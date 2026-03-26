import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsData {
  averageScore: number;
  completionRate: number;
  totalEmployees: number;
  inProgressCount: number;
  trendData: Array<{
    week: string;
    score: number;
  }>;
}

interface PerformanceAnalyticsProps {
  data: AnalyticsData;
}

export function PerformanceAnalytics({ data }: PerformanceAnalyticsProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const axisColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)';
  const cardBg = isDark ? 'var(--card)' : 'var(--card)';

  const stats = [
    {
      label: 'Average Score',
      value: `${data.averageScore}%`,
      icon: TrendingUp,
      color: 'text-pipeline-hired',
      bgColor: 'bg-pipeline-hired/10',
      borderColor: 'border-pipeline-hired/20',
    },
    {
      label: 'Completion Rate',
      value: `${data.completionRate}%`,
      icon: CheckCircle,
      color: 'text-pipeline-screening',
      bgColor: 'bg-pipeline-screening/10',
      borderColor: 'border-pipeline-screening/20',
    },
    {
      label: 'Total Employees',
      value: data.totalEmployees,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
    },
    {
      label: 'In Progress',
      value: data.inProgressCount,
      icon: Clock,
      color: 'text-pipeline-selected',
      bgColor: 'bg-pipeline-selected/10',
      borderColor: 'border-pipeline-selected/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="border border-border rounded-lg bg-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-xl font-display font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance Trend (Last 8 Weeks)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Average employee scores over time</p>
        </div>

        {data.trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'} />
              <XAxis
                dataKey="week"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: '12px' }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: '12px' }}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: cardBg,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                  color: axisColor,
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value) => `${value}%`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No trend data available</p>
          </div>
        )}
      </motion.div>

      {/* Performance Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="grid grid-cols-3 gap-4"
      >
        <ScoreDistributionCard
          label="Excellent (80-100%)"
          percentage={calculateDistribution(data.trendData, 80, 100)}
          color="bg-gradient-to-r from-pipeline-hired to-emerald-500"
          textColor="text-pipeline-hired"
        />
        <ScoreDistributionCard
          label="Good (60-79%)"
          percentage={calculateDistribution(data.trendData, 60, 79)}
          color="bg-gradient-to-r from-pipeline-selected to-yellow-500"
          textColor="text-pipeline-selected"
        />
        <ScoreDistributionCard
          label="Needs Work (<60%)"
          percentage={calculateDistribution(data.trendData, 0, 59)}
          color="bg-gradient-to-r from-pipeline-rejected to-red-500"
          textColor="text-pipeline-rejected"
        />
      </motion.div>
    </div>
  );
}

// ====== HELPER COMPONENTS ======

interface ScoreDistributionCardProps {
  label: string;
  percentage: number;
  color: string;
  textColor: string;
}

function ScoreDistributionCard({
  label,
  percentage,
  color,
  textColor,
}: ScoreDistributionCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <p className="text-xs text-muted-foreground font-medium mb-3">{label}</p>
      <div className="space-y-2">
        <p className={`text-3xl font-bold ${textColor}`}>{percentage}%</p>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${color} w-full`} />
        </div>
      </div>
    </div>
  );
}

// ====== UTILITY FUNCTIONS ======

function calculateDistribution(
  trendData: Array<{ week: string; score: number }>,
  minScore: number,
  maxScore: number,
): number {
  if (!trendData || trendData.length === 0) return 0;

  const count = trendData.filter((d) => d.score >= minScore && d.score <= maxScore).length;
  return Math.round((count / trendData.length) * 100);
}

// ====== DEMO DATA GENERATOR ======

export function generateDemoAnalyticsData(): AnalyticsData {
  const trendData = [
    { week: 'Week 1', score: 65 },
    { week: 'Week 2', score: 68 },
    { week: 'Week 3', score: 70 },
    { week: 'Week 4', score: 72 },
    { week: 'Week 5', score: 75 },
    { week: 'Week 6', score: 76 },
    { week: 'Week 7', score: 78 },
    { week: 'Week 8', score: 82 },
  ];

  return {
    averageScore: 74,
    completionRate: 65,
    totalEmployees: 12,
    inProgressCount: 4,
    trendData,
  };
}
