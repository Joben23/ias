import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  FileText,
  Edit3,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  Settings,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeProfile {
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager_name: string;
  hire_date: string;
  employment_type: string;
  salary_grade: string;
}

interface TrainingProgress {
  course_name: string;
  enrollment_date: string;
  completion_date?: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  progress_percentage: number;
}

interface DocumentChecklist {
  name: string;
  status: 'Completed' | 'Pending' | 'Expired';
  date_completed?: string;
  due_date?: string;
}

export default function EmployeeSelfServicePageNew() {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'training' | 'settings'>('profile');
  const [editingProfile, setEditingProfile] = useState(false);

  // Sample data
  const employeeProfile: EmployeeProfile = {
    employee_id: 'HOS-ENG-001',
    full_name: 'Benjo Sion',
    email: 'benjo.sion@hospital.com',
    phone: '+1-555-8401',
    position: 'Senior Clinical Systems Engineer',
    department: 'Clinical Information Technology',
    manager_name: 'Dr. Sarah Mitchell',
    hire_date: '2020-06-15',
    employment_type: 'Full-time',
    salary_grade: 'IT-Professional-5',
  };

  const trainingProgress: TrainingProgress[] = [
    {
      course_name: 'Epic EHR Systems Fundamentals',
      enrollment_date: '2026-05-01',
      status: 'In Progress',
      progress_percentage: 72,
    },
    {
      course_name: 'Clinical Leadership in Healthcare IT',
      enrollment_date: '2026-04-15',
      status: 'In Progress',
      progress_percentage: 45,
    },
    {
      course_name: 'HIPAA Compliance & Patient Privacy',
      enrollment_date: '2026-04-01',
      completion_date: '2026-04-15',
      status: 'Completed',
      progress_percentage: 100,
    },
    {
      course_name: 'Healthcare Cybersecurity Essentials',
      enrollment_date: '2026-03-15',
      completion_date: '2026-03-30',
      status: 'Completed',
      progress_percentage: 100,
    },
  ];

  const documents: DocumentChecklist[] = [
    {
      name: 'Hospital Employment Contract & Offer Letter',
      status: 'Completed',
      date_completed: '2020-06-10',
    },
    {
      name: 'HIPAA Compliance Training Certificate',
      status: 'Completed',
      date_completed: '2026-04-15',
    },
    {
      name: 'Direct Deposit Authorization',
      status: 'Completed',
      date_completed: '2020-06-15',
    },
    {
      name: 'Emergency Contact Form',
      status: 'Completed',
      date_completed: '2020-06-15',
    },
    {
      name: 'Healthcare Provider Confidentiality Agreement',
      status: 'Completed',
      date_completed: '2020-06-20',
    },
    {
      name: 'Benefits Enrollment (Medical/Dental)',
      status: 'Completed',
      date_completed: '2026-01-15',
    },
    {
      name: 'Healthcare Security Training Certification',
      status: 'Completed',
      date_completed: '2026-03-10',
    },
    {
      name: 'Quarterly Performance Review',
      status: 'Pending',
      due_date: '2026-05-31',
    },
  ];

  const statusColors: Record<string, string> = {
    'Completed': 'bg-green-100 text-green-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Not Started': 'bg-gray-100 text-gray-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Expired': 'bg-red-100 text-red-700',
  };

  const handleUpdateProfile = () => {
    alert('Update profile');
  };

  const handleDownloadDocument = (docName: string) => {
    alert(`Download ${docName}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Employee Self-Service 👤
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile, documents, and development</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['profile', 'documents', 'training', 'settings'].map(tab => (
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{employeeProfile.full_name}</h3>
                  <p className="text-lg text-muted-foreground">{employeeProfile.position}</p>
                  <Badge variant="outline" className="mt-2">
                    {employeeProfile.employee_id}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Employee Since</p>
                  <p className="font-semibold text-foreground">
                    {format(new Date(employeeProfile.hire_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.floor((new Date().getTime() - new Date(employeeProfile.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} years tenure
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Work Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{employeeProfile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground">{employeeProfile.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-semibold text-foreground">{employeeProfile.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Manager</p>
                  <p className="font-semibold text-foreground">{employeeProfile.manager_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employment Type</p>
                  <p className="font-semibold text-foreground">{employeeProfile.employment_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary Grade</p>
                  <p className="font-semibold text-foreground">{employeeProfile.salary_grade}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile */}
          <Button onClick={handleUpdateProfile} size="lg" className="w-full">
            <Edit3 className="w-4 h-4 mr-2" />
            Update Profile
          </Button>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {documents.filter(d => d.status === 'Pending').length} documents pending review • {documents.filter(d => d.status === 'Expired').length} documents expired
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{doc.name}</h4>
                        <Badge className={statusColors[doc.status]}>
                          {doc.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {doc.status === 'Completed' && doc.date_completed && (
                          <p>Completed: {format(new Date(doc.date_completed), 'MMM d, yyyy')}</p>
                        )}
                        {doc.status === 'Pending' && doc.due_date && (
                          <p>Due: {format(new Date(doc.due_date), 'MMM d, yyyy')}</p>
                        )}
                        {doc.status === 'Expired' && (
                          <p className="text-red-600">Expired on {format(new Date(doc.due_date!), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {doc.status === 'Completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDocument(doc.name)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {doc.status === 'Pending' && (
                        <Button size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      {doc.status === 'Expired' && (
                        <Button size="sm" variant="destructive">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Renew
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          {/* Training Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Courses</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {trainingProgress.filter(t => t.status === 'Completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      {trainingProgress.filter(t => t.status === 'In Progress').length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                      {Math.round(trainingProgress.reduce((sum, t) => sum + t.progress_percentage, 0) / trainingProgress.length)}%
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training Courses */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Your Training Courses</h3>
            <div className="space-y-3">
              {trainingProgress.map((course, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{course.course_name}</h4>
                          <Badge className={statusColors[course.status]}>
                            {course.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-muted-foreground text-xs">Enrolled</p>
                            <p className="font-semibold text-foreground">
                              {format(new Date(course.enrollment_date), 'MMm d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Progress</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${course.progress_percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-foreground text-xs font-semibold">
                                {course.progress_percentage}%
                              </span>
                            </div>
                          </div>
                          {course.completion_date && (
                            <div className="col-span-2">
                              <p className="text-muted-foreground text-xs">Completed</p>
                              <p className="font-semibold text-green-700">
                                {format(new Date(course.completion_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="outline">
                        {course.status === 'Completed' ? 'View Certificate' : 'Continue'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Browse Courses */}
          <Button variant="outline" size="lg" className="w-full">
            Browse Available Courses
          </Button>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="lg" className="justify-start h-auto p-4 w-full">
                <div className="text-left">
                  <p className="font-semibold text-foreground">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
              </Button>

              <Button variant="outline" size="lg" className="justify-start h-auto p-4 w-full">
                <div className="text-left">
                  <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Enable 2FA for extra security</p>
                </div>
              </Button>

              <Button variant="outline" size="lg" className="justify-start h-auto p-4 w-full">
                <div className="text-left">
                  <p className="font-semibold text-foreground">Notification Preferences</p>
                  <p className="text-sm text-muted-foreground">Manage your notification settings</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
