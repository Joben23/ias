import { useState, useEffect } from 'react';
import { BookOpen, Users, TrendingUp, AlertCircle, Calendar, Clock, User, CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface TrainingProgram {
  id: string;
  name: string;
  training_type: string;
  duration_hours: number;
  required_skill_level: number;
}

interface EmployeeTraining {
  id: string;
  employee_id: string;
  training_id: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Missed';
  assigned_date: string;
  completion_date: string;
  training: TrainingProgram;
}

interface SkillGap {
  employee_id: string;
  employee_name?: string;
  competency_name: string;
  current_level: number;
  target_level: number;
  gap_level: number;
}

interface DashboardStats {
  totalAssignments: number;
  ongoingCount: number;
  completedCount: number;
  skillGapsCount: number;
  completionRate: number;
  avgTrainingHours: number;
}

export function TrainingDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssignments: 0,
    ongoingCount: 0,
    completedCount: 0,
    skillGapsCount: 0,
    completionRate: 0,
    avgTrainingHours: 0,
  });
  const [upcomingTrainings, setUpcomingTrainings] = useState<EmployeeTraining[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [recommendedTrainings, setRecommendedTrainings] = useState<
    Array<{
      id: string;
      name: string;
      affectedEmployees: number;
      skillGap: string;
      type: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get all assignments
      const { data: allAssignments, error: assignmentError } = await supabase
        .from('employee_trainings' as any)
        .select(`
          *,
          training:training_programs(*)
        `)
        .order('assigned_date', { ascending: false });

      if (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
      } else {
        const assignments = (allAssignments as unknown as EmployeeTraining[]) || [];

        // Calculate stats
        const ongoingCount = assignments.filter((a) => a.status === 'In Progress' || a.status === 'Assigned').length;
        const completedCount = assignments.filter((a) => a.status === 'Completed').length;
        const totalAssignments = assignments.length;
        const completionRate = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;
        const avgTrainingHours =
          totalAssignments > 0
            ? Math.round(
                (assignments.reduce((sum, a) => sum + (a.training?.duration_hours || 0), 0) / totalAssignments) * 10
              ) / 10
            : 0;

        setStats({
          totalAssignments,
          ongoingCount,
          completedCount,
          skillGapsCount: 0, // Will be updated after fetching skill gaps
          completionRate,
          avgTrainingHours,
        });

        // Get upcoming trainings (next 5)
        const upcoming = assignments
          .filter((a) => a.status === 'Assigned' || a.status === 'In Progress')
          .slice(0, 5);
        setUpcomingTrainings(upcoming);
      }

      // Fetch skill gaps
      try {
        const { data: gapData, error: gapError } = await supabase.rpc('get_employees_with_skill_gaps' as any);

        if (gapError) {
          console.error('Error fetching skill gaps:', gapError);
        } else {
          const gaps = (gapData as unknown as SkillGap[]) || [];
          setSkillGaps(gaps);

          // Calculate recommended trainings based on gaps
          const trainingsByGap: Record<string, Set<number>> = {};
          const gapDetails: Record<string, string> = {};

          gaps.forEach((gap) => {
            const key = `${gap.competency_name}-${gap.target_level}`;
            if (!trainingsByGap[key]) {
              trainingsByGap[key] = new Set();
              gapDetails[key] = `${gap.competency_name}: Level ${gap.current_level} → ${gap.target_level}`;
            }
            trainingsByGap[key].add(gap.employee_id as any);
          });

          // Get training programs for recommendations
          const { data: programs } = await supabase.from('training_programs' as any).select('*');
          const trainingPrograms = (programs as unknown as TrainingProgram[]) || [];

          const recommended = trainingPrograms
            .slice(0, 5)
            .map((tp) => ({
              id: tp.id,
              name: tp.name,
              affectedEmployees: Array.from(trainingsByGap[tp.id] || new Set()).length,
              skillGap: 'Skill Level Gap',
              type: tp.training_type,
            }));

          setRecommendedTrainings(recommended);

          // Update skill gaps count
          setStats((prev) => ({
            ...prev,
            skillGapsCount: new Set(gaps.map((g) => g.employee_id)).size,
          }));
        }
      } catch (error) {
        console.error('Error with skill gaps function:', error);
        // Function may not exist yet, continue without it
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
      case 'In Progress':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300';
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
      case 'Missed':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Medical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'Technical':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'Soft Skills':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading training dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Dashboard</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Overview of training programs, assignments, and effectiveness</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Trainings Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssignments}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-slate-400">Ongoing</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.ongoingCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-slate-400">Completed</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats.completedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2 h-1" />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
              {stats.completedCount} of {stats.totalAssignments} completed
            </p>
          </CardContent>
        </Card>

        {/* Skill Gaps Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Employees with Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.skillGapsCount}</div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Need skill development</p>
            <Button variant="outline" size="sm" className="mt-2 w-full text-xs h-7">
              View Details
            </Button>
          </CardContent>
        </Card>

        {/* Avg Training Hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Avg Hours per Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgTrainingHours}h</div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Investment per employee</p>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-slate-400">Training Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-slate-400">Employees Trained</span>
              <span className="font-bold text-gray-900 dark:text-white">{Math.round(stats.totalAssignments / 2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-slate-400">Total Training Hours</span>
              <span className="font-bold text-gray-900 dark:text-white">{Math.round(stats.avgTrainingHours * stats.totalAssignments)}h</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-slate-400">Training Types</span>
              <span className="font-bold text-gray-900 dark:text-white">3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Trainings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Trainings
            </CardTitle>
            <CardDescription>Next trainings scheduled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTrainings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-500 py-4">No upcoming trainings</p>
            ) : (
              upcomingTrainings.map((training) => (
                <div key={training.id} className={`p-3 rounded-lg border ${getTypeColor(training.training.training_type)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{training.training.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{training.training.duration_hours}h duration</p>
                    </div>
                    <Badge className={getStatusColor(training.status)}>{training.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Skill Gaps by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recommended Trainings
            </CardTitle>
            <CardDescription>Based on skill gaps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedTrainings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-500 py-4">No recommendations yet</p>
            ) : (
              recommendedTrainings.map((training) => (
                <div key={training.id} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{training.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {training.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3 w-3 text-gray-400 dark:text-slate-500" />
                    <span className="text-gray-600 dark:text-slate-400">{training.affectedEmployees} employees affected</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill Gaps List */}
      {skillGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Identified Skill Gaps
            </CardTitle>
            <CardDescription>Employees with competency gaps that need training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {skillGaps.slice(0, 10).map((gap, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{gap.employee_name || 'Employee'}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {gap.competency_name}: {gap.current_level} → {gap.target_level} (Gap: {gap.gap_level})
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                    Gap {gap.gap_level}
                  </Badge>
                </div>
              ))}
              {skillGaps.length > 10 && (
                <p className="text-xs text-gray-500 dark:text-slate-500 p-2 text-center">+{skillGaps.length - 10} more gaps...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add missing Button import
import { Button } from '@/components/ui/button';

export default TrainingDashboardPage;
