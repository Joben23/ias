import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface KeyPosition {
  id: string;
  position_name: string;
  department: string;
  is_critical: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EditFormData {
  position_name: string;
  department: string;
  is_critical: boolean;
}

export function KeyPositionsPage() {
  const [positions, setPositions] = useState<KeyPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<KeyPosition | null>(null);
  const [editingPosition, setEditingPosition] = useState<KeyPosition | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    position_name: '',
    department: '',
    is_critical: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('key_positions' as any).select('*');

      if (error) throw error;

      setPositions((data as unknown as KeyPosition[]) || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load key positions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosition = async () => {
    try {
      if (!formData.position_name.trim() || !formData.department.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('key_positions' as any).insert([
        {
          position_name: formData.position_name,
          department: formData.department,
          is_critical: formData.is_critical,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Key position created successfully',
      });

      setFormData({ position_name: '', department: '', is_critical: false });
      setIsCreateDialogOpen(false);
      fetchPositions();
    } catch (error) {
      console.error('Error creating position:', error);
      toast({
        title: 'Error',
        description: 'Failed to create key position',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition) return;

    try {
      if (!formData.position_name.trim() || !formData.department.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('key_positions' as any)
        .update({
          position_name: formData.position_name,
          department: formData.department,
          is_critical: formData.is_critical,
        })
        .eq('id', editingPosition.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Key position updated successfully',
      });

      setFormData({ position_name: '', department: '', is_critical: false });
      setEditingPosition(null);
      setIsEditDialogOpen(false);
      fetchPositions();
    } catch (error) {
      console.error('Error updating position:', error);
      toast({
        title: 'Error',
        description: 'Failed to update key position',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePosition = async () => {
    if (!positionToDelete) return;

    try {
      const { error } = await supabase
        .from('key_positions' as any)
        .delete()
        .eq('id', positionToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Key position deleted successfully',
      });

      fetchPositions();
      setPositionToDelete(null);
    } catch (error) {
      console.error('Error deleting position:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete key position',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (position: KeyPosition) => {
    setEditingPosition(position);
    setFormData({
      position_name: position.position_name,
      department: position.department,
      is_critical: position.is_critical,
    });
    setIsEditDialogOpen(true);
  };

  const filteredPositions = positions.filter(
    (pos) =>
      pos.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading key positions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Key Positions</h1>
          <p className="text-gray-600 mt-1">Define critical hospital roles</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Key Position</DialogTitle>
              <DialogDescription>Add a new critical position to the succession pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="position_name">Position Name *</Label>
                <Input
                  id="position_name"
                  placeholder="e.g., Chief Medical Officer"
                  value={formData.position_name}
                  onChange={(e) => setFormData({ ...formData, position_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="e.g., Clinical Operations"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="critical"
                  checked={formData.is_critical}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_critical: checked === true })
                  }
                />
                <Label htmlFor="critical" className="font-normal cursor-pointer">
                  Critical Position (urgent succession planning)
                </Label>
              </div>
              <Button onClick={handleCreatePosition} className="w-full">
                Create Position
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by position name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Positions Grid */}
      {filteredPositions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm ? 'No positions match your search' : 'No key positions created yet'}
              </p>
              <p className="text-sm text-gray-500">
                {!searchTerm && 'Add your first critical hospital role to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPositions.map((position) => (
            <Card
              key={position.id}
              className={position.is_critical ? 'border-red-200 bg-red-50' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className={position.is_critical ? 'text-red-900' : ''}>
                      {position.position_name}
                    </CardTitle>
                    <CardDescription>{position.department}</CardDescription>
                  </div>
                  {position.is_critical && (
                    <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Critical
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(position)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 flex-1"
                    onClick={() => setPositionToDelete(position)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Key Position</DialogTitle>
            <DialogDescription>Update position details and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-position_name">Position Name *</Label>
              <Input
                id="edit-position_name"
                value={formData.position_name}
                onChange={(e) => setFormData({ ...formData, position_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-critical"
                checked={formData.is_critical}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_critical: checked === true })
                }
              />
              <Label htmlFor="edit-critical" className="font-normal cursor-pointer">
                Critical Position
              </Label>
            </div>
            <Button onClick={handleUpdatePosition} className="w-full">
              Update Position
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!positionToDelete} onOpenChange={(open) => !open && setPositionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{positionToDelete?.position_name}"? This will also remove
              associated succession candidates and development plans. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePosition}
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

export default KeyPositionsPage;
