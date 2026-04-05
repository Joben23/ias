import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit2,
  Zap,
} from 'lucide-react';

interface Competency {
  id: string;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Communication';
  description: string;
}

interface EmployeeCompetency {
  competency_id: string;
  competency: Competency;
  current_level: number; // 1-5
  target_level: number;
  last_assessed: string;
  verified_by?: string;
  gap: number; // target - current
}

interface QuizResult {
  competency_id: string;
  competency_name: string;
  score: number;
  passing_score: number;
  completed_date: string;
  status: 'Passed' | 'Failed';
}

export default function CompetencyManagementPage() {
  const [activeView, setActiveView] = useState<'overview' | 'quizzes' | 'development'>('overview');
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);

  // Sample data
  const competencies: EmployeeCompetency[] = [
    {
      competency_id: '1',
      competency: {
        id: '1',
        name: 'JavaScript',
        category: 'Technical',
        description: 'Proficiency in JavaScript programming language',
      },
      current_level: 4,
      target_level: 5,
      last_assessed: '2026-03-01',
      gap: 1,
    },
    {
      competency_id: '2',
      competency: {
        id: '2',
        name: 'Communication',
        category: 'Communication',
        description: 'Ability to communicate effectively',
      },
      current_level: 3,
      target_level: 5,
      last_assessed: '2026-02-15',
      gap: 2,
    },
    {
      competency_id: '3',
      competency: {
        id: '3',
        name: 'Leadership',
        category: 'Leadership',
        description: 'Leadership and team management skills',
      },
      current_level: 2,
      target_level: 4,
      last_assessed: '2026-02-01',
      gap: 2,
    },
    {
      competency_id: '4',
      competency: {
        id: '4',
        name: 'React',
        category: 'Technical',
        description: 'React.js framework expertise',
      },
      current_level: 5,
      target_level: 5,
      last_assessed: '2026-03-10',
      gap: 0,
    },
  ];

  const quizResults: QuizResult[] = [
    {
      competency_id: '1',
      competency_name: 'JavaScript',
      score: 85,
      passing_score: 70,
      completed_date: '2026-03-10',
      status: 'Passed',
    },
    {
      competency_id: '2',
      competency_name: 'Communication',
      score: 72,
      passing_score: 70,
      completed_date: '2026-03-05',
      status: 'Passed',
    },
  ];

  const categoryColors: Record<string, string> = {
    Technical: 'bg-blue-100 text-blue-700',
    'Soft Skills': 'bg-purple-100 text-purple-700',
    'Leadership': 'bg-green-100 text-green-700',
    'Communication': 'bg-orange-100 text-orange-700',
  };

  const skillGaps = competencies.filter(c => c.gap > 0);
  const masteredSkills = competencies.filter(c => c.gap === 0);
  const averageLevel = Math.round(
    competencies.reduce((sum, c) => sum + c.current_level, 0) / competencies.length
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Competency Management 🎯
        </h1>
        <p className="text-muted-foreground mt-1">Track and develop your professional skills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold text-foreground mt-1">{competencies.length}</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Level</p>
                <p className="text-2xl font-bold text-foreground mt-1">{averageLevel}/5</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skill Gaps</p>
                <p className="text-2xl font-bold text-foreground mt-1">{skillGaps.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold text-foreground mt-1">{masteredSkills.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['overview', 'quizzes', 'development'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveView(tab as any)}
            className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
              activeView === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Mastered Skills */}
          {masteredSkills.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Mastered Skills ({masteredSkills.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {masteredSkills.map(comp => (
                  <Card key={comp.competency_id} className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{comp.competency.name}</h4>
                            <Badge className={categoryColors[comp.competency.category]}>
                              {comp.competency.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{comp.competency.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < comp.current_level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Assessed: {comp.last_assessed}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {skillGaps.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Development Opportunities ({skillGaps.length})
              </h3>
              <div className="space-y-4">
                {skillGaps.map(comp => (
                  <Card
                    key={comp.competency_id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCompetency(comp.competency_id)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{comp.competency.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {comp.competency.description}
                            </p>
                          </div>
                          <Badge className={categoryColors[comp.competency.category]}>
                            {comp.competency.category}
                          </Badge>
                        </div>

                        {/* Current + Target */}
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Level</p>
                            <div className="flex gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < comp.current_level
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Target Level</p>
                            <div className="flex gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < comp.target_level ? 'text-blue-400' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Gap to Fill */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Gap to Fill</span>
                            <span className="text-orange-600 font-medium">{comp.gap} levels</span>
                          </div>
                          <Progress
                            value={((comp.target_level - comp.gap) / comp.target_level) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeView === 'quizzes' && (
        <div className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Complete quizzes to verify your skills and improve your competency levels
            </AlertDescription>
          </Alert>

          {/* Available Quizzes */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Available Quizzes</h3>
            <div className="space-y-3">
              {skillGaps.map(comp => (
                <Card key={comp.competency_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{comp.competency.name} Quiz</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Test your {comp.competency.name.toLowerCase()} knowledge
                        </p>
                      </div>
                      <Button>Take Quiz</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quiz History */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quiz History</h3>
            <div className="space-y-3">
              {quizResults.map(result => (
                <Card key={result.competency_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{result.competency_name}</h4>
                          <Badge variant={result.status === 'Passed' ? 'secondary' : 'destructive'}>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {result.completed_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-foreground">{result.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          Passing: {result.passing_score}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Development Tab */}
      {activeView === 'development' && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your development plan includes recommended trainings and courses based on your skill gaps
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">Communication Skills</p>
                <p className="text-sm text-blue-800">
                  Current: Level 3 → Target: Level 5 (Gap: 2 levels)
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Enroll in Communication Course
                </Button>
              </div>

              <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">Leadership</p>
                <p className="text-sm text-blue-800">
                  Current: Level 2 → Target: Level 4 (Gap: 2 levels)
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Enroll in Leadership Program
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
