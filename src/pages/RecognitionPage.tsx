import { useState, useEffect } from 'react';
import { recognitions as initialRecognitions, Recognition } from '@/data/sampleData';
import { RecognitionCard } from '@/components/hr/RecognitionCard';
import { NewRecognitionDialog } from '@/components/hr/NewRecognitionDialog';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, Medal, Heart, Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const awardCategories = [
  { label: 'Employee of the Month', icon: Trophy, gradient: 'gradient-warm', count: 1 },
  { label: 'Outstanding Physician', icon: Star, gradient: 'gradient-cool', count: 1 },
  { label: 'Best Support Staff', icon: Medal, gradient: 'gradient-primary', count: 1 },
  { label: 'Peer Recognition', icon: Heart, gradient: 'gradient-success', count: 1 },
];

export default function RecognitionPage() {
  const [recognitions, setRecognitions] = useState<Recognition[]>(initialRecognitions);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecognitions = async () => {
      const { data } = await supabase
        .from('recognitions')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: Recognition[] = data.map(row => ({
          id: row.id,
          employeeName: row.employee_name,
          position: (row.position || 'Doctor') as Recognition['position'],
          department: (row.department || 'Administration') as Recognition['department'],
          awardType: row.award_type,
          description: row.description || '',
          date: row.date,
          likes: row.likes,
          comments: row.comments,
        }));
        setRecognitions(mapped);
      }
    };
    fetchRecognitions();
  }, []);

  const handleAddRecognition = async (rec: Recognition) => {
    const { data } = await supabase.from('recognitions').insert({
      employee_name: rec.employeeName,
      position: rec.position,
      department: rec.department,
      award_type: rec.awardType,
      description: rec.description,
      date: rec.date,
      likes: rec.likes,
      comments: rec.comments,
    }).select().single();

    if (data) {
      setRecognitions(prev => [{ ...rec, id: data.id }, ...prev]);
    } else {
      setRecognitions(prev => [rec, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Social Recognition</h1>
          <p className="text-muted-foreground text-sm mt-1">Celebrate achievements and foster positive work culture</p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="gradient-warm text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" />
          Give Recognition
        </button>
      </div>

      <NewRecognitionDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={handleAddRecognition} />

      {/* Award categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {awardCategories.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${cat.gradient} rounded-xl p-5 text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity`}
          >
            <cat.icon className="w-8 h-8 mb-3 opacity-90" />
            <p className="text-2xl font-display font-bold">{cat.count}</p>
            <p className="text-xs opacity-80 mt-1">{cat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Announcement board */}
      <div className="card-elevated p-5 border-l-4 border-accent">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display font-semibold text-foreground">Hospital Announcement Board</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          🎉 Congratulations to <span className="font-semibold text-foreground">Mama Coco</span> for being named
          Employee of the Month! Her dedication to pediatric care has been truly inspiring.
        </p>
      </div>

      {/* Recognition feed */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recognition Feed</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {recognitions.map((rec, i) => (
            <RecognitionCard key={rec.id} recognition={rec} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
