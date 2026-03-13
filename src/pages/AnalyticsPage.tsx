import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Briefcase, Send, CheckCircle2, UserPlus,
  TrendingUp, Clock, Award,
} from 'lucide-react';
import { StatCard } from '@/components/hr/StatCard';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface PipelineCounts {
  applied: number;
  screening: number;
  shortlisted: number;
  interview: number;
  selected: number;
  offerSent: number;
  offerAccepted: number;
  hired: number;
}

interface DeptStat {
  department: string;
  count: number;
}

interface TopCandidate {
  full_name: string;
  overall_score: number;
  recommendation: string;
}

const statusMap: Record<string, keyof PipelineCounts> = {
  'Applied': 'applied',
  'Under Screening': 'screening',
  'Shortlisted': 'shortlisted',
  'Interview Scheduled': 'interview',
  'Selected': 'selected',
  'Offer Sent': 'offerSent',
  'Offer Accepted': 'offerAccepted',
  'Hired': 'hired',
};

const pipelineStages = [
  { key: 'applied' as const, label: 'Applied', color: 'bg-pipeline-applied' },
  { key: 'screening' as const, label: 'Under Screening', color: 'bg-pipeline-screening' },
  { key: 'shortlisted' as const, label: 'Shortlisted', color: 'bg-pipeline-interview' },
  { key: 'interview' as const, label: 'Interview Scheduled', color: 'bg-pipeline-interview' },
  { key: 'selected' as const, label: 'Selected', color: 'bg-pipeline-selected' },
  { key: 'offerSent' as const, label: 'Offer Sent', color: 'bg-pipeline-offer-sent' },
  { key: 'offerAccepted' as const, label: 'Offer Accepted', color: 'bg-pipeline-offer-accepted' },
  { key: 'hired' as const, label: 'Hired', color: 'bg-pipeline-hired' },
];

const deptChartConfig = {
  count: { label: 'Applicants', color: 'hsl(var(--primary))' },
};

const BAR_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function AnalyticsPage() {
  const [pipeline, setPipeline] = useState<PipelineCounts>({
    applied: 0, screening: 0, shortlisted: 0, interview: 0,
    selected: 0, offerSent: 0, offerAccepted: 0, hired: 0,
  });
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [offersSent, setOffersSent] = useState(0);
  const [offersAccepted, setOffersAccepted] = useState(0);
  const [newHires, setNewHires] = useState(0);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [topCandidates, setTopCandidates] = useState<TopCandidate[]>([]);
  const [waitingInterview, setWaitingInterview] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch all applicants
    const { data: applicants } = await supabase.from('applicants').select('status, department');
    if (applicants) {
      setTotalApplicants(applicants.length);

      const counts: PipelineCounts = {
        applied: 0, screening: 0, shortlisted: 0, interview: 0,
        selected: 0, offerSent: 0, offerAccepted: 0, hired: 0,
      };
      const deptMap: Record<string, number> = {};

      for (const a of applicants) {
        const key = statusMap[a.status];
        if (key) counts[key]++;
        deptMap[a.department] = (deptMap[a.department] || 0) + 1;
      }

      setPipeline(counts);
      setNewHires(counts.hired);
      setWaitingInterview(counts.interview);
      setDeptStats(
        Object.entries(deptMap)
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count)
      );
    }

    // Fetch offers
    const { data: offers } = await supabase.from('job_offers').select('status');
    if (offers) {
      setOffersSent(offers.length);
      setOffersAccepted(offers.filter(o => o.status === 'Offer Accepted').length);
    }

    // Fetch evaluations for avg score + top candidates
    const { data: evals } = await supabase
      .from('interview_evaluations')
      .select('overall_score, recommendation, applicant_id');
    if (evals && evals.length > 0) {
      const avg = evals.reduce((s, e) => s + (e.overall_score || 0), 0) / evals.length;
      setAvgScore(Math.round(avg * 10) / 10);

      // Get top 5 by score
      const sorted = [...evals].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).slice(0, 5);
      const applicantIds = sorted.map(e => e.applicant_id);
      const { data: names } = await supabase.from('applicants').select('id, full_name').in('id', applicantIds);
      const nameMap = new Map((names || []).map(n => [n.id, n.full_name]));
      setTopCandidates(sorted.map(e => ({
        full_name: nameMap.get(e.applicant_id) || 'Unknown',
        overall_score: e.overall_score || 0,
        recommendation: e.recommendation,
      })));
    }

    setLoading(false);
  };

  const successRate = totalApplicants > 0
    ? Math.round((pipeline.hired / totalApplicants) * 100)
    : 0;

  const maxPipeline = Math.max(...Object.values(pipeline), 1);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Recruitment Analytics</h1>
        <p className="text-muted-foreground mt-1">Monitor hiring performance and recruitment efficiency.</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Applicants" value={totalApplicants} icon={Users} delay={0} />
        <StatCard title="Under Screening" value={pipeline.screening} icon={Clock} gradient="gradient-cool" delay={0.05} />
        <StatCard title="In Interview" value={pipeline.interview} icon={UserCheck} gradient="gradient-warm" delay={0.1} />
        <StatCard title="Offers Sent" value={offersSent} icon={Send} delay={0.15} />
        <StatCard title="Offers Accepted" value={offersAccepted} icon={CheckCircle2} gradient="gradient-cool" delay={0.2} />
        <StatCard title="New Hires" value={newHires} icon={UserPlus} gradient="gradient-warm" delay={0.25} />
      </div>

      {/* Pipeline + Success Rate */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card-elevated p-6"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-6">Hiring Pipeline Breakdown</h3>
          <div className="space-y-4">
            {pipelineStages.map((stage, i) => {
              const count = pipeline[stage.key];
              const pct = (count / maxPipeline) * 100;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm text-muted-foreground w-40 shrink-0">{stage.label}</span>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                      className={`${stage.color} h-full rounded-lg`}
                    />
                  </div>
                  <span className="text-lg font-display font-bold text-foreground w-10 text-right">{count}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-6">Hiring Success Rate</h3>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - successRate / 100) }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-bold text-foreground">{successRate}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {pipeline.hired} hired out of {totalApplicants} applicants
          </p>
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Offer Conversion</span>
              <span>{offersSent > 0 ? Math.round((offersAccepted / offersSent) * 100) : 0}%</span>
            </div>
            <Progress value={offersSent > 0 ? (offersAccepted / offersSent) * 100 : 0} className="h-2" />
          </div>
        </motion.div>
      </div>

      {/* Department Stats + Interview Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Hiring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card-elevated p-6"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-6">Department Hiring Statistics</h3>
          {deptStats.length > 0 ? (
            <ChartContainer config={deptChartConfig} className="h-[300px] w-full">
              <BarChart data={deptStats} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="department" width={110} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                  {deptStats.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-sm">No department data available.</p>
          )}
        </motion.div>

        {/* Interview Performance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated p-6 space-y-6"
        >
          <h3 className="text-lg font-display font-semibold text-foreground">Interview Performance Insights</h3>

          {/* Avg Score + Waiting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{avgScore}</p>
              <p className="text-xs text-muted-foreground">Avg Interview Score</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{waitingInterview}</p>
              <p className="text-xs text-muted-foreground">Waiting for Interview</p>
            </div>
          </div>

          {/* Top Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Top Ranked Candidates
            </h4>
            {topCandidates.length > 0 ? (
              <div className="space-y-3">
                {topCandidates.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary w-6">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{c.recommendation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={c.overall_score} className="h-2 w-20" />
                      <span className="text-sm font-display font-bold text-foreground w-10 text-right">
                        {c.overall_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No evaluations yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
