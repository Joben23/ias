import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Send, Loader2, DollarSign, Calendar, FileText, Mail } from 'lucide-react';

// Initialize EmailJS for job offer (separate account)
if (import.meta.env.VITE_EMAILJS_OFFER_PUBLIC_KEY) {
  emailjs.init(import.meta.env.VITE_EMAILJS_OFFER_PUBLIC_KEY);
}

interface Props {
  applicantId: string;
  candidateName: string;
  applicantEmail: string;
  position: string;
  department: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferSent: () => void;
}

export function SendOfferDialog({ applicantId, candidateName, applicantEmail, position, department, open, onOpenChange, onOfferSent }: Props) {
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [contractType, setContractType] = useState('Full-Time');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!salary || !startDate) {
      toast({ title: 'Missing fields', description: 'Salary and start date are required', variant: 'destructive', duration: 8000 });
      return;
    }

    // Validate email
    const trimmedEmail = (applicantEmail || '').trim();
    console.log('[OFFER] Email before trim:', JSON.stringify(applicantEmail));
    console.log('[OFFER] Email after trim:', JSON.stringify(trimmedEmail));
    console.log('[OFFER] Email is valid:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail));

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: 'Invalid Email', description: `Applicant email is missing or invalid: "${applicantEmail}"`, variant: 'destructive', duration: 8000 });
      return;
    }

    setLoading(true);
    try {
      // 1. Create job offer record in database
      const { error } = await supabase.from('job_offers').insert({
        applicant_id: applicantId,
        candidate_name: candidateName,
        position,
        department,
        salary_offer: salary,
        start_date: startDate,
        contract_type: contractType,
        notes,
        status: 'Offer Sent',
      });
      if (error) throw error;

      // 2. Update applicant status
      await supabase.from('applicants').update({ status: 'Offer Sent' }).eq('id', applicantId);

      // 3. Send job offer email via EmailJS (optional - don't block if it fails)
      try {
        console.log('[EMAILJS-OFFER] Attempting to send job offer email notification...');
        
        const emailTemplateParams = {
          to_email: trimmedEmail,
          candidate_name: candidateName,
          position: position,
          department: department,
          salary_offer: salary,
          contract_type: contractType,
          start_date: startDate,
          company_name: 'Hospital HRMS',
          notes: notes || 'No additional notes',
          current_year: new Date().getFullYear().toString(),
        };

        console.log('[EMAILJS-OFFER] Template params:', emailTemplateParams);

        const result = await emailjs.send(
          import.meta.env.VITE_EMAILJS_OFFER_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_OFFER,
          emailTemplateParams
        );

        console.log('[EMAILJS-OFFER] ✅ Email sent successfully:', result);
      } catch (emailErr: any) {
        // Email sending failed, but don't block the offer creation
        console.warn('[EMAILJS-OFFER] Email notification failed (non-blocking):', emailErr?.text || emailErr?.message);
        // Don't show error toast - email is optional
      }

      // Show success notifications
      toast({
        title: '✅ Job Offer Sent Successfully',
        description: `Offer sent to ${candidateName}`,
        duration: 8000
      });

      toast({
        title: '📧 Email Sent',
        description: `Job offer email sent to ${trimmedEmail}`,
        duration: 8000
      });

      onOfferSent();
      onOpenChange(false);
      setSalary('');
      setStartDate('');
      setContractType('Full-Time');
      setNotes('');
    } catch (err: any) {
      console.error('[OFFER] Error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to send job offer',
        variant: 'destructive',
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Send Job Offer
          </DialogTitle>
        </DialogHeader>

        <div className="card-elevated p-3 bg-primary/5 border-primary/20">
          <p className="text-sm font-medium text-foreground">{candidateName}</p>
          <p className="text-xs text-muted-foreground">{position} · {department}</p>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Mail className="w-3 h-3" /> {applicantEmail}</p>
        </div>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Salary Offer</Label>
            <Input placeholder="e.g. ₱85,000/month" value={salary} onChange={e => setSalary(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-black dark:text-white" /> Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Contract Type</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Additional offer details..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Job Offer</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
