import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, Video, MapPin, Users, Loader2 } from 'lucide-react';

const panelOptions = [
  'HR Manager',
  'Department Head',
  'Senior Medical Staff',
  'Chief Nursing Officer',
  'Medical Director',
];

interface Props {
  applicantId: string;
  applicantName: string;
  jobPostingId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled: () => void;
}

export function ScheduleInterviewDialog({ applicantId, applicantName, jobPostingId, open, onOpenChange, onScheduled }: Props) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('On-site');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [panel, setPanel] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const togglePanel = (member: string) => {
    setPanel(prev => prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]);
  };

  const handleSubmit = async () => {
    if (!date || !time) {
      toast({ title: 'Missing fields', description: 'Date and time are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('interviews').insert({
        applicant_id: applicantId,
        job_posting_id: jobPostingId || null,
        interview_date: date,
        interview_time: time,
        interview_type: type,
        location: type === 'On-site' ? location : null,
        meeting_link: type === 'Online' ? meetingLink : null,
        panel_members: panel,
        notes,
      });
      if (error) throw error;

      // Update applicant status to Interview Scheduled
      await supabase.from('applicants').update({ status: 'Interview Scheduled' }).eq('id', applicantId);

      toast({ title: 'Interview Scheduled', description: `Interview for ${applicantName} has been scheduled.` });
      onScheduled();
      onOpenChange(false);
      // Reset
      setDate(''); setTime(''); setType('On-site'); setLocation(''); setMeetingLink(''); setPanel([]); setNotes('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule Interview</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Scheduling interview for <span className="font-medium text-foreground">{applicantName}</span></p>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Interview Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'On-site' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</Label>
              <Input placeholder="e.g. Conference Room A, 3rd Floor" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          )}

          {type === 'Online' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Meeting Link</Label>
              <Input placeholder="https://meet.google.com/..." value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Interview Panel</Label>
            <div className="flex flex-wrap gap-2">
              {panelOptions.map(member => (
                <button
                  key={member}
                  type="button"
                  onClick={() => togglePanel(member)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    panel.includes(member)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Scheduling...</> : 'Schedule Interview'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
