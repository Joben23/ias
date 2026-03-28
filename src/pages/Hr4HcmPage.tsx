import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Users, Edit, Save, X, DollarSign, Calendar, UserCheck, Building } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employment_type: string;
  salary: number | null;
  pay_frequency: string;
  hire_date: string | null;
  employment_status: string;
  tax_id: string | null;
  sss_number: string | null;
  philhealth_number: string | null;
  pagibig_number: string | null;
  start_date: string;
  status: string;
}

export default function Hr4HcmPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editFormData, setEditFormData] = useState({
    employment_type: '',
    salary: '',
    pay_frequency: '',
    hire_date: '',
    employment_status: '',
    tax_id: '',
    sss_number: '',
    philhealth_number: '',
    pagibig_number: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setEmployees(data as Employee[] || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      employment_type: employee.employment_type || 'full_time',
      salary: employee.salary?.toString() || '',
      pay_frequency: employee.pay_frequency || 'monthly',
      hire_date: employee.hire_date || '',
      employment_status: employee.employment_status || 'active',
      tax_id: employee.tax_id || '',
      sss_number: employee.sss_number || '',
      philhealth_number: employee.philhealth_number || '',
      pagibig_number: employee.pagibig_number || '',
    });
  };

  const handleSaveEmployee = async () => {
    if (!editingEmployee) return;

    setSaving(true);
    try {
      const updateData = {
        employment_type: editFormData.employment_type,
        salary: editFormData.salary ? parseFloat(editFormData.salary) : null,
        pay_frequency: editFormData.pay_frequency,
        hire_date: editFormData.hire_date || null,
        employment_status: editFormData.employment_status,
        tax_id: editFormData.tax_id || null,
        sss_number: editFormData.sss_number || null,
        philhealth_number: editFormData.philhealth_number || null,
        pagibig_number: editFormData.pagibig_number || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', editingEmployee.id);

      if (error) throw error;

      // Update local state
      setEmployees(employees.map(emp =>
        emp.id === editingEmployee.id
          ? { ...emp, ...updateData }
          : emp
      ));

      setEditingEmployee(null);
      toast({
        title: 'Success',
        description: 'Employee details updated successfully',
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee details',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getEmploymentStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Active</Badge>;
      case 'resigned':
        return <Badge className="bg-gray-500/10 text-gray-700 border-0">Resigned</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500/10 text-red-700 border-0">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEmploymentTypeBadge = (type: string) => {
    switch (type) {
      case 'full_time':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Full Time</Badge>;
      case 'part_time':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Part Time</Badge>;
      case 'contract':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Contract</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

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
              <h1 className="text-3xl font-bold text-foreground">Human Capital Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage employee details and employment information
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(e => e.employment_status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Employees Found</h3>
            <p className="text-muted-foreground">
              Employee records will appear here once added to the system
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-foreground">{employee.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
                      </div>
                    </div>
                    {getEmploymentStatusBadge(employee.employment_status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Position</p>
                      <p className="font-medium">{employee.position}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employment Type</p>
                      {getEmploymentTypeBadge(employee.employment_type)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pay Frequency</p>
                      <p className="font-medium capitalize">{employee.pay_frequency?.replace('_', ' ') || 'Monthly'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(employee.salary)}
                    </p>
                  </div>

                  {employee.hire_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Hired: {format(new Date(employee.hire_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      onClick={() => handleEditEmployee(employee)}
                      className="w-full"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
            <DialogDescription>
              Update employment information for {editingEmployee?.full_name}
            </DialogDescription>
          </DialogHeader>

          {editingEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select
                    value={editFormData.employment_type}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, employment_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pay_frequency">Pay Frequency</Label>
                  <Select
                    value={editFormData.pay_frequency}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, pay_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (PHP)</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editFormData.salary}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, salary: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={editFormData.hire_date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_status">Employment Status</Label>
                <Select
                  value={editFormData.employment_status}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, employment_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resigned">Resigned</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Government IDs</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Tax ID</Label>
                    <Input
                      id="tax_id"
                      placeholder="XXX-XXX-XXX"
                      value={editFormData.tax_id}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sss_number">SSS Number</Label>
                    <Input
                      id="sss_number"
                      placeholder="XX-XXXXXXX-X"
                      value={editFormData.sss_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, sss_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="philhealth_number">PhilHealth Number</Label>
                    <Input
                      id="philhealth_number"
                      placeholder="XX-XXXXXXXXX-X"
                      value={editFormData.philhealth_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, philhealth_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pagibig_number">Pag-IBIG Number</Label>
                    <Input
                      id="pagibig_number"
                      placeholder="XXXX-XXXX-XXXX"
                      value={editFormData.pagibig_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, pagibig_number: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingEmployee(null)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEmployee}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}