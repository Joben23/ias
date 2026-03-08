import { performanceReviews } from '@/data/sampleData';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';

const ratingColor = (score: number) => {
  if (score >= 90) return 'text-pipeline-hired';
  if (score >= 80) return 'text-pipeline-selected';
  if (score >= 70) return 'text-pipeline-screening';
  return 'text-pipeline-rejected';
};

const ratingBg = (score: number) => {
  if (score >= 90) return 'bg-pipeline-hired';
  if (score >= 80) return 'bg-pipeline-selected';
  if (score >= 70) return 'bg-pipeline-screening';
  return 'bg-pipeline-rejected';
};

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Performance Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor probation and early performance of new hires</p>
      </div>

      {/* Review timeline */}
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Probation Timeline</h3>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {['30-Day Review', '60-Day Review', '90-Day Review', 'Employment Confirmation'].map((step, i) => (
            <div key={step} className="flex items-center gap-3 shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`px-5 py-3 rounded-xl text-center min-w-[150px] ${
                  i === 3 ? 'gradient-success text-primary-foreground' : 'bg-muted text-foreground border border-border'
                }`}
              >
                <p className="text-sm font-semibold">{step}</p>
              </motion.div>
              {i < 3 && <div className="w-8 h-0.5 bg-border shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {performanceReviews.map((review, i) => {
          const initials = review.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2);
          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-elevated p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="gradient-primary w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{review.employeeName}</h4>
                  <p className="text-sm text-muted-foreground">{review.position} · {review.department}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  review.status === 'Completed' ? 'bg-pipeline-hired/10 text-pipeline-hired' :
                  review.status === 'In Progress' ? 'bg-pipeline-screening/10 text-pipeline-screening' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {review.status}
                </span>
              </div>

              <div className="bg-muted/50 rounded-xl p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1">{review.reviewType} Review</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-display font-bold ${ratingColor(review.overallRating)}`}>
                    {review.overallRating}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>

              {/* Score bars */}
              <div className="space-y-3">
                {[
                  { label: 'Work Performance', score: review.workPerformance },
                  { label: 'Skills Assessment', score: review.skillsAssessment },
                  { label: 'Behavior', score: review.behaviorEvaluation },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className={`font-semibold ${ratingColor(metric.score)}`}>{metric.score}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.score}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        className={`h-full rounded-full ${ratingBg(metric.score)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                Reviewed by {review.reviewer}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decision matrix */}
      <div className="card-elevated p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Employment Confirmation Outcomes</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Pass Probation', icon: CheckCircle2, color: 'text-pipeline-hired', bg: 'bg-pipeline-hired/10', desc: 'Employee confirmed for permanent position' },
            { label: 'Extend Probation', icon: Clock, color: 'text-pipeline-screening', bg: 'bg-pipeline-screening/10', desc: 'Additional monitoring period required' },
            { label: 'Terminate', icon: AlertTriangle, color: 'text-pipeline-rejected', bg: 'bg-pipeline-rejected/10', desc: 'Employment ended after probation' },
          ].map((outcome, i) => (
            <motion.div
              key={outcome.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`${outcome.bg} rounded-xl p-4 border border-transparent hover:border-current/10 transition-colors cursor-pointer`}
            >
              <outcome.icon className={`w-6 h-6 ${outcome.color} mb-2`} />
              <p className={`font-semibold text-sm ${outcome.color}`}>{outcome.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{outcome.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
