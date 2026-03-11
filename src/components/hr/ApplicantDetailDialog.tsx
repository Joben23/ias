import { useState, useEffect } from 'react';
import { Applicant, ApplicantStatus } from '@/data/sampleData';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  User, Mail, Phone, Briefcase, Building2, Calendar, Star, FileText, Download,
  CheckCircle2, Loader2, CalendarCheck,
} from 'lucide-react';
import { ScheduleInterviewDialog } from '@/components/hr/ScheduleInterviewDialog';

const statuses: ApplicantStatus[] = [
  'Applied', 'Under Screening', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Hired', 'Rejected',
];

interface Props {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: ApplicantStatus) => void;
  onHire: (applicant: Applicant) => void;
}

export function ApplicantDetailDialog({ applicant, open, onOpenChange, onStatusChange, onHire }: Props) {
  const [status, setStatus] = useState<ApplicantStatus>('Applied');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    if (applicant) {
      setStatus(applicant.status);
      setResumeUrl(null);
      if (applicant.resumeFile) {
        supabase.storage
          .from('resumes')
          .createSignedUrl(applicant.resumeFile, 3600)
          .then(({ data }) => {
            if (data) setResumeUrl(data.signedUrl);
          });
      }
    }
  }, [applicant]);

  if (!applicant) return null;

  const handleStatusChange = async (newStatus: string) => {
    const s = newStatus as ApplicantStatus;
    setStatus(s);
    // Update in DB
    await supabase.from('applicants').update({ status: s }).eq('id', applicant.id);
    onStatusChange(applicant.id, s);
    toast({ title: 'Status updated', description: `${applicant.fullName} moved to "${s}"` });
  };

  const handleHire = async () => {
    setHiring(true);
    try {
      const { data, error } = await supabase.functions.invoke('hire-applicant', {
        body: { applicant_id: applicant.id },
      });
      if (error) throw error;
      setStatus('Hired');
      onStatusChange(applicant.id, 'Hired');
      onHire(applicant);
      toast({
        title: 'Applicant Hired!',
        description: `Employee account created. Username: ${data.username}, Password: ${data.password}`,
      });
    } catch (err: any) {
      toast({ title: 'Hire failed', description: err.message || 'Something went wrong', variant: 'destructive' });
    }
    setHiring(false);
  };

  const initials = applicant.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Applicant Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="gradient-cool w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
              {initials}
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg">{applicant.fullName}</h3>
              <p className="text-sm text-muted-foreground">{applicant.positionApplied} · {applicant.department}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon={Mail} label="Email" value={applicant.email} />
            <InfoItem icon={Phone} label="Phone" value={applicant.phone || 'N/A'} />
            <InfoItem icon={Briefcase} label="Experience" value={applicant.experience || 'N/A'} />
            <InfoItem icon={Calendar} label="Applied" value={applicant.applicationDate} />
            <InfoItem icon={Building2} label="Department" value={applicant.department} />
            {applicant.rating && (
              <InfoItem icon={Star} label="Rating" value={`${applicant.rating}/5`} />
            )}
          </div>

          {/* Education & Certifications */}
          {applicant.education && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Education</p>
              <p className="text-sm text-foreground">{applicant.education}</p>
            </div>
          )}
          {applicant.certifications?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Certifications</p>
              <div className="flex flex-wrap gap-1.5">
                {applicant.certifications.map(cert => (
                  <span key={cert} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">{cert}</span>
                ))}
              </div>
            </div>
          )}

          {/* Resume */}
          {applicant.resumeFile && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Resume</p>
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Resume</span>
                  <Download className="w-3.5 h-3.5" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {applicant.resumeFile}
                </p>
              )}
            </div>
          )}

          {/* Status Management */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">Change Status</p>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {status === 'Selected' && (
              <Button
                onClick={handleHire}
                disabled={hiring}
                className="w-full gradient-success text-primary-foreground"
              >
                {hiring ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Hire & Create Employee Account</>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
