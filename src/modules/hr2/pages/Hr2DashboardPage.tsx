import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Plus,
  GraduationCap,
  User,
  Zap,
  CheckCircle,
  Clock,
  Settings,
  ArrowRight,
} from 'lucide-react';

interface EmployeeProfile {
  id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
}

interface MyCourse {
  id: string;
  name: string;
  category: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  instructor?: string;
}

interface MyTraining {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

interface MyCompetency {
  id: string;
  name: string;
  current_level: number;
  target_level: number;
  category: string;
}

interface RecommendedCourse {
  id: string;
  name: string;
  category: string;
  reason: string;
  duration: string;
}

export default function Hr2DashboardPage() {
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null);
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [myTrainings, setMyTrainings] = useState<MyTraining[]>([]);
  const [myCompetencies, setMyCompetencies] = useState<MyCompetency[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [achievements, setAchievements] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      // Sample employee profile (in real app, would come from auth context)
      const sampleProfile: EmployeeProfile = {
        id: 'HOS-ENG-001',
        full_name: 'Benjo Sion',
        email: 'benjo.sion@hospital.com',
        position: 'Senior Clinical Systems Engineer',
        department: 'Clinical Information Technology',
      };
      setEmployeeProfile(sampleProfile);

      // Sample personal learning data
      const sampleCourses: MyCourse[] = [
        {
          id: 'C1',
          name: 'Epic EHR Systems Administration',
          category: 'Technical',
          progress: 65,
          status: 'In Progress',
          instructor: 'Dr. Emily Walsh',
        },
        {
          id: 'C2',
          name: 'HIPAA Compliance & Patient Privacy',
          category: 'Compliance',
          progress: 100,
          status: 'Completed',
        },
      ];
      setMyCourses(sampleCourses);

      // Sample trainings
      const sampleTrainings: MyTraining[] = [
        {
          id: 'T1',
          name: 'Clinical Leadership & Team Management',
          start_date: '2026-05-15',
          end_date: '2026-06-15',
          status: 'Upcoming',
        },
        {
          id: 'T2',
          name: 'Healthcare Cybersecurity Essentials',
          start_date: '2026-04-01',
          end_date: '2026-04-30',
          status: 'In Progress',
        },
      ];
      setMyTrainings(sampleTrainings);

      // Sample competencies
      const sampleCompetencies: MyCompetency[] = [
        {
          id: 'SK1',
          name: 'Healthcare IT Systems',
          current_level: 4,
          target_level: 5,
          category: 'Technical',
        },
        {
          id: 'SK2',
          name: 'Patient Safety & Quality',
          current_level: 5,
          target_level: 5,
          category: 'Clinical',
        },
        {
          id: 'SK3',
          name: 'Clinical Leadership',
          current_level: 3,
          target_level: 4,
          category: 'Leadership',
        },
      ];
      setMyCompetencies(sampleCompetencies);

      // Sample recommended courses
      const sampleRecommendations: RecommendedCourse[] = [
        {
          id: 'R1',
          name: 'Advanced Clinical Systems Architecture',
          category: 'Technical',
          reason: 'Recommended based on your IT expertise',
          duration: '24 hours',
        },
        {
          id: 'R2',
          name: 'Healthcare IT Leadership Track',
          category: 'Leadership',
          reason: 'Align with your career advancement goals',
          duration: '32 hours',
        },
      ];
      setRecommendedCourses(sampleRecommendations);

      // Sample achievements (completed courses)
      const sampleAchievements: MyCourse[] = [
        {
          id: 'A1',
          name: 'HIPAA Compliance & Data Privacy',
          category: 'Compliance',
          progress: 100,
          status: 'Completed',
        },
        {
          id: 'A2',
          name: 'Healthcare IT Fundamentals',
          category: 'Technical',
          progress: 100,
          status: 'Completed',
        },
      ];
      setAchievements(sampleAchievements);

    } catch (error) {
      console.error('Dashboard fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // Calculate stats
  const completedCount = myCourses.filter(c => c.status === 'Completed').length;
  const inProgressCount = myCourses.filter(c => c.status === 'In Progress').length;
  const avgSkillLevel = myCompetencies.length > 0
    ? Math.round(myCompetencies.reduce((sum, s) => sum + s.current_level, 0) / myCompetencies.length)
    : 0;
  const skillLevelLabel = avgSkillLevel <= 2 ? 'Beginner' : avgSkillLevel <= 3 ? 'Intermediate' : 'Advanced';
  const overallProgress = myCourses.length > 0
    ? Math.round(myCourses.reduce((sum, c) => sum + c.progress, 0) / myCourses.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          My Development Dashboard 🚀
        </h1>
        <p className="text-muted-foreground mt-1">Track your learning, skills, and training progress</p>
      </div>

      {/* Employee Profile Card */}
      {employeeProfile && (
        <Card className="border-blue-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground dark:text-white">{employeeProfile.full_name}</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">{employeeProfile.position} • {employeeProfile.department}</p>
                </div>
              </div>
              <Link to="/hr2/ess">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myCourses.length}</div>
            <p className="text-xs text-muted-foreground">courses assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Trainings</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTrainings.length}</div>
            <p className="text-xs text-muted-foreground">assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Level</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{skillLevelLabel}</div>
            <p className="text-xs text-muted-foreground">avg: {avgSkillLevel}/5</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - My Learning & Trainings */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                My Learning Progress
              </CardTitle>
              <CardDescription>Courses you're currently taking or have completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {myCourses.length > 0 ? (
                <>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-semibold">Overall Progress</span>
                    <span className="text-muted-foreground">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2 mb-6" />

                  <div className="space-y-3">
                    {myCourses.map(course => (
                      <div key={course.id} className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground dark:text-white">{course.name}</p>
                            <p className="text-xs text-muted-foreground dark:text-slate-400">
                              {course.category} {course.instructor ? `• Instructor: ${course.instructor}` : ''}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              course.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }
                          >
                            {course.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex-1">
                            <Progress value={course.progress} className="h-1.5" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                            {course.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to="/hr2/learning" className="w-full">
                    <Button variant="outline" className="w-full mt-3">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View All Courses
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No courses assigned yet</p>
                  <p className="text-sm">Start learning to build your skills</p>
                  <Link to="/hr2/learning" className="mt-3">
                    <Button size="sm">Find Courses</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Trainings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                My Trainings
              </CardTitle>
              <CardDescription>Upcoming and ongoing training programs assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {myTrainings.length > 0 ? (
                <div className="space-y-3">
                  {myTrainings.map(training => (
                    <div
                      key={training.id}
                      className="p-3 border border-gray-200 rounded-lg flex items-start justify-between"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{training.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(training.start_date).toLocaleDateString()} - {new Date(training.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          training.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : training.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {training.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No trainings scheduled yet</p>
                  <p className="text-sm">Check back soon for new training assignments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Skills & Achievements */}
        <div className="space-y-6">
          {/* My Competencies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                My Competencies
              </CardTitle>
              <CardDescription>Your skill levels and goals</CardDescription>
            </CardHeader>
            <CardContent>
              {myCompetencies.length > 0 ? (
                <div className="space-y-4">
                  {myCompetencies.map(skill => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{skill.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {skill.current_level}/{skill.target_level}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${
                              i < skill.current_level ? 'bg-yellow-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{skill.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No competencies assessed yet</p>
                </div>
              )}

              <Link to="/hr2/competency" className="w-full">
                <Button variant="outline" className="w-full mt-4">
                  Take Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* My Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                My Achievements
              </CardTitle>
              <CardDescription>Certificates and completed courses</CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-2">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground dark:text-white truncate">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">{achievement.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No achievements yet</p>
                  <p className="text-xs">Complete courses to earn badges</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Recommended Courses
            </CardTitle>
            <CardDescription>Courses based on your skill gaps and career goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCourses.map(course => (
                <div
                  key={course.id}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-primary transition-colors dark:hover:border-blue-500"
                >
                  <h4 className="font-semibold text-foreground dark:text-white mb-1">{course.name}</h4>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2">{course.reason}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.category}</Badge>
                    <span className="text-xs text-muted-foreground dark:text-slate-400">{course.duration}</span>
                  </div>
                  <Link to="/hr2/learning" className="w-full">
                    <Button size="sm" className="w-full mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to support your development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link to="/hr2/learning">
              <Button variant="outline" className="w-full" size="sm">
                <BookOpen className="w-4 h-4 mr-1" />
                Continue Learning
              </Button>
            </Link>
            <Link to="/hr2/learning">
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Browse Courses
              </Button>
            </Link>
            <Link to="/hr2/competency">
              <Button variant="outline" className="w-full" size="sm">
                <Target className="w-4 h-4 mr-1" />
                Take Quiz
              </Button>
            </Link>
            <Link to="/hr2/training">
              <Button variant="outline" className="w-full" size="sm">
                <GraduationCap className="w-4 h-4 mr-1" />
                View Trainings
              </Button>
            </Link>
            <Link to="/hr2/ess">
              <Button variant="outline" className="w-full" size="sm">
                <User className="w-4 h-4 mr-1" />
                My Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Section */}
      {overallProgress >= 80 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 You're doing great! Keep up the excellent progress on your learning journey!
          </AlertDescription>
        </Alert>
      )}

      {overallProgress < 30 && myCourses.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <GraduationCap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            💡 Tip: Spend 30 minutes daily on your courses to accelerate your development!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}