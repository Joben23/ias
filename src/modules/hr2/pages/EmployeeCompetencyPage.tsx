import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus, Target, TrendingUp, AlertTriangle, CheckCircle, User, Award, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
}

interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface ProficiencyLevel {
  id: string;
  name: string;
  description: string;
  level_order: number;
}

interface EmployeeCompetency {
  id: string;
  competency_id: string;
  proficiency_level_id: string;
  assessed_at: string;
  notes: string;
  competencies: Competency;
  proficiency_levels: ProficiencyLevel;
}

interface RoleCompetency {
  competency_id: string;
  required_proficiency_level_id: string;
  competencies: Competency;
  proficiency_levels: ProficiencyLevel;
}

interface SkillGap {
  competency: Competency;
  currentLevel: ProficiencyLevel | null;
  requiredLevel: ProficiencyLevel;
  gap: number; // positive = gap exists
}

interface TrainingProgram {
  id: string;
  name: string;
  competency_id: string;
  description: string;
  duration_hours: number;
  competency: Competency;
}

export default function EmployeeCompetencyPage() {
  const { user } = useAuth();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeCompetencies, setEmployeeCompetencies] = useState<EmployeeCompetency[]>([]);
  const [roleCompetencies, setRoleCompetencies] = useState<RoleCompetency[]>([]);
  const [availableCompetencies, setAvailableCompetencies] = useState<Competency[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<string>('');
  const [selectedProficiency, setSelectedProficiency] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [employeeId, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let targetEmployeeId = employeeId || null;

      if (!targetEmployeeId) {
        if (!user) {
          setEmployee(null);
          setEmployeeCompetencies([]);
          setRoleCompetencies([]);
          setLoading(false);
          return;
        }

        const { data: empRecord, error: empRecordError } = await supabase
          .from('employees')
          .select('id, full_name, position, department, email, phone, status, employee_id')
          .eq('user_id', user.id)
          .single();

        if (empRecordError || !empRecord) {
          console.warn('ESS Competencies: no employee record for user', empRecordError);
          setEmployee(null);
          setEmployeeCompetencies([]);
          setRoleCompetencies([]);
          setLoading(false);
          return;
        }

        setEmployee(empRecord as Employee);
        targetEmployeeId = (empRecord as Employee).id;
      }

      // Fetch employee details
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', targetEmployeeId)
        .single();

      if (empError) throw empError;
      setEmployee(empData);

      // Fetch employee's competencies
      const { data: empCompData, error: empCompError } = await supabase
        .from('employee_competencies' as any)
        .select(`
          id,
          competency_id,
          proficiency_level_id,
          assessed_at,
          notes,
          competencies (
            id,
            name,
            category,
            description
          ),
          proficiency_levels!inner (
            id,
            name,
            description,
            level_order
          )
        `)
        .eq('employee_id', targetEmployeeId);

      if (empCompError) {
        console.warn('Employee competency fetch failed:', empCompError);
        setEmployeeCompetencies([]);
      } else {
        setEmployeeCompetencies((empCompData as unknown as EmployeeCompetency[]) || []);
      }

      // Fetch required competencies for employee's position
      const { data: roleCompData, error: roleCompError } = await supabase
        .from('role_competencies' as any)
        .select(`
          competency_id,
          required_proficiency_level_id,
          competencies (
            id,
            name,
            category,
            description
          ),
          proficiency_levels!inner (
            id,
            name,
            description,
            level_order
          )
        `)
        .eq('position', empData.position);

      if (roleCompError) {
        console.warn('Role competency fetch failed:', roleCompError);
        setRoleCompetencies([]);
      } else {
        setRoleCompetencies((roleCompData as unknown as RoleCompetency[]) || []);
      }

      // Fetch all competencies for assignment
      const { data: allCompData, error: allCompError } = await supabase
        .from('competencies' as any)
        .select('*')
        .order('name');

      if (allCompError) {
        console.warn('Available competency fetch failed:', allCompError);
        setAvailableCompetencies([]);
      } else {
        setAvailableCompetencies((allCompData as unknown as Competency[]) || []);
      }

      // Fetch proficiency levels
      const { data: profData, error: profError } = await supabase
        .from('proficiency_levels' as any)
        .select('*')
        .order('level_order');

      if (profError) {
        console.warn('Proficiency level fetch failed:', profError);
        setProficiencyLevels([]);
      } else {
        setProficiencyLevels((profData as unknown as ProficiencyLevel[]) || []);
      }

      // Fetch training programs for recommendations
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_programs' as any)
        .select('*')
        .order('name');

      if (trainingError) {
        console.warn('Training program fetch failed:', trainingError);
        setTrainingPrograms([]);
      } else {
        setTrainingPrograms((trainingData as unknown as TrainingProgram[]) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Only show toast for unexpected errors, not missing tables
      if (!(error as any)?.message?.includes('does not exist')) {
        toast({
          title: 'Error',
          description: 'Failed to load employee competency data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillGaps = (): SkillGap[] => {
    const gaps: SkillGap[] = [];

    roleCompetencies.forEach(required => {
      const current = employeeCompetencies.find(
        ec => ec.competency_id === required.competency_id
      );

      const currentLevel = current?.proficiency_levels || null;
      const requiredLevel = required.proficiency_levels;

      const gap = currentLevel
        ? requiredLevel.level_order - currentLevel.level_order
        : requiredLevel.level_order; // No current skill = maximum gap

      if (gap > 0) {
        gaps.push({
          competency: required.competencies,
          currentLevel,
          requiredLevel,
          gap,
        });
      }
    });

    return gaps.sort((a, b) => b.gap - a.gap);
  };

  const getTrainingRecommendations = (competencyId: string) => {
    return trainingPrograms.filter((training) => training.competency_id === competencyId);
  };

  const handleAssignCompetency = async () => {
    if (!selectedCompetency || !selectedProficiency || !employeeId) return;

    try {
      const { error } = await supabase
        .from('employee_competencies' as any)
        .upsert([{
          employee_id: employeeId,
          competency_id: selectedCompetency,
          proficiency_level_id: selectedProficiency,
          assessed_at: new Date().toISOString(),
        }], {
          onConflict: 'employee_id,competency_id'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Competency assigned successfully',
      });

      setDialogOpen(false);
      setSelectedCompetency('');
      setSelectedProficiency('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign competency',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProficiency = async (competencyId: string, newProficiencyId: string) => {
    if (!employeeId) return;

    try {
      const { error } = await supabase
        .from('employee_competencies' as any)
        .update({
          proficiency_level_id: newProficiencyId,
          assessed_at: new Date().toISOString(),
        })
        .eq('employee_id', employeeId)
        .eq('competency_id', competencyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Proficiency level updated successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update proficiency',
        variant: 'destructive',
      });
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-red-100 text-red-800 border-red-200';
      case 'basic': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200';
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medical': return 'bg-red-100 text-red-800 border-red-200';
      case 'technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'soft skills': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProficiencyProgressColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-red-500';
      case 'basic': return 'bg-orange-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-green-500';
      case 'expert': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getGapSeverity = (gap: number) => {
    if (gap >= 4) return { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle, label: 'Critical Gap', severity: 'critical' };
    if (gap >= 3) return { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle, label: 'Major Gap', severity: 'major' };
    if (gap >= 2) return { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle, label: 'Significant Gap', severity: 'significant' };
    if (gap >= 1) return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: TrendingUp, label: 'Minor Gap', severity: 'minor' };
    return { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, label: 'Meets Requirement', severity: 'met' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground">Employee not found</h2>
        <Button asChild className="mt-4">
          <Link to="/hr2/competency">Back to Competency Management</Link>
        </Button>
      </div>
    );
  }

  const assignedCompetencyIds = employeeCompetencies.map(ec => ec.competency_id);
  const unassignedCompetencies = availableCompetencies.filter(
    comp => !assignedCompetencyIds.includes(comp.id)
  );

  const skillGaps = calculateSkillGaps();
  const competencyProgress = roleCompetencies.length > 0
    ? ((roleCompetencies.length - skillGaps.length) / roleCompetencies.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/hr2/competency">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{employee.full_name}</h1>
          <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCompetencies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCompetencies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{skillGaps.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Competency Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(competencyProgress)}%</div>
            <Progress value={competencyProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Skill Gaps Alert */}
      {skillGaps.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Skill Gaps Identified
            </CardTitle>
            <CardDescription className="text-orange-700">
              The following competencies need improvement to meet role requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillGaps.slice(0, 4).map((gap) => {
                const severity = getGapSeverity(gap.gap);
                return (
                  <div key={gap.competency.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <div className={`p-2 rounded-full ${severity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <severity.icon className={`w-4 h-4 ${severity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{gap.competency.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {gap.currentLevel?.name || 'Not Assessed'} →
                        Required: {gap.requiredLevel.name}
                      </p>
                    </div>
                    <Badge variant="outline" className={severity.color}>
                      {severity.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Recommendations */}
      {skillGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recommended Training Programs
            </CardTitle>
            <CardDescription>
              Suggested training paths will help address the top skill gaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillGaps.map((gap) => {
                const recommendations = getTrainingRecommendations(gap.competency.id);
                if (recommendations.length === 0) {
                  return (
                    <div key={gap.competency.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium">{gap.competency.name}</p>
                      <p className="text-xs text-muted-foreground">No training programs currently mapped to this competency.</p>
                    </div>
                  );
                }

                return (
                  <div key={gap.competency.id} className="space-y-2">
                    <p className="text-sm font-medium">{gap.competency.name}</p>
                    {recommendations.slice(0, 3).map((program) => (
                      <Card key={program.id} className="p-3 border">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{program.name}</p>
                            <p className="text-xs text-muted-foreground">{program.description || 'No summary available.'}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link to={`/hr2/training/assign?employeeId=${employeeId}&competencyId=${gap.competency.id}`}>
                              Assign
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Competencies Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Role Requirements Overview
          </CardTitle>
          <CardDescription>
            Required competencies for {employee.position} position
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roleCompetencies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No competency requirements defined for this position.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleCompetencies.map((required) => {
                const current = employeeCompetencies.find(ec => ec.competency_id === required.competency_id);
                const currentLevel = current?.proficiency_levels;
                const gap = currentLevel ? required.proficiency_levels.level_order - currentLevel.level_order : required.proficiency_levels.level_order;
                const severity = getGapSeverity(gap);
                const progressValue = currentLevel ? (currentLevel.level_order / 5) * 100 : 0;
                const requiredProgress = (required.proficiency_levels.level_order / 5) * 100;

                return (
                  <Card key={required.competency_id} className={`hover:shadow-md transition-shadow border-l-4 ${
                    severity.severity === 'met' ? 'border-l-green-500' :
                    severity.severity === 'minor' ? 'border-l-yellow-500' :
                    severity.severity === 'significant' ? 'border-l-orange-500' :
                    'border-l-red-500'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{required.competencies.name}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getCategoryColor(required.competencies.category)}>
                              {required.competencies.category}
                            </Badge>
                            <Badge variant="outline" className={severity.color}>
                              {severity.label}
                            </Badge>
                          </div>
                        </div>
                        <severity.icon className={`w-5 h-5 ${severity.color.replace('bg-', 'text-').replace('-50', '-600')}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {required.competencies.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Current Level</span>
                          <span className="font-medium">
                            {currentLevel ? `${currentLevel.name} (${currentLevel.level_order}/5)` : 'Not Assessed'}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={progressValue}
                            className="h-3 bg-gray-200"
                          />
                          <div
                            className="absolute top-0 h-3 bg-blue-500 opacity-30 rounded-full"
                            style={{ width: `${requiredProgress}%` }}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Beginner</span>
                            <span className="font-medium text-blue-600">Required: {required.proficiency_levels.name}</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </div>

                      {gap > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-orange-800">
                            Gap: {gap} level{gap > 1 ? 's' : ''} below requirement
                          </span>
                        </div>
                      )}

                      {!current && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCompetency(required.competency_id);
                            setSelectedProficiency('beginner');
                            setDialogOpen(true);
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Assign This Skill
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
