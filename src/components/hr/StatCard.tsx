import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient?: string;
  subtitle?: string;
  delay?: number;
  onClick?: () => void;
}

export function StatCard({ title, value, icon: Icon, gradient = 'gradient-primary', subtitle, delay = 0, onClick }: StatCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`stat-card group ${onClick ? 'cursor-pointer hover:-translate-y-0.5 transition-all' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`${gradient} p-2.5 rounded-xl`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-xs text-primary mt-1 font-medium">{subtitle}</p>}
    </motion.div>
  );
}
