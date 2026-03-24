import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
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
              
              {/* Protected admin/HR routes */}
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
