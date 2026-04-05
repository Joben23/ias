# HRMS Navigation Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx (Router)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Public Routes   │  │  Auth Routes    │  │ Module Routes   │  │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤  │
│  │ ./              │  │ /stafflogin     │  │ /hr1/*          │  │
│  │ /careers        │  │ /auth/callback  │  │ /hr2/*          │  │
│  │ /employee-portal│  │ /change-pwd     │  │ /hr3/*          │  │
│  └─────────────────┘  └─────────────────┘  │ /hr4/*          │  │
│                                             │ /dashboard      │  │
│                                             └─────────────────┘  │
│                                                    │              │
│                                                    ▼              │
│                                          ┌──────────────────┐    │
│                                          │ Protected Routes │    │
│                                          └──────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                         │
                                         │ Wraps Routes
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Protection Layer (Guards)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  HR1ProtectedRoute  │  HR2ProtectedRoute  │  HR3ProtectedRoute  │
│  ├─ admin           │  ├─ employee        │  ├─ employee        │
│  ├─ hr              │  ├─ hr              │  ├─ hr              │
│  └─ recruiter       │  └─ admin           │  └─ admin           │
│                                                                   │
│          HR4ProtectedRoute                                       │
│          ├─ admin                                                │
│          ├─ hr_manager                                           │
│          └─ hr                                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                         │
                                         │ If Access Allowed
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AppLayout Component                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           AppSidebar                                     │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Logo & Branding                                         │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ HR System | HRMS Platform                         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Available Modules (Role-Filtered)                      │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ 🔥 HR1 – Talent Acquisition   [Active Module]     │ │   │
│  │  │    Recruitment & Onboarding                       │ │   │
│  │  │ 📈 HR2 – Talent Development                      │ │   │
│  │  │    Learning & Development                        │ │   │
│  │  │ ⏱️  HR3 – Workforce Operations                   │ │   │
│  │  │    Daily Operations                              │ │   │
│ │  │ 💰 HR4 – Compensation                            │ │   │
│  │  │    Payroll & Benefits                            │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Current Module Dashboard                              │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ [Navigation items specific to active module]       │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  Public Pages                                            │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Landing Page                                       │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Header Bar (Top Navigation)                            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  [Sidebar Toggle] Module Name > Current Page            │   │
│  │                       [Search] [Theme] [Notifications]  │   │
│  │                                              [Profile]  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Main Content Area (with Animation)                     │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Module Pages                                            │   │
│  │  ├─ Dashboard Components                                │   │
│  │  ├─ Feature Pages                                       │   │
│  │  └─ Detail Views                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                         │
                                         │ Routes To
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Module Page Components                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  HR1 Pages          │  HR2 Pages         │  HR3 Pages           │
│  ├─ Index           │  ├─ Dashboard      │  ├─ Dashboard        │
│  ├─ Applicants      │  ├─ Learning       │  ├─ Attendance       │
│  ├─ Recruitment     │  ├─ Training       │  ├─ Shifts          │
│  ├─ Interviews      │  ├─ Succession     │  ├─ Schedules       │
│  ├─ Rankings        │  ├─ ESS            │  ├─ Timesheets      │
│  ├─ Onboarding      │  ├─ Competency     │  ├─ Leaves          │
│  ├─ Employees       │  └─ Performance    │  └─ Claims          │
│  ├─ Performance     │                     │                      │
│  ├─ Recognition     │  HR4 Pages         │                      │
│  └─ Analytics       │  ├─ Dashboard      │                      │
│                     │  ├─ HCM            │                      │
│                     │  ├─ Payroll        │                      │
│                     │  ├─ Compensation   │                      │
│                     │  └─ Benefits       │                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────┐
│  AuthContext        │
│  (User Info)        │
└──────────┬──────────┘
           │ Provides: authUser, roles
           │
           ▼
┌─────────────────────────────────────────────────────┐
│         HRModuleContext                             │
│         (Module State Management)                   │
├─────────────────────────────────────────────────────┤
│  ├─ selectedModule (current active module)          │
│  ├─ setSelectedModule (switch modules)              │
│  ├─ currentModuleInfo (module metadata)             │
│  └─ HR_MODULES (all module definitions)             │
└──────────┬──────────────────────────────────────────┘
           │ Consumed By: AppLayout, Pages
           │
           ▼
┌─────────────────────────────────────────────────────┐
│              AppLayout                              │
│              (Sidebar + Header + Main)              │
├─────────────────────────────────────────────────────┤
│  1. Get user roles from AuthContext                 │
│  2. Get active module from HRModuleContext          │
│  3. Filter accessible modules by user roles         │
│  4. Display sidebar with available modules          │
│  5. Render current module's navigation items        │
┌─────────────────────────────────────────────────────┐
│  getAccessibleModules() Logic:                      │
│  ├─ admin/hr/recruiter → HR1 accessible            │
│  ├─ employee/hr/admin → HR2 & HR3 accessible       │
│  ├─ admin/hr_manager/hr → HR4 accessible           │
│  └─ Returns Array<HRModule>                         │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│      HR*ProtectedRoute Components                   │
│      (Access Control Guards)                        │
├─────────────────────────────────────────────────────┤
│  1. Check if user is authenticated                  │
│  2. Verify user has required role(s)                │
│  3. If denied: redirect to appropriate module       │
│  4. If allowed: render wrapped component            │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│         Module Pages & Features                     │
│         (Dashboard, Features, Details)              │
└─────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control Flow

```
User Logs In
     │
     ├─ AuthContext stores: authUser + roles
     │
     ▼
Navigation to Module (e.g., /hr1/dashboard)
     │
     ├─ App.tsx router matches route
     │
     ├─ HR*ProtectedRoute checks:
     │     ├─ Is user authenticated?
     │     │  ├─ NO → Redirect to /
     │     │  └─ YES → Continue
     │     │
     │     └─ Does user have required role?
     │        ├─ NO → Redirect to accessible module
     │        │     (Employees → /hr3, Recruiters → /hr1, etc.)
     │        │
     │        └─ YES → Allow access to module
     │                  │
     │                  ▼
     │        AppLayout renders with sidebar
     │              │
     │              ├─ getAccessibleModules() filters by user roles
     │              │
     │              ├─ AppSidebar shows only accessible modules
     │              │
     │              └─ Module pages render with user content
     │
     ▼
User can:
  ✅ Access their assigned modules
  ✅ Switch between allowed modules
  ✅ View module-specific features
  ❌ Cannot access restricted modules
  ❌ Cannot manually navigate to denied paths
```

---

## Component Hierarchy

```
App (main)
  ├─ AuthProvider
  │   └─ AuthContext
  │       └─ authUser, roles, etc.
  │
  ├─ HRModuleProvider
  │   └─ HRModuleContext
  │       └─ selectedModule, currentModuleInfo
  │
  ├─ Routes (/hr1, /hr2, /hr3, /hr4)
  │   │
  │   ├─ HR1ProtectedRoute
  │   │   └─ AppLayout
  │   │       ├─ AppSidebar
  │   │       │   ├─ Logo
  │   │       │   ├─ Module List (Filtered)
  │   │       │   └─ Navigation Items
  │   │       │
  │   │       ├─ Header
  │   │       │   ├─ Breadcrumb
  │   │       │   └─ Controls
  │   │       │
  │   │       └─ Main Content
  │   │           └─ Module Pages (hr1/*)
  │   │
  │   ├─ HR2ProtectedRoute
  │   │   └─ AppLayout
  │   │       └─ Module Pages (hr2/*)
  │   │
  │   ├─ HR3ProtectedRoute
  │   │   └─ AppLayout
  │   │       └─ Module Pages (hr3/*)
  │   │
  │   └─ HR4ProtectedRoute
  │       └─ AppLayout
  │           └─ Module Pages (hr4/*)
  │
  └─ Public Routes
      ├─ LandingPage
      ├─ StaffLoginPage
      ├─ EmployeePortalPage
      └─ etc.
```

---

## State Management Flow

```
┌────────────────────────────────────────┐
│     Browser LocalStorage               │
│  ├─ selectedHRModule (module state)    │
│  ├─ ias_auth_user (authentication)     │
│  └─ ias_trusted_device (trust period)  │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│        HRModuleProvider                │
├────────────────────────────────────────┤
│  onMount:                              │
│  1. Check URL for module               │
│  2. Check localStorage for saved state │
│  3. Initialize with hr1 as default     │
│  onUrlChange:                          │
│  4. Update module state from URL       │
│  5. Save selection to localStorage     │
└────────────────┬───────────────────────┘
                 │
                 ▼ useHRModule()
┌────────────────────────────────────────┐
│    Components Using Module State       │
└────────────────────────────────────────┘
  ├─ AppLayout → shows current module nav
  ├─ AppSidebar → highlights active module
  ├─ Header → shows breadcrumb
  └─ Pages → render module content
```

---

## Module Switching Flow

```
User Clicks Module in Sidebar
         │
         ▼
onClick handler triggers
  handleModuleSwitch(moduleId)
         │
         ├─ setSelectedModule(moduleId)
         │   └─ Updates HRModuleContext state
         │       └─ Saves to localStorage
         │
         └─ navigate(`/${moduleId}/dashboard`)
             └─ React Router navigation
                 │
                 ├─ URL changes
                 │
                 ├─ HR*ProtectedRoute checks access
                 │
                 ├─ If allowed: Render module
                 │
                 └─ If denied: Redirect to
                     alternative module
                         │
                         ▼
                 AppLayout re-renders
                   ├─ Sidebar updates
                   │  └─ Shows new module nav items
                   │
                   ├─ Breadcrumb updates
                   │
                   └─ Main content transitions
                      (With animation fade)
```

---

## Error Handling & Redirect Flow

```
User attempts to access /hr4/dashboard
         │
         ├─ Router matches HR4 route
         │
         ├─ HR4ProtectedRoute component renders
         │
         ├─ Check: Is user authenticated?
         │  ├─ NO → Redirect to /
         │  └─ YES → Continue
         │
         ├─ Check: User roles include (admin|hr_manager|hr)?
         │  ├─ NO, has employee role
         │  │   └─ Redirect to /hr3/dashboard
         │  │
         │  ├─ NO, has recruiter role
         │  │   └─ Redirect to /hr1/dashboard
         │  │
         │  ├─ NO, has no valid role
         │  │   └─ Redirect to /
         │  │
         │  └─ YES → Render module content ✅
```

---

## Module Icon Assignment

```
HR1 – Talent Acquisition       🔥 Zap Icon
│
├─ Reason: Fast-paced recruitment process
├─ Lightning/energy symbolism
└─ Quick hiring actions

HR2 – Talent Development       📈 TrendingUp Icon
│
├─ Reason: Career growth and progression
├─ Upward trajectory symbolism
└─ Employee advancement focus

HR3 – Workforce Operations     ⏱️ ClipboardCheck Icon
│
├─ Reason: Daily operational tasks
├─ Checklist/tracking symbolism
└─ Regular tracking activities

HR4 – Compensation             💰 Banknote Icon
│
├─ Reason: Financial management
├─ Money/payment symbolism
└─ Payroll and salary focus
```

---

## Navigation State Persistence

```
Session Start
     │
     ├─ Check URL for module
     │  └─ /hr2/dashboard → HRModuleContext sets selectedModule='hr2'
     │
     ├─ Check localStorage for saved state
     │  └─ localStorage['selectedHRModule']='hr3' → Use HR3
     │
     └─ No hints → Default to HR1
         
During Session
     │
     ├─ User navigates: /hr1 → /hr3 → /hr4
     │  └─ Each navigation updates localStorage
     │     └─ Survives page refresh
     │
     └─ User closes browser
         └─ Next session starts with last used module

This ensures:
  ✅ Users return to their last module
  ✅ Multiple tabs don't interfere
  ✅ Module state survives page refresh
  ✅ Natural workflow continuation
```

---

**Architecture Version:** 1.0  
**Last Updated:** April 5, 2026  
**Status:** Complete and Implemented
