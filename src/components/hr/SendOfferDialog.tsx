import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Send, Loader2, DollarSign, Calendar, FileText } from 'lucide-react';

interface Props {
  applicantId: string;
  candidateName: string;
  position: string;
  department: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferSent: () => void;
}

export function SendOfferDialog({ applicantId, candidateName, position, department, open, onOpenChange, onOfferSent }: Props) {
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [contractType, setContractType] = useState('Full-Time');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!salary || !startDate) {
      toast({ title: 'Missing fields', description: 'Salary and start date are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
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

      await supabase.from('applicants').update({ status: 'Offer Sent' }).eq('id', applicantId);

      toast({ title: 'Offer Sent!', description: `Job offer sent to ${candidateName}` });
      onOfferSent();
      onOpenChange(false);
      setSalary(''); setStartDate(''); setContractType('Full-Time'); setNotes('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
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
        </div>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Salary Offer</Label>
            <Input placeholder="e.g. ₱85,000/month" value={salary} onChange={e => setSalary(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start Date</Label>
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
