import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, Users, ClipboardCheck, ChevronRight } from 'lucide-react';
import { ScheduleInterviewDialog } from '@/modules/hr1/components/ScheduleInterviewDialog';
import { InterviewEvaluationDialog } from '@/modules/hr1/components/InterviewEvaluationDialog';
import { Button } from '@/components/ui/button';

interface Interview {
  id: string;
  applicant_id: string;
  job_posting_id: string | null;
  interview_date: string;
  interview_time: string;
  interview_type: string;
  location: string | null;
  meeting_link: string | null;
  panel_members: string[];
  notes: string | null;
  status: string;
  applicant_name?: string;
  applicant_position?: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [evalOpen, setEvalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const fetchInterviews = async () => {
    const { data } = await supabase
      .from('interviews')
      .select('*')
      .order('interview_date', { ascending: true });

    if (data) {
      // Fetch applicant names
      const applicantIds = [...new Set(data.map(d => d.applicant_id))];
      const { data: applicants } = await supabase
        .from('applicants')
        .select('id, full_name, position_applied')
        .in('id', applicantIds);

      const nameMap = new Map(applicants?.map(a => [a.id, a]) || []);

      setInterviews(data.map(d => ({
        ...d,
        panel_members: d.panel_members || [],
        applicant_name: nameMap.get(d.applicant_id)?.full_name || 'Unknown',
        applicant_position: nameMap.get(d.applicant_id)?.position_applied || '',
      })));
    }
  };

  useEffect(() => { fetchInterviews(); }, []);

  const today = new Date().toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const todayInterviews = interviews.filter(i => i.interview_date === today && i.status === 'Scheduled');
  const weekInterviews = interviews.filter(i => i.interview_date > today && i.interview_date <= weekEnd && i.status === 'Scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'Completed');
  const scheduledInterviews = interviews.filter(i => i.status === 'Scheduled');

  const openEval = (interview: Interview) => {
    setSelectedInterview(interview);
    setEvalOpen(true);
  };

  const statusColor = (status: string) => {
    if (status === 'Scheduled') return 'bg-pipeline-interview/10 text-pipeline-interview';
    if (status === 'Completed') return 'bg-pipeline-hired/10 text-pipeline-hired';
    return 'bg-muted text-muted-foreground';
  };

  const renderInterviewCard = (interview: Interview, i: number, showEvalBtn = false) => {
    const initials = (interview.applicant_name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <motion.div
        key={interview.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="card-elevated p-4 hover:border-primary/30 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="gradient-cool w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground text-sm truncate">{interview.applicant_name}</h4>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor(interview.status)}`}>
                {interview.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{interview.applicant_position}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-black dark:text-white" /> {interview.interview_date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-black dark:text-white" /> {interview.interview_time}</span>
              {interview.interview_type === 'Online' ? (
                <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Online</span>
              ) : (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {interview.location || 'On-site'}</span>
              )}
            </div>
            {interview.panel_members.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{interview.panel_members.join(', ')}</span>
              </div>
            )}
            {showEvalBtn && interview.status === 'Scheduled' && (
              <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => openEval(interview)}>
                <ClipboardCheck className="w-3.5 h-3.5 mr-1" /> Submit Evaluation
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Interview Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Schedule, track, and evaluate interviews</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Today', count: todayInterviews.length, color: 'gradient-warm' },
          { label: 'This Week', count: weekInterviews.length, color: 'gradient-cool' },
          { label: 'Scheduled', count: scheduledInterviews.length, color: 'gradient-primary' },
          { label: 'Completed', count: completedInterviews.length, color: 'gradient-success' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`${s.color} rounded-xl p-4 text-center text-primary-foreground`}
          >
            <p className="text-2xl font-display font-bold">{s.count}</p>
            <p className="text-xs opacity-90 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's Interviews */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">🔴 Today's Interviews</h2>
        {todayInterviews.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {todayInterviews.map((iv, i) => renderInterviewCard(iv, i, true))}
          </div>
        ) : (
          <div className="card-elevated p-6 text-center text-muted-foreground text-sm">No interviews scheduled for today</div>
        )}
      </div>

      {/* This Week */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">📅 This Week</h2>
        {weekInterviews.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {weekInterviews.map((iv, i) => renderInterviewCard(iv, i, true))}
          </div>
        ) : (
          <div className="card-elevated p-6 text-center text-muted-foreground text-sm">No upcoming interviews this week</div>
        )}
      </div>

      {/* All Scheduled */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">All Interviews</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {interviews.map((iv, i) => renderInterviewCard(iv, i, true))}
        </div>
        {interviews.length === 0 && (
          <div className="card-elevated p-6 text-center text-muted-foreground text-sm">No interviews found</div>
        )}
      </div>

      {selectedInterview && (
        <InterviewEvaluationDialog
          interviewId={selectedInterview.id}
          applicantId={selectedInterview.applicant_id}
          applicantName={selectedInterview.applicant_name || ''}
          open={evalOpen}
          onOpenChange={setEvalOpen}
          onSubmitted={fetchInterviews}
        />
      )}
    </div>
  );
}
