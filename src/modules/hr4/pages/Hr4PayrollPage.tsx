import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calculator, DollarSign, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
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

interface Payroll {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  total_days_worked: number;
  total_absent_days: number;
  total_leave_days: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  total_additions?: number;
  total_comp_deductions?: number;
  status: string;
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
  salary: number | null;
  pay_frequency: string;
}

export default function Hr4PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const { data, error } = await supabase
        .from('payrolls')
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayrolls(data as Payroll[] || []);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payrolls',
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
        .select('id, employee_id, full_name, salary, pay_frequency')
        .not('salary', 'is', null);

      if (error) throw error;
      setEmployees(data as Employee[] || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const calculatePayrollForEmployee = async (employee: Employee, month: number, year: number) => {
    try {
      // Get timesheets for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      const { data: timesheets, error: timesheetError } = await supabase
        .from('timesheets')
        .select('total_hours, date')
        .eq('employee_id', employee.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (timesheetError) throw timesheetError;

      // Get approved leaves for the month
      const { data: leaves, error: leaveError } = await supabase
        .from('leaves')
        .select('start_date, end_date')
        .eq('employee_id', employee.id)
        .eq('status', 'approved');

      if (leaveError) throw leaveError;

      // Get compensations for the month
      const { data: compensations, error: compError } = await supabase
        .from('compensations')
        .select('type, amount')
        .eq('employee_id', employee.id)
        .gte('effective_date', startDate.toISOString().split('T')[0])
        .lte('effective_date', endDate.toISOString().split('T')[0]);

      if (compError) throw compError;

      // Calculate working days
      const totalDaysInMonth = endDate.getDate();
      const workingDays = 22; // Standard working days per month

      // Calculate days worked from timesheets (8 hours = 1 day)
      let totalDaysWorked = 0;
      if (timesheets) {
        totalDaysWorked = timesheets.reduce((total, ts) => {
          return total + (ts.total_hours / 8); // Convert hours to days
        }, 0);
      }

      // Calculate leave days
      let totalLeaveDays = 0;
      if (leaves) {
        leaves.forEach(leave => {
          const leaveStart = new Date(leave.start_date);
          const leaveEnd = new Date(leave.end_date);

          // Calculate overlapping days with the month
          const overlapStart = leaveStart > startDate ? leaveStart : startDate;
          const overlapEnd = leaveEnd < endDate ? leaveEnd : endDate;

          if (overlapStart <= overlapEnd) {
            const leaveDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            totalLeaveDays += leaveDays;
          }
        });
      }

      // Calculate absent days
      const totalPresentDays = totalDaysWorked + totalLeaveDays;
      const totalAbsentDays = Math.max(0, workingDays - totalPresentDays);

      // Calculate salary
      const dailyRate = employee.salary! / workingDays;
      const grossSalary = dailyRate * (totalDaysWorked + totalLeaveDays);
      const deductions = dailyRate * totalAbsentDays;
      const netSalary = grossSalary - deductions;

      // Calculate compensation adjustments
      let totalAdditions = 0;
      let totalCompDeductions = 0;

      if (compensations) {
        compensations.forEach(comp => {
          if (comp.type === 'deduction') {
            totalCompDeductions += comp.amount;
          } else {
            totalAdditions += comp.amount;
          }
        });
      }

      // Final salary calculation
      const finalSalary = netSalary + totalAdditions - totalCompDeductions;

      return {
        employee_id: employee.id,
        month,
        year,
        basic_salary: employee.salary!,
        total_days_worked: Math.round(totalDaysWorked * 100) / 100,
        total_absent_days: Math.round(totalAbsentDays * 100) / 100,
        total_leave_days: Math.round(totalLeaveDays * 100) / 100,
        gross_salary: Math.round(grossSalary * 100) / 100,
        deductions: Math.round((deductions + totalCompDeductions) * 100) / 100,
        net_salary: Math.round(finalSalary * 100) / 100,
        total_additions: Math.round(totalAdditions * 100) / 100,
        total_comp_deductions: Math.round(totalCompDeductions * 100) / 100,
      };
    } catch (error) {
      console.error(`Error calculating payroll for ${employee.full_name}:`, error);
      return null;
    }
  };

  const generatePayroll = async () => {
    if (employees.length === 0) {
      toast({
        title: 'No Employees',
        description: 'No employees with salary information found',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const payrollData = [];

      for (const employee of employees) {
        if (!employee.salary) continue;

        const payroll = await calculatePayrollForEmployee(employee, selectedMonth, selectedYear);
        if (payroll) {
          payrollData.push(payroll);
        }
      }

      if (payrollData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No payroll data could be calculated',
          variant: 'destructive',
        });
        return;
      }

      // Insert payroll records
      const { data, error } = await supabase
        .from('payrolls')
        .upsert(payrollData, { onConflict: 'employee_id,month,year' })
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id
          )
        `);

      if (error) throw error;

      setPayrolls(prev => [...(data as Payroll[]), ...prev.filter(p => !data.find(d => d.id === p.id))]);

      toast({
        title: 'Success',
        description: `Generated payroll for ${payrollData.length} employees`,
      });
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate payroll',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-0">Pending</Badge>;
      case 'processed':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Processed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

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
              <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
              <p className="text-muted-foreground mt-1">
                Generate and manage employee payroll
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Payrolls</p>
                <p className="text-2xl font-bold text-foreground">{payrolls.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Payroll Generation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Generate Payroll
            </CardTitle>
            <CardDescription>
              Select month and year to generate payroll for all employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generatePayroll}
                disabled={generating}
                className="flex items-center gap-2"
              >
                {generating ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                {generating ? 'Generating...' : 'Generate Payroll'}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Uses employee salary from HR4 HCM</p>
              <p>• Calculates based on timesheets (8 hours = 1 day)</p>
              <p>• Approved leaves count as paid days</p>
              <p>• Deductions for absent days</p>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Records
            </CardTitle>
            <CardDescription>
              Employee payroll information and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payrolls.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Payroll Records</h3>
                <p className="text-muted-foreground">
                  Generate payroll to see employee salary information
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Days Worked</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Leave</TableHead>
                      <TableHead>Additions</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payroll.employees?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{payroll.employees?.employee_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {months.find(m => m.value === payroll.month)?.label} {payroll.year}
                        </TableCell>
                        <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                        <TableCell>{payroll.total_days_worked.toFixed(1)}</TableCell>
                        <TableCell>{payroll.total_absent_days.toFixed(1)}</TableCell>
                        <TableCell>{payroll.total_leave_days.toFixed(1)}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {payroll.total_additions ? `+${formatCurrency(payroll.total_additions)}` : '-'}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {payroll.total_comp_deductions ? `-${formatCurrency(payroll.total_comp_deductions)}` : '-'}
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payroll.net_salary)}</TableCell>
                        <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}