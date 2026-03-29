import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, DollarSign, Calendar, Users, TrendingUp, TrendingDown, Award, Minus, Edit, History } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface SalaryStructure {
  id: string;
  position: string;
  department: string;
  min_salary: number;
  max_salary: number;
  created_at: string;
}

interface EmployeeCompensation {
  id: string;
  employee_id: string;
  base_salary: number;
  bonus: number;
  incentives: number;
  last_adjustment_date: string | null;
  employees: {
    full_name: string;
    employee_id: string;
    position: string;
    department: string;
    employment_status: string;
  };
}

interface SalaryAdjustment {
  id: string;
  employee_id: string;
  previous_salary: number;
  new_salary: number;
  reason: string;
  adjusted_by: string | null;
  created_at: string;
  employees: {
    full_name: string;
    employee_id: string;
  };
}

export default function Hr4CompensationPage() {
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [employeeCompensations, setEmployeeCompensations] = useState<EmployeeCompensation[]>([]);
  const [recentAdjustments, setRecentAdjustments] = useState<SalaryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [compensationDialogOpen, setCompensationDialogOpen] = useState(false);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  // Form states
  const [structureForm, setStructureForm] = useState({
    position: '',
    department: '',
    min_salary: '',
    max_salary: '',
  });

  const [compensationForm, setCompensationForm] = useState({
    employee_id: '',
    base_salary: '',
    bonus: '0',
    incentives: '0',
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    employee_id: '',
    new_salary: '',
    reason: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSalaryStructures(),
        fetchEmployeeCompensations(),
        fetchRecentAdjustments(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryStructures = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_structures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalaryStructures(data || []);
    } catch (error) {
      console.error('Error fetching salary structures:', error);
      setSalaryStructures([]);
    }
  };

  const fetchEmployeeCompensations = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_compensation')
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id,
            position,
            department,
            employment_status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployeeCompensations(data || []);
    } catch (error) {
      console.error('Error fetching employee compensations:', error);
      setEmployeeCompensations([]);
    }
  };

  const fetchRecentAdjustments = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_adjustments')
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentAdjustments(data || []);
    } catch (error) {
      console.error('Error fetching recent adjustments:', error);
      setRecentAdjustments([]);
    }
  };

  const handleCreateSalaryStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_structures')
        .insert([{
          position: structureForm.position,
          department: structureForm.department,
          min_salary: parseFloat(structureForm.min_salary),
          max_salary: parseFloat(structureForm.max_salary),
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Salary structure created successfully',
      });

      setStructureDialogOpen(false);
      setStructureForm({
        position: '',
        department: '',
        min_salary: '',
        max_salary: '',
      });
      fetchSalaryStructures();
    } catch (error) {
      console.error('Error creating salary structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to create salary structure',
        variant: 'destructive',
      });
    }
  };

  const handleCreateEmployeeCompensation = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_compensation')
        .insert([{
          employee_id: compensationForm.employee_id,
          base_salary: parseFloat(compensationForm.base_salary),
          bonus: parseFloat(compensationForm.bonus),
          incentives: parseFloat(compensationForm.incentives),
          last_adjustment_date: new Date().toISOString().split('T')[0],
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee compensation created successfully',
      });

      setCompensationDialogOpen(false);
      setCompensationForm({
        employee_id: '',
        base_salary: '',
        bonus: '0',
        incentives: '0',
      });
      fetchEmployeeCompensations();
    } catch (error) {
      console.error('Error creating employee compensation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create employee compensation',
        variant: 'destructive',
      });
    }
  };

  const handleSalaryAdjustment = async () => {
    try {
      // Get current compensation
      const { data: currentComp, error: currentError } = await supabase
        .from('employee_compensation')
        .select('base_salary')
        .eq('employee_id', adjustmentForm.employee_id)
        .single();

      if (currentError) throw currentError;

      // Create adjustment record
      const { data: adjustment, error: adjustmentError } = await supabase
        .from('salary_adjustments')
        .insert([{
          employee_id: adjustmentForm.employee_id,
          previous_salary: currentComp.base_salary,
          new_salary: parseFloat(adjustmentForm.new_salary),
          reason: adjustmentForm.reason,
        }])
        .select();

      if (adjustmentError) throw adjustmentError;

      // Update employee compensation
      const { data: update, error: updateError } = await supabase
        .from('employee_compensation')
        .update({
          base_salary: parseFloat(adjustmentForm.new_salary),
          last_adjustment_date: new Date().toISOString().split('T')[0],
        })
        .eq('employee_id', adjustmentForm.employee_id)
        .select();

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Salary adjustment completed successfully',
      });

      setAdjustmentDialogOpen(false);
      setAdjustmentForm({
        employee_id: '',
        new_salary: '',
        reason: '',
      });
      fetchEmployeeCompensations();
      fetchRecentAdjustments();
    } catch (error) {
      console.error('Error adjusting salary:', error);
      toast({
        title: 'Error',
        description: 'Failed to adjust salary',
        variant: 'destructive',
      });
    }
  };

  const getTotalCompensation = (comp: EmployeeCompensation) => {
    return comp.base_salary + comp.bonus + comp.incentives;
  };

  const getAverageSalary = () => {
    if (employeeCompensations.length === 0) return 0;
    const total = employeeCompensations.reduce((sum, comp) => sum + comp.base_salary, 0);
    return total / employeeCompensations.length;
  };

  const getTotalBonuses = () => {
    return employeeCompensations.reduce((sum, comp) => sum + comp.bonus, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading compensation data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compensation Planning</h1>
        <div className="flex gap-2">
          <Button onClick={() => setStructureDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Salary Structure
          </Button>
          <Button onClick={() => setCompensationDialogOpen(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Set Employee Compensation
          </Button>
          <Button onClick={() => setAdjustmentDialogOpen(true)} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Adjust Salary
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Base Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₱{getAverageSalary().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₱{getTotalBonuses().toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Structures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salaryStructures.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Structures */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Structures</CardTitle>
          <CardDescription>Defined salary ranges by position and department</CardDescription>
        </CardHeader>
        <CardContent>
          {salaryStructures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No salary structures defined yet. Create your first salary structure to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Min Salary</TableHead>
                  <TableHead>Max Salary</TableHead>
                  <TableHead>Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryStructures.map((structure) => (
                  <TableRow key={structure.id}>
                    <TableCell className="font-medium">{structure.position}</TableCell>
                    <TableCell>{structure.department}</TableCell>
                    <TableCell>₱{structure.min_salary.toLocaleString()}</TableCell>
                    <TableCell>₱{structure.max_salary.toLocaleString()}</TableCell>
                    <TableCell>₱{(structure.min_salary + structure.max_salary) / 2}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Compensation Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Compensation Overview</CardTitle>
          <CardDescription>Current compensation details for all employees</CardDescription>
        </CardHeader>
        <CardContent>
          {employeeCompensations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employee compensation records found. Set up compensation for employees to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Incentives</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeCompensations.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{comp.employees?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{comp.employees?.employee_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{comp.employees?.position}</TableCell>
                    <TableCell>₱{comp.base_salary.toLocaleString()}</TableCell>
                    <TableCell>₱{comp.bonus.toLocaleString()}</TableCell>
                    <TableCell>₱{comp.incentives.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₱{getTotalCompensation(comp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Link to={`/hr4/compensation/${comp.employee_id}`}>
                        <Button variant="outline" size="sm">
                          <History className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Salary Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Salary Adjustments</CardTitle>
          <CardDescription>Latest salary changes and adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAdjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No salary adjustments recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Previous Salary</TableHead>
                  <TableHead>New Salary</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAdjustments.map((adjustment) => {
                  const change = adjustment.new_salary - adjustment.previous_salary;
                  const isIncrease = change > 0;
                  return (
                    <TableRow key={adjustment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{adjustment.employees?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{adjustment.employees?.employee_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>₱{adjustment.previous_salary.toLocaleString()}</TableCell>
                      <TableCell>₱{adjustment.new_salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={isIncrease ? "default" : "destructive"}>
                          {isIncrease ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          ₱{Math.abs(change).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                      <TableCell>{format(new Date(adjustment.created_at), 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Salary Structure Dialog */}
      <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Salary Structure</DialogTitle>
            <DialogDescription>
              Define salary range for a position and department combination.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">Position</Label>
              <Input
                id="position"
                value={structureForm.position}
                onChange={(e) => setStructureForm({...structureForm, position: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Nurse, Doctor"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">Department</Label>
              <Input
                id="department"
                value={structureForm.department}
                onChange={(e) => setStructureForm({...structureForm, department: e.target.value})}
                className="col-span-3"
                placeholder="e.g., Emergency, Surgery"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="min_salary" className="text-right">Min Salary</Label>
              <Input
                id="min_salary"
                type="number"
                value={structureForm.min_salary}
                onChange={(e) => setStructureForm({...structureForm, min_salary: e.target.value})}
                className="col-span-3"
                placeholder="20000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_salary" className="text-right">Max Salary</Label>
              <Input
                id="max_salary"
                type="number"
                value={structureForm.max_salary}
                onChange={(e) => setStructureForm({...structureForm, max_salary: e.target.value})}
                className="col-span-3"
                placeholder="35000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSalaryStructure}>Create Structure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Compensation Dialog */}
      <Dialog open={compensationDialogOpen} onOpenChange={setCompensationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Employee Compensation</DialogTitle>
            <DialogDescription>
              Assign base salary, bonus, and incentives for an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee_id" className="text-right">Employee</Label>
              <Select value={compensationForm.employee_id} onValueChange={(value) => setCompensationForm({...compensationForm, employee_id: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeCompensations.map((comp) => (
                    <SelectItem key={comp.employee_id} value={comp.employee_id}>
                      {comp.employees?.full_name} ({comp.employees?.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base_salary" className="text-right">Base Salary</Label>
              <Input
                id="base_salary"
                type="number"
                value={compensationForm.base_salary}
                onChange={(e) => setCompensationForm({...compensationForm, base_salary: e.target.value})}
                className="col-span-3"
                placeholder="25000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bonus" className="text-right">Bonus</Label>
              <Input
                id="bonus"
                type="number"
                value={compensationForm.bonus}
                onChange={(e) => setCompensationForm({...compensationForm, bonus: e.target.value})}
                className="col-span-3"
                placeholder="5000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="incentives" className="text-right">Incentives</Label>
              <Input
                id="incentives"
                type="number"
                value={compensationForm.incentives}
                onChange={(e) => setCompensationForm({...compensationForm, incentives: e.target.value})}
                className="col-span-3"
                placeholder="2000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateEmployeeCompensation}>Set Compensation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Employee Salary</DialogTitle>
            <DialogDescription>
              Increase or decrease an employee's base salary with reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adj_employee_id" className="text-right">Employee</Label>
              <Select value={adjustmentForm.employee_id} onValueChange={(value) => setAdjustmentForm({...adjustmentForm, employee_id: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeCompensations.map((comp) => (
                    <SelectItem key={comp.employee_id} value={comp.employee_id}>
                      {comp.employees?.full_name} ({comp.employees?.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_salary" className="text-right">New Salary</Label>
              <Input
                id="new_salary"
                type="number"
                value={adjustmentForm.new_salary}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, new_salary: e.target.value})}
                className="col-span-3"
                placeholder="30000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">Reason</Label>
              <Textarea
                id="reason"
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                className="col-span-3"
                placeholder="Performance review, promotion, cost of living adjustment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSalaryAdjustment}>Adjust Salary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}