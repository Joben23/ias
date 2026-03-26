import { useState, useEffect } from 'react';
import { AlertCircle, Users, Target, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface KeyPosition {
  id: string;
  name: string;
  department: string;
  description: string;
  is_critical: boolean;
  current_holder_id: string;
}

interface SuccessionCandidate {
  id: string;
  employee_id: string;
  key_position_id: string;
  readiness_level: 'Ready Now' | 'Ready Soon' | 'Needs Development';
  readiness_score: number;
  succession_order: number;
  gap_analysis: string;
}

interface DashboardStats {
  totalKeyPositions: number;
  criticalPositions: number;
  readyNowCount: number;
  readySoonCount: number;
  needsDevelopmentCount: number;
  positionsWithoutSuccessors: number;
}

interface CriticalPositionWithoutSuccessor {
  position_id: string;
  position_name: string;
  department: string;
  current_holder: string;
  successor_count: number;
  ready_now_count: number;
}

export function SuccessionPlanningDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalKeyPositions: 0,
    criticalPositions: 0,
    readyNowCount: 0,
    readySoonCount: 0,
    needsDevelopmentCount: 0,
    positionsWithoutSuccessors: 0,
  });
  const [criticalGaps, setCriticalGaps] = useState<CriticalPositionWithoutSuccessor[]>([]);
  const [talentPool, setTalentPool] = useState<SuccessionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch key positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('key_positions' as any)
        .select('*');

      if (positionsError) {
        console.error('Error fetching key positions:', positionsError);
      } else {
        const positions = (positionsData as unknown as KeyPosition[]) || [];
        const criticalCount = positions.filter((p) => p.is_critical).length;

        setStats((prev) => ({
          ...prev,
          totalKeyPositions: positions.length,
          criticalPositions: criticalCount,
        }));
      }

      // Fetch succession candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('succession_candidates' as any)
        .select('*');

      if (candidatesError) {
        console.error('Error fetching succession candidates:', candidatesError);
      } else {
        const candidates = (candidatesData as unknown as SuccessionCandidate[]) || [];
        
        const readyNow = candidates.filter((c) => c.readiness_level === 'Ready Now').length;
        const readySoon = candidates.filter((c) => c.readiness_level === 'Ready Soon').length;
        const needsDev = candidates.filter((c) => c.readiness_level === 'Needs Development').length;

        setStats((prev) => ({
          ...prev,
          readyNowCount: readyNow,
          readySoonCount: readySoon,
          needsDevelopmentCount: needsDev,
        }));

        setTalentPool(candidates);
      }

      // Fetch critical positions without successors
      try {
        const { data: gapData, error: gapError } = await supabase.rpc(
          'get_critical_positions_without_successors'
        );

        if (gapError) {
          console.error('Error fetching critical gaps:', gapError);
        } else {
          const gaps = (gapData as unknown as CriticalPositionWithoutSuccessor[]) || [];
          setCriticalGaps(gaps);

          setStats((prev) => ({
            ...prev,
            positionsWithoutSuccessors: gaps.length,
          }));
        }
      } catch (error) {
        console.error('Error calling critical gaps function:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load succession planning data',
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
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading succession planning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Succession Planning</h1>
        <p className="text-gray-600 mt-1">Leadership pipeline and talent development</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalKeyPositions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.criticalPositions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.readyNowCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.readySoonCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.needsDevelopmentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">⚠️ No Successors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.positionsWithoutSuccessors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Gaps Alert */}
      {criticalGaps.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Critical Succession Gaps
            </CardTitle>
            <CardDescription className="text-red-800">
              {criticalGaps.length} critical position(s) without ready successors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalGaps.map((gap) => (
              <div
                key={gap.position_id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
              >
                <div>
                  <p className="font-medium text-gray-900">{gap.position_name}</p>
                  <p className="text-sm text-gray-600">
                    {gap.department} • Current: {gap.current_holder}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-700">
                    {gap.successor_count} candidate(s)
                  </p>
                  <p className="text-xs text-red-600">{gap.ready_now_count} ready now</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Talent Pool Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Talent Pool Overview
          </CardTitle>
          <CardDescription>Succession candidates by readiness level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {talentPool.length === 0 ? (
              <p className="text-gray-500 py-4">No succession candidates assigned yet</p>
            ) : (
              <div className="space-y-3">
                {talentPool.map((candidate) => (
                  <div key={candidate.id} className={`p-3 rounded-lg border-2 ${getReadinessColor(candidate.readiness_level)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getReadinessIcon(candidate.readiness_level)}
                          <span className="font-medium text-gray-900">
                            Position #{candidate.succession_order}
                          </span>
                        </div>
                        {candidate.gap_analysis && (
                          <p className="text-sm mt-1 text-gray-700">{candidate.gap_analysis}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold">{candidate.readiness_score}%</div>
                        <Progress value={candidate.readiness_score} className="mt-2 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-24" asChild>
          <a href="/hr2/succession/positions">
            <div>
              <Target className="h-6 w-6 mb-2" />
              <div className="text-sm font-medium">Key Positions</div>
              <div className="text-xs text-gray-500">Manage critical roles</div>
            </div>
          </a>
        </Button>

        <Button variant="outline" className="h-24" asChild>
          <a href="/hr2/succession/candidates">
            <div>
              <Users className="h-6 w-6 mb-2" />
              <div className="text-sm font-medium">Candidates</div>
              <div className="text-xs text-gray-500">Assign successors</div>
            </div>
          </a>
        </Button>

        <Button variant="outline" className="h-24" asChild>
          <a href="/hr2/succession/development">
            <div>
              <TrendingUp className="h-6 w-6 mb-2" />
              <div className="text-sm font-medium">Development</div>
              <div className="text-xs text-gray-500">Create growth plans</div>
            </div>
          </a>
        </Button>
      </div>
    </div>
  );
}

export default SuccessionPlanningDashboard;
