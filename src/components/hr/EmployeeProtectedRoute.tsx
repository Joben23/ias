import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { hasRole } from '@/lib/utils';

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
}

export function EmployeeProtectedRoute({ children }: EmployeeProtectedRouteProps) {
  const { user, loading, profile } = useAuth();
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const checkEmployeeRole = async () => {
      if (!user) {
        setIsEmployee(false);
        return;
      }

      setCheckingRole(true);
      try {
        const employeeCheck = await hasRole(user.id, 'employee');
        setIsEmployee(employeeCheck);
      } catch (error) {
        console.error('Error checking employee role:', error);
        setIsEmployee(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!loading) {
      checkEmployeeRole();
    }
  }, [user, loading]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-primary w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: '/employee-portal' }} />;
  }

  // Check if user must change password
  if (profile?.must_change_password) {
    return <Navigate to="/auth/change-password" replace />;
  }

  if (isEmployee === false) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}