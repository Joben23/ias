import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Trophy, Star, Briefcase, Award, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface RankedCandidate {
  id: string;
  fullName: string;
  position: string;
  department: string;
  experience: string;
  certifications: string[];
  interviewScore: number;
  rating: number;
  evalCount: number;
  recommendation: string;
  finalScore: number;
}

interface JobOption {
  id: string;
  title: string;
}

export default function CandidateRankingPage() {
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from('job_postings').select('id, title').order('created_at', { ascending: false });
      if (data) setJobs(data);
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);

      // Fetch applicants
      let query = supabase.from('applicants').select('*');
      if (selectedJob !== 'all') {
        query = query.eq('job_posting_id', selectedJob);
      }
      const { data: applicants } = await query;

      if (!applicants || applicants.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      // Fetch evaluations for these applicants
      const ids = applicants.map(a => a.id);
      const { data: evals } = await supabase
        .from('interview_evaluations')
        .select('*')
        .in('applicant_id', ids);

      // Build scored candidates
      const ranked: RankedCandidate[] = applicants.map(a => {
        const appEvals = evals?.filter(e => e.applicant_id === a.id) || [];
        const avgScore = appEvals.length > 0
          ? appEvals.reduce((sum, e) => sum + Number(e.overall_score || 0), 0) / appEvals.length
          : 0;

        // Experience score (0-15 based on years)
        const yearsMatch = (a.experience || '').match(/(\d+)/);
        const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
        const expScore = Math.min(years * 3, 15);

        // Certification score (0-10, 2pts each)
        const certScore = Math.min((a.certifications?.length || 0) * 2, 10);

        // Rating score (0-15)
        const ratingScore = (Number(a.rating) || 0) * 3;

        // Interview score weight: 60%, others: 40%
        const interviewWeight = avgScore * 0.6;
        const otherWeight = (expScore + certScore + ratingScore) * (40 / 40);
        const finalScore = Math.min(Math.round(interviewWeight + otherWeight), 100);

        // Most common recommendation
        const recs = appEvals.map(e => e.recommendation);
        const recCount: Record<string, number> = {};
        recs.forEach(r => { recCount[r] = (recCount[r] || 0) + 1; });
        const topRec = Object.entries(recCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        return {
          id: a.id,
          fullName: a.full_name,
          position: a.position_applied,
          department: a.department,
          experience: a.experience || 'N/A',
          certifications: a.certifications || [],
          interviewScore: Math.round(avgScore),
          rating: Number(a.rating) || 0,
          evalCount: appEvals.length,
          recommendation: topRec,
          finalScore,
        };
      });

      ranked.sort((a, b) => b.finalScore - a.finalScore);
      setCandidates(ranked);
      setLoading(false);
    };

    fetchRankings();
  }, [selectedJob]);

  const medalColors = ['gradient-warm', 'gradient-cool', 'gradient-primary'];
  const medalEmoji = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Candidate Rankings</h1>
          <p className="text-muted-foreground text-sm mt-1">Compare and rank applicants based on evaluations and qualifications</p>
        </div>
        <div className="w-64">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger><SelectValue placeholder="Filter by job posting" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {jobs.map(j => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="card-elevated p-12 text-center text-muted-foreground">Loading rankings...</div>
      ) : candidates.length === 0 ? (
        <div className="card-elevated p-12 text-center text-muted-foreground">No candidates found for this selection</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {candidates.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
              {candidates.slice(0, 3).map((c, i) => {
                const initials = c.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`card-elevated p-5 text-center ${i === 0 ? 'ring-2 ring-accent/50' : ''}`}
                  >
                    <div className="text-3xl mb-2">{medalEmoji[i]}</div>
                    <div className={`${medalColors[i]} w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground font-display font-bold text-lg mx-auto mb-3`}>
                      {initials}
                    </div>
                    <h3 className="font-display font-semibold text-foreground">{c.fullName}</h3>
                    <p className="text-xs text-muted-foreground">{c.position}</p>
                    <div className="mt-3">
                      <p className="text-3xl font-display font-bold text-foreground">{c.finalScore}</p>
                      <p className="text-[11px] text-muted-foreground">Overall Score</p>
                    </div>
                    <div className="mt-2">
                      <Progress value={c.finalScore} className="h-2" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full Ranking List */}
          <div className="space-y-3">
            <h2 className="text-lg font-display font-semibold text-foreground">Full Rankings</h2>
            {candidates.map((c, i) => {
              const initials = c.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const recColor = c.recommendation === 'Hire'
                ? 'bg-pipeline-hired/10 text-pipeline-hired'
                : c.recommendation === 'Reject'
                ? 'bg-pipeline-rejected/10 text-pipeline-rejected'
                : 'bg-pipeline-screening/10 text-pipeline-screening';

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-elevated p-4 flex items-center gap-4"
                >
                  <div className="w-8 text-center">
                    <span className={`font-display font-bold text-lg ${i < 3 ? 'text-accent' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                  </div>

                  <div className="gradient-cool w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{c.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{c.position} · {c.department}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="text-center">
                      <p className="font-semibold text-foreground text-sm">{c.interviewScore}</p>
                      <p>Interview</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground text-sm">{c.experience}</p>
                      <p>Experience</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground text-sm">{c.certifications.length}</p>
                      <p>Certs</p>
                    </div>
                  </div>

                  <div className="text-center shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${recColor}`}>
                      {c.recommendation}
                    </span>
                  </div>

                  <div className="text-right shrink-0 w-16">
                    <p className="text-lg font-display font-bold text-foreground">{c.finalScore}</p>
                    <Progress value={c.finalScore} className="h-1.5 mt-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
