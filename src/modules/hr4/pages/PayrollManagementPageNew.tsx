import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Payslip {
  id: string;
  period_start: string;
  period_end: string;
  employee_id: string;
  employee_name: string;
  position: string;
  base_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  total_earnings: number;
  total_deductions: number;
  total_allowances: number;
  net_pay: number;
  generated_date: string;
  currency: string;
  status: 'Draft' | 'Generated' | 'Paid';
}

interface PayrollSummary {
  total_employees: number;
  total_payroll: number;
  total_allowances: number;
  total_deductions: number;
  processed_count: number;
  pending_count: number;
  currency: string;
}

export default function PayrollManagementPage() {
  const [activeTab, setActiveTab] = useState<'payslips' | 'calculation' | 'reports'>('payslips');
  const [selectedMonth, setSelectedMonth] = useState('2026-04');

  // Sample data
  const payslips: Payslip[] = [
    {
      id: 'PS001',
      period_start: '2026-04-01',
      period_end: '2026-04-30',
      employee_id: 'EMP001',
      employee_name: 'John Doe',
      position: 'Senior Developer',
      base_salary: 150000,
      allowances: {
        'Housing': 15000,
        'Transportation': 5000,
        'Performance Bonus': 10000,
      },
      deductions: {
        'Income Tax': 30000,
        'Social Security': 8000,
        'Health Insurance': 2000,
      },
      total_earnings: 180000,
      total_deductions: 40000,
      total_allowances: 30000,
      net_pay: 140000,
      generated_date: '2026-05-01',
      currency: 'PHP',
      status: 'Paid',
    },
    {
      id: 'PS002',
      period_start: '2026-04-01',
      period_end: '2026-04-30',
      employee_id: 'EMP002',
      employee_name: 'Jane Smith',
      position: 'Product Manager',
      base_salary: 120000,
      allowances: {
        'Housing': 12000,
        'Transportation': 3000,
        'Performance Bonus': 8000,
      },
      deductions: {
        'Income Tax': 25000,
        'Social Security': 6500,
        'Health Insurance': 2000,
      },
      total_earnings: 143000,
      total_deductions: 33500,
      total_allowances: 23000,
      net_pay: 109500,
      generated_date: '2026-05-01',
      currency: 'PHP',
      status: 'Paid',
    },
    {
      id: 'PS003',
      period_start: '2026-04-01',
      period_end: '2026-04-30',
      employee_id: 'EMP003',
      employee_name: 'Mike Johnson',
      position: 'Designer',
      base_salary: 90000,
      allowances: {
        'Housing': 9000,
        'Transportation': 2000,
      },
      deductions: {
        'Income Tax': 18000,
        'Social Security': 5000,
        'Health Insurance': 2000,
      },
      total_earnings: 101000,
      total_deductions: 25000,
      total_allowances: 11000,
      net_pay: 76000,
      generated_date: '2026-05-01',
      currency: 'PHP',
      status: 'Generated',
    },
  ];

  const payrollSummary: PayrollSummary = {
    total_employees: 150,
    total_payroll: 20000000,
    total_allowances: 2500000,
    total_deductions: 4500000,
    processed_count: 148,
    pending_count: 2,
    currency: 'PHP',
  };

  const statusColors: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Generated': 'bg-blue-100 text-blue-700',
    'Paid': 'bg-green-100 text-green-700',
  };

  const handleGeneratePayroll = () => {
    alert(`Generate payroll for ${selectedMonth}`);
  };

  const handleDownloadPayslip = (payslipId: string) => {
    alert(`Download payslip ${payslipId}`);
  };

  const handleProcessPayment = () => {
    alert('Process payment for all employees');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Payroll Management 💳
        </h1>
        <p className="text-muted-foreground mt-1">Generate payslips and manage employee compensation</p>
      </div>

      {/* Month Selector */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Selected Period</p>
                <p className="font-semibold text-foreground">April 2026</p>
              </div>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border justify-between">
        <div className="flex gap-4">
          {['payslips', 'calculation', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'calculation' ? 'Calculation' : tab}
            </button>
          ))}
        </div>
        <Button onClick={handleGeneratePayroll} className="mb-3">
          Generate Payroll
        </Button>
      </div>

      {/* Payslips Tab */}
      {activeTab === 'payslips' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{payrollSummary.total_employees}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{payrollSummary.processed_count}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{payrollSummary.pending_count}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payroll</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {(payrollSummary.total_payroll / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payslips List */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Employee Payslips</h3>
            <div className="space-y-3">
              {payslips.map(payslip => (
                <Card key={payslip.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{payslip.employee_name}</h4>
                            <p className="text-sm text-muted-foreground">{payslip.position}</p>
                          </div>
                          <Badge className={statusColors[payslip.status]}>
                            {payslip.status}
                          </Badge>
                        </div>

                        {/* Payslip breakdown */}
                        <div className="grid grid-cols-5 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Base Salary</p>
                            <p className="font-semibold text-foreground">
                              {payslip.currency} {payslip.base_salary.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Allowances</p>
                            <p className="font-semibold text-green-700">
                              +{payslip.currency} {payslip.total_allowances.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Deductions</p>
                            <p className="font-semibold text-red-700">
                              -{payslip.currency} {payslip.total_deductions.toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground text-xs">Net Pay</p>
                            <p className="font-bold text-foreground text-lg">
                              {payslip.currency} {payslip.net_pay.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                          {format(new Date(payslip.period_start), 'MMM d')} - {format(new Date(payslip.period_end), 'MMM d, yyyy')}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPayslip(payslip.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action */}
          <Button onClick={handleProcessPayment} size="lg" className="w-full">
            Process Payment for All Employees
          </Button>
        </div>
      )}

      {/* Calculation Tab */}
      {activeTab === 'calculation' && (
        <div className="space-y-6">
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              View detailed breakdown of how salaries are calculated based on attendance, bonuses, and deductions
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Calculation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-700 mt-2">
                    {payrollSummary.currency} {(payrollSummary.total_payroll + payrollSummary.total_allowances).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-muted-foreground">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-700 mt-2">
                    {payrollSummary.currency} {payrollSummary.total_deductions.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground">Net Payroll</p>
                  <p className="text-2xl font-bold text-blue-700 mt-2">
                    {payrollSummary.currency} {(payrollSummary.total_payroll).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Calculation Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Base Salaries</span>
                    <span className="font-medium">
                      {payrollSummary.currency} {(payrollSummary.total_payroll - payrollSummary.total_allowances).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span className="text-green-700">+ Allowances & Bonuses</span>
                    <span className="font-medium text-green-700">
                      {payrollSummary.currency} {payrollSummary.total_allowances.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span className="text-red-700">- Taxes & Deductions</span>
                    <span className="font-medium text-red-700">
                      -{payrollSummary.currency} {payrollSummary.total_deductions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded border-t-2 border-blue-200">
                    <span className="font-semibold text-blue-900">= Net Payroll</span>
                    <span className="font-bold text-blue-900">
                      {payrollSummary.currency} {(payrollSummary.total_payroll).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              View payroll reports and analytics for different periods and departments
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Payroll Summary Report</p>
                <p className="text-sm text-muted-foreground">Monthly payroll overview</p>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Department Breakdown</p>
                <p className="text-sm text-muted-foreground">Payroll by department</p>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Tax Report</p>
                <p className="text-sm text-muted-foreground">Tax deductions and compliance</p>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-semibold text-foreground">Benefits Report</p>
                <p className="text-sm text-muted-foreground">Employee benefits summary</p>
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
