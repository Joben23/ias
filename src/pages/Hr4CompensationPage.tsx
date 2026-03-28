import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, DollarSign, Calendar, Users, TrendingUp, TrendingDown, Award, Minus } from 'lucide-react';
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

interface Compensation {
  id: string;
  employee_id: string;
  type: string;
  amount: number;
  description: string | null;
  effective_date: string;
  created_at: string;
  employees: {
    full_name: string;
    employee_id: string;
  };
}

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
}

export default function Hr4CompensationPage() {
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    type: '',
    amount: '',
    description: '',
    effective_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCompensations();
    fetchEmployees();
  }, []);

  const fetchCompensations = async () => {
    try {
      const { data, error } = await supabase
        .from('compensations')
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompensations(data as Compensation[] || []);
    } catch (error) {
      console.error('Error fetching compensations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compensations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_id, full_name')
        .order('full_name');

      if (error) throw error;
      setEmployees(data as Employee[] || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.type || !formData.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('compensations')
        .insert({
          employee_id: formData.employee_id,
          type: formData.type,
          amount: amount,
          description: formData.description || null,
          effective_date: formData.effective_date,
        })
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id
          )
        `)
        .single();

      if (error) throw error;

      setCompensations(prev => [data as Compensation, ...prev]);

      // Reset form
      setFormData({
        employee_id: '',
        type: '',
        amount: '',
        description: '',
        effective_date: new Date().toISOString().split('T')[0],
      });
      setDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Compensation added successfully',
      });
    } catch (error) {
      console.error('Error adding compensation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add compensation',
        variant: 'destructive',
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return <Award className="h-4 w-4" />;
      case 'incentive':
        return <TrendingUp className="h-4 w-4" />;
      case 'allowance':
        return <DollarSign className="h-4 w-4" />;
      case 'deduction':
        return <Minus className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      bonus: 'bg-green-500/10 text-green-700 border-green-200',
      incentive: 'bg-blue-500/10 text-blue-700 border-blue-200',
      allowance: 'bg-purple-500/10 text-purple-700 border-purple-200',
      deduction: 'bg-red-500/10 text-red-700 border-red-200',
    };

    return (
      <Badge className={`${variants[type as keyof typeof variants]} border capitalize flex items-center gap-1`}>
        {getTypeIcon(type)}
        {type}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const compensationTypes = [
    { value: 'bonus', label: 'Bonus', description: 'One-time performance bonus' },
    { value: 'incentive', label: 'Incentive', description: 'Performance-based incentive' },
    { value: 'allowance', label: 'Allowance', description: 'Regular allowance payment' },
    { value: 'deduction', label: 'Deduction', description: 'Salary deduction' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Compensation Planning</h1>
              <p className="text-muted-foreground mt-1">
                Manage bonuses, incentives, allowances, and deductions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">{compensations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Add Compensation Button */}
        <div className="mb-8">
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Compensation
          </Button>
        </div>

        {/* Compensation Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Compensation Records
            </CardTitle>
            <CardDescription>
              All compensation entries and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {compensations.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Compensation Records</h3>
                <p className="text-muted-foreground">
                  Add your first compensation entry to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compensations.map((compensation) => (
                      <TableRow key={compensation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{compensation.employees?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{compensation.employees?.employee_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(compensation.type)}</TableCell>
                        <TableCell className="font-semibold">
                          {compensation.type === 'deduction' ? '-' : '+'}
                          {formatCurrency(compensation.amount)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {compensation.description || 'No description'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(compensation.effective_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(compensation.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Compensation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Compensation</DialogTitle>
              <DialogDescription>
                Add a new compensation entry for an employee
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    Employee *
                  </Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name} ({employee.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select compensation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {compensationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="effective_date" className="text-right">
                    Effective Date *
                  </Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Compensation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}