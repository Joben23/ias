import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, UserPlus, BarChart3, Award,
  HeartPulse, Search, ChevronRight, Moon, Sun, CalendarCheck, Trophy, PieChart,
  BookOpen, GraduationCap, Target, UserCheck, Clock,
  CheckCircle, Calendar, DollarSign, Zap, TrendingUp, Banknote, ClipboardCheck,
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
import { useHRModule, HR_MODULES, type HRModule } from '@/contexts/HRModuleContext';
import { useAuth } from '@/contexts/AuthContext';

// Navigation configurations for different HR modules
const getNavigationConfig = (hrModule: HRModule) => {
  const basePath = `/${hrModule}`;

  switch (hrModule) {
    case 'hr1':
      return {
        dashboard: { path: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        recruitment: [
          { path: `${basePath}/applicants`, label: 'Applicants', icon: Users },
          { path: `${basePath}/recruitment`, label: 'Recruitment', icon: Briefcase },
          { path: `${basePath}/interviews`, label: 'Interviews', icon: CalendarCheck },
          { path: `${basePath}/rankings`, label: 'Rankings', icon: Trophy },
        ],
        employee: [
          { path: `${basePath}/onboarding`, label: 'Onboarding', icon: UserPlus },
          { path: `${basePath}/employees`, label: 'Employee Directory', icon: Users },
          { path: `${basePath}/performance`, label: 'Performance', icon: BarChart3 },
          { path: `${basePath}/recognition`, label: 'Recognition', icon: Award },
        ],
        insights: [
          { path: `${basePath}/analytics`, label: 'Analytics', icon: PieChart },
        ],
      };

    case 'hr2':
      return {
        dashboard: { path: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        learning: [
          { path: `${basePath}/learning`, label: 'Learning Management', icon: BookOpen },
          { path: `${basePath}/training`, label: 'Training Management', icon: GraduationCap },
          { path: `${basePath}/succession`, label: 'Succession Planning', icon: Target },
          { path: `${basePath}/ess`, label: 'Employee Self-Service', icon: UserCheck },
          { path: `${basePath}/competency`, label: 'Competency Management', icon: Award },
        ],
      };

    case 'hr3':
      return {
        dashboard: { path: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        operations: [
          { path: `${basePath}/shifts`, label: 'Shift Management', icon: Clock },
          { path: `${basePath}/schedules`, label: 'Schedule Management', icon: CalendarCheck },
          { path: `${basePath}/attendance`, label: 'Attendance', icon: Clock },
          { path: `${basePath}/timesheets`, label: 'Timesheets', icon: CheckCircle },
          { path: `${basePath}/leaves`, label: 'Leave Management', icon: Calendar },
          { path: `${basePath}/claims`, label: 'Claims & Reimbursements', icon: DollarSign },
        ],
      };

    case 'hr4':
      return {
        dashboard: { path: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        hcm: [
          { path: `${basePath}/hcm`, label: 'Human Capital Management', icon: Users },
          { path: `${basePath}/payroll`, label: 'Payroll Management', icon: DollarSign },
          { path: `${basePath}/compensation`, label: 'Compensation Planning', icon: Award },
        ],
      };

    default:
      return {
        dashboard: { path: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      };
  }
};

const externalLinks = [
  { path: '/', label: 'Landing Page', icon: HeartPulse },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { selectedModule, setSelectedModule } = useHRModule();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const navConfig = getNavigationConfig(selectedModule);

  // Get modules accessible to the user based on their roles
  const getAccessibleModules = () => {
    if (!authUser) return [];
    
    const modules: HRModule[] = [];
    
    // HR1: Recruiters / HR Admin - admin, hr, recruiter roles
    if (['admin', 'hr', 'recruiter'].some(role => authUser.roles.includes(role))) {
      modules.push('hr1');
    }
    
    // HR2: Employees, HR staff - employee, hr, admin roles
    if (['employee', 'hr', 'admin'].some(role => authUser.roles.includes(role))) {
      modules.push('hr2');
    }
    
    // HR3: All employees - employee, hr, admin roles
    if (['employee', 'hr', 'admin'].some(role => authUser.roles.includes(role))) {
      modules.push('hr3');
    }
    
    // HR4: Admin / HR Manager only - admin, hr_manager roles
    if (['admin', 'hr_manager', 'hr'].some(role => authUser.roles.includes(role))) {
      modules.push('hr4');
    }
    
    return modules;
  };

  const accessibleModules = getAccessibleModules();

  const handleModuleSwitch = (moduleId: HRModule) => {
    setSelectedModule(moduleId);
    navigate(`/${moduleId}/dashboard`);
  };

  // Module icons for quick identification
  const moduleIcons: Record<HRModule, React.ReactNode> = {
    hr1: <Zap className="w-4 h-4" />,
    hr2: <TrendingUp className="w-4 h-4" />,
    hr3: <ClipboardCheck className="w-4 h-4" />,
    hr4: <Banknote className="w-4 h-4" />,
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Logo & System Name */}
      <div className={`p-4 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="gradient-primary p-2 rounded-xl shrink-0">
          <HeartPulse className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sidebar-foreground text-sm">
              HR System
            </div>
            <p className="text-[11px] text-sidebar-foreground/50">HRMS Platform</p>
          </div>
        )}
      </div>

      <SidebarContent>
        {/* HR Modules - Direct Navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
              Available Modules
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {accessibleModules.map((moduleId) => {
                const module = HR_MODULES[moduleId];
                const isActive = selectedModule === moduleId;
                const modulePath = `/${moduleId}/dashboard`;
                
                return (
                  <SidebarMenuItem key={moduleId}>
                    <SidebarMenuButton
                      asChild
                      tooltip={collapsed ? module.name : undefined}
                      className={isActive ? 'bg-sidebar-primary/20' : ''}
                    >
                      <button
                        onClick={() => handleModuleSwitch(moduleId)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        {moduleIcons[moduleId]}
                        {!collapsed && (
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium text-sm">{module.name.split('–')[0].trim()}</div>
                            <div className="text-xs text-sidebar-foreground/50">{module.subtitle}</div>
                          </div>
                        )}
                        {isActive && !collapsed && (
                          <div className="w-2 h-2 rounded-full bg-sidebar-primary shrink-0 ml-2" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key={navConfig.dashboard.path}>
                <SidebarMenuButton asChild tooltip={navConfig.dashboard.label}>
                  <NavLink
                    to={navConfig.dashboard.path}
                    end={true}
                    className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-primary/15 text-sidebar-primary font-medium"
                  >
                    <navConfig.dashboard.icon className="w-5 h-5" />
                    <span>{navConfig.dashboard.label}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Navigation Groups */}
        {selectedModule === 'hr1' && (
          <>
            {/* Recruitment Flow */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                {!collapsed ? 'Recruitment Flow' : ''}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navConfig.recruitment?.map(item => (
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
                  {navConfig.employee?.map(item => (
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
                  {navConfig.insights?.map(item => (
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
          </>
        )}

        {selectedModule === 'hr2' && (
          <>
            {/* Learning & Development */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                {!collapsed ? 'Learning & Development' : ''}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navConfig.learning?.map(item => (
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
          </>
        )}

        {selectedModule === 'hr3' && (
          <>
            {/* Workforce Operations */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                {!collapsed ? 'Operations' : ''}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navConfig.operations?.map(item => (
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
          </>
        )}

        {selectedModule === 'hr4' && (
          <>
            {/* Human Capital Management */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">
                {!collapsed ? 'Human Capital Management' : ''}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navConfig.hcm?.map(item => (
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
          </>
        )}

        {/* Public Pages */}
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
  const { selectedModule } = useHRModule();
  const navConfig = getNavigationConfig(selectedModule);

  // Get all navigation items for the current module
  const allNavItems = [
    navConfig.dashboard,
    ...(navConfig.recruitment || []),
    ...(navConfig.employee || []),
    ...(navConfig.insights || []),
    ...(navConfig.learning || []),
  ];

  const currentPage = allNavItems.find(n => n.path === location.pathname)?.label ||
                     allNavItems.find(n => location.pathname.startsWith(n.path) && n.path !== `/${selectedModule}/dashboard`)?.label ||
                     'Dashboard';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 h-16 flex items-center gap-4">
            <SidebarTrigger className="text-foreground" aria-label="Toggle sidebar" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{HR_MODULES[selectedModule].name}</span>
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
