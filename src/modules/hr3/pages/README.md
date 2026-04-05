# HR3 Module - New Pages Documentation

## Overview
This document outlines the 5 new comprehensive pages created for the HR3 (Workforce Operations) module. All pages are fully functional with UI components, state management, and mock data.

## Pages Created

### 1. EmployeeDirectoryPage.tsx
**Location**: `src/modules/hr3/pages/EmployeeDirectoryPage.tsx`

**Features**:
- Employee search and filtering by department, role, and status
- Employee profile cards with contact information and hierarchy
- Employee details modal with comprehensive information
- Edit employee dialog for updating basic information
- Bulk actions for administrative tasks
- Export employee list functionality

**Key Components**:
- Search functionality with autocomplete
- Filter system (Department, Role, Employment Status)
- Modal for viewing detailed employee profiles
- Edit dialog for quick updates
- Department and role filtering

**Data Structure**:
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  manager?: string;
  start_date: string;
  location: string;
  status: string;
  avatar_url?: string;
}
```

---

### 2. AttendancePage.tsx
**Location**: `src/modules/hr3/pages/AttendancePage.tsx`

**Features**:
- Real-time clock in/out functionality
- Attendance record viewing with daily breakdown
- Attendance status badges (Present, Absent, Late, Early Leave)
- Correction request system for employees
- Correction approval for managers
- Daily and weekly hour tracking
- Export attendance data to PDF/Excel

**Key Sections**:
- Statistics dashboard (Present, Absent, Late, Total Hours)
- Filter by employee and date
- Attendance records table with status indicators
- Correction request dialog with reason input
- Manager approval/rejection of corrections

**Data Structure**:
```typescript
interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  clock_in: string;
  clock_out: string;
  hours_worked: number;
  status: 'Present' | 'Absent' | 'Late' | 'Early Leave' | 'Correction Pending';
  notes: string;
}
```

---

### 3. TimesheetsPage.tsx
**Location**: `src/modules/hr3/pages/TimesheetsPage.tsx`

**Features**:
- Weekly timesheet submission system
- Daily hours breakdown (Monday-Sunday)
- Project time allocation tracking
- Timesheet status workflow (Draft → Submitted → Approved/Rejected)
- Rejection reason display for failed submissions
- Resubmission capability for rejected timesheets
- Manager approval/rejection interface
- Export timesheet data

**Key Sections**:
- Statistics dashboard (Pending, Approved, Rejected, Draft)
- Status filter system
- Timesheet cards displaying:
  - Daily hours breakdown (7-day grid)
  - Project allocation
  - Total hours summary
  - Notes and rejection reasons
- Action buttons based on timesheet status

**Data Structure**:
```typescript
interface TimesheetEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  week_start: string;
  week_end: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  total_hours: number;
  daily_hours: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  projects: {
    name: string;
    hours: number;
  }[];
  notes: string;
  submitted_date?: string;
  approved_by?: string;
  rejection_reason?: string;
}
```

---

### 4. LeaveManagementPage.tsx
**Location**: `src/modules/hr3/pages/LeaveManagementPage.tsx`

**Features**:
- Leave request submission with type selection
- Multiple leave types (Annual, Sick, Maternity, Compassionate, Unpaid)
- Automatic leave day calculation based on date range
- Leave balance tracking
- Leave request status management
- Manager approval/rejection workflow
- Rejection reason display
- Leave cancellation for approved leaves
- Export leave requests

**Key Sections**:
- Leave balance cards (Annual, Sick, Maternity)
- Leave request form dialog
- Status filter system
- Leave request cards showing:
  - Leave type and dates
  - Number of days requested
  - Employee reason
  - Rejection reasons (if applicable)
  - Status badges
- Manager action buttons

**Data Structure**:
```typescript
interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: 'Annual' | 'Sick' | 'Maternity' | 'Compassionate' | 'Unpaid';
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  approver?: string;
  rejection_reason?: string;
  requested_date: string;
}
```

---

### 5. ClaimsReimbursementPage.tsx
**Location**: `src/modules/hr3/pages/ClaimsReimbursementPage.tsx`

**Features**:
- Reimbursement claim submission form
- Multiple claim types (Travel, Meals, Supplies, Training, Other)
- Currency support (USD, EUR, GBP)
- Project/purpose tracking
- Receipt attachment tracking
- Claim status workflow (Draft → Submitted → Under Review → Approved/Rejected → Paid)
- Manager approval/rejection with reasons
- "Mark as Paid" functionality
- Claims filtering by status and type
- Export claims data

**Key Sections**:
- Statistics dashboard (Pending, Approved, Paid, Total Amount)
- Dual filter system (Status + Type)
- Claim submission dialog with:
  - Claim type selector
  - Amount and currency inputs
  - Project/purpose field
  - Description area
  - Receipt counter
- Claim cards displaying:
  - Amount and currency
  - Claim type badge
  - Status badge
  - Project information
  - Receipt count
  - Approval/rejection details
- Status-based action buttons

**Data Structure**:
```typescript
interface ReimbursementClaim {
  id: string;
  employee_id: string;
  employee_name: string;
  claim_type: 'Travel' | 'Meals' | 'Supplies' | 'Training' | 'Other';
  amount: number;
  currency: string;
  description: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
  receipt_count: number;
  submitted_date?: string;
  approved_date?: string;
  approver?: string;
  rejection_reason?: string;
  project?: string;
}
```

---

## Common Features Across All Pages

### UI Components Used
- `Button` - Action buttons with variants
- `Card` - Content containers
- `Badge` - Status/type indicators
- `Dialog` - Modal interactions
- `Input` - Text and date inputs
- `Textarea` - Multi-line text input
- `Select` - Dropdown selections
- `Table` - Data display (Attendance)

### State Management
- React hooks (`useState`) for local state management
- Mock data for demonstration
- Real-time UI updates

### Toast Notifications
- Success messages for actions
- Error messages for validation failures
- All pages use the `useToast` hook

### Data Export
- Export buttons on all pages
- Toast notification showing export functionality

### Filtering & Search
- Employee filtering (Attendance, Leave)
- Status filtering (all pages)
- Type filtering (Claims & Reimbursements)
- Date filtering (Attendance)

### Status-Based Actions
- Different action buttons based on record status
- Approval/Rejection workflows
- Edit/Update capabilities where appropriate

---

## Integration with Existing System

### Routing
All pages are already integrated into the HR3 module routing:
```
/hr3/attendance → AttendancePage
/hr3/timesheets → TimesheetsPage
/hr3/leaves → LeaveManagementPage
/hr3/claims → ClaimsReimbursementPage
/hr3/employees → EmployeeDirectoryPage (for HR3)
```

### Navigation
The AppLayout already includes menu items for all these pages in the HR3 navigation sidebar.

### Authentication
All pages are protected by the `HR3ProtectedRoute` component and require appropriate HR3 permissions.

---

## Next Steps for Production Implementation

### To Connect to Supabase:
1. Replace mock data arrays with Supabase queries
2. Update state management to use `useQuery` from React Query
3. Implement mutations for create/update/delete operations
4. Add proper error handling for API calls
5. Implement real-time subscriptions where needed

### To Enhance Functionality:
1. Add pagination for large datasets
2. Implement advanced filtering and sorting
3. Add bulk operations for multiple records
4. Add print functionality
5. Implement scheduled exports
6. Add email notifications for approvals

### To Improve UX:
1. Add loading states for all async operations
2. Add confirmation dialogs for destructive actions
3. Implement optimistic updates
4. Add keyboard shortcuts
5. Add accessibility improvements (ARIA labels, keyboard navigation)

---

## File Locations
```
src/modules/hr3/pages/
├── EmployeeDirectoryPage.tsx
├── AttendancePage.tsx
├── TimesheetsPage.tsx
├── LeaveManagementPage.tsx
├── ClaimsReimbursementPage.tsx
└── index.ts (exports all pages)
```

---

## Testing Considerations

### Mock Data
Each page includes representative mock data to test:
- Various statuses and states
- Edge cases (rejections, pending approvals)
- Different employee scenarios
- Various data types and amounts

### Feature Testing
- Test all filtering combinations
- Test dialog open/close functionality
- Test form submissions
- Test action buttons for each status
- Test export functionality
- Test date and number inputs

---

## Styling & Theme
All pages use:
- Tailwind CSS for styling
- custom color schemes with Dark/Light mode support
- consistent component styling across the application
- responsive design (mobile, tablet, desktop)

---

Created: May 2026
Module: HR3 (Workforce Operations)
Version: 1.0
