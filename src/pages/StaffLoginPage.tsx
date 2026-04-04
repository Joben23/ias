import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StaffLoginModal } from '@/components/StaffLoginModal';
import { Moon, Sun } from 'lucide-react';

export default function StaffLoginPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('staff-theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();

  // Redirect if user already authenticated
  useEffect(() => {
    if (authUser && !loading) {
      console.log('[STAFFLOGIN] User already authenticated, redirecting...');
      const redirectUrl = authUser.roles.includes('admin') || authUser.roles.includes('hr')
        ? '/hr1/dashboard'
        : '/employee-portal';
      navigate(redirectUrl, { replace: true });
    }
  }, [authUser, loading, navigate]);

  // Apply theme to document
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('staff-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>

      {/* Login Modal */}
      <StaffLoginModal open={true} onOpenChange={() => {}} theme={theme} />
    </div>
  );
}
