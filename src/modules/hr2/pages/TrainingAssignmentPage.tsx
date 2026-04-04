import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, AlertCircle, User, BookOpen, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
}

interface TrainingProgram {
  id: string;
  name: string;
  competency_id: string;
  required_skill_level: number;
  training_type: string;
  duration_hours: number;
}

interface SkillGap {
  employee_id: string;
  employee_name: string;
  competency_id: string;
  competency_name: string;
  current_level: number;
  target_level: number;
  gap_level: number;
  position: string;
  department: string;
}

interface EmployeeTrainingWithDetails {
  id: string;
  employee_id: string;
  training_id: string;
  status: string;
  assigned_date: string;
  employee: Employee;
  training: TrainingProgram;
}

export function TrainingAssignmentPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [assignments, setAssignments] = useState<EmployeeTrainingWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedTraining, setSelectedTraining] = useState('');
  const [assignmentType, setAssignmentType] = useState<'manual' | 'auto'>('manual');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch employees
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees' as any)
        .select('*')
        .eq('status', 'Employee Activated')
        .order('first_name');

      if (employeeError) {
        console.error('Error fetching employees:', employeeError);
      } else {
        setEmployees((employeeData as unknown as Employee[]) || []);
      }

      // Fetch training programs
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_programs' as any)
        .select('*')
        .order('name');

      if (trainingError) {
        console.error('Error fetching trainings:', trainingError);
      } else {
        setTrainings((trainingData as unknown as TrainingProgram[]) || []);
      }

      // Fetch skill gaps (using the function from migrations)
      try {
        const { data: gapData, error: gapError } = await supabase
          .rpc('get_employees_with_skill_gaps');

        if (gapError) {
          console.error('Error fetching skill gaps:', gapError);
        } else {
          setSkillGaps((gapData as unknown as SkillGap[]) || []);
        }
      } catch (error) {
        console.error('Error calling skill gaps function:', error);
        // Function may not exist yet, so continue without it
      }

      // Fetch current assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('employee_trainings' as any)
        .select(`
          *,
          employee:employees(*),
          training:training_programs(*)
        `)
        .order('assigned_date', { ascending: false });

      if (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
      } else {
        setAssignments((assignmentData as unknown as EmployeeTrainingWithDetails[]) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load training assignment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedTraining || selectedEmployees.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one employee and a training',
        variant: 'destructive',
      });
      return;
    }

    try {
      const assignments = selectedEmployees.map((empId) => ({
        employee_id: empId,
        training_id: selectedTraining,
        status: 'Assigned',
      }));

      const { error } = await supabase
        .from('employee_trainings')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Training assigned to ${selectedEmployees.length} employee(s)`,
      });

      setSelectedEmployees([]);
      setSelectedTraining('');
      setIsAssignDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error assigning training:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign training',
        variant: 'destructive',
      });
    }
  };

  const handleAutoAssign = async () => {
    if (skillGaps.length === 0) {
      toast({
        title: 'Info',
        description: 'No skill gaps found for auto-assignment',
      });
      return;
    }

    try {
      let assignmentCount = 0;
      const uniqueEmployees = [...new Set(skillGaps.map((gap) => gap.employee_id))];

      for (const empId of uniqueEmployees) {
        try {
          const { data: result } = await supabase.rpc('auto_assign_trainings_for_employee', {
            p_employee_id: empId,
          });

          if (result) {
            assignmentCount += result.length;
          }
        } catch (error) {
          console.error(`Error auto-assigning for employee ${empId}:`, error);
        }
      }

      toast({
        title: 'Success',
        description: `Auto-assigned ${assignmentCount} training(s) based on skill gaps`,
      });

      setIsAssignDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error in auto-assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to auto-assign trainings',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('employee_trainings')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment removed',
      });

      fetchData();
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove assignment',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('employee_trainings')
        .update({
          status: newStatus,
          completion_date: newStatus === 'Completed' ? new Date().toISOString() : null,
        })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Status updated to ${newStatus}`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const empName = assignment.employee?.first_name + ' ' + assignment.employee?.last_name;
    const trainingName = assignment.training?.name || '';
    const searchLower = searchTerm.toLowerCase();
    return empName.toLowerCase().includes(searchLower) || trainingName.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading training assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Training Assignment</h1>
          <p className="text-gray-600 mt-1">Assign trainings to employees and track progress</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Training</DialogTitle>
              <DialogDescription>
                Choose between manual assignment or automatic assignment based on skill gaps
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Assignment Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer ${assignmentType === 'manual' ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => {
                    setAssignmentType('manual');
                    setSelectedEmployees([]);
                  }}
                >
                  <CardContent className="p-4">
                    <User className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-1">Manual Assignment</h3>
                    <p className="text-sm text-gray-600">Select specific employees</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer ${assignmentType === 'auto' ? 'border-green-500 border-2' : ''}`}
                  onClick={() => {
                    setAssignmentType('auto');
                    setSelectedEmployees([]);
                  }}
                >
                  <CardContent className="p-4">
                    <Zap className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold mb-1">Auto Assignment</h3>
                    <p className="text-sm text-gray-600">Based on skill gaps</p>
                  </CardContent>
                </Card>
              </div>

              {/* Manual Assignment Form */}
              {assignmentType === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Select Training Program *
                    </label>
                    <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a training" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainings.map((training) => (
                          <SelectItem key={training.id} value={training.id}>
                            {training.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Select Employees ({selectedEmployees.length})
                    </label>
                    <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                      {employees.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedEmployees.includes(emp.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmployees([...selectedEmployees, emp.id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter((id) => id !== emp.id));
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {emp.position} • {emp.department}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleManualAssign} className="w-full">
                    Assign to {selectedEmployees.length} Employee(s)
                  </Button>
                </div>
              )}

              {/* Auto Assignment Form */}
              {assignmentType === 'auto' && (
                <div className="space-y-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">Smart Assignment</p>
                          <p className="text-blue-800 mt-1">
                            This will analyze skill gaps and automatically assign trainings to employees who need
                            them. Found {skillGaps.length} skill gap(s).
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {skillGaps.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {skillGaps.slice(0, 10).map((gap, idx) => (
                        <Card key={idx} className="p-3">
                          <p className="text-sm font-medium text-gray-900">
                            {gap.employee_name} ({gap.position})
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {gap.competency_name}: Level {gap.current_level} → Level {gap.target_level}
                          </p>
                        </Card>
                      ))}
                      {skillGaps.length > 10 && (
                        <p className="text-xs text-gray-500 p-2">
                          +{skillGaps.length - 10} more skill gaps...
                        </p>
                      )}
                    </div>
                  )}

                  <Button onClick={handleAutoAssign} className="w-full" variant="default">
                    Auto-Assign Trainings
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Skill Gaps Alert */}
      {skillGaps.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Skill Gaps Detected</p>
              <p className="text-sm text-yellow-800 mt-1">
                {skillGaps.length} employees have skill gaps that could benefit from training. Consider using auto-assignment
                to recommend trainings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by employee name or training..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments yet</h3>
            <p className="text-gray-600">Assign training to employees to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {assignment.employee?.first_name} {assignment.employee?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{assignment.employee?.position}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{assignment.training?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Assigned {new Date(assignment.assigned_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <Select value={assignment.status} onValueChange={(value) => handleStatusChange(assignment.id, value)}>
                      <SelectTrigger className={`w-32 ${getStatusBadge(assignment.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingAssignmentPage;
