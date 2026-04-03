# Hospital HR System - Complete Testing Guide

## Pre-Test Checklist ✅

- [ ] Application running: `npm run dev`
- [ ] You're logged in as HR or Admin
- [ ] Browser console open (F12) for errors
- [ ] Supabase dashboard open in another tab for logs
- [ ] Database backup taken (if production)

**Test Duration:** ~30 minutes for full workflow

---

## TEST 1: Create New Applicant ⏱️ 5 min

### Step 1: Go to Careers Page
1. Click **"Careers"** in navigation
2. See job postings for available positions
3. Click **"Apply Now"** on any position (e.g., "Staff Nurse - Emergency Department")

### Step 2: Submit Application
1. Fill form:
   - **Full Name:** `Test Hire 2026`
   - **Email:** `test.hire.2026@hospital.test`
   - **Phone:** `555-0001`
   - **Department:** Select any department
   - **Position:** Select corresponding position
   - **Cover Letter:** `Testing onboarding system`
2. **Upload Resume:** Any PDF file (or create one)
3. Click **"Submit Application"**

### Step 3: Verify Submission
- **Expected:** Success message shown
- **Result:** Applicant now in system with "Applied" status
- **Navigate to:** Dashboard → Applicants page
- **Verify:** New applicant appears in list

**PASS/FAIL:** _______________

---

## TEST 2: Move Through Interview Pipeline ⏱️ 8 min

### Step 1: Open Applicant Detail
1. Go to **Applicants** page
2. Click on **"Test Hire 2026"** card to open detail dialog

### Step 2: Shortlist Applicant
1. In Status dropdown: Select **"Shortlisted"**
2. Click **"Save Changes"**
3. **Expected:** Dialog closes, applicant status updated

### Step 3: Schedule Interview
1. Reopen applicant dialog
2. See **"Schedule Interview"** button
3. Click it → Interview scheduling dialog opens
4. Fill:
   - **Interview Date:** Pick any future date
   - **Time:** 10:00 AM
   - **Interviewer:** Select from dropdown
5. Click **"Schedule Interview"**
6. **Expected:** Success message, button disappears

### Step 4: Mark Interview Completed
1. Reopen applicant dialog
2. Status dropdown: Select **"Interview Completed"**
3. Click **"Save Changes"**

### Step 5: Move to Selected Status
1. Reopen applicant dialog
2. Status dropdown: Select **"Selected"**
3. Click **"Save Changes"**

**PASS/FAIL:** _______________

---

## TEST 3: Create and Send Job Offer ⏱️ 7 min

### Step 1: Open Applicant & Send Offer
1. Go to **Applicants** page
2. Open **"Test Hire 2026"** dialog (should be "Selected")
3. Click **"Send Job Offer"** button
4. **New Dialog:** Job offer form appears

### Step 2: Fill Job Offer Details
1. **Position:** Already filled (Staff Nurse)
2. **Department:** Already filled
3. **Start Date:** Pick date 2 weeks from now
4. **Salary Offer:** `$65000` (annual)
5. **Contract Type:** Select `"Full-Time"`
6. **Benefits:** Select benefits packages
7. Leave other fields as defaults

### Step 3: Submit Offer
1. Click **"Create and Send Offer"**
2. **Expected:** 
   - Success message
   - Dialog closes
   - Applicant status changes to "Offer Sent"

### Step 4: Verify Offer Created
1. Reopen applicant dialog
2. Should see new "Offer Sent" status
3. See **"Accept Offer"** + **"Reject Offer"** buttons

**PASS/FAIL:** _______________

---

## TEST 4: Accept Offer & Prepare to Hire ⏱️ 5 min

### Step 1: Accept Offer
1. Reopen applicant dialog (should be "Offer Sent")
2. Click **"Accept Offer"** button
3. **Expected:** Status changes to "Offer Accepted"

### Step 2: Verify Hire Button Appears
1. Reopen applicant dialog
2. **Should see:** "Hire & Create Employee Account" button
3. **Below it:** Message "Employee will be created with the following details:"
   - Employee ID will be automatically assigned
   - Position: Staff Nurse
   - Department: Emergency
   - Start Date: (selected date)

### Step 3: Check Dialog Properties
1. Notice new "Onboarding Info" section shows:
   - "This applicant has not been hired yet"

**PASS/FAIL:** _______________

---

## TEST 5: Hire and Create Employee Account ⏱️ 3 min (CRITICAL TEST)

### Step 1: Click Hire Button
1. Make sure applicant is "Offer Accepted"
2. Click **"Hire & Create Employee Account"** button
3. **Loading state:** Button becomes disabled with spinner

### Step 2: Wait for Success ⏳
- **Expected (3-5 seconds):**
  - ✅ Success toast appears at top
  - Shows: "✅ Employee Account Created"
  - Displays: Employee ID (e.g., "EMP-2026-0001")
  - Shows: Username (e.g., "test.hire2026")
  - Shows: Temporary password
  - Shows: Start date

### Step 3: Verify Success Toast Content
Toast should show:
```
✅ Employee Account Created

Employee ID: EMP-2026-0001
Username: test.hire2026
Password: <random-password>
Start Date: 2026-02-XX

Share these credentials with the new hire.
Next: Go to Onboarding to complete hiring checklist.
```

### Step 4: Check Dialog Update
1. Applicant status changes to **"Hired"**
2. "Onboarding Info" section now shows:
   - ✅ Employee Account Created
   - Employee ID displayed
   - "Next Step: Complete onboarding tasks"

### Step 5: Verify in Database (Optional)
Open Supabase dashboard:
```sql
-- Check employee exists
SELECT id, applicant_id, employee_id, onboarding_status 
FROM employees 
WHERE full_name LIKE 'Test Hire%' 
ORDER BY created_at DESC LIMIT 1;

-- Should show: onboarding_status = 'Offer Accepted'
-- Should show: employee_id = 'EMP-2026-0001'

-- Check auth user created
SELECT email, created_at FROM auth.users 
WHERE email = 'test.hire.2026@hospital.test';

-- Should show: User created just now

-- Check role assigned
SELECT role FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test.hire.2026@hospital.test');

-- Should show: 'employee'

-- Check tasks created
SELECT COUNT(*), GROUP_CONCAT(task_name) as tasks
FROM onboarding_tasks 
WHERE employee_id = (
  SELECT id FROM employees WHERE full_name LIKE 'Test Hire%' LIMIT 1
);

-- Should show: 6 tasks created
```

**PASS/FAIL:** _______________

### ❌ If Test Fails: Troubleshooting

**Error: "Job offer not found"**
- ✓ Make sure you completed Test 3 (Create Job Offer)
- ✓ Make sure status is exactly "Offer Accepted"
- ✓ Check: Supabase → job_offers table has entry

**Error: "Applicant not found"**
- ✓ Verify applicant exists in database
- ✓ Check applicant ID in URL of detail dialog

**Error: "User already exists"**
- ✓ Email already has account
- ✓ Use different email or delete/reset previous test account

**Error: "Permission denied"**
- ✓ Log out and log in as Admin or HR
- ✓ Check your role: Dashboard → Profile → should show "hr" or "admin"

**No error but no success massage:**
- ✓ Check browser console (F12) for error details
- ✓ Check Supabase logs: Functions → hire-applicant → Logs
- ✓ May be timeout - wait 10 seconds and check Employee Directory

---

## TEST 6: Verify Employee in Onboarding ⏱️ 3 min

### Step 1: Navigate to Onboarding Page
1. Dashboard → Click **"Onboarding"** link (or `/dashboard/onboarding`)
2. **Expected:** Page loads with pipeline summary

### Step 2: Check Pipeline Summary
Should show counts:
- **Offer Accepted:** 1 (your new hire)
- **Documents Submitted:** 0
- **Orientation Completed:** 0  
- **Employee Activated:** 0

### Step 3: Find Your New Hire
1. Scroll to "Offer Accepted" section
2. **Should see:** "Test Hire 2026" card with:
   - Name and initials avatar
   - Position: Staff Nurse
   - Department: Emergency
   - Progress bar: 0 of 6 Complete
   - Expandable with tasks

### Step 4: Verify Tasks Present
1. Click to expand card
2. **Should see tabs:**
   - `OnboardingProgress`: 4-stage pipeline with checkmarks
   - `OnboardingChecklist`: List of 6 tasks (all unchecked)
   - `OnboardingDocumentUpload`: Upload area
   - `OrientationSection`: Orientation scheduling

### Step 5: Verify 6 Tasks Listed
In OnboardingChecklist tab, should see:
1. ☐ Submit Government IDs
2. ☐ Upload Medical License
3. ☐ Sign Employment Contract
4. ☐ Complete HR Orientation
5. ☐ Receive Employee ID Badge
6. ☐ Payroll Registration

**PASS/FAIL:** _______________

---

## TEST 7: Mark Tasks Complete & Auto-Activate ⏱️ 5 min (CRITICAL TEST)

### Step 1: Start Marking Tasks
1. In OnboardingChecklist tab, click checkbox for:
   - ☑ Submit Government IDs
   - **Expected:** Checkbox checked, progress bar updates to "1 of 6"

### Step 2: Complete More Tasks
1. Continue checking boxes:
   - ☑ Upload Medical License (2 of 6)
   - ☑ Sign Employment Contract (3 of 6)
   - ☑ Complete HR Orientation (4 of 6)
   - ☑ Receive Employee ID Badge (5 of 6)

### Step 3: Complete Final Task
1. ☑ Payroll Registration (6 of 6)
2. **CRITICAL MOMENT:** Watch for automatic status update
3. **Expected (automatic trigger fires):**
   - ✅ Employee disappears from "Offer Accepted" section
   - ✅ Count updates to "Offer Accepted: 0"
   - ✅ New hire DOES NOT appear in other sections
   - ✅ Database automatically updated: `onboarding_status = 'Employee Activated'`

### Step 4: Verify Employee Activated
1. Refresh Onboarding page (F5)
2. **Expected:** Employee not shown anywhere (completed onboarding)
3. Can verify with query:
```sql
SELECT onboarding_status FROM employees 
WHERE full_name LIKE 'Test Hire%' LIMIT 1;
-- Should show: 'Employee Activated'
```

**PASS/FAIL:** _______________

### ❌ If Auto-Activation Doesn't Work

**Employee doesn't disappear after marking all tasks complete:**
1. Check migration deployed: `20260322_add_onboarding_auto_promotion.sql`
   - Supabase → Database → Migrations → Should be marked as completed
2. Check trigger exists:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'trg_update_onboarding_on_task_change';
   -- Should return 1 row
   ```
3. Check function exists:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'update_onboarding_status_on_task_completion';
   -- Should return 1 row
   ```
4. Force update: Refresh page to re-fetch data

---

## TEST 8: Employee Appears in Directory ⏱️ 3 min

### Step 1: Navigate to Employee Directory
1. Dashboard → Click **"Employees"** link (or `/dashboard/employees`)
2. **Expected:** Page loads with search, filters, sort options

### Step 2: Search for New Employee
1. In search box, type: `Test Hire`
2. **Expected:** 
   - ✅ Shows "Showing 1 of X employees"
   - ✅ Card appears with "Test Hire 2026"
   - Shows: Employee ID (EMP-2026-0001)
   - Shows: Position (Staff Nurse)
   - Shows: Department badge (Emergency)
   - Shows: Email and phone

### Step 3: Test Clear Search
1. Clear search box
2. **Expected:** All employees show again

### Step 4: Test Department Filter
1. Click **Department** dropdown
2. Select **"Emergency"**
3. **Expected:** Only employees from Emergency dept shown
4. **Count updates:** "Showing X of Y employees"

### Step 5: Test Position Filter
1. Keep Emergency dept selected
2. Click **Position** dropdown  
3. Select **"Staff Nurse"**
4. **Expected:** Only Emergency + Staff Nurse employees shown

### Step 6: Test Sort Options
1. Click **Sort** dropdown (now showing filtered results)
2. Select **"By Name"**
3. **Expected:** Results sorted alphabetically (Test Hire appears)
4. Select **"Newest First"**
5. **Expected:** Your new hire appears at top (if hired today)

### Step 7: Clear All Filters
1. Search box: Clear
2. Department: Select "All"
3. Position: Select "All"
4. Sort: Reset to default
5. **Expected:** All activated employees shown

**PASS/FAIL:** _______________

---

## TEST 9: Verify Complete End-to-End Workflow ⏱️ 2 min

### Document the Flow
From applicant creation to Employee Directory:

| Step | Status | Page | Action | Result |
|------|--------|------|--------|--------|
| 1 | Applied | Careers | Submit app | ✅ Created |
| 2 | Shortlisted | Applicants | Select status | ✅ Updated |
| 3 | Interview Scheduled | Applicants | Schedule | ✅ Button clicked |
| 4 | Interview Completed | Applicants | Select status | ✅ Updated |
| 5 | Selected | Applicants | Select status | ✅ Updated |
| 6 | Offer Sent | Applicants | Send offer | ✅ Created |
| 7 | Offer Accepted | Applicants | Accept offer | ✅ Updated |
| 8 | Hired | Applicants | Hire & Create | ✅ Edge Function |
| 9 | Onboarding | Onboarding | 6 tasks auto-created | ✅ Trigger |
| 10 | All tasks complete | Onboarding | Mark complete | ✅ Trigger |
| 11 | Employee Activated | Onboarding | Auto-updated | ✅ Trigger |
| 12 | Directory | Employees | Search/filter | ✅ Visible |

### Verification Summary
- ✅ Applicant successfully created
- ✅ Pipeline progression works
- ✅ Interview scheduling works
- ✅ Job offer creation works
- ✅ Offer acceptance works
- ✅ Employee account creation works
- ✅ Onboarding tasks auto-created
- ✅ Task completion verified
- ✅ Auto-activation works
- ✅ Employee Directory search/filter works
- ✅ Employee visible only when activated

**OVERALL WORKFLOW: PASS/FAIL: _______________**

---

## TEST 10: Error Handling ⏱️ 5 min (Optional)

### Test 10.1: Hire Without Offer
1. Create new applicant (different email)
2. Move to "Offer Accepted" status WITHOUT creating offer
3. Try to "Hire & Create Employee"
4. **Expected:** Error message: "Job offer not found"
5. **Result:** PASS/FAIL: _______________

### Test 10.2: Duplicate Hire
1. Open previously hired employee (Test Hire 2026)
2. Try clicking "Hire" button again
3. **Expected:** Error message: "User already exists" or similar
4. **Result:** PASS/FAIL: _______________

### Test 10.3: Permission Check
1. Log out as HR
2. Log in as regular Employee (not HR/Admin)
3. Try to access Applicants page
4. **Expected:** Redirected to dashboard or "No permission" message
5. **Result:** PASS/FAIL: _______________

---

## FINAL CHECKLIST ✅

After all tests pass:

- [ ] All 10 tests completed successfully
- [ ] No errors in browser console
- [ ] Supabase logs show no errors
- [ ] Database shows correct data
- [ ] UI displays all information correctly
- [ ] Search/filter/sort working
- [ ] Auto-promotion triggers working
- [ ] No duplicate accounts created
- [ ] Permissions enforced
- [ ] All statuses transitioned correctly

---

## Summary Report

| Test | Status | Notes |
|------|--------|-------|
| 1 - Create Applicant | ✅ PASS / ❌ FAIL | |
| 2 - Pipeline Progression | ✅ PASS / ❌ FAIL | |
| 3 - Job Offer | ✅ PASS / ❌ FAIL | |
| 4 - Accept Offer | ✅ PASS / ❌ FAIL | |
| 5 - Hire & Create Employee | ✅ PASS / ❌ FAIL | |
| 6 - Onboarding Tasks | ✅ PASS / ❌ FAIL | |
| 7 - Auto-Activation | ✅ PASS / ❌ FAIL | |
| 8 - Employee Directory | ✅ PASS / ❌ FAIL | |
| 9 - Complete Workflow | ✅ PASS / ❌ FAIL | |
| 10 - Error Handling | ✅ PASS / ❌ FAIL | |

**SYSTEM READY FOR PRODUCTION:** _______________

---

**Test Date:** _______________
**Tested By:** _______________
**Notes:** _______________

---

*For support: Check EDGE_FUNCTION_DEBUG.md for troubleshooting*
