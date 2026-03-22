import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Briefcase, Send, CheckCircle2, UserPlus,
  TrendingUp, Clock, Award, Calendar, Target,
} from 'lucide-react';
import { StatCard } from '@/components/hr/StatCard';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LineChart, Line, PieChart, Pie } from 'recharts';

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

interface HiringTrend {
  month: string;
  hires: number;
}

interface TopPosition {
  position: string;
  hires: number;
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
  const [activeJobs, setActiveJobs] = useState(0);
  const [offerAcceptanceRate, setOfferAcceptanceRate] = useState(0);
  const [hiringTrends, setHiringTrends] = useState<HiringTrend[]>([]);
  const [topPositions, setTopPositions] = useState<TopPosition[]>([]);
  const [avgTimeToHire, setAvgTimeToHire] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch employees first
      const { data: employees } = await supabase.from('employees').select('position, department, start_date, applicant_id');
      
      // Fetch all applicants
      const { data: applicants } = await supabase.from('applicants').select('id, status, department, application_date, position_applied');
      if (applicants) {
        setTotalApplicants(applicants.length);

        const counts: PipelineCounts = {
          applied: 0, screening: 0, shortlisted: 0, interview: 0,
          selected: 0, offerSent: 0, offerAccepted: 0, hired: 0,
        };

        for (const a of applicants) {
          const key = statusMap[a.status];
          if (key) counts[key]++;
        }

        // Set hired from employees count
        counts.hired = employees ? employees.length : 0;
        setPipeline(counts);
        setNewHires(counts.hired);
        setWaitingInterview(counts.interview);
      }

      // Fetch active job openings
      const { data: jobs } = await supabase.from('job_postings').select('status');
      if (jobs) {
        setActiveJobs(jobs.filter(j => j.status === 'Open').length);
      }

      // Fetch offers
      const { data: offers } = await supabase.from('job_offers').select('status');
      if (offers) {
        setOffersSent(offers.length);
        const accepted = offers.filter(o => o.status === 'Offer Accepted').length;
        setOffersAccepted(accepted);
        setOfferAcceptanceRate(offers.length > 0 ? Math.round((accepted / offers.length) * 100) : 0);
      }

      if (employees) {
        // Set hired count from employees
        setNewHires(employees.length);
        // Hiring trends (monthly)
        const monthMap: Record<string, number> = {};
        employees.forEach(emp => {
          if (emp.start_date) {
            const date = new Date(emp.start_date);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            monthMap[month] = (monthMap[month] || 0) + 1;
          }
        });
        const trends: HiringTrend[] = Object.entries(monthMap)
          .map(([month, hires]) => ({ month, hires }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        setHiringTrends(trends);

        // Top performing positions
        const positionMap: Record<string, number> = {};
        employees.forEach(emp => {
          positionMap[emp.position] = (positionMap[emp.position] || 0) + 1;
        });
        const topPos: TopPosition[] = Object.entries(positionMap)
          .map(([position, hires]) => ({ position, hires }))
          .sort((a, b) => b.hires - a.hires)
          .slice(0, 5);
        setTopPositions(topPos);

        // Department hiring breakdown
        const deptHireMap: Record<string, number> = {};
        employees.forEach(emp => {
          deptHireMap[emp.department] = (deptHireMap[emp.department] || 0) + 1;
        });
        const deptHires: DeptStat[] = Object.entries(deptHireMap)
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count);
        setDeptStats(deptHires);

        // Time-to-hire calculation
        if (applicants && employees.length > 0) {
          const timeDiffs: number[] = [];
          employees.forEach(emp => {
            if (emp.applicant_id && emp.start_date) {
              const applicant = applicants.find(a => a.id === emp.applicant_id);
              if (applicant && applicant.application_date) {
                const appDate = new Date(applicant.application_date);
                const startDate = new Date(emp.start_date);
                const diffTime = startDate.getTime() - appDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0) timeDiffs.push(diffDays);
              }
            }
          });
          if (timeDiffs.length > 0) {
            const avg = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
            setAvgTimeToHire(Math.round(avg));
          }
        }
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
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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

  // 🔧 ONLY THE FIXED RETURN PART (replace your current return block)

return (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-display font-bold text-foreground">
        Recruitment Analytics
      </h1>
      <p className="text-muted-foreground mt-1">
        Monitor hiring performance and recruitment efficiency.
      </p>
    </div>

    {/* Overview Metrics */}
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard title="Total Applicants" value={totalApplicants} icon={Users} delay={0} />
      <StatCard title="Active Job Openings" value={activeJobs} icon={Briefcase} delay={0.05} />
      <StatCard title="In Interview Stage" value={pipeline.interview} icon={UserCheck} delay={0.1} />
      <StatCard title="Total Hired" value={newHires} icon={UserPlus} delay={0.15} />
      <StatCard title="Offer Acceptance Rate" value={`${offerAcceptanceRate}%`} icon={Target} delay={0.2} />
      <StatCard title="Avg Time to Hire" value={`${avgTimeToHire} days`} icon={Clock} delay={0.25} />
    </div>

    {/* Pipeline + Success Rate */}
    <div className="grid lg:grid-cols-3 gap-6">
      <motion.div className="lg:col-span-2 card-elevated p-6">
        <h3 className="text-lg font-semibold mb-6">Hiring Pipeline Breakdown</h3>

        {pipelineStages.map((stage) => (
          <div key={stage.key} className="flex justify-between">
            <span>{stage.label}</span>
            <span>{pipeline[stage.key]}</span>
          </div>
        ))}
      </motion.div>

      <motion.div className="card-elevated p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
        <p className="text-3xl font-bold">{successRate}%</p>
      </motion.div>
    </div>

    {/* Interview Performance */}
    <motion.div className="card-elevated p-6 space-y-6">
      <h3 className="text-lg font-semibold">Interview Performance Insights</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">{avgScore}</p>
          <p className="text-xs text-muted-foreground">Avg Interview Score</p>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">{waitingInterview}</p>
          <p className="text-xs text-muted-foreground">Waiting for Interview</p>
        </div>
      </div>
    </motion.div>
  </div>
);
}