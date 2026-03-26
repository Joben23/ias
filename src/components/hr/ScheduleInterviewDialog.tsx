import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';
import { Calendar, Clock, Video, MapPin, Users, Loader2, Mail, AlertCircle } from 'lucide-react';

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
  const [loadingApplicant, setLoadingApplicant] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('On-site');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [panel, setPanel] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [emailNotifSent, setEmailNotifSent] = useState(false);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validate and restrict time to working hours (8am-5pm)
  const handleTimeChange = (value: string) => {
    if (value) {
      const [hours] = value.split(':');
      const hour = parseInt(hours, 10);
      if (hour < 8 || hour >= 17) {
        toast({
          title: 'Invalid Time',
          description: 'Please select a time between 8:00 AM and 5:00 PM',
          variant: 'destructive',
        });
        return;
      }
    }
    setTime(value);
  };

  // Load applicant email when dialog opens
  useEffect(() => {
    if (open && applicantId) {
      loadApplicantEmail();
    }
  }, [open, applicantId]);

  const loadApplicantEmail = async () => {
    setLoadingApplicant(true);
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('email')
        .eq('id', applicantId)
        .single();

      if (error) {
        console.error('Failed to load applicant email:', error);
        toast({
          title: 'Warning',
          description: 'Could not load applicant email. Check database connection.',
          variant: 'destructive'
        });
      } else if (data?.email) {
        setApplicantEmail(data.email);
      }
    } catch (err: any) {
      console.error('Error loading applicant:', err);
    } finally {
      setLoadingApplicant(false);
    }
  };

  const togglePanel = (member: string) => {
    setPanel(prev => prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]);
  };

  const handleSubmit = async () => {
    if (!date || !time) {
      toast({ title: 'Missing fields', description: 'Date and time are required', variant: 'destructive' });
      return;
    }

    if (type === 'On-site' && !location) {
      toast({ title: 'Missing location', description: 'Location is required for on-site interviews', variant: 'destructive' });
      return;
    }

    if (type === 'Online' && !meetingLink) {
      toast({ title: 'Missing meeting link', description: 'Meeting link is required for online interviews', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // 1. Create interview record
      const { data, error } = await supabase.from('interviews').insert({
        applicant_id: applicantId,
        job_posting_id: jobPostingId || null,
        interview_date: date,
        interview_time: time,
        interview_type: type,
        location: type === 'On-site' ? location : null,
        meeting_link: type === 'Online' ? meetingLink : null,
        panel_members: panel,
        notes,
      }).select('id');

      if (error) throw error;

      if (data && data[0]) {
        const interviewId = data[0].id;

        // 2. Send notification email
        let emailSentSuccessfully = false;
        try {
          const { error: funcError } = await supabase.functions.invoke('send-interview-notification', {
            body: { interview_id: interviewId }
          });

          if (funcError) {
            console.error('Failed to send notification:', funcError);
            toast({
              title: 'Interview Scheduled',
              description: 'Interview created, but email notification failed to send. Check logs.',
              variant: 'destructive'
            });
          } else {
            emailSentSuccessfully = true;
            setEmailNotifSent(true);
          }
        } catch (funcErr) {
          console.error('Error invoking notification function:', funcErr);
        }

        // 3. Create in-app notification for HR/Admin
        try {
          const { data: currentUser } = await supabase.auth.getUser();
          if (currentUser.user) {
            await createNotification(
              currentUser.user.id,
              'Interview Scheduled',
              `Interview scheduled for ${applicantName} on ${date} at ${time}${emailSentSuccessfully ? ' - Email sent to applicant' : ''}`,
              'interview',
              applicantId
            );
          }
        } catch (notifErr) {
          console.error('Error creating notification:', notifErr);
        }

        // 4. Update applicant status
        try {
          await supabase.from('applicants').update({ status: 'Interview Scheduled' }).eq('id', applicantId);
        } catch (statusErr) {
          console.error('Error updating applicant status:', statusErr);
        }

        // Show success message
        toast({
          title: 'Interview Scheduled Successfully',
          description: `Interview for ${applicantName} has been scheduled${emailSentSuccessfully ? ' and email notification sent' : ''}`,
          variant: emailSentSuccessfully ? 'default' : 'destructive'
        });

        onScheduled();
        onOpenChange(false);
        // Reset form
        setDate('');
        setTime('');
        setType('On-site');
        setLocation('');
        setMeetingLink('');
        setPanel([]);
        setNotes('');
        setApplicantEmail('');
        setEmailNotifSent(false);
      }
    } catch (err: any) {
      console.error('Error scheduling interview:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to schedule interview',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule Interview</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Scheduling interview for <span className="font-medium text-foreground">{applicantName}</span>
        </p>

        {/* Applicant Email Display */}
        {loadingApplicant ? (
          <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading applicant information...</span>
          </div>
        ) : applicantEmail ? (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2">
            <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-900">Applicant Email</p>
              <p className="text-sm text-blue-800 break-all">{applicantEmail}</p>
              <p className="text-xs text-blue-700 mt-1">✓ Email invitation will be sent automatically</p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-yellow-900">No Email Found</p>
              <p className="text-xs text-yellow-800">This applicant doesn't have an email address on file.</p>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-foreground dark:text-white" /> Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                min={getMinDate()}
                className="text-foreground dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-foreground dark:text-white" /> Time</Label>
              <Input 
                type="time" 
                value={time} 
                onChange={e => handleTimeChange(e.target.value)}
                min="08:00"
                max="17:00"
                className="text-foreground dark:text-white"
              />
              <p className="text-xs text-muted-foreground">Working hours: 8:00 AM - 5:00 PM</p>
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
              <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-foreground dark:text-white" /> Location</Label>
              <Input placeholder="e.g. Conference Room A, 3rd Floor" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          )}

          {type === 'Online' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-foreground dark:text-white" /> Meeting Link</Label>
              <Input placeholder="https://meet.google.com/..." value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-foreground dark:text-white" /> Interview Panel</Label>
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
