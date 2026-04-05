import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Target,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  category: 'Technical' | 'Leadership' | 'Compliance' | 'Soft Skills';
  start_date: string;
  end_date: string;
  duration_days: number;
  assigned_count: number;
  completed_count: number;
  trainer: string;
  status: 'Planned' | 'Active' | 'Completed';
  completion_rate: number;
}

interface TrainingAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  position: string;
  training_id: string;
  training_name: string;
  assigned_date: string;
  start_date: string;
  due_date: string;
  completion_date?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
  progress_percentage: number;
  score?: number;
}

export default function TrainingManagementPageNew() {
  const [activeTab, setActiveTab] = useState<'programs' | 'assignments' | 'progress'>('programs');

  // Sample data
  const trainingPrograms: TrainingProgram[] = [
    {
      id: 'TP001',
      name: 'Epic EHR Systems Fundamentals',
      description: 'Comprehensive training on Epic Electronic Health Record systems and clinical workflows',
      category: 'Technical',
      start_date: '2026-05-01',
      end_date: '2026-05-15',
      duration_days: 15,
      assigned_count: 12,
      completed_count: 8,
      trainer: 'Dr. Emily Walsh',
      status: 'Active',
      completion_rate: 67,
    },
    {
      id: 'TP002',
      name: 'Clinical Leadership in Healthcare IT',
      description: 'Leadership skills specific to healthcare IT management and clinical team supervision',
      category: 'Leadership',
      start_date: '2026-04-15',
      end_date: '2026-05-15',
      duration_days: 30,
      assigned_count: 8,
      completed_count: 3,
      trainer: 'Dr. Marcus Thompson',
      status: 'Active',
      completion_rate: 38,
    },
    {
      id: 'TP003',
      name: 'HIPAA Compliance & Patient Privacy',
      description: 'Annual HIPAA competency training and patient data protection compliance',
      category: 'Compliance',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      duration_days: 3,
      assigned_count: 250,
      completed_count: 238,
      trainer: 'Compliance & Privacy Office',
      status: 'Active',
      completion_rate: 95,
    },
    {
      id: 'TP004',
      name: 'Healthcare Cybersecurity Essentials',
      description: 'Cybersecurity practices and threat prevention in healthcare environments',
      category: 'Technical',
      start_date: '2026-03-15',
      end_date: '2026-03-30',
      duration_days: 13,
      assigned_count: 45,
      completed_count: 45,
      trainer: 'Information Security Team',
      status: 'Completed',
      completion_rate: 100,
    },
  ];

  const trainingAssignments: TrainingAssignment[] = [
    {
      id: 'TA001',
      employee_id: 'HOS-ENG-001',
      employee_name: 'Benjo Sion',
      position: 'Senior Clinical Systems Engineer',
      training_id: 'TP001',
      training_name: 'Epic EHR Systems Fundamentals',
      assigned_date: '2026-04-20',
      start_date: '2026-05-01',
      due_date: '2026-05-15',
      completion_date: '2026-05-12',
      status: 'Completed',
      progress_percentage: 100,
      score: 94,
    },
    {
      id: 'TA002',
      employee_id: 'HOS-IT-002',
      employee_name: 'Dr. Sarah Mitchell',
      position: 'Director of Clinical IT',
      training_id: 'TP002',
      training_name: 'Clinical Leadership in Healthcare IT',
      assigned_date: '2026-03-30',
      start_date: '2026-04-15',
      due_date: '2026-05-15',
      status: 'In Progress',
      progress_percentage: 72,
    },
    {
      id: 'TA003',
      employee_id: 'HOS-IT-003',
      employee_name: 'Michael Chen',
      position: 'Healthcare Systems Analyst',
      training_id: 'TP001',
      training_name: 'Epic EHR Systems Fundamentals',
      assigned_date: '2026-04-20',
      start_date: '2026-05-01',
      due_date: '2026-05-15',
      status: 'In Progress',
      progress_percentage: 58,
    },
    {
      id: 'TA004',
      employee_id: 'HOS-IT-004',
      employee_name: 'Jessica Martinez',
      position: 'Network Security Specialist',
      training_id: 'TP003',
      training_name: 'HIPAA Compliance & Patient Privacy',
      assigned_date: '2026-03-25',
      start_date: '2026-04-01',
      due_date: '2026-04-30',
      completion_date: '2026-04-08',
      status: 'Completed',
      progress_percentage: 100,
      score: 91,
    },
  ];

  const statusColors: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Failed': 'bg-red-100 text-red-700',
    'Planned': 'bg-gray-100 text-gray-700',
    'Active': 'bg-blue-100 text-blue-700',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Technical': '💻',
    'Leadership': '👔',
    'Compliance': '📋',
    'Soft Skills': '💬',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Training Management 📚
        </h1>
        <p className="text-muted-foreground mt-1">Manage training programs and employee development</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['programs', 'assignments', 'progress'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-2 font-medium text-sm transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {trainingPrograms.filter(p => p.status === 'Active').length} active training programs with {trainingPrograms.reduce((sum, p) => sum + p.assigned_count, 0)} total assignments
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {trainingPrograms.map(program => (
              <Card key={program.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{categoryIcons[program.category]}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{program.name}</h4>
                            <Badge className={statusColors[program.status]}>
                              {program.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{program.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-muted-foreground text-xs">Category</p>
                          <p className="font-semibold text-foreground">{program.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Duration</p>
                          <p className="font-semibold text-foreground">{program.duration_days} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Dates</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(program.start_date), 'MMM d')} - {format(new Date(program.end_date), 'MMM d')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Participants</p>
                          <p className="font-semibold text-foreground">{program.assigned_count} assigned</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Completion</p>
                          <p className="font-semibold text-foreground">
                            {program.completed_count} / {program.assigned_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Progress</p>
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{ width: `${program.completion_rate}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-foreground text-xs">
                              {program.completion_rate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3">Trainer: {program.trainer}</p>
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {trainingAssignments.filter(a => a.status === 'In Progress').length} training courses in progress • {trainingAssignments.filter(a => a.status === 'Not Started').length} not yet started
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {trainingAssignments.map(assignment => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{assignment.employee_name}</h4>
                        <Badge className={statusColors[assignment.status]}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{assignment.position}</p>

                      <div className="grid grid-cols-5 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-muted-foreground text-xs">Training Course</p>
                          <p className="font-semibold text-foreground">{assignment.training_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Assigned</p>
                          <p className="text-foreground text-xs">{assignment.assigned_date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Due Date</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Progress</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${assignment.progress_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-foreground text-xs font-semibold">
                              {assignment.progress_percentage}%
                            </span>
                          </div>
                        </div>
                        {assignment.score && (
                          <div>
                            <p className="text-muted-foreground text-xs">Score</p>
                            <p className="font-bold text-green-700 text-lg">{assignment.score}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      {assignment.status === 'Completed' ? 'View Certificate' : 'Continue Course'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Completion Summary</CardTitle>
              <CardDescription>Overall training progress and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">
                    {trainingAssignments.filter(a => a.status === 'Completed').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">trainings finished</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-blue-700 mt-2">
                    {trainingAssignments.filter(a => a.status === 'In Progress').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">currently active</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-muted-foreground">Not Started</p>
                  <p className="text-3xl font-bold text-gray-700 mt-2">
                    {trainingAssignments.filter(a => a.status === 'Not Started').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">pending start</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-3xl font-bold text-purple-700 mt-2">
                    {Math.round(trainingAssignments.reduce((sum, a) => sum + a.progress_percentage, 0) / trainingAssignments.length)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">overall progress</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">By Category</h4>
                <div className="space-y-2">
                  {['Technical', 'Leadership', 'Compliance', 'Soft Skills'].map(cat => {
                    const catPrograms = trainingPrograms.filter(p => p.category === cat);
                    const avgCompletion = catPrograms.length > 0
                      ? Math.round(catPrograms.reduce((sum, p) => sum + p.completion_rate, 0) / catPrograms.length)
                      : 0;
                    return (
                      <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-semibold text-foreground">{cat}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${avgCompletion}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-foreground w-12 text-right">{avgCompletion}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
