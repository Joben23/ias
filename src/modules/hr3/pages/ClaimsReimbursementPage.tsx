import { useState } from 'react';
import { DollarSign, Upload, CheckCircle, AlertCircle, X, Receipt, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ReimbursementClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  claim_type: 'Travel' | 'Meals' | 'Supplies' | 'Training' | 'Other';
  amount: number;
  currency: string;
  description: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
  receipt_count: number;
  submitted_date?: string;
  approved_date?: string;
  approver?: string;
  rejection_reason?: string;
  project?: string;
}

export default function ClaimsReimbursementPage() {
  const mockClaims: ReimbursementClaim[] = [
    {
      id: 'CL-001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      claim_type: 'Travel',
      amount: 450,
      currency: 'USD',
      description: 'Flight and accommodation for client meeting in New York',
      status: 'Approved',
      receipt_count: 3,
      submitted_date: '2026-05-03',
      approved_date: '2026-05-05',
      approver: 'Manager Admin',
      project: 'Client Project A',
    },
    {
      id: 'CL-002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      claim_type: 'Training',
      amount: 299,
      currency: 'USD',
      description: 'AWS Certified Solutions Architect training course',
      status: 'Submitted',
      receipt_count: 2,
      submitted_date: '2026-05-06',
      project: 'Professional Development',
    },
    {
      id: 'CL-003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      claim_type: 'Meals',
      amount: 85.50,
      currency: 'USD',
      description: 'Team lunch during off-site meeting',
      status: 'Paid',
      receipt_count: 1,
      submitted_date: '2026-04-28',
      approved_date: '2026-04-30',
      approver: 'Manager Admin',
      project: 'Team Building',
    },
    {
      id: 'CL-004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      claim_type: 'Supplies',
      amount: 120,
      currency: 'USD',
      description: 'Ergonomic keyboard and mouse for home office setup',
      status: 'Rejected',
      receipt_count: 2,
      submitted_date: '2026-04-25',
      rejection_reason: 'Exceeds departmental limit for office supplies per quarter',
      project: 'Equipment',
    },
    {
      id: 'CL-005',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      claim_type: 'Other',
      amount: 65,
      currency: 'USD',
      description: 'Software license renewal for development tools',
      status: 'Under Review',
      receipt_count: 1,
      submitted_date: '2026-05-04',
      project: 'Tools & Licenses',
    },
  ];

  const claimTypeColors: Record<string, string> = {
    'Travel': 'bg-blue-100 text-blue-800',
    'Meals': 'bg-orange-100 text-orange-800',
    'Supplies': 'bg-green-100 text-green-800',
    'Training': 'bg-purple-100 text-purple-800',
    'Other': 'bg-gray-100 text-gray-800',
  };

  const statusColors: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Submitted': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Paid': 'bg-green-200 text-green-900',
  };

  const [claims, setClaims] = useState<ReimbursementClaim[]>(mockClaims);
  const [newClaimDialog, setNewClaimDialog] = useState(false);
  const [newClaim, setNewClaim] = useState({
    claim_type: 'Travel' as const,
    amount: '',
    currency: 'USD',
    description: '',
    project: '',
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const { toast } = useToast();

  const handleSubmitClaim = () => {
    if (!newClaim.amount || !newClaim.description) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newReimbursement: ReimbursementClaim = {
      id: `CL-${String(claims.length + 1).padStart(3, '0')}`,
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      claim_type: newClaim.claim_type,
      amount: parseFloat(newClaim.amount),
      currency: newClaim.currency,
      description: newClaim.description,
      status: 'Submitted',
      receipt_count: 1,
      submitted_date: new Date().toISOString().split('T')[0],
      project: newClaim.project,
    };

    setClaims([newReimbursement, ...claims]);
    setNewClaim({ claim_type: 'Travel', amount: '', currency: 'USD', description: '', project: '' });
    setNewClaimDialog(false);
    toast({
      title: 'Success',
      description: 'Reimbursement claim submitted',
    });
  };

  const handleApproveClaim = (id: string) => {
    setClaims(claims.map(c => c.id === id
      ? {
        ...c,
        status: 'Approved',
        approved_date: new Date().toISOString().split('T')[0],
        approver: 'Current Manager',
      }
      : c
    ));
    toast({
      title: 'Success',
      description: 'Claim approved',
    });
  };

  const handleRejectClaim = (id: string, reason: string) => {
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }
    setClaims(claims.map(c => c.id === id
      ? { ...c, status: 'Rejected', rejection_reason: reason }
      : c
    ));
    toast({
      title: 'Success',
      description: 'Claim rejected',
    });
  };

  const handleMarkAsPaid = (id: string) => {
    setClaims(claims.map(c => c.id === id
      ? { ...c, status: 'Paid' }
      : c
    ));
    toast({
      title: 'Success',
      description: 'Claim marked as paid',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export',
      description: 'Claims data exported to PDF/Excel',
    });
  };

  const filteredClaims = claims.filter(c =>
    (!filterStatus || c.status === filterStatus) &&
    (!filterType || c.claim_type === filterType)
  );

  const stats = {
    pending: claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length,
    approved: claims.filter(c => c.status === 'Approved').length,
    paid: claims.filter(c => c.status === 'Paid').length,
    totalAmount: claims
      .filter(c => c.status === 'Approved' || c.status === 'Paid')
      .reduce((sum, c) => sum + c.amount, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Claims & Reimbursement</h1>
          <p className="text-muted-foreground mt-1">Manage employee expense claims and reimbursements</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newClaimDialog} onOpenChange={setNewClaimDialog}>
            <DialogTrigger asChild>
              <Button>
                <Receipt className="h-4 w-4 mr-2" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Reimbursement Claim</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Claim Type *</label>
                  <Select value={newClaim.claim_type} onValueChange={(value) => setNewClaim({ ...newClaim, claim_type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Meals">Meals & Entertainment</SelectItem>
                      <SelectItem value="Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Training">Training & Development</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Amount *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newClaim.amount}
                      onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <Select value={newClaim.currency} onValueChange={(value) => setNewClaim({ ...newClaim, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Project/Purpose *</label>
                  <Input
                    value={newClaim.project}
                    onChange={(e) => setNewClaim({ ...newClaim, project: e.target.value })}
                    placeholder="Related project or purpose"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newClaim.description}
                    onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                    placeholder="Detailed description of the expense"
                    rows={3}
                  />
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="text-blue-700">Please ensure you have receipts/invoices attached when submitting.</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewClaimDialog(false)}>Cancel</Button>
                  <Button onClick={handleSubmitClaim}>Submit Claim</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {stats.approved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Filter by Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map(claim => (
          <Card key={claim.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {claim.employee_name}
                  </CardTitle>
                  <CardDescription>
                    {claim.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={claimTypeColors[claim.claim_type]}>{claim.claim_type}</Badge>
                  <Badge className={statusColors[claim.status]}>{claim.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount and Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">{claim.currency} {claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{claim.project || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receipts</p>
                  <p className="font-medium flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    {claim.receipt_count} file{claim.receipt_count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Dates and Approver */}
              {claim.submitted_date && (
                <div className="text-sm text-muted-foreground">
                  <p>Submitted: {claim.submitted_date}</p>
                  {claim.approver && <p>Approved by: {claim.approver}</p>}
                </div>
              )}

              {claim.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-red-700">{claim.rejection_reason}</p>
                </div>
              )}

              {/* Actions */}
              {claim.status === 'Submitted' || claim.status === 'Under Review' ? (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" onClick={() => handleApproveClaim(claim.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Claim</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea placeholder="Reason for rejection..." id="rejection-reason" />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button
                            onClick={() => {
                              const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement).value;
                              handleRejectClaim(claim.id, reason);
                            }}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : claim.status === 'Approved' ? (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" onClick={() => handleMarkAsPaid(claim.id)}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    Mark as Paid
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
