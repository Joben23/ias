import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  UserCheck,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Plus,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  employeesWithGaps: number;
  activeTrainings: number;
  completedCourses: number;
  employeesInProgress: number;
}

interface SkillGap {
  competency: string;
  count: number;
}

interface TrainingItem {
  id: string;
  name: string;
  schedule_date: string;
  participants: number;
  status: string;
}

interface TopLearner {
  employee_name: string;
  completed_courses: number;
  competency_level: number;
}

export default function Hr2DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    employeesWithGaps: 0,
    activeTrainings: 0,
    completedCourses: 0,
    employeesInProgress: 0,
  });
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [learningProgress, setLearningProgress] = useState({
    totalAssigned: 0,
    completionRate: 0,
    inProgress: 0,
  });
  const [upcomingTrainings, setUpcomingTrainings] = useState<TrainingItem[]>([]);
  const [topLearners, setTopLearners] = useState<TopLearner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Only query the basic employees table that should exist
      const employeesRes = await supabase.from('employees').select('*', { count: 'exact', head: true });
      const totalEmployees = employeesRes.count || 0;

      // Set minimal stats with just employee count
      setStats({
        totalEmployees,
        employeesWithGaps: 0,
        activeTrainings: 0,
        completedCourses: 0,
        employeesInProgress: 0,
      });

      // Set empty states for all other data
      setSkillGaps([]);
      setLearningProgress({
        totalAssigned: 0,
        completionRate: 0,
        inProgress: 0,
      });
      setUpcomingTrainings([]);
      setTopLearners([]);

    } catch (error) {
      console.error('Dashboard fetch failed:', error);
      // Set empty states
      setStats({
        totalEmployees: 0,
        employeesWithGaps: 0,
        activeTrainings: 0,
        completedCourses: 0,
        employeesInProgress: 0,
      });
      setSkillGaps([]);
      setLearningProgress({ totalAssigned: 0, completionRate: 0, inProgress: 0 });
      setUpcomingTrainings([]);
      setTopLearners([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HR2 Module Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            HR2 Talent Development Dashboard
          </CardTitle>
          <CardDescription>Monitor employee development, skill gaps, and training progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Link to="/hr2/competency">
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Competency
              </Button>
            </Link>
            <Link to="/hr2/learning">
              <Button variant="outline" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Learning
              </Button>
            </Link>
            <Link to="/hr2/training">
              <Button variant="outline" className="w-full">
                <GraduationCap className="w-4 h-4 mr-2" />
                Training
              </Button>
            </Link>
            <Link to="/hr2/ess">
              <Button variant="outline" className="w-full">
                <UserCheck className="w-4 h-4 mr-2" />
                ESS
              </Button>
            </Link>
            <Link to="/hr2/succession">
              <Button variant="outline" className="w-full">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Succession
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employeesWithGaps}</div>
            <p className="text-xs text-muted-foreground">Employees with gaps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrainings}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Total completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employeesInProgress}</div>
            <p className="text-xs text-muted-foreground">Learning now</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Skill Gaps</CardTitle>
            <CardDescription>Most lacking competencies across employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>HR2 Competency System Not Configured</p>
              <p className="text-sm">Run database migrations to enable skill gap analysis</p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Course completion and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>{learningProgress.completionRate}%</span>
                </div>
                <Progress value={learningProgress.completionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{learningProgress.totalAssigned}</div>
                  <p className="text-xs text-muted-foreground">Courses Assigned</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{learningProgress.inProgress}</div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Schedule & Top Learners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trainings</CardTitle>
            <CardDescription>Next 7 days training schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTrainings.length > 0 ? (
              <div className="space-y-3">
                {upcomingTrainings.slice(0, 5).map((training) => (
                  <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{training.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(training.schedule_date).toLocaleDateString()} • {training.participants} participants
                      </p>
                    </div>
                    <Badge variant="outline">{training.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>HR2 Training System Not Configured</p>
                <p className="text-sm">Run database migrations to enable training management</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Learners</CardTitle>
            <CardDescription>Most active employees in development</CardDescription>
          </CardHeader>
          <CardContent>
            {topLearners.length > 0 ? (
              <div className="space-y-3">
                {topLearners.map((learner, index) => (
                  <div key={learner.employee_name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{learner.employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {learner.completed_courses} courses • Level {learner.competency_level}
                        </p>
                      </div>
                    </div>
                    <Award className="w-4 h-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>HR2 Learning System Not Configured</p>
                <p className="text-sm">Run database migrations to enable learning management</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common HR2 tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/hr2/learning">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </Link>
            <Link to="/hr2/training">
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Training
              </Button>
            </Link>
            <Link to="/hr2/competency">
              <Button className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Assign Competency
              </Button>
            </Link>
            <Link to="/hr2/competency">
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}