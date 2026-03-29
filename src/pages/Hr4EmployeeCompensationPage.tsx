import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, DollarSign, Calendar, TrendingUp, TrendingDown, Award, Target, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
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

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  department: string;
  employment_status: string;
  start_date: string;
}

interface EmployeeCompensation {
  id: string;
  employee_id: string;
  base_salary: number;
  bonus: number;
  incentives: number;
  last_adjustment_date: string | null;
  created_at: string;
}

interface SalaryAdjustment {
  id: string;
  employee_id: string;
  previous_salary: number;
  new_salary: number;
  reason: string;
  adjusted_by: string | null;
  created_at: string;
}

interface PerformanceData {
  id: string;
  review_date: string;
  overall_rating: number;
  comments: string;
}

interface AttendanceData {
  total_present: number;
  total_absent: number;
  attendance_rate: number;
}

interface LeaveData {
  total_approved_leaves: number;
  leave_types: Record<string, number>;
}

export default function Hr4EmployeeCompensationPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [compensation, setCompensation] = useState<EmployeeCompensation | null>(null);
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [leaveData, setLeaveData] = useState<LeaveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  const [adjustmentForm, setAdjustmentForm] = useState({
    new_salary: '',
    reason: '',
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchEmployee(),
        fetchCompensation(),
        fetchAdjustments(),
        fetchPerformanceData(),
        fetchAttendanceData(),
        fetchLeaveData(),
      ]);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployee = async () => {
    if (!employeeId) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setEmployee(null);
    }
  };

  const fetchCompensation = async () => {
    if (!employeeId) return;

    try {
      const { data, error } = await supabase
        .from('employee_compensation')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      setCompensation(data || null);
    } catch (error) {
      console.error('Error fetching compensation:', error);
      setCompensation(null);
    }
  };

  const fetchAdjustments = async () => {
    if (!employeeId) return;

    try {
      const { data, error } = await supabase
        .from('salary_adjustments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdjustments(data || []);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      setAdjustments([]);
    }
  };

  const fetchPerformanceData = async () => {
    if (!employeeId) return;

    try {
      // This would integrate with HR2 performance data
      // For now, we'll simulate with empty data
      setPerformanceData([]);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceData([]);
    }
  };

  const fetchAttendanceData = async () => {
    if (!employeeId) return;

    try {
      // Get employee ID from employee_id
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', employeeId)
        .single();

      if (empError) throw empError;

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get attendance logs for current month
      const { data: attendanceLogs, error: attendanceError } = await supabase
        .from('attendance_logs')
        .select('status')
        .eq('employee_id', empData.id)
        .gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);

      if (attendanceError) throw attendanceError;

      const totalPresent = attendanceLogs?.filter(log => log.status === 'present').length || 0;
      const totalAbsent = attendanceLogs?.filter(log => log.status === 'absent').length || 0;
      const totalDays = totalPresent + totalAbsent;
      const attendanceRate = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;

      setAttendanceData({
        total_present: totalPresent,
        total_absent: totalAbsent,
        attendance_rate: attendanceRate,
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData(null);
    }
  };

  const fetchLeaveData = async () => {
    if (!employeeId) return;

    try {
      // Get employee ID from employee_id
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', employeeId)
        .single();

      if (empError) throw empError;

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      // Get approved leaves for current year
      const { data: leaves, error: leavesError } = await supabase
        .from('leaves')
        .select('leave_type')
        .eq('employee_id', empData.id)
        .eq('status', 'approved')
        .gte('start_date', `${currentYear}-01-01`)
        .lte('end_date', `${currentYear}-12-31`);

      if (leavesError) throw leavesError;

      const leaveTypeCounts: Record<string, number> = {};
      leaves?.forEach(leave => {
        leaveTypeCounts[leave.leave_type] = (leaveTypeCounts[leave.leave_type] || 0) + 1;
      });

      setLeaveData({
        total_approved_leaves: leaves?.length || 0,
        leave_types: leaveTypeCounts,
      });
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setLeaveData(null);
    }
  };

  const handleSalaryAdjustment = async () => {
    if (!employeeId || !compensation) return;

    try {
      // Create adjustment record
      const { data: adjustment, error: adjustmentError } = await supabase
        .from('salary_adjustments')
        .insert([{
          employee_id: employeeId,
          previous_salary: compensation.base_salary,
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
        .eq('employee_id', employeeId)
        .select();

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Salary adjustment completed successfully',
      });

      setAdjustmentDialogOpen(false);
      setAdjustmentForm({
        new_salary: '',
        reason: '',
      });
      fetchCompensation();
      fetchAdjustments();
    } catch (error) {
      console.error('Error adjusting salary:', error);
      toast({
        title: 'Error',
        description: 'Failed to adjust salary',
        variant: 'destructive',
      });
    }
  };

  const getTotalCompensation = () => {
    if (!compensation) return 0;
    return compensation.base_salary + compensation.bonus + compensation.incentives;
  };

  const getSalaryIncreaseRecommendation = () => {
    if (!compensation || !attendanceData || !performanceData.length) return null;

    let recommendation = 'No recommendation available';

    // Based on attendance (HR3 integration)
    if (attendanceData.attendance_rate >= 95) {
      recommendation = 'Excellent attendance - consider salary increase';
    } else if (attendanceData.attendance_rate >= 90) {
      recommendation = 'Good attendance - monitor for improvement';
    } else {
      recommendation = 'Poor attendance - address before salary increase';
    }

    // Based on performance (HR2 integration would go here)
    // For now, we'll just return the attendance-based recommendation

    return recommendation;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading employee compensation data...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/hr4/compensation">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Compensation
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>
          <p className="text-muted-foreground">Employee ID: {employee.employee_id}</p>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium">Position</Label>
              <p className="text-lg">{employee.position}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Department</Label>
              <p className="text-lg">{employee.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={employee.employment_status === 'active' ? 'default' : 'secondary'}>
                {employee.employment_status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Start Date</Label>
              <p className="text-lg">{format(new Date(employee.start_date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Compensation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Compensation
            <Button onClick={() => setAdjustmentDialogOpen(true)} size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Adjust Salary
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compensation ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₱{compensation.base_salary.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Base Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₱{compensation.bonus.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Bonus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">₱{compensation.incentives.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Incentives</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">₱{getTotalCompensation().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Compensation</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No compensation data available for this employee.
            </div>
          )}
        </CardContent>
      </Card>

      {/* HR Integration Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Insights (HR3) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Attendance Insights (HR3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Present Days (Current Month)</span>
                  <Badge variant="default">{attendanceData.total_present}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Absent Days (Current Month)</span>
                  <Badge variant="destructive">{attendanceData.total_absent}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Attendance Rate</span>
                  <Badge variant={attendanceData.attendance_rate >= 95 ? 'default' : attendanceData.attendance_rate >= 90 ? 'secondary' : 'destructive'}>
                    {attendanceData.attendance_rate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No attendance data available</div>
            )}
          </CardContent>
        </Card>

        {/* Leave Insights (HR3) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Leave Insights (HR3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Approved Leaves (Current Year)</span>
                  <Badge variant="outline">{leaveData.total_approved_leaves}</Badge>
                </div>
                {Object.entries(leaveData.leave_types).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type} Leaves</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No leave data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights (HR2) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Performance Insights (HR2)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <div className="space-y-3">
              {performanceData.map((perf) => (
                <div key={perf.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Review Date: {format(new Date(perf.review_date), 'MMM dd, yyyy')}</span>
                    <Badge variant="outline">Rating: {perf.overall_rating}/5</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{perf.comments}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No performance reviews available</div>
          )}
        </CardContent>
      </Card>

      {/* Salary Increase Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Compensation Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{getSalaryIncreaseRecommendation()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Salary Adjustment History */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          {adjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No salary adjustments recorded for this employee.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Previous Salary</TableHead>
                  <TableHead>New Salary</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adjustment) => {
                  const change = adjustment.new_salary - adjustment.previous_salary;
                  const isIncrease = change > 0;
                  return (
                    <TableRow key={adjustment.id}>
                      <TableCell>{format(new Date(adjustment.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>₱{adjustment.previous_salary.toLocaleString()}</TableCell>
                      <TableCell>₱{adjustment.new_salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={isIncrease ? "default" : "destructive"}>
                          {isIncrease ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          ₱{Math.abs(change).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>{adjustment.reason}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Salary Adjustment Dialog */}
      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Salary for {employee.full_name}</DialogTitle>
            <DialogDescription>
              Current base salary: ₱{compensation?.base_salary.toLocaleString() || 'Not set'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new_salary" className="text-right">New Salary</Label>
              <Input
                id="new_salary"
                type="number"
                value={adjustmentForm.new_salary}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, new_salary: e.target.value})}
                className="col-span-3"
                placeholder={compensation?.base_salary.toString() || "30000"}
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