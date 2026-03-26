import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface ProficiencyLevel {
  id: string;
  name: string;
  level_order: number;
}

interface EmployeeCompetency {
  id: string;
  competency_id: string;
  proficiency_level_id: string;
  proficiency_levels: ProficiencyLevel;
  competencies: Competency;
}

interface RoleCompetency {
  competency_id: string;
  required_proficiency_level_id: string;
  competencies: Competency;
  proficiency_levels: ProficiencyLevel;
}

export default function EssCompetenciesPage() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeCompetencies, setEmployeeCompetencies] = useState<EmployeeCompetency[]>([]);
  const [roleCompetencies, setRoleCompetencies] = useState<RoleCompetency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCompetencies();
  }, [user]);

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id, position')
        .eq('user_id', user.id)
        .single();

      if (empError || !empData) {
        console.warn('ESS Competencies: employee not found', empError);
        setEmployeeId(null);
        setEmployeeCompetencies([]);
        setRoleCompetencies([]);
        setLoading(false);
        return;
      }

      setEmployeeId(empData.id);

      const [{ data: empCompData, error: empCompError }, { data: roleCompData, error: roleCompError }] = await Promise.all([
        supabase
          .from('employee_competencies' as any)
          .select(`
            id,
            competency_id,
            proficiency_level_id,
            competencies (id, name, category, description),
            proficiency_levels!inner (id, name, level_order)
          `)
          .eq('employee_id', empData.id),
        supabase
          .from('role_competencies' as any)
          .select(`
            competency_id,
            required_proficiency_level_id,
            competencies (id, name, category, description),
            proficiency_levels!inner (id, name, level_order)
          `)
          .eq('position', empData.position),
      ]);

      if (empCompError) {
        console.warn('ESS Competencies: employee_competencies fetch failed', empCompError);
        setEmployeeCompetencies([]);
      } else {
        setEmployeeCompetencies((empCompData as EmployeeCompetency[]) || []);
      }

      if (roleCompError) {
        console.warn('ESS Competencies: role_competencies fetch failed', roleCompError);
        setRoleCompetencies([]);
      } else {
        setRoleCompetencies((roleCompData as RoleCompetency[]) || []);
      }
    } catch (err) {
      console.error('ESS Competencies error', err);
      setEmployeeCompetencies([]);
      setRoleCompetencies([]);
    } finally {
      setLoading(false);
    }
  };

  const getGap = (competencyId: string): { current: number; required: number; delta: number } => {
    const current = employeeCompetencies.find((x) => x.competency_id === competencyId)?.proficiency_levels.level_order || 0;
    const required = roleCompetencies.find((x) => x.competency_id === competencyId)?.proficiency_levels.level_order || 0;
    return { current, required, delta: Math.max(0, required - current) };
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
        <h1 className="text-2xl font-bold">Competency Tracker</h1>
      </div>

      {employeeId ? null : (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-orange-500" />
            <p className="mt-2 text-muted-foreground">No linked employee profile found. Please contact HR.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleCompetencies.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No role competency requirements defined for your position.</p>
            </CardContent>
          </Card>
        )}

        {roleCompetencies.map((roleComp) => {
          const gap = getGap(roleComp.competency_id);
          const currentLevel = gap.current;
          const requiredLevel = gap.required;
          const progress = requiredLevel > 0 ? Math.min(100, (currentLevel / requiredLevel) * 100) : 0;
          const gapSeverity = gap.delta >= 2 ? 'bg-red-100 text-red-800' : gap.delta === 1 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';

          return (
            <Card key={roleComp.competency_id} className="border"> 
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {roleComp.competencies.name}
                </CardTitle>
                <CardDescription>{roleComp.competencies.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{roleComp.competencies.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm">Current: {currentLevel} / Required: {requiredLevel}</p>
                  <Badge className={gapSeverity}>{gap.delta > 0 ? `Gap ${gap.delta}` : 'On track'}</Badge>
                </div>
                <Progress value={progress} className="mt-2 h-2" />
                <div className="mt-2 text-xs text-muted-foreground">Gap analysis based on role requirement and your assigned proficiency.</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {employeeCompetencies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No competencies assigned yet. Talk to your manager to assess your skills.</p>
            </CardContent>
          </Card>
        ) : (
          employeeCompetencies.map((empComp) => {
            const roleReq = roleCompetencies.find((rc) => rc.competency_id === empComp.competency_id);
            const required = roleReq ? roleReq.proficiency_levels.level_order : 0;
            const progress = required ? Math.min(100, (empComp.proficiency_levels.level_order / required) * 100) : 0;

            return (
              <Card key={empComp.id} className="border">
                <CardHeader>
                  <CardTitle>{empComp.competencies.name}</CardTitle>
                  <CardDescription>{empComp.competencies.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>Current: {empComp.proficiency_levels.name}</span>
                    <span>Required: {roleReq?.proficiency_levels.name || 'N/A'}</span>
                  </div>
                  <Progress value={progress} className="mt-2 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">Use learning and training to close gaps.</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="flex justify-end">
        <Link to="/hr2/ess/learning">
          <Button variant="outline">View Learning Courses</Button>
        </Link>
      </div>
    </div>
  );
}
