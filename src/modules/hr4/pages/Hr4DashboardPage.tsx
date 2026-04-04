import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, DollarSign, Calendar, TrendingUp, AlertTriangle, CheckCircle, Award, Shield, Building, BookOpen, Clock, Target, Zap, Activity, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  resignedEmployees: number;
  terminatedEmployees: number;
  totalPayrollCost: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  averageSalary: number;
  totalBonuses: number;
  totalIncentives: number;
  totalBenefitsCost: number;
  governmentContributions: number;
  companyBenefits: number;
  completedCourses: number;
  trainingAttendanceRate: number;
  skillGapCount: number;
  topPerformers: number;
  highAbsenceEmployees: number;
  promotionEligible: number;
  lastUpdated: string;
}

interface PayrollData {
  month: string;
  cost: number;
  employees: number;
}

interface EmployeeStatusData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface LeaveData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface AttendanceData {
  name: string;
  present: number;
  absent: number;
  late: number;
}

interface TrainingData {
  name: string;
  completed: number;
  inProgress: number;
  notStarted: number;
}

interface TopPerformer {
  employee_id: string;
  full_name: string;
  position: string;
  performance_score: number;
  attendance_rate: number;
}

export default function Hr4DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    resignedEmployees: 0,
    terminatedEmployees: 0,
    totalPayrollCost: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 0,
    averageSalary: 0,
    totalBonuses: 0,
    totalIncentives: 0,
    totalBenefitsCost: 0,
    governmentContributions: 0,
    companyBenefits: 0,
    completedCourses: 0,
    trainingAttendanceRate: 0,
    skillGapCount: 0,
    topPerformers: 0,
    highAbsenceEmployees: 0,
    promotionEligible: 0,
    lastUpdated: '',
  });

  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [employeeStatusData, setEmployeeStatusData] = useState<EmployeeStatusData[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const startOfCurrentMonth = startOfMonth(currentDate);
      const endOfCurrentMonth = endOfMonth(currentDate);

      // ===== HR1: Workforce Metrics =====
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, employment_status, position, department');

      if (employeesError) {
        console.warn('Error fetching employees:', employeesError);
      }

      const employeesData = employees || [];
      const totalEmployees = employeesData.length;
      const activeEmployees = employeesData.filter(e => e.employment_status === 'active').length;
      const resignedEmployees = employeesData.filter(e => e.employment_status === 'resigned').length;
      const terminatedEmployees = employeesData.filter(e => e.employment_status === 'terminated').length;

      // ===== HR4: Payroll & Compensation =====
      const { data: payrolls, error: payrollsError } = await supabase
        .from('payrolls')
        .select('net_salary, employee_id')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .eq('status', 'processed');

      if (payrollsError) {
        console.warn('Error fetching payrolls:', payrollsError);
      }

      const payrollsData = payrolls || [];
      const totalPayrollCost = payrollsData.reduce((sum, p) => sum + (p.net_salary || 0), 0);

      // ===== HR3: Attendance & Leave =====
      const { data: attendanceLogs, error: attendanceError } = await supabase
        .from('attendance_logs')
        .select('status, employee_id, date')
        .gte('date', startOfCurrentMonth.toISOString().split('T')[0])
        .lte('date', endOfCurrentMonth.toISOString().split('T')[0]);

      if (attendanceError) {
        console.warn('Error fetching attendance:', attendanceError);
      }

      const attendanceData = attendanceLogs || [];
      const presentDays = attendanceData.filter(log => log.status === 'present').length;
      const absentDays = attendanceData.filter(log => log.status === 'absent').length;
      const lateDays = attendanceData.filter(log => log.status === 'late').length;

      // Leave data
      const { data: leaves, error: leavesError } = await supabase
        .from('leaves')
        .select('start_date, end_date, leave_type, status, employee_id')
        .eq('status', 'approved')
        .gte('start_date', startOfCurrentMonth.toISOString().split('T')[0])
        .lte('end_date', endOfCurrentMonth.toISOString().split('T')[0]);

      if (leavesError) {
        console.warn('Error fetching leaves:', leavesError);
      }

      const leavesData = leaves || [];
      let leaveDays = 0;
      leavesData.forEach(leave => {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        const leaveStart = startDate < startOfCurrentMonth ? startOfCurrentMonth : startDate;
        const leaveEnd = endDate > endOfCurrentMonth ? endOfCurrentMonth : endDate;
        const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        leaveDays += days > 0 ? days : 0;
      });

      // ===== HR2: Training & Development =====
      const { data: trainingAssignments, error: trainingError } = await supabase
        .from('training_assignments')
        .select('status, employee_id');

      if (trainingError) {
        console.warn('Error fetching training:', trainingError);
      }

      const trainingData = trainingAssignments || [];
      const completedCourses = trainingData.filter(t => t.status === 'completed').length;
      const inProgressCourses = trainingData.filter(t => t.status === 'in_progress').length;
      const trainingAttendanceRate = trainingData.length > 0 ? (completedCourses / trainingData.length) * 100 : 0;

      // ===== Additional HR4 Metrics =====
      const { data: employeeCompensations, error: compError } = await supabase
        .from('employee_compensation')
        .select('base_salary, bonuses, incentives');

      if (compError) {
        console.warn('Error fetching compensations:', compError);
      }

      const compData = employeeCompensations || [];
      const totalBonuses = compData.reduce((sum, c) => sum + (c.bonuses || 0), 0);
      const totalIncentives = compData.reduce((sum, c) => sum + (c.incentives || 0), 0);
      const averageSalary = compData.length > 0 ? compData.reduce((sum, c) => sum + (c.base_salary || 0), 0) / compData.length : 0;

      const { data: employeeBenefits, error: benefitsError } = await supabase
        .from('employee_benefits')
        .select('benefit_type, cost');

      if (benefitsError) {
        console.warn('Error fetching benefits:', benefitsError);
      }

      const benefitsData = employeeBenefits || [];
      const totalBenefitsCost = benefitsData.reduce((sum, b) => sum + (b.cost || 0), 0);
      const governmentContributions = benefitsData.filter(b => b.benefit_type?.includes('SSS') || b.benefit_type?.includes('Pag-IBIG') || b.benefit_type?.includes('PhilHealth')).reduce((sum, b) => sum + (b.cost || 0), 0);
      const companyBenefits = totalBenefitsCost - governmentContributions;

      // ===== Employee Competencies & Performance =====
      const { data: employeeCompetencies, error: competenciesError } = await supabase
        .from('employee_competencies')
        .select('competency_level, employee_id');

      if (competenciesError) {
        console.warn('Error fetching competencies:', competenciesError);
      }

      const competenciesData = employeeCompetencies || [];
      const skillGapCount = competenciesData.filter(c => (c.competency_level || 0) < 3).length;

      // Calculate top performers (placeholder logic)
      const topPerformersList: TopPerformer[] = employeesData.slice(0, 5).map(emp => ({
        employee_id: emp.id,
        full_name: `${emp.id}`, // Placeholder
        position: emp.position || 'Unknown',
        performance_score: Math.random() * 100, // Placeholder
        attendance_rate: Math.random() * 100, // Placeholder
      }));

      // Calculate high absence employees
      const highAbsenceEmployees = Math.floor(totalEmployees * 0.1); // Placeholder

      // Calculate promotion eligible
      const promotionEligible = Math.floor(activeEmployees * 0.15); // Placeholder

      // Set stats
      setStats({
        totalEmployees,
        activeEmployees,
        resignedEmployees,
        terminatedEmployees,
        totalPayrollCost,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        averageSalary,
        totalBonuses,
        totalIncentives,
        totalBenefitsCost,
        governmentContributions,
        companyBenefits,
        completedCourses,
        trainingAttendanceRate,
        skillGapCount,
        topPerformers: topPerformersList.length,
        highAbsenceEmployees,
        promotionEligible,
        lastUpdated: new Date().toISOString(),
      });

      // ===== Chart Data =====
      await Promise.all([
        fetchPayrollChartData(),
        fetchEmployeeStatusChartData(totalEmployees, activeEmployees, resignedEmployees, terminatedEmployees),
        fetchLeaveChartData(),
        fetchAttendanceChartData(attendanceData),
        fetchTrainingChartData(trainingData),
      ]);

      setTopPerformers(topPerformersList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollChartData = async () => {
    try {
      const chartData: PayrollData[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const { data: payrolls, error } = await supabase
          .from('payrolls')
          .select('net_salary, employee_id')
          .eq('month', month)
          .eq('year', year)
          .eq('status', 'processed');

        if (error) {
          console.warn('Error fetching payroll chart data:', error);
          continue;
        }

        const totalCost = payrolls?.reduce((sum, p) => sum + (p.net_salary || 0), 0) || 0;
        const employeeCount = new Set(payrolls?.map(p => p.employee_id)).size;

        chartData.push({
          month: format(date, 'MMM yyyy'),
          cost: totalCost,
          employees: employeeCount,
        });
      }

      setPayrollData(chartData);
    } catch (error) {
      console.error('Error fetching payroll chart data:', error);
      setPayrollData([]);
    }
  };

  const fetchEmployeeStatusChartData = async (total: number, active: number, resigned: number, terminated: number) => {
    const data: EmployeeStatusData[] = [
      {
        name: 'Active',
        value: active,
        color: '#10b981',
        percentage: total > 0 ? (active / total) * 100 : 0
      },
      {
        name: 'Resigned',
        value: resigned,
        color: '#f59e0b',
        percentage: total > 0 ? (resigned / total) * 100 : 0
      },
      {
        name: 'Terminated',
        value: terminated,
        color: '#ef4444',
        percentage: total > 0 ? (terminated / total) * 100 : 0
      },
    ];
    setEmployeeStatusData(data);
  };

  const fetchLeaveChartData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const { data: leaves, error } = await supabase
        .from('leaves')
        .select('leave_type, start_date, end_date')
        .eq('status', 'approved')
        .gte('start_date', `${currentYear}-01-01`)
        .lte('end_date', `${currentYear}-12-31`);

      if (error) throw error;

      // Count leave days by type
      const leaveTypeCounts: Record<string, number> = {};

      leaves?.forEach(leave => {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        leaveTypeCounts[leave.leave_type] = (leaveTypeCounts[leave.leave_type] || 0) + days;
      });

      const leaveChartData: LeaveData[] = [
        { name: 'Sick', value: leaveTypeCounts.sick || 0, color: '#ef4444' },
        { name: 'Vacation', value: leaveTypeCounts.vacation || 0, color: '#10b981' },
        { name: 'Emergency', value: leaveTypeCounts.emergency || 0, color: '#f59e0b' },
        { name: 'Personal', value: leaveTypeCounts.personal || 0, color: '#8b5cf6' },
      ];

      setLeaveData(leaveChartData);
    } catch (error) {
      console.error('Error fetching leave analytics data:', error);
    }
  };

  const fetchAttendanceChartData = async (attendanceData: any[]) => {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const data: AttendanceData[] = [{
      name: currentMonth,
      present: attendanceData.filter(log => log.status === 'present').length,
      absent: attendanceData.filter(log => log.status === 'absent').length,
      late: attendanceData.filter(log => log.status === 'late').length,
    }];

    setAttendanceData(data);
  };

  const fetchTrainingChartData = async (trainingData: any[]) => {
    const data: TrainingData[] = [{
      name: 'Current Month',
      completed: trainingData.filter(t => t.status === 'completed').length,
      inProgress: trainingData.filter(t => t.status === 'in_progress').length,
      notStarted: trainingData.filter(t => t.status === 'assigned').length,
    }];

    setTrainingData(data);
  };

  const generateInsights = () => {
    const insights = [];

    if (stats.activeEmployees > stats.totalEmployees * 0.8) {
      insights.push({
        type: 'positive',
        message: 'Most employees are active',
        icon: CheckCircle,
      });
    }

    if (stats.totalPayrollCost > 0) {
      insights.push({
        type: 'info',
        message: `Current month payroll: ₱${stats.totalPayrollCost.toLocaleString()}`,
        icon: DollarSign,
      });
    }

    if (stats.averageSalary > 0) {
      insights.push({
        type: 'info',
        message: `Average base salary: ₱${stats.averageSalary.toLocaleString()}`,
        icon: DollarSign,
      });
    }

    if (stats.totalBonuses > stats.averageSalary * stats.activeEmployees * 0.1) {
      insights.push({
        type: 'positive',
        message: 'High bonus allocation detected',
        icon: Award,
      });
    }

    if (stats.leaveDays > stats.presentDays * 0.1) {
      insights.push({
        type: 'warning',
        message: 'High leave usage detected',
        icon: AlertTriangle,
      });
    }

    if (stats.absentDays > stats.presentDays * 0.05) {
      insights.push({
        type: 'warning',
        message: 'High absence rate detected',
        icon: AlertTriangle,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
        </Badge>
      </div>

      {/* Workforce Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₱{stats.totalPayrollCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.presentDays + stats.absentDays > 0
                ? Math.round((stats.presentDays / (stats.presentDays + stats.absentDays)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.presentDays} present days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.trainingAttendanceRate)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCourses} courses completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* HR Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₱{stats.averageSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Base salary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₱{stats.totalBenefitsCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Monthly contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.leaveDays}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.skillGapCount}</div>
            <p className="text-xs text-muted-foreground">
              Need development
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">
              High-performing employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Absence</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highAbsenceEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotion Ready</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.promotionEligible}</div>
            <p className="text-xs text-muted-foreground">
              Eligible for advancement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Trend</CardTitle>
            <CardDescription>Monthly payroll expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            {payrollData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Payroll Cost']} />
                  <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payroll data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workforce Distribution</CardTitle>
            <CardDescription>Employee status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {employeeStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={employeeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  />
                  <Tooltip formatter={(value) => [value, 'Employees']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No employee data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance and Leave Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Current month attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                  <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attendance data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Types Distribution</CardTitle>
            <CardDescription>Breakdown of leave types used</CardDescription>
          </CardHeader>
          <CardContent>
            {leaveData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  />
                  <Tooltip formatter={(value) => [value, 'Requests']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No leave data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training and Development */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Training Completion</CardTitle>
            <CardDescription>Training program progress</CardDescription>
          </CardHeader>
          <CardContent>
            {trainingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trainingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                  <Bar dataKey="notStarted" fill="#6b7280" name="Not Started" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No training data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>High-performing employees</CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.slice(0, 5).map((performer, index) => (
                  <div key={performer.employee_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-800">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{performer.full_name}</p>
                        <p className="text-sm text-muted-foreground">{performer.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">{Math.round(performer.performance_score)}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No performance data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Top Insights</CardTitle>
          <CardDescription>Key observations from your HR data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <IconComponent className={`h-5 w-5 ${
                    insight.type === 'positive' ? 'text-green-600' :
                    insight.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <span className="text-sm font-medium">{insight.message}</span>
                </div>
              );
            })}
            {insights.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No insights available at this time.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}