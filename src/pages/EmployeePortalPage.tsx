import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, User, Award, Calendar, LogOut, ChevronLeft } from 'lucide-react';
import { ChangePasswordSection } from '@/components/ChangePasswordSection';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface OnboardingTask {
  id: string;
  task_name: string;
  task_category: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

interface Recognition {
  id: string;
  employee_name: string;
  position: string | null;
  department: string | null;
  award_type: string;
  description: string | null;
  date: string;
  likes: number;
  comments: number;
}

interface EmployeeData {
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  start_date: string;
  status: string;
  onboarding_status?: string;
}

export default function EmployeePortalPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchEmployeeData(),
        fetchOnboardingTasks(),
        fetchRecognitions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) {
        console.error('Error fetching employee data:', error);
        // Don't show error toast for missing employee record - might not be hired yet
        if (error.code !== 'PGRST116') { // PGRST116 is "not found"
          toast({
            title: 'Error',
            description: 'Failed to load employee data',
            variant: 'destructive',
          });
        }
      } else {
        setEmployeeData(data);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const fetchOnboardingTasks = async () => {
    try {
      // Get employee record first to get employee_id
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (empError || !empData) {
        console.log('No employee record found for onboarding tasks');
        setOnboardingTasks([]);
        return;
      }

      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .eq('employee_id', empData.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching onboarding tasks:', error);
      } else {
        setOnboardingTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching onboarding tasks:', error);
      setOnboardingTasks([]);
    }
  };

  const fetchRecognitions = async () => {
    try {
      // For now, just fetch all recognitions since the table doesn't have recipient_id
      // In a real app, you'd need to add recipient_id to the recognitions table
      const { data, error } = await supabase
        .from('recognitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recognitions:', error);
        setRecognitions([]);
      } else if (data) {
        // Transform the data to match our interface
        const formattedRecognitions = data.map(item => ({
          id: item.id,
          employee_name: item.employee_name,
          position: item.position,
          department: item.department,
          award_type: item.award_type,
          description: item.description,
          date: item.date,
          likes: item.likes,
          comments: item.comments
        }));
        setRecognitions(formattedRecognitions);
      } else {
        setRecognitions([]);
      }
    } catch (error) {
      console.error('Error fetching recognitions:', error);
      setRecognitions([]);
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name || !name.trim()) return 'EM';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'probation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Landing
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="gradient-primary text-white font-semibold">
                  {getInitials(employeeData?.full_name || profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {employeeData?.full_name || profile?.full_name || 'Employee'}
                </h1>
                <p className="text-muted-foreground">
                  {employeeData?.position || 'Staff Member'} • {employeeData?.department || profile?.department || 'Hospital'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {employeeData?.status && (
                <Badge className={getStatusColor(employeeData.status)}>
                  {employeeData.status}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeData ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-foreground font-mono">{employeeData.employee_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{employeeData.email || profile?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{employeeData.phone || profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-foreground">{employeeData.start_date || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="text-foreground">{employeeData.department || profile?.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Position</label>
                    <p className="text-foreground">{employeeData.position}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Employee record not found. You may not be fully onboarded yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contact HR for assistance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Onboarding Tasks
              </CardTitle>
              <CardDescription>
                Complete these tasks to get fully onboarded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {onboardingTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No onboarding tasks assigned
                </p>
              ) : (
                <div className="space-y-4">
                  {onboardingTasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.task_name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.task_category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Recognition
              </CardTitle>
              <CardDescription>
                Recognition and appreciation from your colleagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recognitions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No recognition posts yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recognitions.map((recognition) => (
                      <Card key={recognition.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{recognition.award_type}</h4>
                          <span className="text-xs text-muted-foreground">
                            {recognition.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{recognition.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{recognition.employee_name}</span>
                          <div className="flex items-center gap-3">
                            <span>👍 {recognition.likes}</span>
                            <span>💬 {recognition.comments}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings - Change Password */}
          <Card className="lg:col-span-3">
            <ChangePasswordSection />
          </Card>
        </div>
      </div>
    </div>
  );
}