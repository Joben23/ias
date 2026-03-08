import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/hr/AppLayout";
import Index from "./pages/Index";
import ApplicantsPage from "./pages/ApplicantsPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import OnboardingPage from "./pages/OnboardingPage";
import PerformancePage from "./pages/PerformancePage";
import RecognitionPage from "./pages/RecognitionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
