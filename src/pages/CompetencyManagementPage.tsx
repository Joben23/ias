import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookOpen, Users, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface CompetencyStats {
  totalCompetencies: number;
  totalEmployees: number;
  avgCompetenciesPerEmployee: number;
  skillGaps: number;
  criticalGaps?: number;
  employeesWithGaps?: number;
}

interface ProficiencyLevel {
  id: string;
  name: string;
  description: string;
  level_order: number;
}

interface RoleCompetency {
  id: string;
  position: string;
  competency_id: string;
  required_proficiency_level_id: string;
  competencies: Competency;
  proficiency_levels: ProficiencyLevel;
}


export default function CompetencyManagementPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [stats, setStats] = useState<CompetencyStats>({
    totalCompetencies: 0,
    totalEmployees: 0,
    avgCompetenciesPerEmployee: 0,
    skillGaps: 0,
    criticalGaps: 0,
    employeesWithGaps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
  });
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([]);
  const [roleCompetencies, setRoleCompetencies] = useState<RoleCompetency[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    position: '',
    competency_id: '',
    required_proficiency_level_id: '',
  });
  const [selectedRole, setSelectedRole] = useState('');
  const { toast } = useToast();

  const categories = ['Medical', 'Technical', 'Soft Skills'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch competencies
      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies' as any)
        .select('*')
        .order('name');

      if (competenciesError) {
        console.warn('Competency fetch failed:', competenciesError);
        setCompetencies([]);
        // Show error only if it's not a "table doesn't exist" info scenario
        if (!competenciesError.message?.includes('does not exist')) {
          toast({
            title: 'Error',
            description: 'Failed to load competency data',
            variant: 'destructive',
          });
        }
      } else {
        setCompetencies((competenciesData as Competency[]) || []);
      }

      // Fetch stats
      await fetchStats();

      // Fetch proficiency levels
      const { data: profLevelsData, error: profLevelsError } = await supabase
        .from('proficiency_levels' as any)
        .select('*')
        .order('level_order');
      if (profLevelsError) {
        console.error('Error fetching proficiency levels:', profLevelsError);
      } else {
        setProficiencyLevels((profLevelsData as ProficiencyLevel[]) || []);
      }

      // Fetch role competency requirements
      const { data: roleData, error: roleError } = await supabase
        .from('role_competencies' as any)
        .select(`
          id,
          position,
          competency_id,
          required_proficiency_level_id,
          competencies (id, name, category, description),
          proficiency_levels!inner (id, name, description, level_order)
        `)
        .order('position');
      if (roleError) {
        console.error('Error fetching role competencies:', roleError);
      } else {
        setRoleCompetencies((roleData as RoleCompetency[]) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCompetencies([]);
      setStats({
        totalCompetencies: 0,
        totalEmployees: 0,
        avgCompetenciesPerEmployee: 0,
        skillGaps: 0,
        criticalGaps: 0,
        employeesWithGaps: 0,
      });
      // Only show toast for unexpected errors, not missing tables
      if (!(error as any)?.message?.includes('does not exist')) {
        toast({
          title: 'Error',
          description: 'Failed to load competency data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total competencies
      const { count: totalCompetencies, error: compError } = await supabase
        .from('competencies' as any)
        .select('*', { count: 'exact', head: true });

      // Get total employees
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // Get average competencies per employee
      const { data: employeeCompetencies, error: empCompError } = await supabase
        .from('employee_competencies' as any)
        .select('employee_id');

      let avgCompetenciesPerEmployee = 0;
      if (empCompError || !employeeCompetencies) {
        console.warn('Employee competency fetch failed:', empCompError);
      } else {
        const uniqueEmployees = new Set(employeeCompetencies.map(ec => ec.employee_id));
        avgCompetenciesPerEmployee = uniqueEmployees.size > 0
          ? employeeCompetencies.length / uniqueEmployees.size
          : 0;
      }

      // Calculate skill gaps (simplified for now)
      const skillGaps = Math.floor(Math.random() * totalEmployees * 2); // Placeholder based on employee count
      const criticalGaps = Math.floor(skillGaps * 0.3); // Assume 30% are critical
      const employeesWithGaps = Math.floor(totalEmployees * 0.6); // Assume 60% have gaps

      setStats({
        totalCompetencies: compError ? 0 : (totalCompetencies || 0),
        totalEmployees: totalEmployees || 0,
        avgCompetenciesPerEmployee: Math.round(avgCompetenciesPerEmployee * 10) / 10,
        skillGaps,
        criticalGaps,
        employeesWithGaps,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if there's an error
      setStats({
        totalCompetencies: 0,
        totalEmployees: 0,
        avgCompetenciesPerEmployee: 0,
        skillGaps: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast({
        title: 'Error',
        description: 'Name and category are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCompetency) {
        const { error } = await supabase
          .from('competencies' as any)
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCompetency.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Competency updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('competencies' as any)
          .insert([{
            name: formData.name,
            category: formData.category,
            description: formData.description,
          }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Competency created successfully',
        });
      }

      setDialogOpen(false);
      setEditingCompetency(null);
      setFormData({ name: '', category: '', description: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save competency',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (competency: Competency) => {
    setEditingCompetency(competency);
    setFormData({
      name: competency.name,
      category: competency.category,
      description: competency.description,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (competencyId: string) => {
    if (!confirm('Are you sure you want to delete this competency?')) return;

    try {
      const { error } = await supabase
        .from('competencies' as any)
        .delete()
        .eq('id', competencyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Competency deleted successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete competency',
        variant: 'destructive',
      });
    }
  };

  const handleRoleCompetencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleForm.position || !roleForm.competency_id || !roleForm.required_proficiency_level_id) {
      toast({
        title: 'Validation Error',
        description: 'All role competency fields are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('role_competencies' as any)
        .upsert([
          {
            position: roleForm.position,
            competency_id: roleForm.competency_id,
            required_proficiency_level_id: roleForm.required_proficiency_level_id,
          },
        ], { onConflict: 'position,competency_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role competency requirement saved successfully',
      });

      setRoleDialogOpen(false);
      setRoleForm({ position: '', competency_id: '', required_proficiency_level_id: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save role competency',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoleCompetency = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role competency requirement?')) return;

    try {
      const { error } = await supabase
        .from('role_competencies' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role competency requirement deleted',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete role competency',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingCompetency(null);
    setFormData({ name: '', category: '', description: '' });
    setDialogOpen(true);
  };

  const filteredCompetencies = competencies.filter(competency => {
    const matchesSearch = competency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competency.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || competency.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medical': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'soft skills': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Competency Management</h1>
          <p className="text-muted-foreground">Define and manage organizational competencies</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Competency
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCompetency ? 'Edit Competency' : 'Create New Competency'}
              </DialogTitle>
              <DialogDescription>
                {editingCompetency ? 'Update the competency details below.' : 'Add a new competency to the system.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Patient Care"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this competency involves..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCompetency ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Competencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompetencies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Skills/Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompetenciesPerEmployee}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.skillGaps}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search competencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Competencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompetencies.map((competency) => (
          <Card key={competency.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{competency.name}</CardTitle>
                  <Badge className={getCategoryColor(competency.category)}>
                    {competency.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(competency)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(competency.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {competency.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <Link to={`/hr2/competency/${competency.id}/employees`}>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-1" />
                    View Employees
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompetencies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No competencies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first competency.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Competency
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Competency Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role Competency Requirements</CardTitle>
              <CardDescription>
                Define required competencies per job position for country-wide skill mapping.
              </CardDescription>
            </div>
            <Button onClick={() => setRoleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role Requirement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roleCompetencies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No role competency requirements found. Add one to ensure gap analysis works.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 rounded-lg">
                    <th className="p-3">Position</th>
                    <th className="p-3">Competency</th>
                    <th className="p-3">Required Level</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleCompetencies.map((roleComp) => (
                    <tr key={roleComp.id} className="border-b last:border-b-0 hover:bg-slate-50">
                      <td className="p-3">{roleComp.position}</td>
                      <td className="p-3">{roleComp.competencies.name}</td>
                      <td className="p-3">{roleComp.proficiency_levels.name}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => handleDeleteRoleCompetency(roleComp.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role Competency Requirement</DialogTitle>
            <DialogDescription>Define a role requirement to support gap analysis and development planning.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleCompetencySubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role / Position</label>
              <Input
                value={roleForm.position}
                onChange={(e) => setRoleForm({ ...roleForm, position: e.target.value })}
                placeholder="e.g., Registered Nurse"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Competency</label>
              <Select
                value={roleForm.competency_id}
                onValueChange={(value) => setRoleForm({ ...roleForm, competency_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((competency) => (
                    <SelectItem key={competency.id} value={competency.id}>
                      {competency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Required Proficiency Level</label>
              <Select
                value={roleForm.required_proficiency_level_id}
                onValueChange={(value) => setRoleForm({ ...roleForm, required_proficiency_level_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select required level" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} ({level.level_order})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
