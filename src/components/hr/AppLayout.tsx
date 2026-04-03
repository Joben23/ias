import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, UserPlus, BarChart3, Award,
  HeartPulse, Search, ChevronRight, Moon, Sun, CalendarCheck, Trophy, PieChart,
  BookOpen, GraduationCap, Target, UserCheck, ChevronDown, Check, Clock,
  CheckCircle, Calendar, DollarSign,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useTheme } from '@/components/ThemeProvider';
import { useHRModule, HR_MODULES, type HRModule } from '@/contexts/HRModuleContext';

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
  const { selectedModule, setSelectedModule, currentModuleInfo } = useHRModule();
  const navigate = useNavigate();
  const navConfig = getNavigationConfig(selectedModule);

  const handleModuleSwitch = (moduleId: HRModule) => {
    setSelectedModule(moduleId);
    // Navigate to the appropriate default page for each module
    if (moduleId === 'hr1') {
      navigate('/hr1/dashboard');
    } else if (moduleId === 'hr2') {
      navigate('/hr2/dashboard');
    } else if (moduleId === 'hr3') {
      navigate('/hr3/dashboard');
    } else if (moduleId === 'hr4') {
      navigate('/hr4/dashboard'); // HR4 default page is Dashboard
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* HR Module Selector */}
      <div className={`p-4 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="gradient-primary p-2 rounded-xl shrink-0">
          <HeartPulse className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 justify-start p-0 h-auto font-display font-bold text-sidebar-foreground text-sm leading-tight hover:bg-transparent min-w-0"
              >
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{currentModuleInfo.name}</span>
                    <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                  </div>
                  <p className="text-[11px] text-sidebar-foreground/50 truncate">Hospital HR System</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {Object.values(HR_MODULES).filter(module => module.available).map((module) => (
                <DropdownMenuItem
                  key={module.id}
                  onClick={() => handleModuleSwitch(module.id)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-muted-foreground">{module.description}</div>
                  </div>
                  {selectedModule === module.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-5 h-5 bg-primary/20 rounded" />
        )}
      </div>

      <SidebarContent>
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
