import { useState, useEffect } from 'react';
import { Applicant, ApplicantStatus } from '@/data/sampleData';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  User, Mail, Phone, Briefcase, Building2, Calendar, Star, FileText, Download,
  CheckCircle2, Loader2, CalendarCheck, Send, DollarSign, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { ScheduleInterviewDialog } from '@/components/hr/ScheduleInterviewDialog';
import { SendOfferDialog } from '@/components/hr/SendOfferDialog';
import { RecruitmentTimeline } from '@/components/hr/RecruitmentTimeline';

const statuses: ApplicantStatus[] = [
  'Applied', 'Under Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected',
  'Offer Sent', 'Offer Accepted', 'Offer Declined', 'Hired', 'Rejected',
];

interface OfferData {
  id: string;
  salary_offer: string;
  start_date: string;
  contract_type: string;
  offer_date: string;
  status: string;
}

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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  const fetchOffer = async (applicantId: string) => {
    const { data } = await supabase
      .from('job_offers')
      .select('*')
      .eq('applicant_id', applicantId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      setOffer(data[0] as OfferData);
    } else {
      setOffer(null);
    }
  };

  useEffect(() => {
    if (applicant) {
      setStatus(applicant.status);
      setResumeUrl(null);
      setOffer(null);
      if (applicant.resumeFile) {
        supabase.storage
          .from('resumes')
          .createSignedUrl(applicant.resumeFile, 3600)
          .then(({ data }) => {
            if (data) setResumeUrl(data.signedUrl);
          });
      }
      fetchOffer(applicant.id);
    }
  }, [applicant]);

  if (!applicant) return null;

  const handleStatusChange = async (newStatus: string) => {
    const s = newStatus as ApplicantStatus;
    setStatus(s);
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
      
      if (error) {
        throw new Error(error.message || 'Edge Function failed');
      }

      if (!data) {
        throw new Error('No response from server');
      }

      setStatus('Hired');
      onStatusChange(applicant.id, 'Hired');
      onHire(applicant);
      
      if (offer) {
        await supabase.from('job_offers').update({ status: 'Offer Accepted' }).eq('id', offer.id);
      }
      
      toast({
        title: '✅ Applicant Hired Successfully!',
        description: `
Employee Account Created
ID: ${data.employee_id}
Username: ${data.username}
Password: ${data.password}
Start Date: ${data.start_date}
        `,
      });
    } catch (err: any) {
      console.error('Hire error:', err);
      
      let errorMessage = 'Failed to create employee account. Please try again.';
      
      if (err.message?.includes('Job offer not found')) {
        errorMessage = 'Job offer not found. Please ensure offer is created and accepted before hiring.';
      } else if (err.message?.includes('Applicant not found')) {
        errorMessage = 'Applicant not found in system.';
      } else if (err.message?.includes('User already exists')) {
        errorMessage = 'An employee account already exists for this applicant.';
      } else if (err.message?.includes('already hired')) {
        errorMessage = 'This applicant has already been hired.';
      } else if (err.message?.includes('Unauthorized')) {
        errorMessage = 'You do not have permission to hire applicants.';
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      toast({ 
        title: '❌ Hiring Failed', 
        description: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      setHiring(false);
    }
  };

  const handleAcceptOffer = async () => {
    setAcceptingOffer(true);
    try {
      if (offer) {
        await supabase.from('job_offers').update({ status: 'Offer Accepted' }).eq('id', offer.id);
        setOffer({ ...offer, status: 'Offer Accepted' });
      }
      await supabase.from('applicants').update({ status: 'Offer Accepted' }).eq('id', applicant.id);
      setStatus('Offer Accepted');
      onStatusChange(applicant.id, 'Offer Accepted');
      toast({ title: 'Offer Accepted', description: `${applicant.fullName} accepted the job offer.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setAcceptingOffer(false);
  };

  const handleDeclineOffer = async () => {
    try {
      if (offer) {
        await supabase.from('job_offers').update({ status: 'Offer Declined' }).eq('id', offer.id);
        setOffer({ ...offer, status: 'Offer Declined' });
      }
      await supabase.from('applicants').update({ status: 'Offer Declined' }).eq('id', applicant.id);
      setStatus('Offer Declined');
      onStatusChange(applicant.id, 'Offer Declined');
      toast({ title: 'Offer Declined', description: `${applicant.fullName} declined the job offer.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleOfferSent = () => {
    setStatus('Offer Sent');
    onStatusChange(applicant.id, 'Offer Sent');
    fetchOffer(applicant.id);
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
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
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

          {/* Offer Details */}
          {offer && (
            <div className="border border-border rounded-xl p-4 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Offer</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  offer.status === 'Offer Sent' ? 'bg-pipeline-offer-sent/15 text-pipeline-offer-sent' :
                  offer.status === 'Offer Accepted' ? 'bg-pipeline-offer-accepted/15 text-pipeline-offer-accepted' :
                  'bg-pipeline-offer-declined/15 text-pipeline-offer-declined'
                }`}>
                  {offer.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Salary:</span> <span className="text-foreground font-medium">{offer.salary_offer}</span></div>
                <div><span className="text-muted-foreground text-xs">Start:</span> <span className="text-foreground font-medium">{offer.start_date}</span></div>
                <div><span className="text-muted-foreground text-xs">Contract:</span> <span className="text-foreground font-medium">{offer.contract_type}</span></div>
                <div><span className="text-muted-foreground text-xs">Sent:</span> <span className="text-foreground font-medium">{offer.offer_date}</span></div>
              </div>
            </div>
          )}

          {/* Recruitment Timeline */}
          <RecruitmentTimeline currentStatus={status} />

          {/* Onboarding Info - shown after hiring */}
          {status === 'Hired' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-900 dark:text-green-100">✅ Employee Account Created</p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    The employee has been successfully registered and will now begin the onboarding process.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Next Step:</span> Complete onboarding checklist</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Location:</span> Onboarding {'>'} New Hire Onboarding page</p>
              </div>
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

            {(status === 'Shortlisted' || status === 'Under Screening' || status === 'Interview Scheduled') && (
              <Button onClick={() => setScheduleOpen(true)} variant="outline" className="w-full">
                <CalendarCheck className="w-4 h-4 mr-2" /> Schedule Interview
              </Button>
            )}

            {(status === 'Interview Completed' || status === 'Selected') && (
              <Button onClick={() => setOfferOpen(true)} className="w-full bg-pipeline-offer-sent text-primary-foreground hover:bg-pipeline-offer-sent/90">
                <Send className="w-4 h-4 mr-2" /> Send Job Offer
              </Button>
            )}

            {status === 'Offer Sent' && (
              <div className="flex gap-2">
                <Button onClick={handleAcceptOffer} disabled={acceptingOffer} className="flex-1 bg-pipeline-offer-accepted text-primary-foreground hover:bg-pipeline-offer-accepted/90">
                  {acceptingOffer ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ThumbsUp className="w-4 h-4 mr-2" />}
                  Accept Offer
                </Button>
                <Button onClick={handleDeclineOffer} variant="outline" className="flex-1 border-pipeline-offer-declined text-pipeline-offer-declined hover:bg-pipeline-offer-declined/10">
                  <ThumbsDown className="w-4 h-4 mr-2" /> Decline
                </Button>
              </div>
            )}

            {status === 'Offer Accepted' && (
              <Button onClick={handleHire} disabled={hiring} className="w-full gradient-success text-primary-foreground">
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

      <ScheduleInterviewDialog
        applicantId={applicant.id}
        applicantName={applicant.fullName}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onScheduled={() => handleStatusChange('Interview Scheduled')}
      />

      <SendOfferDialog
        applicantId={applicant.id}
        candidateName={applicant.fullName}
        position={applicant.positionApplied}
        department={applicant.department}
        open={offerOpen}
        onOpenChange={setOfferOpen}
        onOfferSent={handleOfferSent}
      />
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
