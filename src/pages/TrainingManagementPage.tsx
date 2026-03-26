import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle, BookOpen, Users, TrendingUp, Calendar, Clock, User, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  competency_id: string;
  required_skill_level: number;
  training_type: string;
  duration_hours: number;
  trainer_name: string;
  schedule_date: string;
  course_id: string;
  created_at: string;
}

interface EmployeeTraining {
  id: string;
  employee_id: string;
  training_id: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Missed' | 'Cancelled';
  assigned_date: string;
  attendance_date: string;
  completion_date: string;
  notes: string;
}

interface Competency {
  id: string;
  name: string;
  category: string;
}

interface TrainingStats {
  totalPrograms: number;
  ongoingAssignments: number;
  completedAssignments: number;
  employeesWithGaps: number;
}

export function TrainingManagementPage() {
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [stats, setStats] = useState<TrainingStats>({ totalPrograms: 0, ongoingAssignments: 0, completedAssignments: 0, employeesWithGaps: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    competency_id: '',
    required_skill_level: '1',
    training_type: 'Technical',
    duration_hours: '',
    trainer_name: '',
    schedule_date: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch training programs
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_programs' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (trainingError) {
        console.error('Error fetching training programs:', trainingError);
      } else {
        setTrainings((trainingData as unknown as TrainingProgram[]) || []);
      }

      // Fetch competencies
      const { data: competencyData, error: competencyError } = await supabase
        .from('competencies' as any)
        .select('*');

      if (competencyError) {
        console.error('Error fetching competencies:', competencyError);
      } else {
        setCompetencies((competencyData as unknown as Competency[]) || []);
      }

      // Fetch stats
      await fetchStats();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load training data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total programs
      const { count: totalPrograms } = await supabase
        .from('training_programs' as any)
        .select('*', { count: 'exact' });

      // Get ongoing assignments
      const { count: ongoingCount } = await supabase
        .from('employee_trainings' as any)
        .select('*', { count: 'exact' })
        .in('status', ['Assigned', 'In Progress']);

      // Get completed assignments
      const { count: completedCount } = await supabase
        .from('employee_trainings' as any)
        .select('*', { count: 'exact' })
        .eq('status', 'Completed');

      setStats({
        totalPrograms: totalPrograms || 0,
        ongoingAssignments: ongoingCount || 0,
        completedAssignments: completedCount || 0,
        employeesWithGaps: 0, // This would be calculated from get_employees_with_skill_gaps()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.duration_hours) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        duration_hours: parseFloat(formData.duration_hours),
        required_skill_level: parseInt(formData.required_skill_level),
      };

      if (editingId) {
        const { error } = await supabase
          .from('training_programs')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Training program updated',
        });
      } else {
        const { error } = await supabase
          .from('training_programs')
          .insert([dataToSave]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Training program created',
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving training:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save training program',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Training program deleted',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting training:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete training program',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (training: TrainingProgram) => {
    setFormData({
      name: training.name,
      description: training.description || '',
      competency_id: training.competency_id || '',
      required_skill_level: training.required_skill_level.toString(),
      training_type: training.training_type,
      duration_hours: training.duration_hours.toString(),
      trainer_name: training.trainer_name || '',
      schedule_date: training.schedule_date ? new Date(training.schedule_date).toISOString().split('T')[0] : '',
    });
    setEditingId(training.id);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      competency_id: '',
      required_skill_level: '1',
      training_type: 'Technical',
      duration_hours: '',
      trainer_name: '',
      schedule_date: '',
    });
    setEditingId(null);
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch = training.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || training.training_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTrainingTypeColor = (type: string) => {
    switch (type) {
      case 'Medical':
        return 'bg-red-100 text-red-800';
      case 'Technical':
        return 'bg-blue-100 text-blue-800';
      case 'Soft Skills':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading training programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Training Management</h1>
          <p className="text-gray-600 mt-1">Create and manage training programs, track assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New Training Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Training Program' : 'Create New Training Program'}</DialogTitle>
              <DialogDescription>
                Define a training program with competency requirements and schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Training Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Response Level 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Training description and objectives"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Related Competency</label>
                  <Select value={formData.competency_id} onValueChange={(value) => setFormData({ ...formData, competency_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select competency" />
                    </SelectTrigger>
                    <SelectContent>
                      {competencies.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id}>
                          {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Training Type</label>
                  <Select value={formData.training_type} onValueChange={(value) => setFormData({ ...formData, training_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Required Skill Level *</label>
                  <Select value={formData.required_skill_level} onValueChange={(value) => setFormData({ ...formData, required_skill_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Duration (hours) *</label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    placeholder="e.g., 8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Trainer/Instructor</label>
                <Input
                  value={formData.trainer_name}
                  onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                  placeholder="Name of trainer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Schedule Date</label>
                <Input
                  type="date"
                  value={formData.schedule_date}
                  onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingId ? 'Update Training Program' : 'Create Training Program'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPrograms}</div>
            <p className="text-xs text-gray-500 mt-1">Active training programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.ongoingAssignments}</div>
            <p className="text-xs text-gray-500 mt-1">Assignments in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedAssignments}</div>
            <p className="text-xs text-gray-500 mt-1">Finished assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">TBD</div>
            <p className="text-xs text-gray-500 mt-1">Employees needing training</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search training programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Medical">Medical</SelectItem>
            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Training Programs Grid */}
      {filteredTrainings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No training programs found</h3>
            <p className="text-gray-600">Create your first training program to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{training.name}</CardTitle>
                    <Badge className={`mt-2 ${getTrainingTypeColor(training.training_type)}`}>
                      {training.training_type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(training)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(training.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {training.description && (
                  <p className="text-sm text-gray-600">{training.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Level {training.required_skill_level} Required</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{training.duration_hours} hours</span>
                  </div>
                  {training.trainer_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{training.trainer_name}</span>
                    </div>
                  )}
                  {training.schedule_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(training.schedule_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainingManagementPage;
