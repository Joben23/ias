import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Shield, Building, Users, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface Benefit {
  id: string;
  name: string;
  type: 'government' | 'company';
  description: string | null;
  created_at: string;
}

interface EmployeeBenefit {
  id: string;
  employee_id: string;
  benefit_id: string;
  contribution_amount: number;
  employer_share: number;
  employee_share: number;
  status: 'active' | 'inactive';
  created_at: string;
  employees: {
    full_name: string;
    employee_id: string;
    position: string;
    department: string;
  };
  benefits: {
    name: string;
    type: string;
  };
}

export default function Hr4BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Form states
  const [benefitForm, setBenefitForm] = useState({
    name: '',
    type: '',
    description: '',
  });

  const [assignForm, setAssignForm] = useState({
    employee_id: '',
    benefit_id: '',
    contribution_amount: '',
    employer_share: '',
    employee_share: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchBenefits(),
        fetchEmployeeBenefits(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBenefits(data || []);
    } catch (error) {
      console.error('Error fetching benefits:', error);
      setBenefits([]);
    }
  };

  const fetchEmployeeBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id,
            position,
            department
          ),
          benefits:benefit_id (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployeeBenefits(data || []);
    } catch (error) {
      console.error('Error fetching employee benefits:', error);
      setEmployeeBenefits([]);
    }
  };

  const handleCreateBenefit = async () => {
    try {
      const { data, error } = await supabase
        .from('benefits')
        .insert([{
          name: benefitForm.name,
          type: benefitForm.type,
          description: benefitForm.description || null,
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Benefit created successfully',
      });

      setBenefitDialogOpen(false);
      setBenefitForm({
        name: '',
        type: '',
        description: '',
      });
      fetchBenefits();
    } catch (error) {
      console.error('Error creating benefit:', error);
      toast({
        title: 'Error',
        description: 'Failed to create benefit',
        variant: 'destructive',
      });
    }
  };

  const handleAssignBenefit = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_benefits')
        .insert([{
          employee_id: assignForm.employee_id,
          benefit_id: assignForm.benefit_id,
          contribution_amount: parseFloat(assignForm.contribution_amount),
          employer_share: parseFloat(assignForm.employer_share),
          employee_share: parseFloat(assignForm.employee_share),
          status: 'active',
        }])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Benefit assigned to employee successfully',
      });

      setAssignDialogOpen(false);
      setAssignForm({
        employee_id: '',
        benefit_id: '',
        contribution_amount: '',
        employer_share: '',
        employee_share: '',
      });
      fetchEmployeeBenefits();
    } catch (error) {
      console.error('Error assigning benefit:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign benefit',
        variant: 'destructive',
      });
    }
  };

  const getTotalBenefitsCost = () => {
    return employeeBenefits.reduce((sum, eb) => sum + eb.contribution_amount, 0);
  };

  const getGovernmentBenefitsCount = () => {
    return employeeBenefits.filter(eb => eb.benefits?.type === 'government').length;
  };

  const getCompanyBenefitsCount = () => {
    return employeeBenefits.filter(eb => eb.benefits?.type === 'company').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading benefits data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Benefits Administration</h1>
        <div className="flex gap-2">
          <Button onClick={() => setBenefitDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Benefit
          </Button>
          <Button onClick={() => setAssignDialogOpen(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Assign Benefit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{benefits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Government Benefits</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{benefits.filter(b => b.type === 'government').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Benefits</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{benefits.filter(b => b.type === 'company').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₱{getTotalBenefitsCost().toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits List */}
      <Card>
        <CardHeader>
          <CardTitle>All Benefits</CardTitle>
          <CardDescription>Government and company benefits available</CardDescription>
        </CardHeader>
        <CardContent>
          {benefits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No benefits defined yet. Create your first benefit to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell className="font-medium">{benefit.name}</TableCell>
                    <TableCell>
                      <Badge variant={benefit.type === 'government' ? 'default' : 'secondary'}>
                        {benefit.type === 'government' ? (
                          <Building className="h-3 w-3 mr-1" />
                        ) : (
                          <DollarSign className="h-3 w-3 mr-1" />
                        )}
                        {benefit.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{benefit.description || 'No description'}</TableCell>
                    <TableCell>{format(new Date(benefit.created_at), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Benefits Assignments</CardTitle>
          <CardDescription>Benefits assigned to employees with contribution details</CardDescription>
        </CardHeader>
        <CardContent>
          {employeeBenefits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employee benefits assigned yet. Assign benefits to employees to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Benefit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total Contribution</TableHead>
                  <TableHead>Employer Share</TableHead>
                  <TableHead>Employee Share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeBenefits.map((eb) => (
                  <TableRow key={eb.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{eb.employees?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{eb.employees?.employee_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{eb.benefits?.name}</TableCell>
                    <TableCell>
                      <Badge variant={eb.benefits?.type === 'government' ? 'default' : 'secondary'}>
                        {eb.benefits?.type}
                      </Badge>
                    </TableCell>
                    <TableCell>₱{eb.contribution_amount.toLocaleString()}</TableCell>
                    <TableCell>₱{eb.employer_share.toLocaleString()}</TableCell>
                    <TableCell>₱{eb.employee_share.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={eb.status === 'active' ? 'default' : 'secondary'}>
                        {eb.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/hr4/benefits/${eb.employee_id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Benefit Dialog */}
      <Dialog open={benefitDialogOpen} onOpenChange={setBenefitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Benefit</DialogTitle>
            <DialogDescription>
              Add a new government or company benefit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={benefitForm.name}
                onChange={(e) => setBenefitForm({...benefitForm, name: e.target.value})}
                className="col-span-3"
                placeholder="e.g., SSS, Rice Allowance"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={benefitForm.type} onValueChange={(value) => setBenefitForm({...benefitForm, type: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select benefit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={benefitForm.description}
                onChange={(e) => setBenefitForm({...benefitForm, description: e.target.value})}
                className="col-span-3"
                placeholder="Optional description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateBenefit}>Create Benefit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Benefit Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Benefit to Employee</DialogTitle>
            <DialogDescription>
              Assign a benefit to an employee with contribution details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee_id" className="text-right">Employee</Label>
              <Select value={assignForm.employee_id} onValueChange={(value) => setAssignForm({...assignForm, employee_id: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeBenefits.map((eb) => (
                    <SelectItem key={eb.employee_id} value={eb.employee_id}>
                      {eb.employees?.full_name} ({eb.employees?.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="benefit_id" className="text-right">Benefit</Label>
              <Select value={assignForm.benefit_id} onValueChange={(value) => setAssignForm({...assignForm, benefit_id: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select benefit" />
                </SelectTrigger>
                <SelectContent>
                  {benefits.map((benefit) => (
                    <SelectItem key={benefit.id} value={benefit.id}>
                      {benefit.name} ({benefit.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contribution_amount" className="text-right">Total Contribution</Label>
              <Input
                id="contribution_amount"
                type="number"
                value={assignForm.contribution_amount}
                onChange={(e) => setAssignForm({...assignForm, contribution_amount: e.target.value})}
                className="col-span-3"
                placeholder="500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employer_share" className="text-right">Employer Share</Label>
              <Input
                id="employer_share"
                type="number"
                value={assignForm.employer_share}
                onChange={(e) => setAssignForm({...assignForm, employer_share: e.target.value})}
                className="col-span-3"
                placeholder="250"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee_share" className="text-right">Employee Share</Label>
              <Input
                id="employee_share"
                type="number"
                value={assignForm.employee_share}
                onChange={(e) => setAssignForm({...assignForm, employee_share: e.target.value})}
                className="col-span-3"
                placeholder="250"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignBenefit}>Assign Benefit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}