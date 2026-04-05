import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';

interface ReimbursementClaim {
  id: string;
  claim_type: string;
  amount: number;
  currency: string;
  date_submitted: string;
  date_incurred: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  description: string;
  category: 'Travel' | 'Meals' | 'Equipment' | 'Training' | 'Other';
  receipt_url?: string;
  notes?: string;
  approved_by?: string;
  approved_date?: string;
}

interface ClaimsSummary {
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
  rejected_amount: number;
  total_pending: number;
  total_approved: number;
  currency: string;
}

export default function ClaimsReimbursementPageNew() {
  const [activeTab, setActiveTab] = useState<'claims' | 'summary' | 'submit'>('claims');
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  // Sample data
  const claims: ReimbursementClaim[] = [
    {
      id: 'CLM001',
      claim_type: 'Travel Reimbursement',
      amount: 5500,
      currency: 'PHP',
      date_submitted: '2026-04-25',
      date_incurred: '2026-04-20',
      status: 'Approved',
      description: 'Flight and hotel for client meeting in Manila',
      category: 'Travel',
      receipt_url: '#',
      approved_by: 'Finance Manager',
      approved_date: '2026-04-26',
    },
    {
      id: 'CLM002',
      claim_type: 'Meal Expense',
      amount: 1200,
      currency: 'PHP',
      date_submitted: '2026-04-23',
      date_incurred: '2026-04-22',
      status: 'Pending',
      description: 'Team lunch during project workshop',
      category: 'Meals',
      receipt_url: '#',
      notes: 'Awaiting approval',
    },
    {
      id: 'CLM003',
      claim_type: 'Training Course',
      amount: 8500,
      currency: 'PHP',
      date_submitted: '2026-04-18',
      date_incurred: '2026-04-15',
      status: 'Pending',
      description: 'Advanced React Development Course',
      category: 'Training',
      receipt_url: '#',
      notes: 'Waiting for budget confirmation',
    },
    {
      id: 'CLM004',
      claim_type: 'Equipment Purchase',
      amount: 3200,
      currency: 'PHP',
      date_submitted: '2026-04-10',
      date_incurred: '2026-04-08',
      status: 'Paid',
      description: 'Mechanical keyboard and mouse',
      category: 'Equipment',
      receipt_url: '#',
      approved_by: 'Finance Manager',
      approved_date: '2026-04-10',
    },
    {
      id: 'CLM005',
      claim_type: 'Office Supplies',
      amount: 850,
      currency: 'PHP',
      date_submitted: '2026-03-28',
      date_incurred: '2026-03-25',
      status: 'Rejected',
      description: 'Personal office supplies not covered by policy',
      category: 'Other',
      receipt_url: '#',
      notes: 'Personal items excluded from reimbursement policy',
    },
  ];

  const summary: ClaimsSummary = {
    pending_amount: 9700,
    approved_amount: 5500,
    paid_amount: 3200,
    rejected_amount: 850,
    total_pending: 2,
    total_approved: 1,
    currency: 'PHP',
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-green-100 text-green-700',
    'Paid': 'bg-blue-100 text-blue-700',
    'Rejected': 'bg-red-100 text-red-700',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Travel': '✈️',
    'Meals': '🍽️',
    'Equipment': '💻',
    'Training': '📚',
    'Other': '📦',
  };

  const handleSubmitClaim = () => {
    alert('Submit new claim');
  };

  const handleEditClaim = (claimId: string) => {
    alert(`Edit claim ${claimId}`);
  };

  const handleDeleteClaim = (claimId: string) => {
    alert(`Delete claim ${claimId}`);
  };

  const handleDownloadReceipt = (claimId: string) => {
    alert(`Download receipt for claim ${claimId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Claims & Reimbursements 💵
        </h1>
        <p className="text-muted-foreground mt-1">Submit and track expense reimbursement claims</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border justify-between">
        <div className="flex gap-4">
          {['claims', 'summary', 'submit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          {/* Status Alert */}
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {summary.total_pending} claims pending approval ({summary.currency} {summary.pending_amount.toLocaleString()}) • {summary.total_approved} approved and awaiting payment
            </AlertDescription>
          </Alert>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">
                      {summary.currency} {summary.pending_amount.toLocaleString()}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {summary.currency} {summary.approved_amount.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      {summary.currency} {summary.paid_amount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">
                      {summary.currency} {summary.rejected_amount.toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Claims List */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">All Claims</h3>
            <div className="space-y-3">
              {claims.map(claim => (
                <Card
                  key={claim.id}
                  className={`cursor-pointer transition-colors ${
                    selectedClaim === claim.id ? 'ring-2 ring-primary' : 'hover:border-primary'
                  }`}
                  onClick={() => setSelectedClaim(selectedClaim === claim.id ? null : claim.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">{categoryIcons[claim.category]}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{claim.claim_type}</h4>
                            <Badge className={statusColors[claim.status]}>
                              {claim.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{claim.description}</p>

                          <div className="grid grid-cols-5 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-muted-foreground text-xs">Amount</p>
                              <p className="font-bold text-foreground text-lg">
                                {claim.currency} {claim.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Category</p>
                              <p className="font-semibold text-foreground">{claim.category}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Date Incurred</p>
                              <p className="font-semibold text-foreground">
                                {format(new Date(claim.date_incurred), 'MMM d')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Submitted</p>
                              <p className="font-semibold text-foreground">
                                {format(new Date(claim.date_submitted), 'MMM d')}
                              </p>
                            </div>
                            {claim.approved_date && (
                              <div>
                                <p className="text-muted-foreground text-xs">Approved</p>
                                <p className="font-semibold text-green-700">
                                  {format(new Date(claim.approved_date), 'MMm d')}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Expanded Details */}
                          {selectedClaim === claim.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                              {claim.approved_by && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Approved By</p>
                                  <p className="text-sm font-semibold text-foreground">{claim.approved_by}</p>
                                </div>
                              )}
                              {claim.notes && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Notes</p>
                                  <p className="text-sm text-foreground">{claim.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReceipt(claim.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                        {claim.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClaim(claim.id)}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {claim.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClaim(claim.id)}
                            className="text-red-600 border-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Summary (YTD 2026)</CardTitle>
              <CardDescription>Year-to-date reimbursement claims overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-muted-foreground">Pending Claims</p>
                  <p className="text-2xl font-bold text-yellow-700 mt-2">{summary.total_pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.currency} {summary.pending_amount.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Approved Claims</p>
                  <p className="text-2xl font-bold text-green-700 mt-2">{summary.total_approved}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.currency} {summary.approved_amount.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground">Paid Claims</p>
                  <p className="text-2xl font-bold text-blue-700 mt-2">
                    {claims.filter(c => c.status === 'Paid').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.currency} {summary.paid_amount.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-muted-foreground">Rejected Claims</p>
                  <p className="text-2xl font-bold text-red-700 mt-2">
                    {claims.filter(c => c.status === 'Rejected').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.currency} {summary.rejected_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">By Category</h4>
                <div className="space-y-2">
                  {['Travel', 'Meals', 'Equipment', 'Training'].map(cat => {
                    const catClaims = claims.filter(c => c.category === cat);
                    const catTotal = catClaims.reduce((sum, c) => sum + c.amount, 0);
                    return (
                      <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-muted-foreground">{cat}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{catClaims.length} claims</span>
                          <span className="font-semibold text-foreground">
                            {summary.currency} {catTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Tab */}
      {activeTab === 'submit' && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Submit a new expense claim with supporting receipts. Claims require manager approval before reimbursement.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>New Reimbursement Claim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Travel', 'Meals', 'Equipment', 'Training', 'Medical', 'Other'].map(cat => (
                  <Button key={cat} variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{cat}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat === 'Travel' && 'Flights, hotels, parking'}
                        {cat === 'Meals' && 'Team meals and business meals'}
                        {cat === 'Equipment' && 'Work equipment and tools'}
                        {cat === 'Training' && 'Courses and professional development'}
                        {cat === 'Medical' && 'Medical and wellness expenses'}
                        {cat === 'Other' && 'Other reimbursable expenses'}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>

              <Button onClick={handleSubmitClaim} size="lg" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Claim
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
