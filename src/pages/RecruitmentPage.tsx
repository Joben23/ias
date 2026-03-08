import { jobPostings, applicants } from '@/data/sampleData';
import { motion } from 'framer-motion';
import { Briefcase, Users, Calendar, MapPin, Clock, Plus, ChevronRight, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';

const statusConfig = {
  Open: { icon: CheckCircle2, color: 'text-pipeline-hired', bg: 'bg-pipeline-hired/10' },
  Closed: { icon: XCircle, color: 'text-pipeline-rejected', bg: 'bg-pipeline-rejected/10' },
  'On Hold': { icon: PauseCircle, color: 'text-pipeline-screening', bg: 'bg-pipeline-screening/10' },
};

export default function RecruitmentPage() {
  const interviewApplicants = applicants.filter(a => a.status === 'Interview Scheduled');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Recruitment Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage job postings, screening, and interviews</p>
        </div>
        <button className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Recruitment workflow */}
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Recruitment Workflow</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Screening', count: 2, color: 'gradient-warm' },
            { label: 'Assessment', count: 1, color: 'gradient-cool' },
            { label: 'Interview', count: 2, color: 'gradient-primary' },
            { label: 'Background Check', count: 1, color: 'gradient-warm' },
            { label: 'Final Decision', count: 1, color: 'gradient-success' },
          ].map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`${step.color} rounded-xl p-4 text-center text-primary-foreground`}
            >
              <p className="text-2xl font-display font-bold">{step.count}</p>
              <p className="text-xs opacity-90 mt-1">{step.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Job Postings */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Active Job Postings</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobPostings.map((job, i) => {
            const config = statusConfig[job.status];
            const StatusIcon = config.icon;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-elevated p-5 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`${config.bg} p-2 rounded-lg`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.bg} ${config.color}`}>
                    {job.status}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requirements.slice(0, 3).map(req => (
                    <span key={req} className="text-[11px] px-2 py-0.5 bg-muted rounded-md text-muted-foreground">{req}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {job.applicantCount} applicants</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.employmentType}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{job.department}</span>
                  <span>Closes {job.closingDate}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Interview Schedule */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Upcoming Interviews</h2>
        <div className="card-elevated divide-y divide-border">
          {interviewApplicants.map((app, i) => {
            const initials = app.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
              >
                <div className="gradient-cool w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{app.fullName}</p>
                  <p className="text-xs text-muted-foreground">{app.positionApplied} · {app.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Mar 12, 2026</p>
                  <p className="text-xs text-muted-foreground">10:00 AM</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            );
          })}
          {interviewApplicants.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No upcoming interviews</div>
          )}
        </div>
      </div>
    </div>
  );
}
