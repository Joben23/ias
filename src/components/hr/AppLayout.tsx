import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, UserPlus, BarChart3, Award,
  HeartPulse, Search, ChevronRight, Moon, Sun, CalendarCheck, Trophy, PieChart,
} from 'lucide-react';
import { ProfileDropdown } from '@/components/hr/ProfileDropdown';
import { NotificationBell } from '@/components/hr/NotificationBell';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { useTheme } from '@/components/ThemeProvider';

const dashboardItem = { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard };

const recruitmentItems = [
  { path: '/dashboard/applicants', label: 'Applicants', icon: Users },
  { path: '/dashboard/recruitment', label: 'Recruitment', icon: Briefcase },
  { path: '/dashboard/interviews', label: 'Interviews', icon: CalendarCheck },
  { path: '/dashboard/rankings', label: 'Rankings', icon: Trophy },
];

const employeeItems = [
  { path: '/dashboard/onboarding', label: 'Onboarding', icon: UserPlus },
  { path: '/dashboard/employees', label: 'Employee Directory', icon: Users },
  { path: '/dashboard/performance', label: 'Performance', icon: BarChart3 },
  { path: '/dashboard/recognition', label: 'Recognition', icon: Award },
];

const insightsItems = [
  { path: '/dashboard/analytics', label: 'Analytics', icon: PieChart },
];

const externalLinks = [
  { path: '/', label: 'Landing Page', icon: HeartPulse },
];

const allNavItems = [dashboardItem, ...recruitmentItems, ...employeeItems, ...insightsItems];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className={`p-4 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="gradient-primary p-2 rounded-xl shrink-0">
          <HeartPulse className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground text-lg leading-tight">Human Resources 1</h1>
            <p className="text-[11px] text-sidebar-foreground/50">Hospital HR System</p>
          </div>
        )}
      </div>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key={dashboardItem.path}>
                <SidebarMenuButton asChild tooltip={dashboardItem.label}>
                  <NavLink
                    to={dashboardItem.path}
                    end={true}
                    className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium"
                  >
                    <dashboardItem.icon className="w-5 h-5" />
                    <span>{dashboardItem.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recruitment Flow */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            {!collapsed ? 'Recruitment Flow' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recruitmentItems.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.path}
                      end={true}
                      className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Employee Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            {!collapsed ? 'Employee Management' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {employeeItems.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.path}
                      end={true}
                      className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Insights */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            {!collapsed ? 'Insights' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insightsItems.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.path}
                      end={true}
                      className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
            {!collapsed ? 'Public Pages' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {externalLinks.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link
                      to={item.path}
                      className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <div className="p-4 m-3 rounded-xl bg-sidebar-accent border border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 mb-1">Talent Acquisition</p>
          <p className="text-sm font-semibold text-sidebar-foreground">Workforce Entry</p>
          <p className="text-[11px] text-sidebar-foreground/40 mt-1">HR Subsystem v1.0</p>
        </div>
      )}
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-muted-foreground" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const currentPage = allNavItems.find(n => n.path === location.pathname)?.label || allNavItems.find(n => location.pathname.startsWith(n.path) && n.path !== '/dashboard')?.label || 'Dashboard';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 h-16 flex items-center gap-4">
            <SidebarTrigger className="text-foreground" aria-label="Toggle sidebar" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>HR</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{currentPage}</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
              <NotificationBell />
              <ProfileDropdown />
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
    </SidebarProvider>
  );
}
