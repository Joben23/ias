import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SuccessionCandidate {
  employee_id: string;
  full_name: string;
  position: string;
  readiness_score: number;
}

interface EmployeeRecord {
  id: string;
  full_name: string;
  position: string;
  department: string;
}

export default function EssCareerPathPage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [nextRoles, setNextRoles] = useState<SuccessionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchCareerPath();
  }, [user]);

  const fetchCareerPath = async () => {
    setLoading(true);
    try {
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id, full_name, position, department')
        .eq('user_id', user.id)
        .single();

      if (empError || !empData) {
        console.warn('Career path: employee not found', empError);
        setEmployee(null);
        setNextRoles([]);
        setLoading(false);
        return;
      }

      setEmployee(empData as EmployeeRecord);

      const { data: candidates, error: candidatesError } = await supabase
        .from('succession_candidates' as any)
        .select('employee_id, full_name, position, readiness_score')
        .eq('current_position', (empData as any).position)
        .order('readiness_score', { ascending: false })
        .limit(5);

      if (candidatesError) {
        console.warn('Career path candidates fetch failed', candidatesError);
        setNextRoles([]);
      } else {
        setNextRoles((candidates as SuccessionCandidate[]) || []);
      }
    } catch (error) {
      console.error('Career path error', error);
      toast({
        title: 'Error',
        description: 'Unable to load career path data',
        variant: 'destructive',
      });
      setNextRoles([]);
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
      <div className="flex items-center justify-between">
        <Link to="/hr2/ess" className="text-sm text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Career Path</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your current position</CardTitle>
          <CardDescription>Based on your profile and the hospital succession pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{employee?.position || 'Not assigned'}</p>
          <p className="text-muted-foreground">{employee?.department || ''}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextRoles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">No next roles found. Work with your manager to define a path.</CardContent>
          </Card>
        ) : (
          nextRoles.map((role) => (
            <Card key={role.employee_id} className="border">
              <CardHeader>
                <CardTitle>{role.full_name}</CardTitle>
                <CardDescription>{role.position}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Readiness score: {role.readiness_score}%</p>
                <Progress value={role.readiness_score} className="mt-2 h-2" />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
