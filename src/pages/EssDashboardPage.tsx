import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Columns, User, BookOpen, Award, ShieldCheck } from 'lucide-react';

export default function EssDashboardPage() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    assignedSkills: 0,
    skillGaps: 0,
    readiness: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOverview();
  }, [user]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (empError || !empData) {
        console.warn('ESS: employee record not found', empError);
        setEmployeeId(null);
      } else {
        setEmployeeId(empData.id);

        const [courseCountResponse, competencyResponse, positionResponse] = await Promise.all([
          supabase
            .from('employee_courses' as any)
            .select('*', { count: 'exact', head: true })
            .eq('employee_id', empData.id),
          supabase
            .from('employee_competencies' as any)
            .select('*')
            .eq('employee_id', empData.id),
          supabase
            .from('employees')
            .select('position')
            .eq('id', empData.id)
            .single(),
        ]);

        const courseCount = courseCountResponse.count || 0;
        const assignedSkills = (competencyResponse.data as any[]).length || 0;
        const position = positionResponse.data?.position || '';

        const { data: roleRequirements } = await supabase
          .from('role_competencies' as any)
          .select('competency_id, proficiency_levels(level_order)')
          .eq('position', position);

        const employeeComps = competencyResponse.data as any[];
        let calculatedGaps = 0;
        if (roleRequirements && Array.isArray(roleRequirements)) {
          for (const requirement of roleRequirements) {
            const current = employeeComps.find((ec) => ec.competency_id === requirement.competency_id);
            if (current && current.proficiency_levels && requirement.proficiency_levels) {
              const gap = requirement.proficiency_levels.level_order - current.proficiency_levels.level_order;
              if (gap > 0) calculatedGaps += gap;
            } else if (!current && requirement.proficiency_levels) {
              calculatedGaps += requirement.proficiency_levels.level_order;
            }
          }
        }

        const completedCoursesQuery = await supabase
          .from('employee_courses')
          .select('*', { count: 'exact', head: true })
          .eq('employee_id', empData.id)
          .eq('status', 'Completed');

        const completedCount = completedCoursesQuery.count || 0;

        setStats({
          totalCourses: courseCount || 0,
          completedCourses: completedCount,
          assignedSkills: assignedSkills,
          skillGaps: calculatedGaps,
          readiness: courseCount ? Math.round((completedCount / courseCount) * 100) : 0,
        });
      }
    } catch (error) {
      console.error('ESS Dashboard fetch error', error);
      setStats({ totalCourses: 0, completedCourses: 0, assignedSkills: 0, skillGaps: 0, readiness: 0 });
      setEmployeeId(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Employee Self-Service</CardTitle>
            <CardDescription>Quick view of your record</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{employeeId ? 'Active' : 'Not linked to employee record'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Learning Progress</CardTitle>
            <CardDescription>{stats.completedCourses}/{stats.totalCourses} completed</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats.totalCourses ? (stats.completedCourses / stats.totalCourses) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="w-4 h-4" /> Competency Coverage</CardTitle>
            <CardDescription>{stats.assignedSkills} assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-bold">{stats.assignedSkills}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Readiness</CardTitle>
            <CardDescription>{stats.skillGaps} Gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={100 - Math.min(100, Math.max(0, stats.skillGaps * 20))} className="h-2" />
            <div className="mt-2 text-sm">Estimated readiness: {stats.readiness}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to self-service sections</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link to="/hr2/ess/profile"><Button className="w-full">Profile</Button></Link>
            <Link to="/hr2/ess/learning"><Button className="w-full">Learning</Button></Link>
            <Link to="/hr2/ess/competencies"><Button className="w-full">Competencies</Button></Link>
            <Link to="/hr2/ess/career"><Button className="w-full">Career Path</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact HR for support</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use the HR reporting channels if your skills or learning plan needs revision.</p>
            <Badge className="bg-blue-100 text-blue-800">HR Support</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
