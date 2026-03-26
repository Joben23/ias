import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, CheckCircle, Clock, Zap, Target, BookOpen } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
}

interface SuccessionOpportunity {
  key_position_id: string;
  position_name: string;
  department: string;
  readiness_score: number;
  readiness_level: 'Ready Now' | 'Ready Soon' | 'Needs Development';
  succession_order: number;
  gap_analysis: string;
}

interface DevelopmentPlan {
  id: string;
  planned_trainings: string[];
  required_competencies: string[];
  target_completion_date: string;
  status: 'Active' | 'Completed' | 'On Hold';
  notes: string;
}

interface EmployeeMetrics {
  totalOpportunities: number;
  readyNow: number;
  readySoon: number;
  inDevelopment: number;
  activePlans: number;
  completedPlans: number;
}

export function EmployeeSuccessionPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [opportunities, setOpportunities] = useState<SuccessionOpportunity[]>([]);
  const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>([]);
  const [metrics, setMetrics] = useState<EmployeeMetrics>({
    totalOpportunities: 0,
    readyNow: 0,
    readySoon: 0,
    inDevelopment: 0,
    activePlans: 0,
    completedPlans: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeSuccessionData();
    }
  }, [employeeId]);

  const fetchEmployeeSuccessionData = async () => {
    try {
      setLoading(true);

      // Fetch employee
      const { data: empData, error: empError } = await supabase
        .from('employees' as any)
        .select('id, full_name, email, department, position')
        .eq('id', employeeId)
        .single();

      if (empError) throw empError;
      setEmployee(empData as unknown as Employee);

      // Fetch succession opportunities
      const { data: oppData, error: oppError } = await supabase
        .from('succession_candidates' as any)
        .select(
          `
          key_position_id,
          readiness_score,
          readiness_level,
          succession_order,
          gap_analysis,
          key_positions:key_position_id(name, department)
        `
        )
        .eq('employee_id', employeeId);

      if (oppError) throw oppError;

      const formattedOpportunities = ((oppData || []) as unknown as any[]).map((opp) => ({
        key_position_id: opp.key_position_id,
        position_name: opp.key_positions?.name || 'Unknown Position',
        department: opp.key_positions?.department || 'Unknown Department',
        readiness_score: opp.readiness_score,
        readiness_level: opp.readiness_level,
        succession_order: opp.succession_order,
        gap_analysis: opp.gap_analysis,
      }));

      setOpportunities(formattedOpportunities);

      // Fetch development plans for this employee's opportunities
      const candidateIds = ((oppData || []) as unknown as any[]).map((opp) => opp.id);

      if (candidateIds.length > 0) {
        const { data: planData, error: planError } = await supabase
          .from('succession_development_plans' as any)
          .select('*')
          .in('succession_candidate_id', candidateIds);

        if (planError) throw planError;
        setDevelopmentPlans((planData as unknown as DevelopmentPlan[]) || []);
      }

      // Calculate metrics
      const readyNow = formattedOpportunities.filter((o) => o.readiness_level === 'Ready Now').length;
      const readySoon = formattedOpportunities.filter(
        (o) => o.readiness_level === 'Ready Soon'
      ).length;
      const inDevelopment = formattedOpportunities.filter(
        (o) => o.readiness_level === 'Needs Development'
      ).length;

      const activePlans = ((planData || []) as any[]).filter((p) => p.status === 'Active').length;
      const completedPlans = ((planData || []) as any[]).filter((p) => p.status === 'Completed').length;

      setMetrics({
        totalOpportunities: formattedOpportunities.length,
        readyNow,
        readySoon,
        inDevelopment,
        activePlans,
        completedPlans,
      });
    } catch (error) {
      console.error('Error fetching succession data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load succession information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'Ready Now':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ready Soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Needs Development':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case 'Ready Now':
        return <CheckCircle className="h-4 w-4" />;
      case 'Ready Soon':
        return <Clock className="h-4 w-4" />;
      case 'Needs Development':
        return <Zap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading your career information...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Employee information not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
        <p className="text-gray-600 mt-1">{employee.position}</p>
        <div className="flex gap-4 mt-3">
          <span className="text-sm text-gray-600">{employee.department}</span>
          <span className="text-sm text-gray-600">{employee.email}</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.totalOpportunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.readyNow}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.readySoon}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{metrics.inDevelopment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metrics.activePlans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{metrics.completedPlans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Succession Opportunities */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-6 w-6" />
          Succession Opportunities
        </h2>

        {opportunities.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No succession opportunities identified</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <Card key={opp.key_position_id} className={`border-2 ${getReadinessColor(opp.readiness_level)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getReadinessIcon(opp.readiness_level)}
                        <h3 className="font-semibold text-gray-900">{opp.position_name}</h3>
                        <span className="text-xs text-gray-600">({opp.department})</span>
                        {opp.succession_order && (
                          <Badge variant="outline" className="ml-auto">
                            Position #{opp.succession_order}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{opp.readiness_level}</p>

                      {opp.gap_analysis && (
                        <div className="bg-white bg-opacity-50 p-2 rounded text-sm text-gray-700 mb-3">
                          <p className="font-medium mb-1">Gap Analysis:</p>
                          <p>{opp.gap_analysis}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Readiness</span>
                        <span className="text-sm font-bold">{opp.readiness_score}%</span>
                      </div>
                      <Progress value={opp.readiness_score} className="mt-2 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Development Plans */}
      {developmentPlans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Your Development Plans
          </h2>

          <div className="space-y-4">
            {developmentPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Development Plan
                      </CardTitle>
                      <CardDescription>Status: {plan.status}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        plan.status === 'Completed'
                          ? 'secondary'
                          : plan.status === 'On Hold'
                            ? 'outline'
                            : 'default'
                      }
                    >
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.planned_trainings && plan.planned_trainings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Planned Trainings</p>
                      <ul className="space-y-1">
                        {plan.planned_trainings.map((training, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span>✓</span>
                            <span>{training}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.required_competencies && plan.required_competencies.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Required Competencies
                      </p>
                      <ul className="space-y-1">
                        {plan.required_competencies.map((comp, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span>→</span>
                            <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.target_completion_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Target Completion:</span>
                      <span>{new Date(plan.target_completion_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {plan.notes && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {plan.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Career Development Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>Career Development Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="text-blue-600">🎯</div>
            <div>
              <p className="font-medium text-gray-900">Focus on Your Opportunities</p>
              <p className="text-sm text-gray-600">
                Work closely with your manager on the opportunities identified for you
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-blue-600">📚</div>
            <div>
              <p className="font-medium text-gray-900">Complete Recommended Trainings</p>
              <p className="text-sm text-gray-600">
                Engage with the trainings in your development plan to build critical competencies
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-blue-600">💬</div>
            <div>
              <p className="font-medium text-gray-900">Regular Check-ins</p>
              <p className="text-sm text-gray-600">
                Schedule regular feedback sessions with your manager to track progress
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-blue-600">🚀</div>
            <div>
              <p className="font-medium text-gray-900">Continuous Learning</p>
              <p className="text-sm text-gray-600">
                Seek mentorship and learning opportunities to advance your career
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmployeeSuccessionPage;
