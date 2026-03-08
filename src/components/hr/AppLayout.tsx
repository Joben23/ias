import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, UserPlus, BarChart3, Award,
  Menu, X, HeartPulse, Bell, Search, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/applicants', label: 'Applicants', icon: Users },
  { path: '/recruitment', label: 'Recruitment', icon: Briefcase },
  { path: '/onboarding', label: 'Onboarding', icon: UserPlus },
  { path: '/performance', label: 'Performance', icon: BarChart3 },
  { path: '/recognition', label: 'Recognition', icon: Award },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-sidebar border-r border-sidebar-border shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="gradient-primary p-2 rounded-xl">
            <HeartPulse className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground text-lg leading-tight">MedHire</h1>
            <p className="text-[11px] text-sidebar-foreground/50">Hospital HR System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-2 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive
                  ? 'bg-sidebar-primary/15 text-sidebar-primary'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-sidebar-accent border border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 mb-1">Talent Acquisition</p>
          <p className="text-sm font-semibold text-sidebar-foreground">Workforce Entry</p>
          <p className="text-[11px] text-sidebar-foreground/40 mt-1">HR Subsystem v1.0</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="gradient-primary p-2 rounded-xl">
                    <HeartPulse className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="font-display font-bold text-sidebar-foreground">MedHire</h1>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/60">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="px-3 space-y-1">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-item ${isActive
                        ? 'bg-sidebar-primary/15 text-sidebar-primary'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 h-16 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>HR</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{currentPage}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
            </button>
            <div className="gradient-primary w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground font-display font-bold text-xs">
              HR
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
