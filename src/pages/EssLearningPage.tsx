import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LearningCourse {
  id: string;
  course_id: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress_percentage: number;
  courses: {
    id: string;
    name: string;
    category: string;
    duration_hours: number;
    description: string;
  };
}

export default function EssLearningPage() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchEmployeeCourses();
  }, [user]);

  const fetchEmployeeCourses = async () => {
    setLoading(true);
    try {
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (empError || !empData) {
        console.warn('ESS Learning: no employee id found', empError);
        setCourses([]);
        setEmployeeId(null);
        setLoading(false);
        return;
      }

      setEmployeeId(empData.id);

      const { data, error } = await supabase
        .from('employee_courses' as any)
        .select(`
          id,
          course_id,
          status,
          progress_percentage,
          courses (id, name, category, duration_hours, description)
        `)
        .eq('employee_id', empData.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.warn('ESS Learning fetch courses failed:', error);
        setCourses([]);
      } else {
        setCourses((data as LearningCourse[]) || []);
      }
    } catch (err) {
      console.error('ESS Learning error:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: courses.length,
    completed: courses.filter((c) => c.status === 'Completed').length,
    inProgress: courses.filter((c) => c.status === 'In Progress').length,
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
      <div className="flex items-center justify-between">
        <Link to="/hr2/ess" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to ESS
        </Link>
        <h1 className="text-2xl font-bold">Learning Progress</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Assigned</CardTitle>
            <CardDescription>{stats.total}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats.total ? (stats.completed / stats.total) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>{stats.completed}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{stats.completed > 0 ? 'Good' : 'None'}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <CardDescription>{stats.inProgress}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>{stats.inProgress > 0 ? 'Keep going' : 'No active courses'}</Badge>
          </CardContent>
        </Card>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No learning courses found. Ask your manager to assign learning paths.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">{course.courses?.name || 'Untitled Course'}</CardTitle>
                <CardDescription>{course.courses?.category || 'General'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{course.courses?.description || 'No course description.'}</p>
                <div className="flex items-center justify-between text-sm">
                  <p>{course.progress_percentage}%</p>
                  <Badge>{course.status}</Badge>
                </div>
                <Progress value={course.progress_percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Duration: {course.courses?.duration_hours || 0} hrs</span>
                  <span>{course.status === 'Completed' ? 'Completed' : course.status === 'In Progress' ? 'In Progress' : 'Not Started'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
