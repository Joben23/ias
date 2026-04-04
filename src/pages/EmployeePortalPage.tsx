import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Award, Calendar, LogOut, ChevronLeft, Play, StopCircle, Plus, Loader2, DollarSign, FileText, Building, TrendingUp, Minus } from 'lucide-react';
import { ChangePasswordSection } from '@/components/ChangePasswordSection';
import { StaffLoginModal } from '@/components/StaffLoginModal';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Helper function to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return 'EMP';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface OnboardingTask {
  id: string;
  task_name: string;
  task_category: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

interface Recognition {
  id: string;
  employee_name: string;
  position: string | null;
  department: string | null;
  award_type: string;
  description: string | null;
  date: string;
  likes: number;
  comments: number;
}

interface EmployeeData {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  start_date: string;
  status: string;
  onboarding_status?: string;
  // Additional employment properties
  employment_type?: string;
  pay_frequency?: string;
  salary?: number;
  hire_date?: string;
  employment_status?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
}

interface TodayAttendance {
  id: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number | null;
  status: string;
}

interface Schedule {
  id: string;
  date: string;
  status: string;
  shifts: {
    name: string;
    start_time: string;
    end_time: string;
  };
}

interface Timesheet {
  id: string;
  date: string;
  total_hours: number;
  overtime_hours: number;
  status: string;
}

interface Leave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

interface Claim {
  id: string;
  claim_type: string;
  amount: number;
  description: string;
  receipt_url?: string;
  status: string;
  submitted_at: string;
  created_at: string;
}

interface Compensation {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  effective_date: string;
  created_at: string;
}

interface Payroll {
  id: string;
  month: number;
  year: number;
  basic_salary: number;
  total_days_worked: number;
  total_absent_days: number;
  total_leave_days: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
}

export default function EmployeePortalPage() {
  const { authUser, signOut } = useAuth();
  const navigate = useNavigate();
  const hasCheckedAttendance = useRef(false);
  
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<Schedule | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [claimFormData, setClaimFormData] = useState({
    claim_type: '',
    amount: '',
    description: '',
    receipt: null as File | null,
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setLoginModalOpen(true);
  };

  const handleClockIn = async () => {
    if (!employeeData || !employeeData.id) {
      toast({
        title: 'Error',
        description: 'Employee data not found',
        variant: 'destructive',
      });
      return;
    }

    setClockInLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const currentTime = new Date();

      // Check if already clocked in today
      if (todayAttendance && todayAttendance.time_in) {
        toast({
          title: 'Already clocked in',
          description: 'You already clocked in today.',
        });
        setClockInLoading(false);
        return;
      }

      // Determine status based on time
      let status = 'present';
      // Default logic: late if after 9:00 AM
      const hours = currentTime.getHours();
      if (hours >= 9) {
        status = 'late';
      }

      // Insert new attendance record
      const { data, error } = await (supabase
        .from('attendance_logs' as any)
        .insert({
          employee_id: employeeData.id,
          full_name: employeeData.full_name,
          date: today,
          time_in: now,
          time_out: null,
          total_hours: null,
          status: status,
        })
        .select()
        .single() as any);

      if (error) throw error;

      setTodayAttendance(data);
      toast({
        title: 'Clocked in successfully',
        description: `Status: ${status === 'late' ? 'Late' : 'Present'}`,
      });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!todayAttendance || !todayAttendance.id) {
      toast({
        title: 'Error',
        description: 'No active clock-in found',
        variant: 'destructive',
      });
      return;
    }

    setClockOutLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const clockInTime = todayAttendance.time_in ? new Date(todayAttendance.time_in) : new Date();
      const clockOutTime = new Date(now);
      const diffMs = clockOutTime.getTime() - clockInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Update attendance record
      const { data, error } = await (supabase
        .from('attendance_logs' as any)
        .update({
          time_out: now,
          total_hours: Math.round(diffHours * 100) / 100, // Round to 2 decimal places
        })
        .eq('id', todayAttendance.id)
        .select()
        .single() as any);

      if (error) throw error;

      setTodayAttendance(data);

      // Auto-generate timesheet
      await generateTimesheet(employeeData.id, today, Math.round(diffHours * 100) / 100);

      toast({
        title: 'Clocked out successfully',
        description: `Total hours: ${(Math.round(diffHours * 100) / 100).toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Error',
        description: 'Failed to clock out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClockOutLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchAllData();
    }
  }, [authUser]);

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchEmployeeData(),
        fetchOnboardingTasks(),
        fetchRecognitions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const fetchTodayAttendance = async (empId: string) => {
    // Use ref to prevent multiple API calls
    if (hasCheckedAttendance.current) return;
    hasCheckedAttendance.current = true;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await (supabase
        .from('attendance_logs' as any)
        .select('*')
        .eq('employee_id', empId)
        .eq('date', today)
        .maybeSingle() as any);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today\'s attendance:', error);
      } else {
        setTodayAttendance(data || null);
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  const fetchTodaySchedule = async (empId: string) => {
    // Schedules table not available in current schema
    // Initialize with null
    try {
      setTodaySchedule(null);
      console.log('[SCHEDULE] Table not yet available in schema');
    } catch (error) {
      console.error('Error with today\'s schedule:', error);
      setTodaySchedule(null);
    }
  };

  const fetchUpcomingSchedules = async (empId: string) => {
    // Schedules table not available in current schema
    // Initialize with empty array
    try {
      setUpcomingSchedules([]);
      console.log('[SCHEDULES] Table not yet available in schema');
    } catch (error) {
      console.error('Error with upcoming schedules:', error);
      setUpcomingSchedules([]);
    }
  };

  const fetchTimesheets = async (empId: string) => {
    // Timesheets table not available in current schema
    // Initialize with empty array
    try {
      setTimesheets([]);
      console.log('[TIMESHEETS] Table not yet available in schema');
    } catch (error) {
      console.error('Error with timesheets:', error);
      setTimesheets([]);
    }
  };

  const fetchLeaves = async (empId: string) => {
    // Leaves table not available in current schema
    // Initialize with empty array
    try {
      setLeaves([]);
      console.log('[LEAVES] Table not yet available in schema');
    } catch (error) {
      console.error('Error with leaves:', error);
      setLeaves([]);
    }
  };

  const fetchClaims = async (empId: string) => {
    // Claims table not available in current schema
    // Initialize with empty array
    try {
      setClaims([]);
      console.log('[CLAIMS] Table not yet available in schema');
    } catch (error) {
      console.error('Error with claims:', error);
      setClaims([]);
    }
  };

  const fetchPayrolls = async (empId: string) => {
    // Payrolls table not available in current schema
    // Initialize with empty array
    try {
      setPayrolls([]);
      console.log('[PAYROLLS] Table not yet available in schema');
    } catch (error) {
      console.error('Error with payrolls:', error);
      setPayrolls([]);
    }
  };

  const fetchCompensations = async (empId: string) => {
    // Compensations table not available in current schema
    // Initialize with empty array
    try {
      setCompensations([]);
      console.log('[COMPENSATIONS] Table not yet available in schema');
    } catch (error) {
      console.error('Error with compensations:', error);
      setCompensations([]);
    }
  };

  const generateTimesheet = async (employeeId: string, date: string, totalHours: number) => {
    // Timesheets table not available in current schema
    // Skip timesheet generation
    try {
      console.log('[TIMESHEET] Table not yet available in schema - skipping generation');
      // Mock implementation - just log the action
      console.log(`Would generate timesheet for employee ${employeeId} on ${date} with ${totalHours} hours`);
    } catch (error) {
      console.error('Error generating timesheet:', error);
    }
  };

  const fetchEmployeeData = async () => {
    if (!authUser?.id) {
      console.log('No auth user - cannot fetch employee data');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching employee data:', error);
        // Don't show error toast for missing employee record - might not be hired yet
        if (error.code !== 'PGRST116') { // PGRST116 is "not found"
          toast({
            title: 'Error',
            description: 'Failed to load employee data',
            variant: 'destructive',
          });
        }
      } else {
        setEmployeeData(data);
        // Fetch today's attendance only after getting employee data
        if (data && data.id) {
          fetchTodayAttendance(data.id);
          fetchTodaySchedule(data.id);
          fetchUpcomingSchedules(data.id);
          fetchTimesheets(data.id);
          fetchLeaves(data.id);
          fetchClaims(data.id);
          fetchPayrolls(data.id);
          fetchCompensations(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const fetchOnboardingTasks = async () => {
    if (!authUser?.id) {
      console.log('No auth user - cannot fetch onboarding tasks');
      return;
    }
    try {
      // Get employee record first to get employee_id
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (empError || !empData) {
        console.log('No employee record found for onboarding tasks');
        setOnboardingTasks([]);
        return;
      }

      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .eq('employee_id', empData.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching onboarding tasks:', error);
      } else {
        setOnboardingTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching onboarding tasks:', error);
      setOnboardingTasks([]);
    }
  };

  const fetchRecognitions = async () => {
    try {
      // For now, just fetch all recognitions since the table doesn't have recipient_id
      // In a real app, you'd need to add recipient_id to the recognitions table
      const { data, error } = await supabase
        .from('recognitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recognitions:', error);
        setRecognitions([]);
      } else if (data) {
        // Transform the data to match our interface
        const formattedRecognitions = data.map(item => ({
          id: item.id,
          employee_name: item.employee_name,
          position: item.position,
          department: item.department,
          award_type: item.award_type,
          description: item.description,
          date: item.date,
          likes: item.likes,
          comments: item.comments
        }));
        setRecognitions(formattedRecognitions);
      } else {
        setRecognitions([]);
      }
    } catch (error) {
      console.error('Error fetching recognitions:', error);
      setRecognitions([]);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getShiftColor = (shiftName: string) => {
    if (shiftName.toLowerCase().includes('morning')) {
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    } else if (shiftName.toLowerCase().includes('night')) {
      return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
    } else if (shiftName.toLowerCase().includes('afternoon')) {
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
    } else {
      return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getTimesheetStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'approved':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      case 'rejected':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getTimesheetStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-0">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-700 border-0">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'probation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const submitLeaveRequest = async () => {
    if (!employeeData?.id) {
      toast({
        title: 'Error',
        description: 'Employee data not found',
        variant: 'destructive',
      });
      return;
    }

    if (!leaveFormData.leave_type || !leaveFormData.start_date || !leaveFormData.end_date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingLeave(true);
    try {
      // Leaves table not yet available
      toast({
        title: 'Feature coming soon',
        description: 'Leave request system will be available in the next release.',
      });
      setLeaveFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
      setLeaveDialogOpen(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingLeave(false);
    }
  };

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-0">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-700 border-0">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const submitClaimRequest = async () => {
    if (!employeeData?.id) {
      toast({
        title: 'Error',
        description: 'Employee data not found',
        variant: 'destructive',
      });
      return;
    }

    if (!claimFormData.claim_type || !claimFormData.amount || !claimFormData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(claimFormData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingClaim(true);
    try {
      // Claims table not yet available
      toast({
        title: 'Feature coming soon',
        description: 'Expense claim system will be available in the next release.',
      });
      setClaimFormData({
        claim_type: '',
        amount: '',
        description: '',
        receipt: null,
      });
      setClaimDialogOpen(false);
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit claim. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingClaim(false);
    }
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-0">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-700 border-0">Rejected</Badge>;
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

  if (loading || dataLoading) {
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Landing
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="gradient-primary text-white font-semibold">
                  {getInitials(employeeData?.full_name || authUser?.fullName || 'E')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {employeeData?.full_name || authUser?.fullName || 'Employee'}
                </h1>
                <p className="text-muted-foreground">
                  {employeeData?.position || 'Staff Member'} • {employeeData?.department || 'Hospital'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {employeeData?.status && (
                <Badge className={getStatusColor(employeeData.status)}>
                  {employeeData.status}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeData ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-foreground font-mono">{employeeData.employee_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{employeeData.email || authUser?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{employeeData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-foreground">{employeeData.start_date || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-foreground">{employeeData.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <p className="text-foreground">{employeeData.position}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Employee record not found. You may not be fully onboarded yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contact HR for assistance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Employment Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Employment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeData ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                    <p className="text-foreground capitalize">
                      {employeeData.employment_type?.replace('_', ' ') || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pay Frequency</label>
                    <p className="text-foreground capitalize">
                      {employeeData.pay_frequency?.replace('_', ' ') || 'Monthly'}
                    </p>
                  </div>
                  {employeeData.salary && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Salary</label>
                      <p className="text-foreground font-semibold">
                        {formatCurrency(employeeData.salary)}
                      </p>
                    </div>
                  )}
                  {employeeData.hire_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                      <p className="text-foreground">
                        {new Date(employeeData.hire_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employment Status</label>
                    <Badge className={getStatusColor(employeeData.employment_status || 'active')}>
                      {employeeData.employment_status || 'active'}
                    </Badge>
                  </div>
                  {(employeeData.sss_number || employeeData.philhealth_number || employeeData.pagibig_number) && (
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-muted-foreground">Government IDs</label>
                      <div className="space-y-2 mt-2">
                        {employeeData.sss_number && (
                          <p className="text-xs text-muted-foreground">
                            SSS: {employeeData.sss_number.replace(/(\d{2})(\d{7})(\d{1})/, '$1-XXXXXXX-$3')}
                          </p>
                        )}
                        {employeeData.philhealth_number && (
                          <p className="text-xs text-muted-foreground">
                            PhilHealth: {employeeData.philhealth_number.replace(/(\d{2})(\d{9})(\d{1})/, '$1-XXXXXXXXX-$3')}
                          </p>
                        )}
                        {employeeData.pagibig_number && (
                          <p className="text-xs text-muted-foreground">
                            Pag-IBIG: {employeeData.pagibig_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-XXXX-$3')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Employment information not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Onboarding Tasks
              </CardTitle>
              <CardDescription>
                Complete these tasks to get fully onboarded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {onboardingTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No onboarding tasks assigned
                </p>
              ) : (
                <div className="space-y-4">
                  {onboardingTasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.task_name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.task_category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance - Clock In/Out */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance
              </CardTitle>
              <CardDescription>
                Track your daily time in and time out
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAttendance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Time In</p>
                      <p className="text-lg font-semibold">
                        {todayAttendance.time_in
                          ? new Date(todayAttendance.time_in).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Not clocked in'}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Time Out</p>
                      <p className="text-lg font-semibold">
                        {todayAttendance.time_out
                          ? new Date(todayAttendance.time_out).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Not clocked out'}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
                      <p className="text-lg font-semibold">
                        {todayAttendance.total_hours ? `${todayAttendance.total_hours.toFixed(2)}h` : '-'}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge
                        className={
                          todayAttendance.status === 'present'
                            ? 'bg-green-500/10 text-green-700 border-0'
                            : todayAttendance.status === 'late'
                              ? 'bg-yellow-500/10 text-yellow-700 border-0'
                              : 'bg-red-500/10 text-red-700 border-0'
                        }
                      >
                        {todayAttendance.status || 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleClockIn}
                      disabled={
                        !!todayAttendance.time_in ||
                        clockInLoading ||
                        clockOutLoading
                      }
                      className="flex-1 gap-2"
                      variant={todayAttendance.time_in ? 'secondary' : 'default'}
                    >
                      <Play className="h-4 w-4" />
                      {clockInLoading ? 'Clocking In...' : 'Clock In'}
                    </Button>

                    <Button
                      onClick={handleClockOut}
                      disabled={
                        !todayAttendance.time_in ||
                        !!todayAttendance.time_out ||
                        clockOutLoading ||
                        clockInLoading
                      }
                      className="flex-1 gap-2"
                      variant={todayAttendance.time_out ? 'secondary' : 'destructive'}
                    >
                      <StopCircle className="h-4 w-4" />
                      {clockOutLoading ? 'Clocking Out...' : 'Clock Out'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No attendance record for today</p>
                  <Button
                    onClick={handleClockIn}
                    disabled={clockInLoading}
                    className="mt-4 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {clockInLoading ? 'Clocking In...' : 'Clock In Now'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Schedule */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Schedule
              </CardTitle>
              <CardDescription>
                Your upcoming shifts and today's schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedule ? (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Today's Shift</h4>
                  <Card className={`border-l-4 ${getShiftColor(todaySchedule.shifts.name)}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{todaySchedule.shifts.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(todaySchedule.shifts.start_time)} - {formatTime(todaySchedule.shifts.end_time)}
                          </p>
                        </div>
                        <Badge className="capitalize">
                          {todaySchedule.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Today's Shift</h4>
                  <div className="text-center py-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No shift scheduled for today</p>
                  </div>
                </div>
              )}

              {upcomingSchedules.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Upcoming Shifts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {upcomingSchedules.slice(0, 4).map((schedule) => (
                      <Card key={schedule.id} className={`border-l-4 ${getShiftColor(schedule.shifts.name)}`}>
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{schedule.shifts.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(schedule.date)} • {formatTime(schedule.shifts.start_time)} - {formatTime(schedule.shifts.end_time)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Timesheets */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                My Timesheets
              </CardTitle>
              <CardDescription>
                Your daily work hours and approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timesheets.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No timesheets yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Timesheets will be generated automatically after clocking out
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timesheets.map((timesheet) => (
                    <Card key={timesheet.id} className={`border-l-4 ${getTimesheetStatusColor(timesheet.status)}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(timesheet.date)}</span>
                          </div>
                          {getTimesheetStatusBadge(timesheet.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{timesheet.total_hours.toFixed(2)} hours total</span>
                          </div>
                          {timesheet.overtime_hours > 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                              <Clock className="w-4 h-4" />
                              <span>{timesheet.overtime_hours.toFixed(2)} hours overtime</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Recognition
              </CardTitle>
              <CardDescription>
                Recognition and appreciation from your colleagues</CardDescription>
            </CardHeader>
            <CardContent>
              {recognitions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No recognition posts yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recognitions.map((recognition) => (
                      <Card key={recognition.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{recognition.award_type}</h4>
                          <span className="text-xs text-muted-foreground">
                            {recognition.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{recognition.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{recognition.employee_name}</span>
                          <div className="flex items-center gap-3">
                            <span>👍 {recognition.likes}</span>
                            <span>💬 {recognition.comments}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Leaves */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Leaves
              </CardTitle>
              <CardDescription>
                Request and track your leave applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {leaves.length} leave request{leaves.length !== 1 ? 's' : ''}
                </p>
                <Button
                  onClick={() => setLeaveDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Request Leave
                </Button>
              </div>

              {leaves.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leave requests yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click "Request Leave" to submit your first leave application
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaves.map((leave) => (
                    <Card key={leave.id} className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{leave.leave_type}</span>
                          </div>
                          {getLeaveStatusBadge(leave.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                            </span>
                          </div>
                          {leave.reason && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Reason:</strong> {leave.reason}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Requested: {new Date(leave.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Claims */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                My Claims
              </CardTitle>
              <CardDescription>
                Submit and track your expense claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {claims.length} claim{claims.length !== 1 ? 's' : ''}
                </p>
                <Button
                  onClick={() => setClaimDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Submit Claim
                </Button>
              </div>

              {claims.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No claims yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click "Submit Claim" to request reimbursement for expenses
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claims.map((claim) => (
                    <Card key={claim.id} className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{claim.claim_type}</span>
                          </div>
                          {getClaimStatusBadge(claim.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{formatCurrency(claim.amount)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>Description:</strong> {claim.description}
                          </div>
                          {claim.receipt_url && (
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(claim.receipt_url, '_blank')}
                                className="w-full"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Receipt
                              </Button>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Submitted: {new Date(claim.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Payroll */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                My Payroll
              </CardTitle>
              <CardDescription>
                View your salary information and payroll history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payrolls.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payroll records yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Payroll will be generated at the end of each month
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payrolls.map((payroll) => (
                    <Card key={payroll.id} className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <Badge className={payroll.status === 'processed' ? 'bg-green-500/10 text-green-700 border-0' : 'bg-yellow-500/10 text-yellow-700 border-0'}>
                            {payroll.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Basic Salary</p>
                            <p className="font-semibold">{formatCurrency(payroll.basic_salary)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Days Worked</p>
                            <p className="font-semibold">{payroll.total_days_worked.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Deductions</p>
                            <p className="font-semibold text-red-600">{formatCurrency(payroll.deductions)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Net Salary</p>
                            <p className="font-semibold text-green-600">{formatCurrency(payroll.net_salary)}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <div className="grid grid-cols-2 gap-4">
                            <span>Leave Days: {payroll.total_leave_days.toFixed(1)}</span>
                            <span>Absent Days: {payroll.total_absent_days.toFixed(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Compensation */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Compensation
              </CardTitle>
              <CardDescription>
                View your bonuses, incentives, allowances, and deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {compensations.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No compensation records yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Compensation entries will appear here when added by HR
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {compensations.map((compensation) => (
                    <Card key={compensation.id} className={`border-l-4 ${
                      compensation.type === 'bonus' ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' :
                      compensation.type === 'incentive' ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                      compensation.type === 'allowance' ? 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20' :
                      'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {compensation.type === 'bonus' && <Award className="w-4 h-4 text-green-600" />}
                            {compensation.type === 'incentive' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                            {compensation.type === 'allowance' && <DollarSign className="w-4 h-4 text-purple-600" />}
                            {compensation.type === 'deduction' && <Minus className="w-4 h-4 text-red-600" />}
                            <span className="font-medium capitalize">{compensation.type}</span>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              compensation.type === 'deduction' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {compensation.type === 'deduction' ? '-' : '+'}
                              {formatCurrency(compensation.amount)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {compensation.description && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Description:</strong> {compensation.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Effective: {new Date(compensation.effective_date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings - Change Password */}
          <Card className="lg:col-span-3">
            <ChangePasswordSection />
          </Card>
        </div>
      </div>

      {/* Leave Request Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Submit a leave request for HR approval. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leave-type" className="text-right">
                Leave Type
              </Label>
              <Select
                value={leaveFormData.leave_type}
                onValueChange={(value) => setLeaveFormData(prev => ({ ...prev, leave_type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={leaveFormData.start_date}
                onChange={(e) => setLeaveFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="col-span-3"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={leaveFormData.end_date}
                onChange={(e) => setLeaveFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="col-span-3"
                min={leaveFormData.start_date || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your leave request..."
                value={leaveFormData.reason}
                onChange={(e) => setLeaveFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLeaveDialogOpen(false)}
              disabled={submittingLeave}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitLeaveRequest}
              disabled={submittingLeave}
            >
              {submittingLeave ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Submission Dialog */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Expense Claim</DialogTitle>
            <DialogDescription>
              Submit a claim for reimbursement. Receipt upload is optional but recommended.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="claim-type" className="text-right">
                Claim Type
              </Label>
              <Select
                value={claimFormData.claim_type}
                onValueChange={(value) => setClaimFormData(prev => ({ ...prev, claim_type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={claimFormData.amount}
                onChange={(e) => setClaimFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the expense..."
                value={claimFormData.description}
                onChange={(e) => setClaimFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receipt" className="text-right">
                Receipt
              </Label>
              <div className="col-span-3">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setClaimFormData(prev => ({ ...prev, receipt: e.target.files?.[0] || null }))}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Upload receipt image or PDF
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClaimDialogOpen(false)}
              disabled={submittingClaim}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitClaimRequest}
              disabled={submittingClaim}
            >
              {submittingClaim ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Login Modal - shown after sign out */}
      <StaffLoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}