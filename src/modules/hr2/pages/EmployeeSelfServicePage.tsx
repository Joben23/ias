import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  FileText,
  BookOpen,
  Award,
  Upload,
  Edit3,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  Briefcase,
  GraduationCap,
  Target,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeProfile {
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  job_title: string;
  employment_status: 'Active' | 'Probationary' | 'On Leave' | 'Inactive';
  profile_picture?: string;
}

interface EmploymentDetails {
  employee_id: string;
  date_hired: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract';
  supervisor_name: string;
  years_tenure: number;
}

interface LearningProgress {
  total_courses_assigned: number;
  courses_completed: number;
  trainings_attended: number;
  avg_completion_rate: number;
}

interface Competency {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  proficiency_score: number; // 0-100
  category: string;
}

interface Document {
  id: string;
  name: string;
  type: 'Resume' | 'Certificate' | 'ID' | 'Other';
  upload_date: string;
  file_url: string;
}

interface LeaveRequest {
  id: string;
  leave_type: 'Annual' | 'Sick' | 'Maternity' | 'Compassionate' | 'Unpaid';
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  requested_date: string;
}

export default function EmployeeSelfServicePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'employment' | 'learning' | 'competencies' | 'documents' | 'leave'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'LR-001',
      leave_type: 'Annual',
      start_date: '2026-05-15',
      end_date: '2026-05-19',
      days_requested: 5,
      status: 'Approved',
      reason: 'Personal vacation',
      requested_date: '2026-05-06',
    },
  ]);
  const [newLeaveDialog, setNewLeaveDialog] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_type: 'Annual' as const,
    start_date: '',
    end_date: '',
    reason: '',
  });
  const { toast } = useToast();

  // Sample employee data
  const employeeProfile: EmployeeProfile = {
    employee_id: 'HOS-ENG-001',
    full_name: 'Benjo Sion',
    email: 'benjo.sion@hospital.com',
    phone: '+1-555-8401',
    address: '456 Medical Plaza, Boston, MA 02115',
    department: 'Clinical Information Technology',
    job_title: 'Senior Clinical Systems Engineer',
    employment_status: 'Active',
    profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=benjo',
  };

  const employmentDetails: EmploymentDetails = {
    employee_id: 'HOS-ENG-001',
    date_hired: '2020-06-15',
    employment_type: 'Full-time',
    supervisor_name: 'Dr. Sarah Mitchell',
    years_tenure: 4,
  };

  const learningProgress: LearningProgress = {
    total_courses_assigned: 12,
    courses_completed: 9,
    trainings_attended: 6,
    avg_completion_rate: 82,
  };

  const competencies: Competency[] = [
    { id: '1', name: 'Healthcare IT Systems', level: 'Advanced', proficiency_score: 88, category: 'Technical' },
    { id: '2', name: 'Patient Safety & Quality', level: 'Expert', proficiency_score: 95, category: 'Clinical' },
    { id: '3', name: 'Clinical Leadership', level: 'Intermediate', proficiency_score: 72, category: 'Leadership' },
    { id: '4', name: 'HIPAA Compliance', level: 'Advanced', proficiency_score: 92, category: 'Compliance' },
    { id: '5', name: 'Epic EHR Systems', level: 'Advanced', proficiency_score: 85, category: 'Technical' },
  ];

  const documents: Document[] = [
    { id: '1', name: 'Resume - 2026', type: 'Resume', upload_date: '2026-01-10', file_url: '#' },
    { id: '2', name: 'HIPAA Certification', type: 'Certificate', upload_date: '2025-08-15', file_url: '#' },
    { id: '3', name: 'CompTIA Security+ Certification', type: 'Certificate', upload_date: '2024-11-20', file_url: '#' },
    { id: '4', name: 'State Medical License', type: 'ID', upload_date: '2024-06-01', file_url: '#' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Expert':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'Probationary':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'On Leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Resume':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Certificate':
        return <Award className="w-4 h-4 text-green-500" />;
      case 'ID':
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-white">
          Employee Self-Service 👤
        </h1>
        <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">Manage your profile, employment info, and development</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border dark:border-slate-700 overflow-x-auto pb-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('employment')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'employment'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Employment
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'learning'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Learning
        </button>
        <button
          onClick={() => setActiveTab('competencies')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'competencies'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Competencies
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'documents'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'leave'
              ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
              : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200'
          }`}
        >
          Leave
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">Employment Status</p>
                    <Badge className={`mt-2 ${getStatusColor(employeeProfile.employment_status)}`}>
                      {employeeProfile.employment_status}
                    </Badge>
                  </div>
                  <Briefcase className="w-5 h-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">Courses Completed</p>
                    <p className="text-xl font-bold text-foreground dark:text-white mt-1">{learningProgress.courses_completed}</p>
                  </div>
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">Trainings Attended</p>
                    <p className="text-xl font-bold text-foreground dark:text-white mt-1">{learningProgress.trainings_attended}</p>
                  </div>
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">Tenure</p>
                    <p className="text-xl font-bold text-foreground dark:text-white mt-1">{employmentDetails.years_tenure} yrs</p>
                  </div>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-white">Welcome back, {employeeProfile.full_name}!</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                    Keep your information updated and track your development progress.
                  </p>
                </div>
                <Home className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-xs">Your profile information</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs h-8"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <img
                  src={employeeProfile.profile_picture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-border dark:border-slate-700"
                />
                {isEditingProfile && (
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    <Upload className="w-3 h-3 mr-1" />
                    Change Picture
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Full Name</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Email</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Phone</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Address</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employment Tab */}
      {activeTab === 'employment' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Employment Details
              </CardTitle>
              <CardDescription className="text-xs">Your employment information (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Employee ID</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.employee_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Department</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Job Title</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employeeProfile.job_title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Employment Type</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employmentDetails.employment_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Date Hired</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{format(new Date(employmentDetails.date_hired), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Supervisor</p>
                  <p className="font-semibold text-foreground dark:text-white text-sm">{employmentDetails.supervisor_name}</p>
                </div>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
                  For changes to employment information, please contact HR.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learning Tab */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Learning & Development Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">Courses Assigned</p>
                        <p className="text-2xl font-bold text-foreground dark:text-white mt-1">{learningProgress.total_courses_assigned}</p>
                      </div>
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">Completed</p>
                        <p className="text-2xl font-bold text-foreground dark:text-white mt-1">{learningProgress.courses_completed}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground dark:text-white">Overall Completion Rate</p>
                  <span className="text-sm font-semibold text-foreground dark:text-white">{learningProgress.avg_completion_rate}%</span>
                </div>
                <Progress value={learningProgress.avg_completion_rate} className="h-2" />
              </div>

              <Button className="w-full text-sm h-9">
                <GraduationCap className="w-4 h-4 mr-2" />
                View My Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competencies Tab */}
      {activeTab === 'competencies' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-4 h-4" />
                My Competencies
              </CardTitle>
              <CardDescription className="text-xs">Your skill levels and proficiency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {competencies.length > 0 ? (
                competencies.map((competency) => (
                  <div key={competency.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground dark:text-white">{competency.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">{competency.category}</p>
                      </div>
                      <Badge className={getLevelColor(competency.level)} variant="outline">
                        {competency.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={competency.proficiency_score} className="h-1.5 flex-1" />
                      <span className="text-xs font-semibold text-muted-foreground dark:text-slate-400">{competency.proficiency_score}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground dark:text-slate-400">No competencies assessed yet.</p>
              )}

              <Button className="w-full text-sm h-9 mt-2">
                <Award className="w-4 h-4 mr-2" />
                Take Skill Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    My Documents
                  </CardTitle>
                  <CardDescription className="text-xs">Your uploaded files and certificates</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-muted dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getDocumentIcon(doc.type)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground dark:text-white truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">
                          {doc.type} • {format(new Date(doc.upload_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="text-sm">No documents uploaded yet. Upload your resume, certificates, and IDs.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground dark:text-white">Leave Management</h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">Request and track your leave</p>
            </div>
            <Dialog open={newLeaveDialog} onOpenChange={setNewLeaveDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Leave Type *</label>
                    <Select value={newLeave.leave_type} onValueChange={(value) => setNewLeave({ ...newLeave, leave_type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Annual">Annual Leave</SelectItem>
                        <SelectItem value="Sick">Sick Leave</SelectItem>
                        <SelectItem value="Maternity">Maternity Leave</SelectItem>
                        <SelectItem value="Compassionate">Compassionate Leave</SelectItem>
                        <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date *</label>
                      <Input
                        type="date"
                        value={newLeave.start_date}
                        onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date *</label>
                      <Input
                        type="date"
                        value={newLeave.end_date}
                        onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  {newLeave.start_date && newLeave.end_date && (
                    <div className="p-2 bg-muted dark:bg-slate-800 rounded">
                      <p className="text-sm">
                        <span className="font-semibold">Total Leave Days:</span>{' '}
                        {Math.ceil(
                          (new Date(newLeave.end_date).getTime() -
                            new Date(newLeave.start_date).getTime()) /
                            (1000 * 60 * 60 * 24) +
                            1
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Reason *</label>
                    <Textarea
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                      placeholder="Please provide a reason for your leave request"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewLeaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!newLeave.start_date || !newLeave.end_date || !newLeave.reason) {
                          toast({
                            title: 'Error',
                            description: 'Please fill all required fields',
                            variant: 'destructive',
                          });
                          return;
                        }
                        const newRequest: LeaveRequest = {
                          id: `LR-${String(leaveRequests.length + 1).padStart(3, '0')}`,
                          leave_type: newLeave.leave_type,
                          start_date: newLeave.start_date,
                          end_date: newLeave.end_date,
                          days_requested: Math.ceil(
                            (new Date(newLeave.end_date).getTime() -
                              new Date(newLeave.start_date).getTime()) /
                              (1000 * 60 * 60 * 24) +
                              1
                          ),
                          status: 'Pending',
                          reason: newLeave.reason,
                          requested_date: new Date().toISOString().split('T')[0],
                        };
                        setLeaveRequests([newRequest, ...leaveRequests]);
                        setNewLeave({ leave_type: 'Annual', start_date: '', end_date: '', reason: '' });
                        setNewLeaveDialog(false);
                        toast({
                          title: 'Success',
                          description: 'Leave request submitted successfully',
                        });
                      }}
                    >
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground dark:text-slate-400">Annual Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">15 days</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">Out of 20 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground dark:text-slate-400">Sick Leave Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">8 days</div>
                <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">Out of 10 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground dark:text-slate-400">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {leaveRequests.filter((l) => l.status === 'Pending').length}
                </div>
                <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                My Leave Requests
              </CardTitle>
              <CardDescription className="text-xs">History of your leave requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <div key={leave.id} className="border border-border dark:border-slate-700 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground dark:text-white">{leave.leave_type} Leave</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">
                          {leave.start_date} to {leave.end_date} • {leave.days_requested} days
                        </p>
                      </div>
                      <Badge
                        className={
                          leave.status === 'Approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : leave.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }
                      >
                        {leave.status}
                      </Badge>
                    </div>
                    {leave.reason && (
                      <p className="text-xs text-muted-foreground dark:text-slate-400">
                        <span className="font-semibold">Reason:</span> {leave.reason}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">No leave requests yet.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
