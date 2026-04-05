import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart,
  Shield,
  TrendingUp,
  Check,
  Clock,
  Zap,
  AlertCircle,
  Download,
} from 'lucide-react';

interface BenefitPlan {
  id: string;
  name: string;
  category: 'Health' | 'Insurance' | 'Retirement' | 'Wellness';
  description: string;
  monthly_premium: number;
  company_contribution: number;
  employee_contribution: number;
  coverage_details: string[];
  enrollment_deadline: string;
  enrolled_count: number;
  total_employees: number;
}

interface EmployeeBenefit {
  id: string;
  plan_name: string;
  status: 'Active' | 'Pending' | 'Expired' | 'Cancelled';
  effective_date: string;
  coverage_type: 'Employee Only' | 'Employee + Spouse' | 'Employee + Children' | 'Family';
  monthly_deduction: number;
}

export default function BenefitsPageNew() {
  const [activeTab, setActiveTab] = useState<'plans' | 'mybenefits' | 'enroll'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Sample data
  const benefitPlans: BenefitPlan[] = [
    {
      id: 'BP001',
      name: 'Comprehensive Health Insurance',
      category: 'Health',
      description: 'Complete medical coverage with preventive care and hospitalization',
      monthly_premium: 5000,
      company_contribution: 3500,
      employee_contribution: 1500,
      coverage_details: [
        'Outpatient care',
        'Hospitalization',
        'Emergency services',
        'Preventive checkups',
      ],
      enrollment_deadline: '2026-06-30',
      enrolled_count: 142,
      total_employees: 150,
    },
    {
      id: 'BP002',
      name: 'Dental Insurance',
      category: 'Health',
      description: 'Dental and orthodontic coverage',
      monthly_premium: 500,
      company_contribution: 250,
      employee_contribution: 250,
      coverage_details: [
        'Regular checkups',
        'Cleanings',
        'Fillings',
        'Orthodontic treatment (50%)',
      ],
      enrollment_deadline: '2026-06-30',
      enrolled_count: 95,
      total_employees: 150,
    },
    {
      id: 'BP003',
      name: 'Life Insurance (2x salary)',
      category: 'Insurance',
      description: 'Life insurance coverage at 2x annual salary',
      monthly_premium: 800,
      company_contribution: 800,
      employee_contribution: 0,
      coverage_details: [
        '2x annual salary coverage',
        'Accidental death benefit',
        'Disability waiver',
      ],
      enrollment_deadline: '2026-06-30',
      enrolled_count: 148,
      total_employees: 150,
    },
    {
      id: 'BP004',
      name: '401k Retirement Plan',
      category: 'Retirement',
      description: 'Tax-deferred retirement savings with 4% company match',
      monthly_premium: 0,
      company_contribution: 4,
      employee_contribution: 0,
      coverage_details: [
        '4% company match',
        'Tax-deferred contributions',
        'Investment options',
        'Early withdrawal options',
      ],
      enrollment_deadline: '2026-12-31',
      enrolled_count: 135,
      total_employees: 150,
    },
    {
      id: 'BP005',
      name: 'Wellness Program',
      category: 'Wellness',
      description: 'Fitness, mental health, and wellness services',
      monthly_premium: 300,
      company_contribution: 300,
      employee_contribution: 0,
      coverage_details: [
        'Gym membership',
        'Mental health counseling',
        'Wellness coaching',
        'Health screenings',
      ],
      enrollment_deadline: '2026-08-30',
      enrolled_count: 87,
      total_employees: 150,
    },
  ];

  const myBenefits: EmployeeBenefit[] = [
    {
      id: 'EB001',
      plan_name: 'Comprehensive Health Insurance',
      status: 'Active',
      effective_date: '2025-01-01',
      coverage_type: 'Employee + Spouse',
      monthly_deduction: 1500,
    },
    {
      id: 'EB002',
      plan_name: 'Dental Insurance',
      status: 'Active',
      effective_date: '2025-01-01',
      coverage_type: 'Employee Only',
      monthly_deduction: 250,
    },
    {
      id: 'EB003',
      plan_name: 'Life Insurance (2x salary)',
      status: 'Active',
      effective_date: '2024-06-15',
      coverage_type: 'Employee Only',
      monthly_deduction: 0,
    },
    {
      id: 'EB004',
      plan_name: '401k Retirement Plan',
      status: 'Active',
      effective_date: '2024-01-01',
      coverage_type: 'Employee Only',
      monthly_deduction: 0,
    },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    'Health': <Heart className="w-5 h-5 text-red-500" />,
    'Insurance': <Shield className="w-5 h-5 text-blue-500" />,
    'Retirement': <TrendingUp className="w-5 h-5 text-green-500" />,
    'Wellness': <Zap className="w-5 h-5 text-yellow-500" />,
  };

  const statusColors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Expired': 'bg-gray-100 text-gray-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };

  const handleEnrollBenefit = (planId: string) => {
    alert(`Enroll in plan ${planId}`);
  };

  const handleCancelBenefit = (benefitId: string) => {
    alert(`Cancel benefit ${benefitId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Employee Benefits 💚
        </h1>
        <p className="text-muted-foreground mt-1">Manage health, insurance, retirement, and wellness benefits</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['plans', 'mybenefits', 'enroll'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'mybenefits' ? 'My Benefits' : tab === 'enroll' ? 'Enroll' : tab}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Open Enrollment Period: Available until December 31, 2026. Company subsidizes a portion of all plans.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {benefitPlans.map(plan => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-colors ${
                  selectedPlan === plan.id ? 'ring-2 ring-primary' : 'hover:border-primary'
                }`}
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{categoryIcons[plan.category]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{plan.name}</h4>
                          <Badge variant="outline">{plan.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Enrollment</p>
                      <p className="font-semibold text-foreground">
                        {plan.enrolled_count}/{plan.total_employees} enrolled
                      </p>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(plan.enrolled_count / plan.total_employees) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-3 gap-4 my-4 p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Premium</p>
                      <p className="font-semibold text-foreground">PHP {plan.monthly_premium.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Company Pays</p>
                      <p className="font-semibold text-green-700">
                        PHP {plan.company_contribution.toLocaleString()} (
                        {((plan.company_contribution / plan.monthly_premium) * 100).toFixed(0)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">You Pay</p>
                      <p className="font-semibold text-foreground">PHP {plan.employee_contribution.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Coverage Details (Expandable) */}
                  {selectedPlan === plan.id && (
                    <div className="my-4 pt-4 border-t border-gray-200">
                      <h5 className="font-semibold text-foreground text-sm mb-2">Coverage Includes:</h5>
                      <ul className="space-y-1">
                        {plan.coverage_details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-muted-foreground">
                          Deadline: {plan.enrollment_deadline}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleEnrollBenefit(plan.id)}
                        >
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Benefits Tab */}
      {activeTab === 'mybenefits' && (
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Active Benefits: {myBenefits.filter(b => b.status === 'Active').length}</p>
                  <p className="text-sm text-green-700">You have 4 active benefit plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Benefit Deductions Summary</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">Total Monthly Deduction</p>
                    <p className="text-2xl font-bold text-foreground mt-1">PHP 1,750</p>
                    <p className="text-xs text-muted-foreground mt-2">Health insurance + Dental</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-muted-foreground">Company Contribution</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">PHP 4,650</p>
                    <p className="text-xs text-muted-foreground mt-2">All plans combined</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm text-muted-foreground">Total Benefit Value</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">PHP 6,400</p>
                    <p className="text-xs text-muted-foreground mt-2">Your + company contribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Your Current Benefits</h3>
            <div className="space-y-3">
              {myBenefits.map(benefit => (
                <Card key={benefit.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{benefit.plan_name}</h4>
                          <Badge className={statusColors[benefit.status]}>
                            {benefit.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-muted-foreground text-xs">Coverage</p>
                            <p className="font-semibold text-foreground">{benefit.coverage_type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Effective Date</p>
                            <p className="font-semibold text-foreground">{benefit.effective_date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Monthly Deduction</p>
                            <p className="font-semibold text-foreground">
                              {benefit.monthly_deduction > 0 ? `PHP ${benefit.monthly_deduction}` : 'N/A (Company paid)'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelBenefit(benefit.id)}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Change
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Benefit Summary
            </Button>
            <Button>
              Explore More Benefits
            </Button>
          </div>
        </div>
      )}

      {/* Enroll Tab */}
      {activeTab === 'enroll' && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can enroll in benefits during the open enrollment period. Some benefits require approval.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Add a New Benefit</CardTitle>
              <CardDescription>Select a benefit plan to enroll</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benefitPlans
                  .filter(p => !myBenefits.some(mb => mb.plan_name === p.name))
                  .map(plan => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div>{categoryIcons[plan.category]}</div>
                        <div>
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEnrollBenefit(plan.id)}
                      >
                        Enroll
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
