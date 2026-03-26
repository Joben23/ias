import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { HRModuleProvider } from "@/contexts/HRModuleContext";
import { ProtectedRoute } from "@/components/hr/ProtectedRoute";
import { EmployeeProtectedRoute } from "@/components/hr/EmployeeProtectedRoute";
import { AppLayout } from "@/components/hr/AppLayout";
import EmployeePortalPage from "./pages/EmployeePortalPage";
import ForceChangePasswordPage from "./pages/ForceChangePasswordPage";
import Index from "./pages/Index";
import ApplicantsPage from "./pages/ApplicantsPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import OnboardingPage from "./pages/OnboardingPage";
import EmployeeDirectoryPage from "./pages/EmployeeDirectoryPage";
import PerformancePage from "./pages/PerformancePage";
import RecognitionPage from "./pages/RecognitionPage";
import InterviewsPage from "./pages/InterviewsPage";
import CandidateRankingPage from "./pages/CandidateRankingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LandingPage from "./pages/LandingPage";
import JobApplicationPage from "./pages/JobApplicationPage";
import NotFound from "./pages/NotFound";
import ComingSoonPage from "./pages/ComingSoonPage";
import CompetencyManagementPage from "./pages/CompetencyManagementPage";
import EmployeeCompetencyPage from "./pages/EmployeeCompetencyPage";
import LearningManagementPage from "./pages/LearningManagementPage";
import EmployeeLearningPage from "./pages/EmployeeLearningPage";
import TrainingManagementPage from "./pages/TrainingManagementPage";
import TrainingDashboardPage from "./pages/TrainingDashboardPage";
import TrainingAssignmentPage from "./pages/TrainingAssignmentPage";
import TrainingEvaluationPage from "./pages/TrainingEvaluationPage";
import SuccessionPlanningDashboard from "./pages/SuccessionPlanningDashboard";
import KeyPositionsPage from "./pages/KeyPositionsPage";
import SuccessionCandidatesPage from "./pages/SuccessionCandidatesPage";
import DevelopmentPlansPage from "./pages/DevelopmentPlansPage";
import EmployeeSuccessionPage from "./pages/EmployeeSuccessionPage";
import EssDashboardPage from "./pages/EssDashboardPage";
import EssProfilePage from "./pages/EssProfilePage";
import EssLearningPage from "./pages/EssLearningPage";
import EssCompetenciesPage from "./pages/EssCompetenciesPage";
import EssCareerPathPage from "./pages/EssCareerPathPage";
import Hr2DashboardPage from "./pages/Hr2DashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <HRModuleProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/careers/apply/:jobId" element={<JobApplicationPage />} />

                {/* Force change password route */}
                <Route path="/auth/change-password" element={<ForceChangePasswordPage />} />

                {/* Employee Portal */}
                <Route
                  path="/employee-portal"
                  element={
                    <EmployeeProtectedRoute>
                      <EmployeePortalPage />
                    </EmployeeProtectedRoute>
                  }
                />

                {/* HR Module Routes */}
                <Route
                  path="/hr1/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="dashboard" element={<Index />} />
                          <Route path="applicants" element={<ApplicantsPage />} />
                          <Route path="recruitment" element={<RecruitmentPage />} />
                          <Route path="interviews" element={<InterviewsPage />} />
                          <Route path="rankings" element={<CandidateRankingPage />} />
                          <Route path="onboarding" element={<OnboardingPage />} />
                          <Route path="employees" element={<EmployeeDirectoryPage />} />
                          <Route path="performance" element={<PerformancePage />} />
                          <Route path="recognition" element={<RecognitionPage />} />
                          <Route path="analytics" element={<AnalyticsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* HR2 Routes - Coming Soon Pages */}
                <Route
                  path="/hr2/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="dashboard" element={<Hr2DashboardPage />} />
                          <Route path="learning" element={<LearningManagementPage />} />
                          <Route path="learning/:employeeId" element={<EmployeeLearningPage />} />
                          <Route path="training" element={<TrainingDashboardPage />} />
                          <Route path="training/programs" element={<TrainingManagementPage />} />
                          <Route path="training/assign" element={<TrainingAssignmentPage />} />
                          <Route path="training/evaluate" element={<TrainingEvaluationPage />} />
                          <Route path="succession" element={<SuccessionPlanningDashboard />} />
                          <Route path="succession/positions" element={<KeyPositionsPage />} />
                          <Route path="succession/candidates" element={<SuccessionCandidatesPage />} />
                          <Route path="succession/development" element={<DevelopmentPlansPage />} />
                          <Route path="succession/:employeeId" element={<EmployeeSuccessionPage />} />
                          <Route path="ess" element={<EssDashboardPage />} />
                          <Route path="ess/profile" element={<EssProfilePage />} />
                          <Route path="ess/learning" element={<EssLearningPage />} />
                          <Route path="ess/competencies" element={<EssCompetenciesPage />} />
                          <Route path="ess/career" element={<EssCareerPathPage />} />
                          <Route path="competency" element={<CompetencyManagementPage />} />
                          <Route path="competency/:employeeId" element={<EmployeeCompetencyPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Legacy dashboard route - redirect to hr1 */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/applicants" element={<ApplicantsPage />} />
                          <Route path="/recruitment" element={<RecruitmentPage />} />
                          <Route path="/onboarding" element={<OnboardingPage />} />
                          <Route path="/employees" element={<EmployeeDirectoryPage />} />
                          <Route path="/performance" element={<PerformancePage />} />
                          <Route path="/recognition" element={<RecognitionPage />} />
                          <Route path="/interviews" element={<InterviewsPage />} />
                          <Route path="/rankings" element={<CandidateRankingPage />} />
                          <Route path="/analytics" element={<AnalyticsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </HRModuleProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
