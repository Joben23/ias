import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, DollarSign, FileText, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Claim {
  id: string;
  employee_id: string;
  claim_type: string;
  amount: number;
  description: string;
  receipt_url?: string;
  status: string;
  submitted_at: string;
  created_at: string;
  employees: {
    full_name: string;
    employee_id: string;
  };
}

export default function Hr3ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingClaim, setProcessingClaim] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          employees:employee_id (
            full_name,
            employee_id
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setClaims(data as Claim[] || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: 'Error',
        description: 'Failed to load claims',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processClaim = async (claimId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingClaim(claimId);
    try {
      const { error } = await supabase
        .from('claims')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (error) throw error;

      // Update local state
      setClaims(claims.map(claim =>
        claim.id === claimId
          ? { ...claim, status: newStatus }
          : claim
      ));

      toast({
        title: 'Success',
        description: `Claim ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error processing claim:', error);
      toast({
        title: 'Error',
        description: `Failed to ${newStatus} claim`,
        variant: 'destructive',
      });
    } finally {
      setProcessingClaim(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-0">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-700 border-0">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-700 border-0">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'approved':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      case 'rejected':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Claims & Reimbursements</h1>
              <p className="text-muted-foreground mt-1">
                Review and manage employee expense claims
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold text-foreground">{claims.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {claims.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {claims.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Claims Yet</h3>
            <p className="text-muted-foreground">
              Employee claims will appear here for review
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {claims.map((claim) => (
              <Card key={claim.id} className={`border-l-4 ${getStatusColor(claim.status)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {claim.employees?.full_name || 'Unknown Employee'}
                      </span>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="capitalize">{claim.claim_type}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(claim.amount)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {claim.description}
                    </p>
                  </div>

                  {claim.receipt_url && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Receipt</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(claim.receipt_url, '_blank')}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Receipt
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Submitted {format(new Date(claim.submitted_at), 'MMM dd, yyyy')}</span>
                  </div>

                  {claim.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => processClaim(claim.id, 'approved')}
                        disabled={processingClaim === claim.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processingClaim === claim.id ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => processClaim(claim.id, 'rejected')}
                        disabled={processingClaim === claim.id}
                        className="flex-1"
                      >
                        {processingClaim === claim.id ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}