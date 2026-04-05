import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookOpen, Users, Clock, Award, TrendingUp, CheckCircle, Play, UserPlus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface ProficiencyLevel {
  id: string;
  name: string;
  level_order: number;
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

interface CourseStats {
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  avgProgress: number;
}

interface EmployeeCourse {
  id: string;
  employee_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  employees: Employee;
  courses: Course;
}

export default function LearningManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    avgProgress: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeCourses, setEmployeeCourses] = useState<EmployeeCourse[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    duration_hours: 1,
    instructor: '',
    objectives: '',
    prerequisites: '',
  });
  const [selectedCompetencies, setSelectedCompetencies] = useState<{competency_id: string, proficiency_level_id: string}[]>([]);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    employee_id: '',
    due_date: '',
  });
  const { toast } = useToast();

  const categories = ['Medical', 'Technical', 'Soft Skills'];

  useEffect(() => {
    fetchData();
  }, []);

  // Mock data
  const mockCoursesData: Course[] = [
    {
      id: 'COURSE-001',
      name: 'Epic EHR Systems Administration',
      category: 'Technical',
      description: 'Comprehensive training on Epic Electronic Health Record systems',
      duration_hours: 24,
      instructor: 'Dr. Emily Walsh',
      objectives: 'Master Epic configuration and workflows',
      prerequisites: 'Basic healthcare IT knowledge',
    },
    {
      id: 'COURSE-002',
      name: 'HIPAA Compliance & Patient Privacy',
      category: 'Medical',
      description: 'Essential compliance training for healthcare professionals',
      duration_hours: 4,
      instructor: 'Compliance & Privacy Office',
      objectives: 'Understand HIPAA and protect patient privacy',
      prerequisites: 'Mandatory for all',
    },
    {
      id: 'COURSE-003',
      name: 'Healthcare Cybersecurity Essentials',
      category: 'Technical',
      description: 'Security best practices for healthcare IT',
      duration_hours: 16,
      instructor: 'Information Security Team',
      objectives: 'Identify and prevent security threats',
      prerequisites: 'Healthcare IT fundamentals',
    },
    {
      id: 'COURSE-004',
      name: 'Clinical Leadership Training',
      category: 'Soft Skills',
      description: 'Leadership development for healthcare IT managers',
      duration_hours: 32,
      instructor: 'Dr. Marcus Thompson',
      objectives: 'Develop clinical leadership skills',
      prerequisites: 'Healthcare IT experience',
    },
  ];

  const mockEmployeesData: any[] = [
    { id: 'HOS-ENG-001', full_name: 'Benjo Sion', position: 'Senior Clinical Systems Engineer', department: 'Clinical IT' },
    { id: 'HOS-IT-002', full_name: 'Dr. Sarah Mitchell', position: 'Director of Clinical IT', department: 'Clinical IT' },
    { id: 'HOS-IT-003', full_name: 'Michael Chen', position: 'Healthcare Systems Analyst', department: 'Clinical IT' },
    { id: 'HOS-IT-004', full_name: 'Jessica Martinez', position: 'Network Security Specialist', department: 'Clinical IT' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses' as any)
        .select('*')
        .order('name');

      if (coursesError || !coursesData || coursesData.length === 0) {
        console.log('Using mock courses');
        setCourses(mockCoursesData);
      } else {
        setCourses(coursesData || []);
      }

      // Fetch employees for enrollment
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, full_name, position, department')
        .order('full_name');

      if (employeesError || !employeesData || employeesData.length === 0) {
        console.log('Using mock employees');
        setEmployees(mockEmployeesData);
      } else {
        setEmployees(employeesData || []);
      }

      // Fetch employee courses with employee and course details
      const { data: employeeCoursesData, error: employeeCoursesError } = await supabase
        .from('employee_courses' as any)
        .select(`
          id,
          employee_id,
          course_id,
          status,
          progress_percentage,
          enrolled_at,
          started_at,
          completed_at,
          due_date,
          employees (
            id,
            full_name,
            position,
            department
          ),
          courses (
            id,
            name,
            category,
            description,
            duration_hours,
            instructor
          )
        `)
        .order('enrolled_at', { ascending: false });

      if (employeeCoursesError || !employeeCoursesData || employeeCoursesData.length === 0) {
        console.log('Using mock employee courses');
        const mockEC: EmployeeCourse[] = [
          {
            id: 'EC-001',
            employee_id: 'HOS-ENG-001',
            course_id: 'COURSE-001',
            status: 'In Progress',
            progress_percentage: 65,
            enrolled_at: '2026-05-01',
            started_at: '2026-05-05',
            completed_at: null,
            due_date: '2026-05-25',
            employees: mockEmployeesData[0],
            courses: mockCoursesData[0],
          },
          {
            id: 'EC-002',
            employee_id: 'HOS-ENG-001',
            course_id: 'COURSE-002',
            status: 'Completed',
            progress_percentage: 100,
            enrolled_at: '2026-04-01',
            started_at: '2026-04-01',
            completed_at: '2026-04-15',
            due_date: '2026-04-30',
            employees: mockEmployeesData[0],
            courses: mockCoursesData[1],
          },
          {
            id: 'EC-003',
            employee_id: 'HOS-IT-002',
            course_id: 'COURSE-004',
            status: 'In Progress',
            progress_percentage: 45,
            enrolled_at: '2026-04-15',
            started_at: '2026-04-20',
            completed_at: null,
            due_date: '2026-06-15',
            employees: mockEmployeesData[1],
            courses: mockCoursesData[3],
          },
        ];
        setEmployeeCourses(mockEC);
      } else {
        setEmployeeCourses((employeeCoursesData as EmployeeCourse[]) || []);
      }

      // Fetch competencies for course creation
      const mockCompetencies: Competency[] = [
        { id: 'COMP-001', name: 'Healthcare IT Systems', category: 'Technical', description: '' },
        { id: 'COMP-002', name: 'Patient Safety', category: 'Medical', description: '' },
        { id: 'COMP-003', name: 'Epic EHR', category: 'Technical', description: '' },
        { id: 'COMP-004', name: 'Clinical Leadership', category: 'Soft Skills', description: '' },
        { id: 'COMP-005', name: 'HIPAA Compliance', category: 'Medical', description: '' },
      ];

      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies' as any)
        .select('*')
        .order('name');

      if (competenciesError || !competenciesData || competenciesData.length === 0) {
        console.log('Using mock competencies');
        setCompetencies(mockCompetencies);
      } else {
        setCompetencies((competenciesData as unknown as Competency[]) || []);
      }

      // Fetch proficiency levels
      const mockProficiencyLevels: ProficiencyLevel[] = [
        { id: 'PL-001', name: 'Beginner', level_order: 1 },
        { id: 'PL-002', name: 'Intermediate', level_order: 2 },
        { id: 'PL-003', name: 'Advanced', level_order: 3 },
        { id: 'PL-004', name: 'Expert', level_order: 4 },
      ];

      const { data: proficiencyData, error: proficiencyError } = await supabase
        .from('proficiency_levels' as any)
        .select('*')
        .order('level_order');

      if (proficiencyError || !proficiencyData || proficiencyData.length === 0) {
        console.log('Using mock proficiency levels');
        setProficiencyLevels(mockProficiencyLevels);
      } else {
        setProficiencyLevels((proficiencyData as unknown as ProficiencyLevel[]) || []);
      }

      // Fetch stats
      await fetchStats();
    } catch (error) {
      console.error('Error fetching data:', error);
      // Only show toast for unexpected errors, not missing tables
      if (!(error as any)?.message?.includes('does not exist')) {
        toast({
          title: 'Error',
          description: 'Failed to load learning data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total courses
      const { count: totalCourses, error: coursesError } = await supabase
        .from('courses' as any)
        .select('*', { count: 'exact', head: true });

      // Get total enrollments
      const { count: totalEnrollments, error: enrollmentsError } = await supabase
        .from('employee_courses' as any)
        .select('*', { count: 'exact', head: true });

      // Get completion stats
      const { data: enrollmentsData, error: statsError } = await supabase
        .from('employee_courses' as any)
        .select('status, progress_percentage');
      const enrollments = (enrollmentsData as unknown as { status: string; progress_percentage: number }[]) || [];

      let completed = 0;
      let completionRate = 0;
      let avgProgress = 0;

      if (!statsError && Array.isArray(enrollments)) {
        completed = enrollments.filter(e => e.status === 'Completed').length;
        completionRate = totalEnrollments ? (completed / totalEnrollments) * 100 : 0;
        avgProgress = enrollments.length
          ? enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length
          : 0;
      }

      setStats({
        totalCourses: coursesError ? 0 : (totalCourses || 0),
        totalEnrollments: enrollmentsError ? 0 : (totalEnrollments || 0),
        completionRate: Math.round(completionRate),
        avgProgress: Math.round(avgProgress),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if there's an error
      setStats({
        totalCourses: 0,
        totalEnrollments: 0,
        completionRate: 0,
        avgProgress: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast({
        title: 'Error',
        description: 'Name and category are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      let courseId: string;

      if (editingCourse) {
        const { error } = await supabase
          .from('courses' as any)
          .update({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            duration_hours: formData.duration_hours,
            instructor: formData.instructor,
            objectives: formData.objectives,
            prerequisites: formData.prerequisites,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCourse.id);

        if (error) throw error;
        courseId = editingCourse.id;

        // Delete existing course competencies
        await supabase
          .from('course_competencies' as any)
          .delete()
          .eq('course_id', courseId);

        toast({
          title: 'Success',
          description: 'Course updated successfully',
        });
      } else {
        const { data, error } = await supabase
          .from('courses' as any)
          .insert([{
            name: formData.name,
            category: formData.category,
            description: formData.description,
            duration_hours: formData.duration_hours,
            instructor: formData.instructor,
            objectives: formData.objectives,
            prerequisites: formData.prerequisites,
          }])
          .select('id')
          .single();

        if (error) throw error;
        const inserted = data as unknown as { id: string };
        courseId = inserted.id;

        toast({
          title: 'Success',
          description: 'Course created successfully',
        });
      }

      // Add course competencies
      if (selectedCompetencies.length > 0) {
        const competenciesToInsert = selectedCompetencies.map(sc => ({
          course_id: courseId,
          competency_id: sc.competency_id,
          proficiency_level_id: sc.proficiency_level_id,
        }));

        const { error: compError } = await supabase
          .from('course_competencies' as any)
          .insert(competenciesToInsert);

        if (compError) {
          console.error('Error saving course competencies:', compError);
          toast({
            title: 'Warning',
            description: 'Course saved but competencies could not be linked',
            variant: 'destructive',
          });
        }
      }

      setDialogOpen(false);
      setEditingCourse(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        duration_hours: 1,
        instructor: '',
        objectives: '',
        prerequisites: '',
      });
      setSelectedCompetencies([]);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save course',
        variant: 'destructive',
      });
    }
  };

  const handleEnrollEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enrollmentFormData.employee_id || !selectedCourseForEnrollment) {
      toast({
        title: 'Error',
        description: 'Employee and course are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const enrollmentData: any = {
        employee_id: enrollmentFormData.employee_id,
        course_id: selectedCourseForEnrollment.id,
        status: 'Not Started',
        progress_percentage: 0,
      };

      if (enrollmentFormData.due_date) {
        enrollmentData.due_date = enrollmentFormData.due_date;
      }

      const { error } = await supabase
        .from('employee_courses' as any)
        .upsert(enrollmentData, {
          onConflict: 'employee_id,course_id'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee enrolled in course successfully',
      });

      setEnrollDialogOpen(false);
      setSelectedCourseForEnrollment(null);
      setEnrollmentFormData({ employee_id: '', due_date: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enroll employee',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      category: course.category,
      description: course.description,
      duration_hours: course.duration_hours,
      instructor: course.instructor || '',
      objectives: course.objectives || '',
      prerequisites: course.prerequisites || '',
    });

    // Load course competencies
    try {
      const { data: courseComps, error } = await supabase
        .from('course_competencies' as any)
        .select('competency_id, proficiency_level_id')
        .eq('course_id', course.id);

      if (!error && courseComps) {
        const selected = courseComps as unknown as { competency_id: string; proficiency_level_id: string }[];
        setSelectedCompetencies(selected);
      } else {
        setSelectedCompetencies([]);
      }
    } catch (error) {
      console.error('Error loading course competencies:', error);
      setSelectedCompetencies([]);
    }

    setDialogOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also remove all enrollments.')) return;

    try {
      const { error } = await supabase
        .from('courses' as any)
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      duration_hours: 1,
      instructor: '',
      objectives: '',
      prerequisites: '',
    });
    setSelectedCompetencies([]);
    setDialogOpen(true);
  };

  const openEnrollDialog = (course: Course) => {
    setSelectedCourseForEnrollment(course);
    setEnrollmentFormData({ employee_id: '', due_date: '' });
    setEnrollDialogOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medical': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'soft skills': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Management</h1>
          <p className="text-muted-foreground">Create and manage training courses for employee development</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Update the course details below.' : 'Add a new training course to the system.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Advanced Patient Care"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration (hours)</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Instructor</label>
                  <Input
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Learning Objectives</label>
                <Textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  placeholder="What will participants learn..."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prerequisites</label>
                <Textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="Required knowledge or experience..."
                  rows={2}
                />
              </div>

              {/* Competency Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Competencies Developed</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select the competencies that this course will help develop, along with the target proficiency level.
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {competencies.map((competency) => {
                    const selected = selectedCompetencies.find(sc => sc.competency_id === competency.id);
                    return (
                      <div key={competency.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`comp-${competency.id}`}
                          checked={!!selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCompetencies([...selectedCompetencies, {
                                competency_id: competency.id,
                                proficiency_level_id: 'intermediate' // default
                              }]);
                            } else {
                              setSelectedCompetencies(selectedCompetencies.filter(sc => sc.competency_id !== competency.id));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`comp-${competency.id}`} className="text-sm flex-1">
                          {competency.name} <span className="text-muted-foreground">({competency.category})</span>
                        </label>
                        {selected && (
                          <Select
                            value={selected.proficiency_level_id}
                            onValueChange={(value) => {
                              setSelectedCompetencies(selectedCompetencies.map(sc =>
                                sc.competency_id === competency.id
                                  ? { ...sc, proficiency_level_id: value }
                                  : sc
                              ));
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {proficiencyLevels.map((level) => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <Progress value={stats.avgProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <Badge className={getCategoryColor(course.category)}>
                    {course.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{course.duration_hours} hours</span>
                {course.instructor && (
                  <>
                    <span>•</span>
                    <span>{course.instructor}</span>
                  </>
                )}
              </div>

              {course.objectives && (
                <div className="text-sm">
                  <strong>Objectives:</strong> {course.objectives}
                </div>
              )}

              {course.prerequisites && (
                <div className="text-sm">
                  <strong>Prerequisites:</strong> {course.prerequisites}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEnrollDialog(course)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Enroll
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first training course.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Course
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enrolled Employees Section */}
      {employeeCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Enrolled Employees ({employeeCourses.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeeCourses.map((empCourse) => (
              <Card key={empCourse.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{empCourse.employees.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {empCourse.employees.position} • {empCourse.employees.department}
                      </p>
                    </div>
                    <Badge className={getStatusColor(empCourse.status)}>
                      {empCourse.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Course:</strong> {empCourse.courses.name}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className={getCategoryColor(empCourse.courses.category)}>
                      {empCourse.courses.category}
                    </Badge>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{empCourse.courses.duration_hours} hours</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{empCourse.progress_percentage}%</span>
                    </div>
                    <Progress value={empCourse.progress_percentage} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Enrolled: {new Date(empCourse.enrolled_at).toLocaleDateString()}</span>
                  </div>

                  {empCourse.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Due: {new Date(empCourse.due_date).toLocaleDateString()}</span>
                      {new Date(empCourse.due_date) < new Date() && empCourse.status !== 'Completed' && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  )}

                  <Link to={`/hr2/learning/${empCourse.employee_id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="w-4 h-4 mr-1" />
                      View Learning Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Employee in Course</DialogTitle>
            <DialogDescription>
              Select an employee to enroll in "{selectedCourseForEnrollment?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrollEmployee} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Employee</label>
              <Select value={enrollmentFormData.employee_id} onValueChange={(value) => setEnrollmentFormData({ ...enrollmentFormData, employee_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date (Optional)</label>
              <Input
                type="date"
                value={enrollmentFormData.due_date}
                onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, due_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEnrollDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!enrollmentFormData.employee_id}>
                Enroll Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}