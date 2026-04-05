import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserCheck,
  Calendar,
  Brain,
  Target,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeMetrics {
  total_employees: number;
  new_hires_this_year: number;
  terminations_this_year: number;
  active_training_programs: number;
  average_satisfaction: number;
  turnover_rate: number;
  engagement_score: number;
}

interface DepartmentMetrics {
  name: string;
  employee_count: number;
  budget_utilization: number;
  performance_index: number;
  open_positions: number;
}

interface EmployeeStatus {
  name: string;
  position: string;
  department: string;
  status: 'Active' | 'On Leave' | 'On Training';
  join_date: string;
  performance_rating: number;
  skills_count: number;
}

export default function HCMDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'employees'>('overview');

  // Sample data
  const metrics: EmployeeMetrics = {
    total_employees: 150,
    new_hires_this_year: 25,
    terminations_this_year: 3,
    active_training_programs: 12,
    average_satisfaction: 4.2,
    turnover_rate: 2,
    engagement_score: 78,
  };

  const departments: DepartmentMetrics[] = [
    {
      name: 'Engineering',
      employee_count: 45,
      budget_utilization: 75,
      performance_index: 88,
      open_positions: 3,
    },
    {
      name: 'Product & Design',
      employee_count: 25,
      budget_utilization: 82,
      performance_index: 85,
      open_positions: 1,
    },
    {
      name: 'Sales & Marketing',
      employee_count: 40,
      budget_utilization: 70,
      performance_index: 82,
      open_positions: 2,
    },
    {
      name: 'Operations',
      employee_count: 30,
      budget_utilization: 68,
      performance_index: 80,
      open_positions: 0,
    },
    {
      name: 'HR & Finance',
      employee_count: 10,
      budget_utilization: 80,
      performance_index: 86,
      open_positions: 1,
    },
  ];

  const employees: EmployeeStatus[] = [
    {
      name: 'John Doe',
      position: 'Senior Developer',
      department: 'Engineering',
      status: 'Active',
      join_date: '2020-03-15',
      performance_rating: 4.5,
      skills_count: 8,
    },
    {
      name: 'Jane Smith',
      position: 'Product Manager',
      department: 'Product & Design',
      status: 'Active',
      join_date: '2021-06-20',
      performance_rating: 4.3,
      skills_count: 7,
    },
    {
      name: 'Sarah Wilson',
      position: 'UX Designer',
      department: 'Product & Design',
      status: 'On Training',
      join_date: '2022-01-10',
      performance_rating: 4.0,
      skills_count: 6,
    },
    {
      name: 'Mike Johnson',
      position: 'Sales Manager',
      department: 'Sales & Marketing',
      status: 'On Leave',
      join_date: '2020-11-05',
      performance_rating: 4.2,
      skills_count: 6,
    },
    {
      name: 'Emily Brown',
      position: 'Data Analyst',
      department: 'Operations',
      status: 'Active',
      join_date: '2023-02-14',
      performance_rating: 4.1,
      skills_count: 5,
    },
  ];

  const statusColors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'On Leave': 'bg-yellow-100 text-yellow-700',
    'On Training': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Human Capital Dashboard 👥
        </h1>
        <p className="text-muted-foreground mt-1">Manage workforce, departments, and employee development</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['overview', 'departments', 'employees'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{metrics.total_employees}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Score</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.engagement_score}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${metrics.engagement_score}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Turnover Rate</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{metrics.turnover_rate}%</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{metrics.average_satisfaction}/5</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workforce Changes */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Hires (YTD)</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{metrics.new_hires_this_year}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Terminations (YTD)</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{metrics.terminations_this_year}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Training Programs</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{metrics.active_training_programs}</p>
                  </div>
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personnel Actions */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              3 pending approvals • 2 open requisitions • 5 employees pending review
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Department Overview</h3>
            <Button size="sm" variant="outline">
              View Department Reports
            </Button>
          </div>

          <div className="space-y-3">
            {departments.map(dept => (
              <Card key={dept.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{dept.name}</h4>
                        <Badge variant="outline">{dept.employee_count} employees</Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Performance Index</p>
                          <p className="font-semibold text-foreground">{dept.performance_index}/100</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${dept.performance_index}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Budget Utilization</p>
                          <p className="font-semibold text-foreground">{dept.budget_utilization}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${dept.budget_utilization}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-xs">Open Positions</p>
                          <div className="flex items-center gap-2 mt-2">
                            {dept.open_positions > 0 ? (
                              <>
                                <span className="font-semibold text-orange-700">{dept.open_positions} open</span>
                                <Button size="sm" variant="outline">
                                  Post Job
                                </Button>
                              </>
                            ) : (
                              <span className="text-green-700 text-sm font-semibold">All positions filled</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Active Employees</h3>
            <Button size="sm">
              + Add Employee
            </Button>
          </div>

          <div className="space-y-3">
            {employees.map((emp, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{emp.name}</h4>
                          <p className="text-sm text-muted-foreground">{emp.position}</p>
                        </div>
                        <Badge className={statusColors[emp.status]}>
                          {emp.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-5 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-muted-foreground text-xs">Department</p>
                          <p className="font-semibold text-foreground">{emp.department}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Joined</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(emp.join_date), 'MMM yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Performance</p>
                          <p className="font-semibold text-foreground">{emp.performance_rating}/5 ⭐</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Skills</p>
                          <p className="font-semibold text-foreground">{emp.skills_count} skills</p>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
