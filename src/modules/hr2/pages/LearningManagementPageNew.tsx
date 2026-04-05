import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Soft Skills' | 'Management' | 'Compliance';
  instructor: string;
  duration_hours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  image?: string;
}

interface Enrollment {
  course_id: string;
  course: Course;
  enrollment_date: string;
  completion_percentage: number;
  status: 'Active' | 'Completed' | 'Dropped';
  completion_date?: string;
}

export default function LearningManagementPage() {
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  // Sample data - In real app, fetch from database
  useEffect(() => {
    const sampleEnrollments: Enrollment[] = [
      {
        course_id: '1',
        course: {
          id: '1',
          title: 'React Advanced Patterns',
          description: 'Master advanced React patterns and best practices',
          category: 'Technical',
          instructor: 'John Smith',
          duration_hours: 24,
          level: 'Advanced',
        },
        enrollment_date: '2026-03-01',
        completion_percentage: 65,
        status: 'Active',
      },
      {
        course_id: '2',
        course: {
          id: '2',
          title: 'Communication Skills',
          description: 'Improve your professional communication',
          category: 'Soft Skills',
          instructor: 'Sarah Johnson',
          duration_hours: 8,
          level: 'Beginner',
        },
        enrollment_date: '2026-02-15',
        completion_percentage: 100,
        status: 'Completed',
        completion_date: '2026-03-20',
      },
    ];

    const sampleAvailable: Course[] = [
      {
        id: '3',
        title: 'Project Management Fundamentals',
        description: 'Learn the basics of project management',
        category: 'Management',
        instructor: 'Mike Davis',
        duration_hours: 16,
        level: 'Beginner',
      },
      {
        id: '4',
        title: 'Data Privacy Compliance',
        description: 'Understand GDPR and data privacy requirements',
        category: 'Compliance',
        instructor: 'Emma Wilson',
        duration_hours: 4,
        level: 'Beginner',
      },
    ];

    setEnrollments(sampleEnrollments);
    setAvailableCourses(sampleAvailable);
  }, []);

  const handleEnroll = (courseId: string) => {
    alert(`Enrolled in course ${courseId}`);
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!filterCategory || e.course.category === filterCategory)
  );

  const filteredAvailable = availableCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!filterCategory || c.category === filterCategory)
  );

  const completedCoursesCount = enrollments.filter(e => e.status === 'Completed').length;
  const activeCoursesCount = enrollments.filter(e => e.status === 'Active').length;
  const totalHoursCompleted = enrollments
    .filter(e => e.status === 'Completed')
    .reduce((sum, e) => sum + e.course.duration_hours, 0);

  const categoryColors: Record<string, string> = {
    Technical: 'bg-blue-100 text-blue-700',
    'Soft Skills': 'bg-purple-100 text-purple-700',
    'Management': 'bg-green-100 text-green-700',
    'Compliance': 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Learning Management 📚
        </h1>
        <p className="text-muted-foreground mt-1">Enroll in courses to develop your skills</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Courses</p>
                <p className="text-2xl font-bold text-foreground mt-1">{completedCoursesCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalHoursCompleted} hours</p>
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
                <p className="text-2xl font-bold text-foreground mt-1">{activeCoursesCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Active courses</p>
              </div>
              <PlayCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-foreground mt-1">{availableCourses.length}</p>
                <p className="text-xs text-muted-foreground mt-1">New courses</p>
              </div>
              <BookOpen className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4 flex-wrap items-center">
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(null)}
          >
            All
          </Button>
          {['Technical', 'Soft Skills', 'Management', 'Compliance'].map(cat => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat as any)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`pb-3 px-2 font-medium text-sm transition-colors ${
            activeTab === 'enrolled'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Enrolled Courses ({filteredEnrollments.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-2 font-medium text-sm transition-colors ${
            activeTab === 'available'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Available Courses ({filteredAvailable.length})
        </button>
      </div>

      {/* Enrolled Courses */}
      {activeTab === 'enrolled' && (
        <div className="grid gap-4">
          {filteredEnrollments.map(enrollment => (
            <Card key={enrollment.course_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{enrollment.course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{enrollment.course.description}</p>
                      </div>
                      <Badge className={categoryColors[enrollment.course.category]}>
                        {enrollment.course.category}
                      </Badge>
                    </div>

                    {/* Course Info */}
                    <div className="flex gap-4 text-sm text-muted-foreground mt-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {enrollment.course.duration_hours}h
                      </div>
                      <div>Instructor: {enrollment.course.instructor}</div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Level: {enrollment.course.level}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">{enrollment.completion_percentage}%</span>
                      </div>
                      <Progress value={enrollment.completion_percentage} className="h-2" />
                    </div>

                    {/* Enrolled Date */}
                    <div className="text-xs text-muted-foreground mt-3">
                      {enrollment.status === 'Completed' ? (
                        <span>Completed on {enrollment.completion_date}</span>
                      ) : (
                        <span>Enrolled on {enrollment.enrollment_date}</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex flex-col gap-2 justify-center">
                    <Button size="sm" variant="outline">
                      {enrollment.status === 'Completed' ? 'View' : 'Continue'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    {enrollment.status !== 'Completed' && (
                      <Button size="sm" variant="ghost" className="text-xs">
                        Drop Course
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Courses */}
      {activeTab === 'available' && (
        <div className="grid gap-4">
          {filteredAvailable.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                      </div>
                      <Badge className={categoryColors[course.category]}>
                        {course.category}
                      </Badge>
                    </div>

                    {/* Course Info */}
                    <div className="flex gap-4 text-sm text-muted-foreground mt-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration_hours}h
                      </div>
                      <div>Instructor: {course.instructor}</div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Level: {course.level}
                      </div>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <Button
                    onClick={() => handleEnroll(course.id)}
                    className="self-center"
                  >
                    Enroll
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeTab === 'enrolled' && filteredEnrollments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground">No enrolled courses</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Browse available courses and enroll to start learning
            </p>
            <Button
              className="mt-4"
              onClick={() => setActiveTab('available')}
            >
              View Available Courses
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
