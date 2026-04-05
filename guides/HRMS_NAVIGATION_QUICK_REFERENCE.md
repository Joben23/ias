# HRMS Navigation - Quick Reference Guide

## 🎯 Quick Start

### For Users
1. **See all accessible modules** in the sidebar (based on your role)
2. **Click any module** to switch to it
3. **Active module** is highlighted with icon and dot indicator
4. **Current page** shown in top breadcrumb bar

### For Developers

#### Adding a New Module Feature
```tsx
// 1. Add route in App.tsx
<Route path="/hr1/my-feature" element={<MyFeaturePage />} />

// 2. Add navigation item in AppLayout.tsx
recruitment: [
  { path: `/hr1/my-feature`, label: 'My Feature', icon: MyIcon },
  // ...
]
```

#### Checking User Access
```tsx
// Get current user roles
const { authUser } = useAuth();
console.log(authUser.roles); // ['employee', 'admin', ...]

// Check if user has specific role
if (authUser?.roles.includes('admin')) {
  // Admin-only logic
}
```

#### Current Module Info
```tsx
// Get active module
const { selectedModule, currentModuleInfo } = useHRModule();
console.log(currentModuleInfo.name); // "HR1 – Talent Acquisition"
```

---

## 📋 Module Checklist

### Core Components
- ✅ AppLayout.tsx - Main layout with sidebar
- ✅ HR1/2/3/4ProtectedRoute.tsx - Access control per module
- ✅ HRModuleContext.tsx - Module state management
- ✅ App.tsx - Route definitions

### Protected Routes Applied
- ✅ `/hr1/*` → HR1ProtectedRoute
- ✅ `/hr2/*` → HR2ProtectedRoute
- ✅ `/hr3/*` → HR3ProtectedRoute
- ✅ `/hr4/*` → HR4ProtectedRoute

---

## 🔐 Access Control Matrix

| User Role | HR1 | HR2 | HR3 | HR4 | Entry Point |
|-----------|-----|-----|-----|-----|-------------|
| recruiter | ✅ | ❌ | ❌ | ❌ | /hr1 |
| employee | ❌ | ✅ | ✅ | ❌ | /hr2 or /hr3 |
| hr | ✅ | ✅ | ✅ | ✅ | /hr1 (default) |
| hr_manager | ❌ | ❌ | ❌ | ✅ | /hr4 |
| admin | ✅ | ✅ | ✅ | ✅ | /hr1 (default) |

---

## 🛣️ Navigation Paths

### HR1 – Talent Acquisition (Recruitment)
- `/hr1/dashboard` - Main dashboard
- `/hr1/applicants` - Applicant tracking
- `/hr1/recruitment` - Job postings
- `/hr1/interviews` - Interview scheduling
- `/hr1/rankings` - Candidate rankings
- `/hr1/onboarding` - New hire onboarding
- `/hr1/employees` - Employee directory
- `/hr1/performance` - Performance reviews
- `/hr1/recognition` - Employee recognition
- `/hr1/analytics` - Recruitment analytics

### HR2 – Talent Development (Learning)
- `/hr2/dashboard` - Main dashboard
- `/hr2/learning` - Learning management
- `/hr2/training` - Training programs
- `/hr2/succession` - Succession planning
- `/hr2/ess` - Employee self-service
- `/hr2/competency` - Competency management

### HR3 – Workforce Operations (Daily Use)
- `/hr3/dashboard` - Main dashboard
- `/hr3/attendance` - Attendance tracking
- `/hr3/shifts` - Shift management
- `/hr3/schedules` - Schedule management
- `/hr3/timesheets` - Timesheet submission
- `/hr3/leaves` - Leave requests
- `/hr3/claims` - Claims & reimbursements

### HR4 – Compensation (Payroll)
- `/hr4/dashboard` - Main dashboard
- `/hr4/hcm` - Human capital management
- `/hr4/payroll` - Payroll processing
- `/hr4/compensation` - Compensation planning
- `/hr4/benefits` - Benefits administration

---

## 🎨 Module Icons

| Module | Icon | Component |
|--------|------|-----------|
| HR1 | 🔥 Zap | `<Zap />` |
| HR2 | 📈 TrendingUp | `<TrendingUp />` |
| HR3 | ⏱️ ClipboardCheck | `<ClipboardCheck />` |
| HR4 | 💰 Banknote | `<Banknote />` |

Located in: `src/components/hr/AppLayout.tsx` (moduleIcons object)

---

## 🔄 Module Transitions

### Valid Transitions

**From HR1 → To:**
- HR2 (if user has hr/admin roles)
- HR3 (if user has hr/admin roles)
- HR4 (if user has hr/admin roles)

**From HR2 (Employee) → To:**
- HR3 (same user role restriction)
- HR2 → HR1 denied (redirects to HR2)

**From HR3 → To:**
- HR2 (if user has hr/admin/employee roles)
- HR1 (if user has hr/admin roles)

**From HR4 → To:**
- Any module (if user has hr/admin roles)

### Redirect Logic

When user tries to access denied module:
1. Check user's roles
2. If denied: Redirect to accessible module
3. If no accessible modules: Redirect to home

---

## 🧪 Testing Commands

### Check Compilation
```bash
npm run build
```

### Run Development Server
```bash
npm run dev
```

### Check Types
```bash
npm run type-check
```

### View Errors
```bash
npm run lint
```

---

## 📱 Responsive Breakpoints

| Screen Size | Sidebar | Navigation |
|------------|---------|------------|
| Desktop (>lg) | Full width | All items visible |
| Tablet (md) | Collapsible | Limited items |
| Mobile (<md) | Drawer | Hamburger menu |

---

## 🐛 Common Issues & Solutions

### Issue: Module not visible in sidebar
**Cause:** User role not in access list
**Fix:** Add role to appropriate HR*ProtectedRoute

### Issue: Redirect loop
**Cause:** User has no accessible modules
**Fix:** Assign at least one role to user

### Issue: Navigation not updating
**Cause:** HRModuleContext state not syncing
**Fix:** Clear localStorage and refresh

### Issue: Protected route not working
**Cause:** Component not wrapped properly
**Fix:** Ensure route uses correct Protected component

---

## 📚 Related Files

### Configuration
- `src/contexts/HRModuleContext.tsx` - Module definitions
- `src/App.tsx` - Route configuration

### Components
- `src/components/hr/AppLayout.tsx` - Main layout
- `src/components/hr/HR1/2/3/4ProtectedRoute.tsx` - Access control

### Pages
- `src/modules/hr1/pages/` - HR1 feature pages
- `src/modules/hr2/pages/` - HR2 feature pages
- `src/modules/hr3/pages/` - HR3 feature pages
- `src/modules/hr4/pages/` - HR4 feature pages

---

## 🚀 Deployment Notes

1. **Environment Variables:**
   - No new env vars needed
   - Existing auth config used for role checking

2. **Database Migration:**
   - No new tables required
   - Existing roles used: admin, hr, recruiter, hr_manager, employee

3. **Browser Compatibility:**
   - Works on all modern browsers
   - localStorage used for module persistence

4. **Performance:**
   - Lightweight sidebar rendering
   - Lazy loading for module pages
   - No significant performance impact

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review HRMS_NAVIGATION_REFACTOR.md for detailed info
3. Check error logs in browser console
4. Verify database user roles are correct

---

**Last Updated:** April 5, 2026
**Version:** 1.0
