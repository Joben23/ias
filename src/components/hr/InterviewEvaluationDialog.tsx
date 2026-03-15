import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Star, Loader2 } from 'lucide-react';

const categories = [
  { key: 'technical_skills', label: 'Technical Skills' },
  { key: 'communication_skills', label: 'Communication Skills' },
  { key: 'medical_knowledge', label: 'Medical Knowledge' },
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'cultural_fit', label: 'Cultural Fit' },
] as const;

interface Props {
  interviewId: string;
  applicantId: string;
  applicantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

export function InterviewEvaluationDialog({ interviewId, applicantId, applicantName, open, onOpenChange, onSubmitted }: Props) {
  const [loading, setLoading] = useState(false);
  const [evaluatorName, setEvaluatorName] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({
    technical_skills: 3,
    communication_skills: 3,
    medical_knowledge: 3,
    professionalism: 3,
    cultural_fit: 3,
  });
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('Hire');

  const setRating = (key: string, val: number) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!evaluatorName.trim()) {
      toast({ title: 'Missing evaluator name', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('interview_evaluations').insert({
        interview_id: interviewId,
        applicant_id: applicantId,
        evaluator_name: evaluatorName,
        technical_skills: ratings.technical_skills,
        communication_skills: ratings.communication_skills,
        medical_knowledge: ratings.medical_knowledge,
        professionalism: ratings.professionalism,
        cultural_fit: ratings.cultural_fit,
        comments,
        recommendation,
      });
      if (error) throw error;

      // Mark interview as completed
      await supabase.from('interviews').update({ status: 'Completed' }).eq('id', interviewId);

      // Auto-update applicant status to reflect interview completion
      await supabase.from('applicants').update({ status: 'Interview Completed' }).eq('id', applicantId);

      toast({ title: 'Evaluation Submitted', description: `Evaluation for ${applicantName} saved.` });
      onSubmitted();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Interview Evaluation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Evaluating <span className="font-medium text-foreground">{applicantName}</span></p>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Evaluator Name</Label>
            <Input placeholder="Your name" value={evaluatorName} onChange={e => setEvaluatorName(e.target.value)} />
          </div>

          {/* Rating categories */}
          <div className="space-y-3">
            <Label>Ratings (1-5)</Label>
            {categories.map(cat => (
              <div key={cat.key} className="flex items-center justify-between gap-2">
                <span className="text-sm text-foreground min-w-[140px]">{cat.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(cat.key, val)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          val <= ratings[cat.key]
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Comments</Label>
            <Textarea placeholder="Additional observations..." value={comments} onChange={e => setComments(e.target.value)} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Recommendation</Label>
            <Select value={recommendation} onValueChange={setRecommendation}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Hire">✅ Hire</SelectItem>
                <SelectItem value="Second Interview">🔄 Second Interview</SelectItem>
                <SelectItem value="Reject">❌ Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="card-elevated p-3">
            <p className="text-xs text-muted-foreground mb-1">Calculated Score</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {(Object.values(ratings).reduce((a, b) => a + b, 0) / 5 * 20).toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground"> / 100</span>
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : 'Submit Evaluation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
