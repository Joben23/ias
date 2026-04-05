import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
  Calendar,
  Edit3,
  Plus,
} from 'lucide-react';

interface SuccessionPlan {
  id: string;
  current_position: string;
  current_employee_name: string;
  current_employee_id: string;
  future_position: string;
  successor_name: string;
  successor_id: string;
  readiness_level: 'Ready Now' | 'Ready in 1-2 years' | 'Ready in 3+ years';
  readiness_percentage: number;
  development_plan: string;
  target_date: string;
  status: 'Active' | 'On Track' | 'At Risk' | 'Completed';
}

interface CriticalRole {
  role: string;
  current_holder: string;
  holder_id: string;
  years_in_role: number;
  retirement_eligible_year: number;
  heirs_count: number;
  coverage_level: 'Critical' | 'High' | 'Medium' | 'Low';
}

export default function SuccessionPlanningPageNew() {
  const [activeTab, setActiveTab] = useState<'plans' | 'critical' | 'development'>('plans');

  // Sample data
  const successionPlans: SuccessionPlan[] = [
    {
      id: 'SP001',
      current_position: 'Director of Clinical IT',
      current_employee_name: 'Dr. Sarah Mitchell',
      current_employee_id: 'HOS-IT-002',
      future_position: 'Director of Clinical IT',
      successor_name: 'Benjo Sion',
      successor_id: 'HOS-ENG-001',
      readiness_level: 'Ready in 1-2 years',
      readiness_percentage: 78,
      development_plan: 'Clinical leadership training, Epic architecture mentorship, healthcare compliance deep dive',
      target_date: '2027-06-01',
      status: 'On Track',
    },
    {
      id: 'SP002',
      current_position: 'Chief Health Information Officer',
      current_employee_name: 'Dr. Marcus Thompson',
      current_employee_id: 'HOS-IT-060',
      future_position: 'Chief Health Information Officer',
      successor_name: 'Dr. Sarah Mitchell',
      successor_id: 'HOS-IT-002',
      readiness_level: 'Ready in 1-2 years',
      readiness_percentage: 82,
      development_plan: 'Executive healthcare leadership, interoperability standards, population health IT',
      target_date: '2027-12-01',
      status: 'On Track',
    },
    {
      id: 'SP003',
      current_position: 'Manager of EHR Operations',
      current_employee_name: 'Thomas Anderson',
      current_employee_id: 'HOS-IT-045',
      future_position: 'Manager of EHR Operations',
      successor_name: 'Michael Chen',
      successor_id: 'HOS-IT-003',
      readiness_level: 'Ready in 3+ years',
      readiness_percentage: 52,
      development_plan: 'Advanced Epic training, operational leadership, vendor management experience',
      target_date: '2028-08-01',
      status: 'On Track',
    },
    {
      id: 'SP004',
      current_position: 'VP of Information Technology',
      current_employee_name: 'Robert Chen',
      current_employee_id: 'HOS-IT-050',
      future_position: 'VP of Information Technology',
      successor_name: 'Jessica Martinez',
      successor_id: 'HOS-IT-004',
      readiness_level: 'Ready Now',
      readiness_percentage: 91,
      development_plan: 'Strategic IT initiatives, healthcare IT compliance, executive leadership responsibilities',
      target_date: '2026-12-01',
      status: 'On Track',
    },
  ];

  const criticalRoles: CriticalRole[] = [
    {
      role: 'VP of Information Technology',
      current_holder: 'Robert Chen',
      holder_id: 'HOS-IT-050',
      years_in_role: 6,
      retirement_eligible_year: 2028,
      heirs_count: 2,
      coverage_level: 'Critical',
    },
    {
      role: 'Director of Clinical IT',
      current_holder: 'Dr. Sarah Mitchell',
      holder_id: 'HOS-IT-002',
      years_in_role: 5,
      retirement_eligible_year: 2031,
      heirs_count: 2,
      coverage_level: 'High',
    },
    {
      role: 'Chief Health Information Officer',
      current_holder: 'Dr. Marcus Thompson',
      holder_id: 'HOS-IT-060',
      years_in_role: 9,
      retirement_eligible_year: 2027,
      heirs_count: 1,
      coverage_level: 'Critical',
    },
    {
      role: 'Manager of EHR Operations',
      current_holder: 'Thomas Anderson',
      holder_id: 'HOS-IT-045',
      years_in_role: 4,
      retirement_eligible_year: 2034,
      heirs_count: 2,
      coverage_level: 'High',
    },
  ];

  const statusColors: Record<string, string> = {
    'On Track': 'bg-green-100 text-green-700',
    'At Risk': 'bg-red-100 text-red-700',
    'Active': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-gray-100 text-gray-700',
  };

  const readinessColors: Record<string, string> = {
    'Ready Now': 'bg-green-100 text-green-700',
    'Ready in 1-2 years': 'bg-yellow-100 text-yellow-700',
    'Ready in 3+ years': 'bg-orange-100 text-orange-700',
  };

  const coverageColors: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700',
    'High': 'bg-orange-100 text-orange-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Succession Planning 👥
        </h1>
        <p className="text-muted-foreground mt-1">Plan leadership succession and develop future leaders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border justify-between">
        <div className="flex gap-4">
          {['plans', 'critical', 'development'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'plans' ? 'Succession Plans' : tab === 'critical' ? 'Critical Roles' : 'Development'}
            </button>
          ))}
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Create Plan
        </Button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Target className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {successionPlans.filter(p => p.status === 'At Risk').length} plans at risk • {successionPlans.filter(p => p.readiness_level === 'Ready Now').length} ready for transition
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {successionPlans.map(plan => (
              <Card key={plan.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    {/* Current Holder */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Current Holder</p>
                      <p className="font-bold text-foreground mt-2">{plan.current_employee_name}</p>
                      <p className="text-sm text-muted-foreground">{plan.current_position}</p>
                    </div>

                    {/* Transition Arrow */}
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-2">Target</p>
                        <p className="text-lg font-bold text-foreground">→</p>
                      </div>
                    </div>

                    {/* Successor */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Successor</p>
                      <p className="font-bold text-green-700 mt-2">{plan.successor_name}</p>
                      <p className="text-sm text-green-600">{plan.future_position}</p>
                    </div>
                  </div>

                  {/* Status and Readiness */}
                  <div className="grid grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={statusColors[plan.status]} style={{ marginTop: '6px' }}>
                        {plan.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Readiness</p>
                      <Badge className={readinessColors[plan.readiness_level]} style={{ marginTop: '6px' }}>
                        {plan.readiness_level}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Readiness Level</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${plan.readiness_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{plan.readiness_percentage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target Date</p>
                      <p className="font-semibold text-foreground">{plan.target_date}</p>
                    </div>
                  </div>

                  {/* Development Plan */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Development Plan</p>
                    <p className="text-sm text-foreground">{plan.development_plan}</p>
                  </div>

                  {/* Action */}
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Critical Roles Tab */}
      {activeTab === 'critical' && (
        <div className="space-y-6">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {criticalRoles.filter(r => r.coverage_level === 'Critical').length} critical roles with succession gaps • Immediate attention required
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {criticalRoles.map((role, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg text-foreground">{role.role}</h4>
                        <Badge className={coverageColors[role.coverage_level]}>
                          {role.coverage_level} Coverage
                        </Badge>
                      </div>

                      <div className="grid grid-cols-5 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-muted-foreground text-xs">Current Holder</p>
                          <p className="font-semibold text-foreground">{role.current_holder}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Years in Role</p>
                          <p className="font-semibold text-foreground">{role.years_in_role} years</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Eligible for Retirement</p>
                          <p className={`font-semibold ${role.retirement_eligible_year - new Date().getFullYear() < 3 ? 'text-red-700' : 'text-foreground'}`}>
                            Year {role.retirement_eligible_year}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Prepared Heirs</p>
                          <p className="font-semibold text-foreground">{role.heirs_count} {role.heirs_count === 1 ? 'successor' : 'successors'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Risk Level</p>
                          <Badge className={`${role.heirs_count === 0 ? 'bg-red-100 text-red-700' : role.heirs_count === 1 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {role.heirs_count === 0 ? 'High Risk' : role.heirs_count === 1 ? 'Medium Risk' : 'Low Risk'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Development Tab */}
      {activeTab === 'development' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Potential Development Programs</CardTitle>
              <CardDescription>Programs to develop future leaders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Executive Leadership Program', 'Strategic Planning Intensive', 'Financial Acumen for Leaders', 'Change Management Certification'].map((program, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{program}</h4>
                        <p className="text-sm text-muted-foreground mt-1">12-week program</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>High-Potential Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Benjo Sion', role: 'Senior Clinical Systems Engineer', potential: 'Director Track' },
                  { name: 'Michael Chen', role: 'Healthcare Systems Analyst', potential: 'Manager Track' },
                  { name: 'Jessica Martinez', role: 'Network Security Specialist', potential: 'Director Track' },
                ].map((emp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <p className="font-semibold text-foreground">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">{emp.role}</p>
                    </div>
                    <Badge variant="outline">{emp.potential}</Badge>
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
