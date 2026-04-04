import { useState, useEffect } from 'react';
import { Search, Star, MessageSquare, User, BookOpen, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeTraining {
  id: string;
  employee_id: string;
  training_id: string;
  status: string;
  assigned_date: string;
  completion_date: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    position: string;
  };
  training: {
    id: string;
    name: string;
    training_type: string;
    duration_hours: number;
  };
}

interface TrainingEvaluation {
  id: string;
  employee_training_id: string;
  knowledge_improvement: number;
  performance_improvement: number;
  trainer_feedback: string;
  overall_rating: number;
  evaluated_at: string;
}

export function TrainingEvaluationPage() {
  const [completedTrainings, setCompletedTrainings] = useState<EmployeeTraining[]>([]);
  const [evaluations, setEvaluations] = useState<TrainingEvaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEvaluateDialogOpen, setIsEvaluateDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<EmployeeTraining | null>(null);
  const [evaluationForm, setEvaluationForm] = useState({
    knowledge_improvement: 3,
    performance_improvement: 3,
    overall_rating: 3,
    trainer_feedback: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch completed trainings
      const { data: completedData, error: completedError } = await supabase
        .from('employee_trainings' as any)
        .select(`
          *,
          employee:employees(*),
          training:training_programs(*)
        `)
        .eq('status', 'Completed')
        .order('completion_date', { ascending: false });

      if (completedError) {
        console.error('Error fetching completed trainings:', completedError);
      } else {
        setCompletedTrainings((completedData as unknown as EmployeeTraining[]) || []);
      }

      // Fetch evaluations
      const { data: evaluationData, error: evaluationError } = await supabase
        .from('training_evaluations' as any)
        .select('*')
        .order('evaluated_at', { ascending: false });

      if (evaluationError) {
        console.error('Error fetching evaluations:', evaluationError);
      } else {
        setEvaluations((evaluationData as unknown as TrainingEvaluation[]) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load evaluation data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTraining) {
      toast({
        title: 'Error',
        description: 'No training selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if evaluation already exists
      const { data: existing } = await supabase
        .from('training_evaluations' as any)
        .select('id')
        .eq('employee_training_id', selectedTraining.id)
        .single();

      if (existing) {
        // Update existing evaluation
        const { error } = await supabase
          .from('training_evaluations')
          .update({
            ...evaluationForm,
            evaluated_at: new Date().toISOString(),
          })
          .eq('employee_training_id', selectedTraining.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Evaluation updated',
        });
      } else {
        // Create new evaluation
        const { error } = await supabase
          .from('training_evaluations')
          .insert([
            {
              employee_training_id: selectedTraining.id,
              ...evaluationForm,
            },
          ]);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Evaluation saved',
        });
      }

      setIsEvaluateDialogOpen(false);
      setSelectedTraining(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving evaluation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save evaluation',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEvaluationForm({
      knowledge_improvement: 3,
      performance_improvement: 3,
      overall_rating: 3,
      trainer_feedback: '',
    });
  };

  const handleEditEvaluation = (training: EmployeeTraining) => {
    const evaluation = evaluations.find((e) => e.employee_training_id === training.id);
    if (evaluation) {
      setEvaluationForm({
        knowledge_improvement: evaluation.knowledge_improvement || 3,
        performance_improvement: evaluation.performance_improvement || 3,
        overall_rating: evaluation.overall_rating || 3,
        trainer_feedback: evaluation.trainer_feedback || '',
      });
    }
    setSelectedTraining(training);
    setIsEvaluateDialogOpen(true);
  };

  const getEvaluation = (trainingId: string) => {
    return evaluations.find((e) => e.employee_training_id === trainingId);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return 'Excellent';
      case 4:
        return 'Good';
      case 3:
        return 'Fair';
      case 2:
        return 'Poor';
      case 1:
        return 'Very Poor';
      default:
        return 'Not Rated';
    }
  };

  const filteredTrainings = completedTrainings.filter((training) => {
    const empName = training.employee?.first_name + ' ' + training.employee?.last_name;
    const trainingName = training.training?.name || '';
    const searchLower = searchTerm.toLowerCase();
    return empName.toLowerCase().includes(searchLower) || trainingName.toLowerCase().includes(searchLower);
  });

  const stats = {
    totalCompletions: completedTrainings.length,
    totalEvaluations: evaluations.length,
    avgRating: evaluations.length
      ? (
          evaluations.reduce((sum, e) => sum + e.overall_rating, 0) / evaluations.length
        ).toFixed(1)
      : 'N/A',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading evaluation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Training Evaluation</h1>
          <p className="text-gray-600 mt-1">Evaluate completed trainings and track effectiveness</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCompletions}</div>
            <p className="text-xs text-gray-500 mt-1">Trainings completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Evaluated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalEvaluations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalCompletions > 0
                ? `${Math.round((stats.totalEvaluations / stats.totalCompletions) * 100)}% evaluated`
                : 'No evaluations yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRatingColor(parseFloat(stats.avgRating as string))}`}>
              {stats.avgRating} / 5
            </div>
            <p className="text-xs text-gray-500 mt-1">Based on evaluations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by employee name or training..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Completed Trainings List */}
      {filteredTrainings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No completed trainings</h3>
            <p className="text-gray-600">Trainings must be marked as completed before evaluation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTrainings.map((training) => {
            const evaluation = getEvaluation(training.id);
            return (
              <Card key={training.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {training.employee?.first_name} {training.employee?.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{training.employee?.position}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{training.training?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{training.training?.training_type}</Badge>
                          <span className="text-xs text-gray-500">
                            {training.training?.duration_hours} hours • Completed{' '}
                            {new Date(training.completion_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Evaluation Summary */}
                      {evaluation && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-xs text-gray-600">Overall Rating</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < evaluation.overall_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">{evaluation.overall_rating}</p>
                              <p className="text-xs text-gray-600">{getRatingLabel(evaluation.overall_rating)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-600">Knowledge Improvement</p>
                              <p className="font-semibold text-sm">{evaluation.knowledge_improvement}/5</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Performance Improvement</p>
                              <p className="font-semibold text-sm">{evaluation.performance_improvement}/5</p>
                            </div>
                          </div>

                          {evaluation.trainer_feedback && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Trainer Feedback
                              </p>
                              <p className="text-sm text-gray-700 mt-1">{evaluation.trainer_feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Dialog open={isEvaluateDialogOpen && selectedTraining?.id === training.id} onOpenChange={setIsEvaluateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handleEditEvaluation(training)}
                          variant={evaluation ? 'outline' : 'default'}
                        >
                          {evaluation ? 'Edit' : 'Evaluate'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Evaluate Training</DialogTitle>
                          <DialogDescription>
                            Provide feedback for {training.employee?.first_name} {training.employee?.last_name} on{' '}
                            {training.training?.name}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">Overall Rating *</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => setEvaluationForm({ ...evaluationForm, overall_rating: rating })}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      rating <= evaluationForm.overall_rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {getRatingLabel(evaluationForm.overall_rating)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Knowledge Improvement
                              </label>
                              <Select
                                value={evaluationForm.knowledge_improvement.toString()}
                                onValueChange={(value) =>
                                  setEvaluationForm({ ...evaluationForm, knowledge_improvement: parseInt(value) })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                      {rating} - {getRatingLabel(rating)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Performance Improvement
                              </label>
                              <Select
                                value={evaluationForm.performance_improvement.toString()}
                                onValueChange={(value) =>
                                  setEvaluationForm({ ...evaluationForm, performance_improvement: parseInt(value) })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                      {rating} - {getRatingLabel(rating)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Trainer Feedback</label>
                            <Textarea
                              value={evaluationForm.trainer_feedback}
                              onChange={(e) =>
                                setEvaluationForm({ ...evaluationForm, trainer_feedback: e.target.value })
                              }
                              placeholder="Provide detailed feedback about the training and employee performance"
                              rows={4}
                            />
                          </div>

                          <Button onClick={handleSaveEvaluation} className="w-full">
                            Save Evaluation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TrainingEvaluationPage;
