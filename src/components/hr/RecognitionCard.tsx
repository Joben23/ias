import { Recognition } from '@/data/sampleData';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Award, Trophy, Star, Medal } from 'lucide-react';

const awardIcons: Record<string, typeof Award> = {
  'Employee of the Month': Trophy,
  'Outstanding Physician Award': Star,
  'Best Support Staff': Medal,
  'Peer Recognition': Heart,
};

interface RecognitionCardProps {
  recognition: Recognition;
  index?: number;
  onClick?: (recognition: Recognition) => void;
}

export function RecognitionCard({ recognition, index = 0, onClick }: RecognitionCardProps) {
  const initials = recognition.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const IconComponent = awardIcons[recognition.awardType] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="card-elevated p-5 hover:border-accent/30 transition-all cursor-pointer"
      onClick={() => onClick?.(recognition)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="gradient-warm w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{recognition.employeeName}</h4>
          <p className="text-sm text-muted-foreground">{recognition.position} · {recognition.department}</p>
        </div>
        <div className="gradient-warm p-2 rounded-lg">
          <IconComponent className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
        <Award className="w-3 h-3" />
        {recognition.awardType}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{recognition.description}</p>

      <div className="flex items-center justify-end pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{recognition.date}</span>
      </div>
    </motion.div>
  );
}
