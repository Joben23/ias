import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { HRModuleProvider } from "@/contexts/HRModuleContext";
import { ProtectedRoute } from "@/components/hr/ProtectedRoute";
import { EmployeeProtectedRoute } from "@/components/hr/EmployeeProtectedRoute";
import { HR1ProtectedRoute } from "@/components/hr/HR1ProtectedRoute";
import { HR2ProtectedRoute } from "@/components/hr/HR2ProtectedRoute";
import { HR3ProtectedRoute } from "@/components/hr/HR3ProtectedRoute";
import { HR4ProtectedRoute } from "@/components/hr/HR4ProtectedRoute";
import { AppLayout } from "@/components/hr/AppLayout";
import EmployeePortalPage from "./pages/EmployeePortalPage";
import ForceChangePasswordPage from "./pages/ForceChangePasswordPage";
import LandingPage from "./pages/LandingPage";
import JobApplicationPage from "./pages/JobApplicationPage";
import NotFound from "./pages/NotFound";
import ComingSoonPage from "./pages/ComingSoonPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import { AuthCallback } from "./pages/AuthCallback";

// HR1 - Recruitment, Onboarding, Interviews
import Index from "@/modules/hr1/pages/Index";
import ApplicantsPage from "@/modules/hr1/pages/ApplicantsPage";
import RecruitmentPage from "@/modules/hr1/pages/RecruitmentPage";
import InterviewsPage from "@/modules/hr1/pages/InterviewsPage";
import OnboardingPage from "@/modules/hr1/pages/OnboardingPage";
import EmployeeDirectoryPage from "@/modules/hr1/pages/EmployeeDirectoryPage";
import CandidateRankingPage from "@/modules/hr1/pages/CandidateRankingPage";

// HR2 - Learning, Training, Performance, Competency, Succession, ESS
import Hr2DashboardPage from "@/modules/hr2/pages/Hr2DashboardPage";
import PerformancePage from "@/modules/hr2/pages/PerformancePage";
import RecognitionPage from "@/modules/hr2/pages/RecognitionPage";
import CompetencyManagementPage from "@/modules/hr2/pages/CompetencyManagementPage";
import EmployeeCompetencyPage from "@/modules/hr2/pages/EmployeeCompetencyPage";
import LearningManagementPage from "@/modules/hr2/pages/LearningManagementPage";
import EmployeeLearningPage from "@/modules/hr2/pages/EmployeeLearningPage";
import TrainingManagementPage from "@/modules/hr2/pages/TrainingManagementPage";
import TrainingDashboardPage from "@/modules/hr2/pages/TrainingDashboardPage";
import TrainingAssignmentPage from "@/modules/hr2/pages/TrainingAssignmentPage";
import TrainingEvaluationPage from "@/modules/hr2/pages/TrainingEvaluationPage";
import SuccessionPlanningDashboard from "@/modules/hr2/pages/SuccessionPlanningDashboard";
import KeyPositionsPage from "@/modules/hr2/pages/KeyPositionsPage";
import SuccessionCandidatesPage from "@/modules/hr2/pages/SuccessionCandidatesPage";
import DevelopmentPlansPage from "@/modules/hr2/pages/DevelopmentPlansPage";
import EmployeeSuccessionPage from "@/modules/hr2/pages/EmployeeSuccessionPage";
import EmployeeSelfServicePage from "@/modules/hr2/pages/EmployeeSelfServicePage";

// HR3 - Attendance, Shifts, Schedules, Timesheets, Leaves, Claims
import Hr3DashboardPage from "@/modules/hr3/pages/Hr3DashboardPage";
import Hr3AttendancePage from "@/modules/hr3/pages/Hr3AttendancePage";
import ShiftAndScheduleManagementPage from "@/modules/hr3/pages/ShiftAndScheduleManagementPage";
import Hr3TimesheetsPage from "@/modules/hr3/pages/Hr3TimesheetsPage";
import Hr3LeavesPage from "@/modules/hr3/pages/Hr3LeavesPage";
import Hr3ClaimsPage from "@/modules/hr3/pages/Hr3ClaimsPage";

// HR4 - HCM, Payroll, Compensation, Benefits, Analytics
import Hr4DashboardPage from "@/modules/hr4/pages/Hr4DashboardPage";
import Hr4HcmPage from "@/modules/hr4/pages/Hr4HcmPage";
import Hr4PayrollPage from "@/modules/hr4/pages/Hr4PayrollPage";
import Hr4CompensationPage from "@/modules/hr4/pages/Hr4CompensationPage";
import Hr4BenefitsPage from "@/modules/hr4/pages/Hr4BenefitsPage";
import Hr4EmployeeCompensationPage from "@/modules/hr4/pages/Hr4EmployeeCompensationPage";
import Hr4EmployeeBenefitsPage from "@/modules/hr4/pages/Hr4EmployeeBenefitsPage";
import AnalyticsPage from "@/modules/hr4/pages/AnalyticsPage";

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
                <Route path="/stafflogin" element={<StaffLoginPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
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
                    <HR1ProtectedRoute>
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
                    </HR1ProtectedRoute>
                  }
                />

                {/* HR2 Routes - Talent Development */}
                <Route
                  path="/hr2/*"
                  element={
                    <HR2ProtectedRoute>
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
                          <Route path="ess" element={<EmployeeSelfServicePage />} />
                          <Route path="competency" element={<CompetencyManagementPage />} />
                          <Route path="competency/:employeeId" element={<EmployeeCompetencyPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </HR2ProtectedRoute>
                  }
                />

                {/* HR3 Routes - Workforce Operations */}
                <Route
                  path="/hr3/*"
                  element={
                    <HR3ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="dashboard" element={<Hr3DashboardPage />} />
                          <Route path="attendance" element={<Hr3AttendancePage />} />
                          <Route path="shifts" element={<ShiftAndScheduleManagementPage />} />
                          <Route path="schedules" element={<ShiftAndScheduleManagementPage />} />
                          <Route path="timesheets" element={<Hr3TimesheetsPage />} />
                          <Route path="leaves" element={<Hr3LeavesPage />} />
                          <Route path="claims" element={<Hr3ClaimsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </HR3ProtectedRoute>
                  }
                />

                {/* HR4 Routes - Compensation & HR Intelligence */}
                <Route
                  path="/hr4/*"
                  element={
                    <HR4ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/hr4/dashboard" replace />} />
                          <Route path="dashboard" element={<Hr4DashboardPage />} />
                          <Route path="hcm" element={<Hr4HcmPage />} />
                          <Route path="payroll" element={<Hr4PayrollPage />} />
                          <Route path="compensation" element={<Hr4CompensationPage />} />
                          <Route path="compensation/:employeeId" element={<Hr4EmployeeCompensationPage />} />
                          <Route path="benefits" element={<Hr4BenefitsPage />} />
                          <Route path="benefits/:employeeId" element={<Hr4EmployeeBenefitsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </HR4ProtectedRoute>
                  }
                />

                {/* Legacy dashboard route - redirect to hr1 */}
                <Route
                  path="/dashboard/*"
                  element={
                    <HR1ProtectedRoute>
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
                    </HR1ProtectedRoute>
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
