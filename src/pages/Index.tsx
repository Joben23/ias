import { dashboardStats, applicants, recognitions, newHires } from '@/data/sampleData';
import { StatCard } from '@/components/hr/StatCard';
import { HiringPipeline } from '@/components/hr/HiringPipeline';
import { ApplicantCard } from '@/components/hr/ApplicantCard';
import { OnboardingProgress } from '@/components/hr/OnboardingProgress';
import { RecognitionCard } from '@/components/hr/RecognitionCard';
import { Users, Briefcase, UserCheck, UserPlus, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  const recentApplicants = applicants.slice(0, 4);
  const topRecognition = recognitions[0];

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
        <StatCard title="Total Applicants" value={dashboardStats.totalApplicants} icon={Users} delay={0} />
        <StatCard title="Active Openings" value={dashboardStats.activeJobOpenings} icon={Briefcase} gradient="gradient-cool" delay={0.05} />
        <StatCard title="In Interview" value={dashboardStats.candidatesInInterview} icon={UserCheck} gradient="gradient-warm" delay={0.1} />
        <StatCard title="New Hires" value={dashboardStats.newHiresThisMonth} icon={UserPlus} delay={0.15} subtitle="This month" />
        <StatCard title="Under Probation" value={dashboardStats.employeesUnderProbation} icon={Clock} gradient="gradient-cool" delay={0.2} />
        <StatCard title="Recognitions" value={dashboardStats.recognitionHighlights} icon={Award} gradient="gradient-warm" delay={0.25} />
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
    </div>
  );
};

export default Index;
