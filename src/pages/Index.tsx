import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dashboardStats, applicants, recognitions, newHires } from '@/data/sampleData';
import { StatCard } from '@/components/hr/StatCard';
import { HiringPipeline } from '@/components/hr/HiringPipeline';
import { ApplicantCard } from '@/components/hr/ApplicantCard';
import { OnboardingProgress } from '@/components/hr/OnboardingProgress';
import { RecognitionCard } from '@/components/hr/RecognitionCard';
import { Users, Briefcase, UserCheck, UserPlus, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const Index = () => {
  const recentApplicants = applicants.slice(0, 4);
  const topRecognition = recognitions[0];
  const [activeOpenings, setActiveOpenings] = useState<number>(dashboardStats.activeJobOpenings);
  const [activeOpeningsList, setActiveOpeningsList] = useState<Array<{ id: string; title: string; department: string }>>([]);
  const [selectedDashboardCard, setSelectedDashboardCard] = useState<'totalApplicants' | 'activeOpenings' | 'inInterview' | 'newHires' | 'underProbation' | 'recognitions' | null>(null);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);

  useEffect(() => {
    const fetchActiveOpenings = async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, department, status');

      if (error) {
        console.error('Failed to load job postings:', error);
        return;
      }

      const openJobs = (data || []).filter((job: any) => job.status === 'Open');
      setActiveOpenings(openJobs.length);
      setActiveOpeningsList(openJobs.map((job: any) => ({ id: job.id, title: job.title, department: job.department })));
    };

    fetchActiveOpenings();
  }, []);

  const openDashboardModal = (key: typeof selectedDashboardCard) => {
    setSelectedDashboardCard(key);
    setIsDashboardModalOpen(true);
  };

  const dashboardModalData = () => {
    if (!selectedDashboardCard) return { title: '', subtitle: '', lines: [] as string[] };

    switch (selectedDashboardCard) {
      case 'totalApplicants':
        return {
          title: 'Total Applicants',
          subtitle: 'All active application submissions',
          lines: applicants.slice(0, 10).map(a => `${a.fullName} • ${a.positionApplied}`),
        };
      case 'activeOpenings':
        return {
          title: 'Active Openings',
          subtitle: 'Currently open jobs',
          lines: activeOpeningsList.map(job => `${job.title} • ${job.department}`),
        };
      case 'inInterview':
        return {
          title: 'In Interview',
          subtitle: 'Candidates currently interviewing',
          lines: applicants.filter(a => a.status === 'Interview Scheduled').slice(0, 10).map(a => `${a.fullName} • ${a.positionApplied}`),
        };
      case 'newHires':
        return {
          title: 'New Hires',
          subtitle: 'Hires in this month',
          lines: newHires.slice(0, 10).map(h => `${h.name} • ${h.position}`),
        };
      case 'underProbation':
        return {
          title: 'Under Probation',
          subtitle: 'Employees currently on probation',
          lines: [] as string[],
        };
      case 'recognitions':
        return {
          title: 'Recognitions',
          subtitle: 'Top recognitions this month',
          lines: recognitions.slice(0, 10).map(r => `${r.employeeName} • ${r.awardType}`),
        };
      default:
        return { title: '', subtitle: '', lines: [] as string[] };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Good morning, HR Team 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your talent acquisition overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Applicants"
          value={dashboardStats.totalApplicants}
          icon={Users}
          delay={0}
          onClick={() => openDashboardModal('totalApplicants')}
        />
        <StatCard
          title="Active Openings"
          value={activeOpenings}
          icon={Briefcase}
          gradient="gradient-cool"
          delay={0.05}
          onClick={() => openDashboardModal('activeOpenings')}
        />
        <StatCard
          title="In Interview"
          value={dashboardStats.candidatesInInterview}
          icon={UserCheck}
          gradient="gradient-warm"
          delay={0.1}
          onClick={() => openDashboardModal('inInterview')}
        />
        <StatCard
          title="New Hires"
          value={dashboardStats.newHiresThisMonth}
          icon={UserPlus}
          delay={0.15}
          subtitle="This month"
          onClick={() => openDashboardModal('newHires')}
        />
        <StatCard
          title="Under Probation"
          value={dashboardStats.employeesUnderProbation}
          icon={Clock}
          gradient="gradient-cool"
          delay={0.2}
          onClick={() => openDashboardModal('underProbation')}
        />
        <StatCard
          title="Recognitions"
          value={dashboardStats.recognitionHighlights}
          icon={Award}
          gradient="gradient-warm"
          delay={0.25}
          onClick={() => openDashboardModal('recognitions')}
        />
      </div>

      {/* Pipeline */}
      <HiringPipeline />

      {/* Two column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Applicants */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Recent Applicants</h2>
            <Link to="/applicants" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentApplicants.map((app, i) => (
              <ApplicantCard key={app.id} applicant={app} index={i} />
            ))}
          </div>
        </div>

        {/* Onboarding + Recognition */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Onboarding</h2>
            <Link to="/onboarding" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <OnboardingProgress hire={newHires[0]} index={0} />

          <div className="flex items-center justify-between mt-6">
            <h2 className="text-lg font-display font-semibold text-foreground">Latest Recognition</h2>
            <Link to="/recognition" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {topRecognition && <RecognitionCard recognition={topRecognition} />}
        </div>
      </div>

      {/* Workflow visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card-elevated p-6"
      >
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Hiring Workflow</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: 'Application', color: 'gradient-cool' },
            { label: 'Screening', color: 'gradient-warm' },
            { label: 'Interview', color: 'gradient-cool' },
            { label: 'Selection', color: 'gradient-primary' },
            { label: 'Job Offer', color: 'gradient-warm' },
            { label: 'Onboarding', color: 'gradient-primary' },
            { label: 'Probation', color: 'gradient-cool' },
            { label: 'Workforce', color: 'gradient-success' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 shrink-0">
              <div className={`${step.color} px-4 py-2 rounded-xl text-primary-foreground text-sm font-medium whitespace-nowrap`}>
                {step.label}
              </div>
              {i < 7 && (
                <div className="w-6 h-0.5 bg-border shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={isDashboardModalOpen} onOpenChange={setIsDashboardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dashboardModalData().title}</DialogTitle>
            <DialogDescription>{dashboardModalData().subtitle}</DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-5xl font-bold">
              {selectedDashboardCard === 'totalApplicants' && dashboardStats.totalApplicants}
              {selectedDashboardCard === 'activeOpenings' && activeOpenings}
              {selectedDashboardCard === 'inInterview' && dashboardStats.candidatesInInterview}
              {selectedDashboardCard === 'newHires' && dashboardStats.newHiresThisMonth}
              {selectedDashboardCard === 'underProbation' && dashboardStats.employeesUnderProbation}
              {selectedDashboardCard === 'recognitions' && dashboardStats.recognitionHighlights}
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto text-left text-sm p-2 space-y-1">
            {dashboardModalData().lines.length === 0 ? (
              <p className="text-muted-foreground">No details available for this metric.</p>
            ) : (
              dashboardModalData().lines.map((line, idx) => <p key={idx} className="truncate">{line}</p>)
            )}
          </div>
          <DialogFooter>
            <DialogClose className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
