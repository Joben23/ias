import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HR1 – Talent Acquisition
 * Accessible to: Recruiters, HR Admin, Admin
 * Purpose: Manage applicants, job postings, hiring
 */
export function HR1ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Require authenticated user
  if (!authUser) {
    return <Navigate to="/" replace state={{ from: '/hr1' }} />;
  }

  // HR1: Recruiters / HR Admin - admin, hr, recruiter roles
  if (
    !['admin', 'hr', 'recruiter'].some(role => authUser.roles.includes(role))
  ) {
    // If employee, redirect to HR3 (Workforce Operations)
    if (authUser.roles.includes('employee')) {
      return <Navigate to="/hr3/dashboard" replace />;
    }
    // Otherwise redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
