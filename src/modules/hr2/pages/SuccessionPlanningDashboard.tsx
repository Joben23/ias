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
  position_name: string;
  department: string;
  is_critical: boolean;
}

interface SuccessionCandidate {
  id: string;
  employee_id: string;
  key_position_id: string;
  readiness_level: 'Ready Now' | 'Ready Soon' | 'In Development';
  notes: string;
}

interface DashboardStats {
  totalKeyPositions: number;
  criticalPositions: number;
  readyNowCount: number;
  readySoonCount: number;
  needsDevelopmentCount: number;
  positionsWithoutSuccessors: number;
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
        const inDevelopment = candidates.filter((c) => c.readiness_level === 'In Development').length;

        setStats((prev) => ({
          ...prev,
          readyNowCount: readyNow,
          readySoonCount: readySoon,
          needsDevelopmentCount: inDevelopment,
        }));

        setTalentPool(candidates);
      }

      // Calculate positions without successors
      if (positionsData && candidatesData) {
        const positions = (positionsData as unknown as KeyPosition[]) || [];
        const candidates = (candidatesData as unknown as SuccessionCandidate[]) || [];
        
        const positionsWithCandidates = new Set(candidates.map(c => c.key_position_id));
        const positionsWithoutSuccessors = positions.filter(p => !positionsWithCandidates.has(p.id)).length;

        setStats((prev) => ({
          ...prev,
          positionsWithoutSuccessors,
        }));
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
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'Ready Soon':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'In Development':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300';
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case 'Ready Now':
        return <CheckCircle className="h-4 w-4" />;
      case 'Ready Soon':
        return <Clock className="h-4 w-4" />;
      case 'In Development':
        return <Zap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading succession planning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Succession Planning</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Leadership pipeline and talent development</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">Total Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalKeyPositions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.criticalPositions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">Ready Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.readyNowCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">Ready Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.readySoonCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">In Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.needsDevelopmentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">⚠️ No Successors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.positionsWithoutSuccessors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Talent Pool Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Talent Pool Overview
          </CardTitle>
          <CardDescription className="text-xs">Succession candidates by readiness level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {talentPool.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-500 py-4">No succession candidates assigned yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-200">Ready Now</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {stats.readyNowCount}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">candidates ready to step in</p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-900 dark:text-yellow-200">Ready Soon</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {stats.readySoonCount}
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">candidates in development</p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-900 dark:text-orange-200">In Development</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {stats.needsDevelopmentCount}
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">candidates need training</p>
                </div>
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
              <div className="text-sm font-medium text-foreground dark:text-white">Key Positions</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Manage critical roles</div>
            </div>
          </a>
        </Button>

        <Button variant="outline" className="h-24" asChild>
          <a href="/hr2/succession/candidates">
            <div>
              <Users className="h-6 w-6 mb-2" />
              <div className="text-sm font-medium text-foreground dark:text-white">Candidates</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Assign successors</div>
            </div>
          </a>
        </Button>

        <Button variant="outline" className="h-24" asChild>
          <a href="/hr2/succession/development">
            <div>
              <TrendingUp className="h-6 w-6 mb-2" />
              <div className="text-sm font-medium text-foreground dark:text-white">Development</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Create growth plans</div>
            </div>
          </a>
        </Button>
      </div>
    </div>
  );
}

export default SuccessionPlanningDashboard;
