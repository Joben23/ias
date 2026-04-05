import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  Edit3,
  Check,
  X,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface SalaryAdjustment {
  id: string;
  employee_id: string;
  employee_name: string;
  position: string;
  current_salary: number;
  new_salary: number;
  adjustment_percentage: number;
  adjustment_amount: number;
  reason: string;
  effective_date: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  requested_by: string;
  approved_by?: string;
}

interface CompensationMetrics {
  median_salary: number;
  average_salary: number;
  salary_range_low: number;
  salary_range_high: number;
  total_adjustment_amount: number;
  pending_adjustments: number;
}

export default function CompensationPlanningPage() {
  const [activeTab, setActiveTab] = useState<'adjustments' | 'market' | 'trends'>('adjustments');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Sample data
  const salaryAdjustments: SalaryAdjustment[] = [
    {
      id: 'ADJ001',
      employee_id: 'EMP001',
      employee_name: 'John Doe',
      position: 'Senior Developer',
      current_salary: 150000,
      new_salary: 165000,
      adjustment_percentage: 10,
      adjustment_amount: 15000,
      reason: 'Performance merit increase - Excellent Q1 reviews',
      effective_date: '2026-06-01',
      status: 'Approved',
      requested_by: 'HR Manager',
      approved_by: 'Finance Manager',
    },
    {
      id: 'ADJ002',
      employee_id: 'EMP002',
      employee_name: 'Jane Smith',
      position: 'Product Manager',
      current_salary: 120000,
      new_salary: 132000,
      adjustment_percentage: 10,
      adjustment_amount: 12000,
      reason: 'Promotion to Senior Product Manager',
      effective_date: '2026-07-01',
      status: 'Pending Approval',
      requested_by: 'Department Head',
    },
    {
      id: 'ADJ003',
      employee_id: 'EMP004',
      employee_name: 'Sarah Wilson',
      position: 'UX Designer',
      current_salary: 95000,
      new_salary: 102300,
      adjustment_percentage: 7.7,
      adjustment_amount: 7300,
      reason: 'Cost of living adjustment',
      effective_date: '2026-06-01',
      status: 'Pending Approval',
      requested_by: 'HR Manager',
    },
    {
      id: 'ADJ004',
      employee_id: 'EMP005',
      employee_name: 'Michael Chen',
      position: 'QA Engineer',
      current_salary: 85000,
      new_salary: 85000,
      adjustment_percentage: 0,
      adjustment_amount: 0,
      reason: 'Reviewed and no adjustment needed',
      effective_date: '2026-06-01',
      status: 'Approved',
      requested_by: 'HR Manager',
      approved_by: 'Finance Manager',
    },
  ];

  const metrics: CompensationMetrics = {
    median_salary: 122500,
    average_salary: 127500,
    salary_range_low: 75000,
    salary_range_high: 200000,
    total_adjustment_amount: 34300,
    pending_adjustments: 2,
  };

  const statusColors: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Pending Approval': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
  };

  const handleEditAdjustment = (id: string) => {
    setEditingId(id);
    setShowEditForm(true);
  };

  const handleApproveAdjustment = (id: string) => {
    alert(`Approve adjustment ${id}`);
  };

  const handleRejectAdjustment = (id: string) => {
    alert(`Reject adjustment ${id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Compensation Planning 💰
        </h1>
        <p className="text-muted-foreground mt-1">Manage employee salary adjustments and compensation strategy</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['adjustments', 'market', 'trends'].map(tab => (
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

      {/* Adjustments Tab */}
      {activeTab === 'adjustments' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Adjustments</p>
                    <p className="text-2xl font-bold text-foreground mt-1">PHP {metrics.total_adjustment_amount.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metrics.pending_adjustments}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Median Salary</p>
                    <p className="text-2xl font-bold text-foreground mt-1">PHP {metrics.median_salary.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Salary Range</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      PHP {metrics.salary_range_low.toLocaleString()} - {metrics.salary_range_high.toLocaleString()}
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Salary Adjustments List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Salary Adjustments</h3>
              <Button size="sm">
                + Create Adjustment
              </Button>
            </div>

            <div className="space-y-3">
              {salaryAdjustments.map(adjustment => (
                <Card key={adjustment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{adjustment.employee_name}</h4>
                            <p className="text-sm text-muted-foreground">{adjustment.position}</p>
                          </div>
                          <Badge className={statusColors[adjustment.status]}>
                            {adjustment.status}
                          </Badge>
                        </div>

                        {/* Salary Comparison */}
                        <div className="grid grid-cols-4 gap-4 my-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Current Salary</p>
                            <p className="font-semibold text-foreground">PHP {adjustment.current_salary.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">New Salary</p>
                            <p className="font-semibold text-green-700">PHP {adjustment.new_salary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Increase</p>
                            <div className="flex items-center gap-1">
                              <ArrowUp className="w-4 h-4 text-green-600" />
                              <p className="font-semibold text-green-700">
                                {adjustment.adjustment_percentage}% (+PHP {adjustment.adjustment_amount.toLocaleString()})
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-semibold text-foreground">Reason:</span> {adjustment.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Effective: {format(new Date(adjustment.effective_date), 'MMM d, yyyy')} • Requested by: {adjustment.requested_by}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAdjustment(adjustment.id)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>

                        {adjustment.status === 'Pending Approval' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApproveAdjustment(adjustment.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectAdjustment(adjustment.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market Analysis Tab */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Compare employee compensation against market rates and industry benchmarks
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Market Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Your Average Salary</span>
                    <span className="font-semibold">PHP {metrics.average_salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Market Average</span>
                    <span className="font-semibold">PHP 130000</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span className="text-sm">Difference</span>
                    <span>-PHP 2500 (Below)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Entry Level</span>
                    <Badge variant="outline">PHP 75k - 90k</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Mid Level</span>
                    <Badge variant="outline">PHP 90k - 130k</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Senior Level</span>
                    <Badge variant="outline">PHP 130k - 200k</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Historical trends and projections for compensation planning
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Annual Salary Growth Trend</CardTitle>
              <CardDescription>Average salary increase over past 3 years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">2024</span>
                  <span className="font-semibold">2.5% average increase</span>
                  <span className="text-xs text-muted-foreground">47 employees</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">2025</span>
                  <span className="font-semibold">3.2% average increase</span>
                  <span className="text-xs text-muted-foreground">52 employees</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm font-semibold">2026 (Planned)</span>
                  <span className="font-semibold text-blue-700">4.0% projected increase</span>
                  <span className="text-xs text-muted-foreground">Est. 85 employees</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 border-b border-gray-200">
                  <span>Engineering</span>
                  <div className="text-right">
                    <p className="font-semibold">15 employees</p>
                    <p className="text-muted-foreground">Avg: PHP 145k</p>
                  </div>
                </div>
                <div className="flex justify-between p-2 border-b border-gray-200">
                  <span>Product & Design</span>
                  <div className="text-right">
                    <p className="font-semibold">8 employees</p>
                    <p className="text-muted-foreground">Avg: PHP 110k</p>
                  </div>
                </div>
                <div className="flex justify-between p-2">
                  <span>Operations</span>
                  <div className="text-right">
                    <p className="font-semibold">5 employees</p>
                    <p className="text-muted-foreground">Avg: PHP 85k</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Fix missing import
function ArrowRight({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}
