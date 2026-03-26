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
  readiness_level: 'Ready Now' | 'Ready Soon' | 'In Development';
  employee?: { full_name: string; email: string };
  key_position?: { position_name: string };
}

interface DevelopmentPlan {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'Active' | 'Completed' | 'On Hold';
  created_at: string;
}

interface FormData {
  employee_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'Active' | 'Completed' | 'On Hold';
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
    employee_id: '',
    title: '',
    description: '',
    target_date: '',
    status: 'Active',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all active employees
      const { data: empData, error: empError } = await supabase
        .from('employees' as any)
        .select('id, full_name, email, department')
        .eq('status', 'active');

      if (empError) throw empError;

      setCandidates((empData || []).map((emp: any) => ({
        id: emp.id,
        employee_id: emp.id,
        key_position_id: '', // Not needed for this page
        readiness_level: 'In Development' as const,
        employee: { full_name: emp.full_name, email: emp.email },
        key_position: { position_name: '' },
      })));

      // Fetch development plans
      const { data: planData, error: planError } = await supabase
        .from('development_plans' as any)
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
      if (!formData.employee_id || !formData.title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please select an employee and provide a title',
          variant: 'destructive',
        });
        return;
      }

      // Check if plan exists for this employee
      const existingPlan = plans.find(
        (p) => p.employee_id === formData.employee_id && p.title === formData.title
      );

      if (existingPlan) {
        toast({
          title: 'Duplicate Plan',
          description: 'A development plan with this title already exists for this employee',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('development_plans' as any).insert([
        {
          employee_id: formData.employee_id,
          title: formData.title,
          description: formData.description,
          target_date: formData.target_date,
          status: formData.status,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Development plan created successfully',
      });

      setFormData({ employee_id: '', title: '', description: '', target_date: '', status: 'Active' });
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
      const { error } = await supabase
        .from('development_plans' as any)
        .update({
          title: formData.title,
          description: formData.description,
          target_date: formData.target_date,
          status: formData.status,
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
        .from('development_plans' as any)
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
      employee_id: plan.employee_id,
      title: plan.title,
      description: plan.description,
      target_date: plan.target_date,
      status: plan.status as 'Active' | 'Completed' | 'On Hold',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmployeeForPlan = (plan: DevelopmentPlan) => {
    return candidates.find((c) => c.employee_id === plan.employee_id);
  };

  const filteredPlans = plans.filter((plan) => {
    const employee = getEmployeeForPlan(plan);
    if (!employee) return false;

    const matchesSearch =
      employee.employee?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());

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
                <Label htmlFor="employee">Employee *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employee_id: value })
                  }
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((cand) => (
                      <SelectItem key={cand.id} value={cand.employee_id}>
                        {cand.employee?.full_name} ({cand.employee?.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Leadership Development Program"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the development plan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="target_date">Target Completion Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Active' | 'Completed' | 'On Hold') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
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
            const employee = getEmployeeForPlan(plan);
            if (!employee) return null;

            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {plan.status === 'Completed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {plan.title}
                      </CardTitle>
                      <CardDescription>
                        for {employee.employee?.full_name}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                  )}

                  {plan.target_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {new Date(plan.target_date).toLocaleDateString()}</span>
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
              <Label>Employee</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {editingPlan && getEmployeeForPlan(editingPlan)?.employee?.full_name}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Target Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_date: e.target.value,
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
