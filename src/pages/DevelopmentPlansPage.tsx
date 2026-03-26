import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Search, CheckCircle2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface SuccessionCandidate {
  id: string;
  employee_id: string;
  key_position_id: string;
  readiness_level: 'Ready Now' | 'Ready Soon' | 'Needs Development';
  readiness_score: number;
  employee?: { full_name: string; email: string };
  key_position?: { name: string };
}

interface DevelopmentPlan {
  id: string;
  succession_candidate_id: string;
  planned_trainings: string[];
  required_competencies: string[];
  target_completion_date: string;
  status: 'Active' | 'Completed' | 'On Hold';
  notes: string;
  created_at: string;
}

interface FormData {
  succession_candidate_id: string;
  planned_trainings: string;
  required_competencies: string;
  target_completion_date: string;
  status: 'Active' | 'Completed' | 'On Hold';
  notes: string;
}

export function DevelopmentPlansPage() {
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<DevelopmentPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<DevelopmentPlan | null>(null);
  const [formData, setFormData] = useState<FormData>({
    succession_candidate_id: '',
    planned_trainings: '',
    required_competencies: '',
    target_completion_date: '',
    status: 'Active',
    notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch candidates who need development
      const { data: candData, error: candError } = await supabase
        .from('succession_candidates' as any)
        .select(
          `
          *,
          employees:employee_id(full_name, email),
          key_positions:key_position_id(name)
        `
        )
        .eq('readiness_level', 'Needs Development');

      if (candError) throw candError;
      setCandidates(
        ((candData || []) as unknown as any[]).map((c) => ({
          ...c,
          employee: c.employees,
          key_position: c.key_positions,
        }))
      );

      // Fetch development plans
      const { data: planData, error: planError } = await supabase
        .from('succession_development_plans' as any)
        .select('*');

      if (planError) throw planError;
      setPlans((planData as unknown as DevelopmentPlan[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load development plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!formData.succession_candidate_id) {
        toast({
          title: 'Validation Error',
          description: 'Please select a succession candidate',
          variant: 'destructive',
        });
        return;
      }

      // Check if plan exists
      const existingPlan = plans.find(
        (p) => p.succession_candidate_id === formData.succession_candidate_id
      );

      if (existingPlan) {
        toast({
          title: 'Duplicate Plan',
          description: 'A development plan already exists for this candidate',
          variant: 'destructive',
        });
        return;
      }

      const trainings = formData.planned_trainings
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const competencies = formData.required_competencies
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const { error } = await supabase.from('succession_development_plans' as any).insert([
        {
          succession_candidate_id: formData.succession_candidate_id,
          planned_trainings: trainings,
          required_competencies: competencies,
          target_completion_date: formData.target_completion_date,
          status: formData.status,
          notes: formData.notes,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Development plan created successfully',
      });

      setFormData({
        succession_candidate_id: '',
        planned_trainings: '',
        required_competencies: '',
        target_completion_date: '',
        status: 'Active',
        notes: '',
      });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create development plan',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const trainings = formData.planned_trainings
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const competencies = formData.required_competencies
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const { error } = await supabase
        .from('succession_development_plans' as any)
        .update({
          planned_trainings: trainings,
          required_competencies: competencies,
          target_completion_date: formData.target_completion_date,
          status: formData.status,
          notes: formData.notes,
        })
        .eq('id', editingPlan.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Development plan updated successfully',
      });

      setEditingPlan(null);
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update development plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      const { error } = await supabase
        .from('succession_development_plans' as any)
        .delete()
        .eq('id', planToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Development plan deleted successfully',
      });

      fetchData();
      setPlanToDelete(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete development plan',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (plan: DevelopmentPlan) => {
    setEditingPlan(plan);
    setFormData({
      succession_candidate_id: plan.succession_candidate_id,
      planned_trainings: (plan.planned_trainings || []).join(', '),
      required_competencies: (plan.required_competencies || []).join(', '),
      target_completion_date: plan.target_completion_date,
      status: plan.status as 'Active' | 'Completed' | 'On Hold',
      notes: plan.notes,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCandidateForPlan = (planId: string): SuccessionCandidate | undefined => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return undefined;
    return candidates.find((c) => c.id === plan.succession_candidate_id);
  };

  const filteredPlans = plans.filter((plan) => {
    const candidate = getCandidateForPlan(plan.id);
    if (!candidate) return false;

    const matchesSearch =
      candidate.employee?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.key_position?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterStatus || plan.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading development plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Development Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage succession development paths</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Development Plan</DialogTitle>
              <DialogDescription>
                Create a development path for a succession candidate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="candidate">Succession Candidate *</Label>
                <Select
                  value={formData.succession_candidate_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, succession_candidate_id: value })
                  }
                >
                  <SelectTrigger id="candidate">
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((cand) => (
                      <SelectItem key={cand.id} value={cand.id}>
                        {cand.employee?.full_name} - {cand.key_position?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="trainings">Planned Trainings (comma-separated)</Label>
                <Textarea
                  id="trainings"
                  placeholder="e.g., Leadership 101, Financial Management, Strategic Planning"
                  value={formData.planned_trainings}
                  onChange={(e) =>
                    setFormData({ ...formData, planned_trainings: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="competencies">Required Competencies (comma-separated)</Label>
                <Textarea
                  id="competencies"
                  placeholder="e.g., Budget Management, Team Leadership, Strategic Thinking"
                  value={formData.required_competencies}
                  onChange={(e) =>
                    setFormData({ ...formData, required_competencies: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Target Completion Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.target_completion_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_completion_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes and observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <Button onClick={handleCreatePlan} className="w-full">
                Create Development Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Plans</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No development plans found</p>
              <p className="text-sm text-gray-500">
                {searchTerm || filterStatus
                  ? 'Try adjusting your filters'
                  : 'Create development plans for candidates who need additional preparation'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map((plan) => {
            const candidate = getCandidateForPlan(plan.id);
            if (!candidate) return null;

            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {plan.status === 'Completed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {candidate.employee?.full_name}
                      </CardTitle>
                      <CardDescription>
                        for {candidate.key_position?.name}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.planned_trainings && plan.planned_trainings.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Planned Trainings</p>
                      <div className="space-y-1">
                        {plan.planned_trainings.map((training, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            • {training}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.required_competencies && plan.required_competencies.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Required Competencies
                      </p>
                      <div className="space-y-1">
                        {plan.required_competencies.map((comp, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            • {comp}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.target_completion_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {new Date(plan.target_completion_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {plan.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                      <p className="text-sm text-gray-600">{plan.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(plan)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 flex-1"
                      onClick={() => setPlanToDelete(plan)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Development Plan</DialogTitle>
            <DialogDescription>Update the development path for this candidate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label>Succession Candidate</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {editingPlan && getCandidateForPlan(editingPlan.id)?.employee?.full_name}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-trainings">Planned Trainings (comma-separated)</Label>
              <Textarea
                id="edit-trainings"
                value={formData.planned_trainings}
                onChange={(e) =>
                  setFormData({ ...formData, planned_trainings: e.target.value })
                }
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit-competencies">Required Competencies (comma-separated)</Label>
              <Textarea
                id="edit-competencies"
                value={formData.required_competencies}
                onChange={(e) =>
                  setFormData({ ...formData, required_competencies: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Target Completion Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_completion_date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <Button onClick={handleUpdatePlan} className="w-full">
              Update Development Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Development Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this development plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DevelopmentPlansPage;
