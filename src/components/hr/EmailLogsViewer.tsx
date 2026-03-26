import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  Mail, 
  MailCheck, 
  MailX, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { EmailLog } from '@/types/email-notifications';

interface EmailLogWithApplicant extends EmailLog {
  applicant?: {
    full_name: string;
    position_applied: string;
  };
}

export function EmailLogsViewer() {
  const [emailLogs, setEmailLogs] = useState<EmailLogWithApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  useEffect(() => {
    loadEmailLogs();
    // Refresh every 30 seconds
    const interval = setInterval(loadEmailLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEmailLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('email_logs')
        .select(`
          *,
          applicant:applicant_id (
            full_name,
            position_applied
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (dateRange !== 'all') {
        const daysMap = { '24h': 1, '7d': 7, '30d': 30 };
        const days = daysMap[dateRange as keyof typeof daysMap];
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', cutoffDate);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmailLogs(data || []);
    } catch (err: any) {
      toast({
        title: 'Error loading email logs',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = emailLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.recipient_email.toLowerCase().includes(searchLower) ||
      log.applicant?.full_name?.toLowerCase().includes(searchLower) ||
      log.subject.toLowerCase().includes(searchLower)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'opened':
      case 'clicked':
        return <MailCheck className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'bounced':
        return <MailX className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Mail className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'opened':
      case 'clicked':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
      case 'bounced':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    total: emailLogs.length,
    sent: emailLogs.filter(l => l.status === 'sent').length,
    failed: emailLogs.filter(l => l.status === 'failed').length,
    pending: emailLogs.filter(l => l.status === 'pending').length,
  };

  const successRate = stats.total > 0 
    ? Math.round((stats.sent / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Email Log Viewer</h2>
        <p className="text-muted-foreground text-sm mt-1">Monitor interview invitation emails</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Total Emails</p>
          <p className="text-lg font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-medium">Sent</p>
          <p className="text-lg font-bold text-green-700">{stats.sent}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 font-medium">Failed</p>
          <p className="text-lg font-bold text-red-700">{stats.failed}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium">Pending</p>
          <p className="text-lg font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">Success Rate</p>
          <p className="text-lg font-bold text-blue-700">{successRate}%</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={loadEmailLogs}
            disabled={loading}
            variant="outline"
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="sent">✓ Sent</option>
            <option value="failed">✗ Failed</option>
            <option value="pending">⏳ Pending</option>
            <option value="bounced">⛔ Bounced</option>
            <option value="opened">👁️ Opened</option>
          </select>

          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-background border text-sm"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Email Logs Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Recipient Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Applicant</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subject</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Loading email logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {searchTerm ? 'No emails match your search' : 'No email logs found'}
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground truncate" title={log.recipient_email}>
                    {log.recipient_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {log.applicant?.full_name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {log.sent_at ? formatDistanceToNow(new Date(log.sent_at), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <details className="cursor-pointer marker:text-primary">
                      <summary className="text-primary hover:underline">View</summary>
                      <div className="mt-2 p-2 bg-muted rounded text-xs space-y-1">
                        {log.resend_id && (
                          <div>
                            <span className="font-medium">Resend ID:</span> {log.resend_id}
                          </div>
                        )}
                        {log.error_message && (
                          <div className="text-red-600">
                            <span className="font-medium">Error:</span> {log.error_message}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Created:</span> {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        Showing {filteredLogs.length} of {emailLogs.length} emails • Auto-refreshes every 30 seconds
      </p>
    </div>
  );
}
