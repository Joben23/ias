import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Progress } from '@/components/ui/progress';

interface KeyPosition {
  id: string;
  name: string;
  department: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

interface SuccessionCandidate {
  id: string;
  employee_id: string;
  key_position_id: string;
  readiness_level: 'Ready Now' | 'Ready Soon' | 'Needs Development';
  readiness_score: number;
  succession_order: number;
  gap_analysis: string;
  employee?: Employee;
  key_position?: KeyPosition;
}

interface FormData {
  employee_id: string;
  key_position_id: string;
  succession_order: number;
}

export function SuccessionCandidatesPage() {
  const [candidates, setCandidates] = useState<SuccessionCandidate[]>([]);
  const [positions, setPositions] = useState<KeyPosition[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<SuccessionCandidate | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<SuccessionCandidate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employee_id: '',
    key_position_id: '',
    succession_order: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch positions
      const { data: posData, error: posError } = await supabase.from('key_positions' as any).select('*');
      if (posError) throw posError;
      setPositions((posData as unknown as KeyPosition[]) || []);

      // Fetch employees
      const { data: empData, error: empError } = await supabase
        .from('employees' as any)
        .select('id, full_name, email, department')
        .eq('status', 'active');
      if (empError) throw empError;
      setEmployees((empData as unknown as Employee[]) || []);

      // Fetch candidates with relationships
      const { data: candData, error: candError } = await supabase
        .from('succession_candidates' as any)
        .select(
          `
          *,
          employees:employee_id(id, full_name, email, department),
          key_positions:key_position_id(id, name, department)
        `
        );
      if (candError) throw candError;
      setCandidates(
        ((candData || []) as unknown as SuccessionCandidate[]).map((c: any) => ({
          ...c,
          employee: c.employees,
          key_position: c.key_positions,
        }))
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load succession candidates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCandidate = async () => {
    try {
      if (!formData.employee_id || !formData.key_position_id) {
        toast({
          title: 'Validation Error',
          description: 'Please select both employee and position',
          variant: 'destructive',
        });
        return;
      }

      // Check if candidate already exists for this position
      const existingPosition = candidates.find(
        (c) => c.key_position_id === formData.key_position_id && c.employee_id === formData.employee_id
      );

      if (existingPosition) {
        toast({
          title: 'Duplicate Entry',
          description: 'This candidate is already assigned to this position',
          variant: 'destructive',
        });
        return;
      }

      // Calculate readiness score
      let readinessScore = 0;
      try {
        const { data, error } = await supabase.rpc('calculate_succession_readiness', {
          p_employee_id: formData.employee_id,
          p_position_id: formData.key_position_id,
        });

        if (!error && data) {
          readinessScore = data.readiness_score || 0;
        }
      } catch (e) {
        console.error('Error calculating readiness:', e);
      }

      const { error } = await supabase.from('succession_candidates' as any).insert([
        {
          employee_id: formData.employee_id,
          key_position_id: formData.key_position_id,
          succession_order: formData.succession_order,
          readiness_score: readinessScore,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Succession candidate added successfully',
      });

      setFormData({ employee_id: '', key_position_id: '', succession_order: 1 });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to add succession candidate',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCandidate = async () => {
    if (!editingCandidate) return;

    try {
      const { error } = await supabase
        .from('succession_candidates' as any)
        .update({
          succession_order: formData.succession_order,
        })
        .eq('id', editingCandidate.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Succession candidate updated successfully',
      });

      setEditingCandidate(null);
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to update succession candidate',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;

    try {
      const { error } = await supabase
        .from('succession_candidates' as any)
        .delete()
        .eq('id', candidateToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Succession candidate removed successfully',
      });

      fetchData();
      setCandidateToDelete(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete succession candidate',
        variant: 'destructive',
      });
    }
  };

  const handleReorderCandidate = async (candidate: SuccessionCandidate, direction: 'up' | 'down') => {
    const samePositionCandidates = candidates
      .filter((c) => c.key_position_id === candidate.key_position_id)
      .sort((a, b) => a.succession_order - b.succession_order);

    const currentIndex = samePositionCandidates.findIndex((c) => c.id === candidate.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= samePositionCandidates.length) return;

    const targetCandidate = samePositionCandidates[newIndex];

    // Swap orders
    try {
      await supabase
        .from('succession_candidates' as any)
        .update({ succession_order: targetCandidate.succession_order })
        .eq('id', candidate.id);

      await supabase
        .from('succession_candidates' as any)
        .update({ succession_order: candidate.succession_order })
        .eq('id', targetCandidate.id);

      fetchData();
    } catch (error) {
      console.error('Error reordering candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder candidates',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (candidate: SuccessionCandidate) => {
    setEditingCandidate(candidate);
    setFormData({
      employee_id: candidate.employee_id,
      key_position_id: candidate.key_position_id,
      succession_order: candidate.succession_order,
    });
    setIsEditDialogOpen(true);
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'Ready Now':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ready Soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Needs Development':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.employee?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.key_position?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterPosition || candidate.key_position_id === filterPosition;

    return matchesSearch && matchesFilter;
  });

  // Group candidates by position
  const groupedCandidates = positions.reduce(
    (acc, position) => {
      const positionCandidates = filteredCandidates
        .filter((c) => c.key_position_id === position.id)
        .sort((a, b) => a.succession_order - b.succession_order);

      if (positionCandidates.length > 0) {
        acc[position.id] = { position, candidates: positionCandidates };
      }
      return acc;
    },
    {} as Record<string, { position: KeyPosition; candidates: SuccessionCandidate[] }>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading succession candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Succession Candidates</h1>
          <p className="text-gray-600 mt-1">Manage successor assignments and readiness</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Candidate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Succession Candidate</DialogTitle>
              <DialogDescription>Select an employee to assign as a successor</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="position">Key Position *</Label>
                <Select value={formData.key_position_id} onValueChange={(value) =>
                  setFormData({ ...formData, key_position_id: value })
                }>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: value })
                }>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order">Succession Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.succession_order}
                  onChange={(e) =>
                    setFormData({ ...formData, succession_order: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <Button onClick={handleCreateCandidate} className="w-full">
                Assign Candidate
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
            placeholder="Search by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Positions</SelectItem>
            {positions.map((pos) => (
              <SelectItem key={pos.id} value={pos.id}>
                {pos.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Candidates by Position */}
      {Object.keys(groupedCandidates).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No succession candidates assigned</p>
              <p className="text-sm text-gray-500">
                Start by assigning employees to key positions
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedCandidates).map(({ position, candidates: posCandidates }) => (
            <Card key={position.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{position.name}</CardTitle>
                    <CardDescription>{position.department}</CardDescription>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {posCandidates.length} candidate(s)
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {posCandidates.map((candidate, idx) => (
                  <div
                    key={candidate.id}
                    className={`p-4 rounded-lg border-2 ${getReadinessColor(candidate.readiness_level)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block w-6 h-6 bg-gray-200 text-gray-700 rounded-full text-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="font-medium text-gray-900">{candidate.employee?.full_name}</p>
                          <span className="text-xs text-gray-600">({candidate.employee?.department})</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{candidate.readiness_level}</span>
                            <span className="font-medium">{candidate.readiness_score}%</span>
                          </div>
                          <Progress value={candidate.readiness_score} className="h-2" />
                        </div>
                        {candidate.gap_analysis && (
                          <p className="text-xs text-gray-700 mt-2">{candidate.gap_analysis}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => handleReorderCandidate(candidate, 'up')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={idx === posCandidates.length - 1}
                          onClick={() => handleReorderCandidate(candidate, 'down')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(candidate)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1"
                        onClick={() => setCandidateToDelete(candidate)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Succession Candidate</DialogTitle>
            <DialogDescription>Update candidate assignment details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {editingCandidate?.employee?.full_name}
              </div>
            </div>
            <div>
              <Label>Position</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {editingCandidate?.key_position?.name}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-order">Succession Order</Label>
              <Input
                id="edit-order"
                type="number"
                min="1"
                value={formData.succession_order}
                onChange={(e) =>
                  setFormData({ ...formData, succession_order: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <Button onClick={handleUpdateCandidate} className="w-full">
              Update Candidate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!candidateToDelete} onOpenChange={(open) => !open && setCandidateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {candidateToDelete?.employee?.full_name} from the
              succession pipeline for {candidateToDelete?.key_position?.name}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCandidate}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SuccessionCandidatesPage;
