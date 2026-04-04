import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle, Play, Download, Calendar, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
}

interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  duration_hours: number;
  instructor: string;
  objectives: string;
  prerequisites: string;
}

interface EmployeeCourse {
  id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  courses: Course;
  course_certifications: any[];
}

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  overdueCourses: number;
  totalHours: number;
  completedHours: number;
}

export default function EmployeeLearningPage() {
  const { user } = useAuth();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeCourses, setEmployeeCourses] = useState<EmployeeCourse[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    overdueCourses: 0,
    totalHours: 0,
    completedHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let targetEmployeeId = employeeId;
      if (!targetEmployeeId) {
        if (!user) {
          setEmployee(null);
          setLoading(false);
          return;
        }

        const { data: empRecord, error: empRecordError } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (empRecordError || !empRecord) {
          console.warn('ESS Learning: no employee record for user', empRecordError);
          setEmployee(null);
          setEmployeeCourses([]);
          setLoading(false);
          return;
        }

        setEmployee(empRecord as Employee);
        targetEmployeeId = empRecord.id;
      }

      // Fetch employee details
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', targetEmployeeId)
        .single();

      if (empError) {
        console.warn('ESS Learning: employee fetch failed', empError);
      } else {
        setEmployee(empData || null);
      }

      // Fetch employee's courses with certifications
      const { data: coursesData, error: coursesError } = await supabase
        .from('employee_courses' as any)
        .select(`
          id,
          course_id,
          status,
          progress_percentage,
          enrolled_at,
          started_at,
          completed_at,
          due_date,
          courses (
            id,
            name,
            category,
            description,
            duration_hours,
            instructor,
            objectives,
            prerequisites
          ),
          course_certifications (
            id,
            certificate_number,
            issued_at,
            certificate_url
          )
        `)
        .eq('employee_id', employeeId)
        .order('enrolled_at', { ascending: false });

      if (coursesError) {
        console.error('Error fetching employee courses:', coursesError);
      } else {
        setEmployeeCourses(coursesData || []);
        calculateStats(coursesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Only show toast for unexpected errors, not missing tables
      if (!(error as any)?.message?.includes('does not exist')) {
        toast({
          title: 'Error',
          description: 'Failed to load employee learning data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (courses: EmployeeCourse[]) => {
    const now = new Date();
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.status === 'Completed').length;
    const inProgressCourses = courses.filter(c => c.status === 'In Progress').length;
    const overdueCourses = courses.filter(c =>
      c.due_date && new Date(c.due_date) < now && c.status !== 'Completed'
    ).length;

    const totalHours = courses.reduce((sum, c) => sum + c.courses.duration_hours, 0);
    const completedHours = courses
      .filter(c => c.status === 'Completed')
      .reduce((sum, c) => sum + c.courses.duration_hours, 0);

    setStats({
      totalCourses,
      completedCourses,
      inProgressCourses,
      overdueCourses,
      totalHours,
      completedHours,
    });
  };

  const handleStartCourse = async (employeeCourseId: string) => {
    try {
      const { error } = await supabase
        .from('employee_courses' as any)
        .update({
          status: 'In Progress',
          started_at: new Date().toISOString(),
          progress_percentage: Math.max(5, Math.floor(Math.random() * 20) + 5), // Simulate initial progress
          updated_at: new Date().toISOString(),
        })
        .eq('id', employeeCourseId);

      if (error) throw error;

      toast({
        title: 'Course Started',
        description: 'You have started this course. Good luck!',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start course',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProgress = async (employeeCourseId: string, newProgress: number) => {
    try {
      const updateData: any = {
        progress_percentage: newProgress,
        updated_at: new Date().toISOString(),
      };

      if (newProgress >= 100) {
        updateData.status = 'Completed';
        updateData.completed_at = new Date().toISOString();

        // Create certification
        await createCertification(employeeCourseId);
      } else if (newProgress > 0) {
        updateData.status = 'In Progress';
      }

      const { error } = await supabase
        .from('employee_courses' as any)
        .update(updateData)
        .eq('id', employeeCourseId);

      if (error) throw error;

      toast({
        title: newProgress >= 100 ? 'Course Completed!' : 'Progress Updated',
        description: newProgress >= 100
          ? 'Congratulations! You have completed this course and earned a certification.'
          : `Your progress has been updated to ${newProgress}%.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const createCertification = async (employeeCourseId: string) => {
    try {
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { error } = await supabase
        .from('course_certifications' as any)
        .insert([{
          employee_course_id: employeeCourseId,
          certificate_number: certificateNumber,
          issued_at: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating certification:', error);
    }
  };

  const downloadCertificate = (certification: any) => {
    // In a real application, this would generate/download a PDF certificate
    toast({
      title: 'Certificate Download',
      description: `Certificate ${certification.certificate_number} would be downloaded here.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medical': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'soft skills': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground">Employee not found</h2>
        <Button asChild className="mt-4">
          <Link to="/hr2/learning">Back to Learning Management</Link>
        </Button>
      </div>
    );
  }

  const completedCourses = employeeCourses.filter(ec => ec.status === 'Completed');
  const inProgressCourses = employeeCourses.filter(ec => ec.status === 'In Progress');
  const notStartedCourses = employeeCourses.filter(ec => ec.status === 'Not Started');
  const overdueCourses = employeeCourses.filter(ec => isOverdue(ec.due_date) && ec.status !== 'Completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/hr2/learning">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{employee.full_name}'s Learning</h1>
          <p className="text-muted-foreground">{employee.position} • {employee.department}</p>
        </div>
      </div>

      {/* Learning Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedHours}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Courses Alert */}
      {overdueCourses.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Clock className="w-5 h-5" />
              Overdue Courses
            </CardTitle>
            <CardDescription className="text-red-700">
              The following courses are past their due dates. Please complete them as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueCourses.map((empCourse) => (
                <div key={empCourse.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <div className="p-2 rounded-full bg-red-100">
                    <Clock className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{empCourse.courses.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(empCourse.due_date!).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Overdue
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Sections */}
      <div className="space-y-6">
        {/* In Progress Courses */}
        {inProgressCourses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              In Progress ({inProgressCourses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressCourses.map((empCourse) => (
                <Card key={empCourse.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{empCourse.courses.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getCategoryColor(empCourse.courses.category)}>
                            {empCourse.courses.category}
                          </Badge>
                          <Badge className={getStatusColor(empCourse.status)}>
                            {empCourse.status}
                          </Badge>
                        </div>
                      </div>
                      {isOverdue(empCourse.due_date) && (
                        <Clock className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {empCourse.courses.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{empCourse.courses.duration_hours} hours</span>
                      {empCourse.courses.instructor && (
                        <>
                          <span>•</span>
                          <span>{empCourse.courses.instructor}</span>
                        </>
                      )}
                    </div>

                    {empCourse.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(empCourse.due_date).toLocaleDateString()}</span>
                        {isOverdue(empCourse.due_date) && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{empCourse.progress_percentage}%</span>
                      </div>
                      <Progress value={empCourse.progress_percentage} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateProgress(empCourse.id, Math.min(100, empCourse.progress_percentage + 25))}
                      >
                        Update Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateProgress(empCourse.id, 100)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses (Not Started) */}
        {notStartedCourses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              Available Courses ({notStartedCourses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notStartedCourses.map((empCourse) => (
                <Card key={empCourse.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{empCourse.courses.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getCategoryColor(empCourse.courses.category)}>
                            {empCourse.courses.category}
                          </Badge>
                          <Badge className={getStatusColor(empCourse.status)}>
                            {empCourse.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {empCourse.courses.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{empCourse.courses.duration_hours} hours</span>
                      {empCourse.courses.instructor && (
                        <>
                          <span>•</span>
                          <span>{empCourse.courses.instructor}</span>
                        </>
                      )}
                    </div>

                    {empCourse.courses.objectives && (
                      <div className="text-sm">
                        <strong>Objectives:</strong> {empCourse.courses.objectives}
                      </div>
                    )}

                    {empCourse.courses.prerequisites && (
                      <div className="text-sm">
                        <strong>Prerequisites:</strong> {empCourse.courses.prerequisites}
                      </div>
                    )}

                    {empCourse.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(empCourse.due_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleStartCourse(empCourse.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Completed Courses ({completedCourses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedCourses.map((empCourse) => (
                <Card key={empCourse.id} className="hover:shadow-md transition-shadow border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{empCourse.courses.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getCategoryColor(empCourse.courses.category)}>
                            {empCourse.courses.category}
                          </Badge>
                          <Badge className={getStatusColor(empCourse.status)}>
                            {empCourse.status}
                          </Badge>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {empCourse.courses.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{empCourse.courses.duration_hours} hours</span>
                      {empCourse.completed_at && (
                        <>
                          <span>•</span>
                          <span>Completed {new Date(empCourse.completed_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    <Progress value={100} className="h-2" />

                    {empCourse.course_certifications && empCourse.course_certifications.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Certifications Earned:</h4>
                        {empCourse.course_certifications.map((cert: any) => (
                          <div key={cert.id} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                            <div>
                              <p className="text-sm font-medium">{cert.certificate_number}</p>
                              <p className="text-xs text-muted-foreground">
                                Issued: {new Date(cert.issued_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadCertificate(cert)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {employeeCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses assigned</h3>
            <p className="text-muted-foreground">
              You haven't been enrolled in any training courses yet. Check back later for new assignments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}