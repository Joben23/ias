import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/hr/ProtectedRoute";
import { AppLayout } from "@/components/hr/AppLayout";
import Index from "./pages/Index";
import ApplicantsPage from "./pages/ApplicantsPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import OnboardingPage from "./pages/OnboardingPage";
import PerformancePage from "./pages/PerformancePage";
import RecognitionPage from "./pages/RecognitionPage";
import LoginPage from "./pages/LoginPage";
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
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/applicants" element={<ApplicantsPage />} />
                        <Route path="/recruitment" element={<RecruitmentPage />} />
                        <Route path="/onboarding" element={<OnboardingPage />} />
                        <Route path="/performance" element={<PerformancePage />} />
                        <Route path="/recognition" element={<RecognitionPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
