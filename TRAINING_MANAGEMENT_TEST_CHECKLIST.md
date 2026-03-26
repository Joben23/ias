# Training Management - Test Checklist

**Date:** March 26, 2026  
**Module:** HR2 Training Management  
**Version:** 1.0

---

## Pre-Testing Requirements

- [ ] Supabase migration applied (20260326_create_training_management.sql)
- [ ] Database tables verified to exist
- [ ] Application built successfully
- [ ] Dev server running without errors
- [ ] HR user account with admin/hr role
- [ ] Test employee data available

---

## Database Verification Tests

### Test 1: Verify Tables Created
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('training_programs', 'employee_trainings', 'training_evaluations');
```
- [ ] Expected: 3 rows returned
- [ ] Result: ___________

### Test 2: Verify RLS Policies
```sql
SELECT policyname, tablename FROM pg_policies 
WHERE tablename IN ('training_programs', 'employee_trainings', 'training_evaluations');
```
- [ ] Expected: Multiple rows with policy names
- [ ] Result: ___________

### Test 3: Verify Functions Exist
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_employees_with_skill_gaps', 'auto_assign_trainings_for_employee');
```
- [ ] Expected: 2 rows
- [ ] Result: ___________

### Test 4: Verify Indexes Created
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('training_programs', 'employee_trainings', 'training_evaluations');
```
- [ ] Expected: 6+ indexes
- [ ] Result: ___________

---

## Frontend Navigation Tests

### Test 5: Access Training Dashboard
1. Login to HR2 module
2. Look for "Training Management" in sidebar
3. Click on "Training Management" → "Dashboard"
- [ ] Page loads without errors
- [ ] Stats cards display (Total Programs, Ongoing, Completed, Skill Gaps)
- [ ] No console errors
- [ ] Dashboard responsive on mobile

**Expected:** Dashboard with 4 stat cards and upcoming trainings section

---

### Test 6: Navigate to Training Programs
1. Click "Training Management" → "Training Programs"
- [ ] Page loads
- [ ] Shows "New Training Program" button
- [ ] Search box present
- [ ] Filter dropdown present
- [ ] No console errors

**Expected:** Empty state with helpful messaging

---

### Test 7: Navigate to Training Assignments
1. Click "Training Management" → "Training Assignments"
- [ ] Page loads
- [ ] Shows "Assign Training" button
- [ ] Can see assignment type selector
- [ ] No console errors

**Expected:** Empty state (no assignments yet)

---

### Test 8: Navigate to Training Evaluation
1. Click "Training Management" → "Training Evaluation"
- [ ] Page loads
- [ ] Shows stat cards
- [ ] No console errors

**Expected:** Empty state (no completed trainings yet)

---

## Training Program CRUD Tests

### Test 9: Create Training Program
1. Training → Training Programs → New Training Program
2. Fill form:
   - Name: "Emergency Response Level 3"
   - Description: "Advanced emergency response training"
   - Competency: (select available)
   - Required Level: 3
   - Type: Medical
   - Duration: 8
   - Trainer: "Dr. Smith"
   - Schedule Date: (future date)
3. Click "Create Training Program"
- [ ] Success toast appears
- [ ] Program appears in list
- [ ] Data saved to database
- [ ] No console errors

**Expected:** Program created and visible in list

---

### Test 10: Search Training Program
1. On Training Programs page
2. Type "Emergency" in search box
- [ ] Program filters to results
- [ ] Search is case-insensitive
- [ ] Real-time filtering

**Expected:** Only matching programs display

---

### Test 11: Filter by Training Type
1. On Training Programs page
2. Click filter dropdown → "Medical"
- [ ] Only medical trainings show
- [ ] Other types filtered out

**Expected:** Filtered results match type

---

### Test 12: Edit Training Program
1. Click Edit button on a program card
2. Change name to "Advanced Emergency Response"
3. Click "Update Training Program"
- [ ] Success toast
- [ ] Program name updated in list
- [ ] Database updated

**Expected:** Changes saved and reflected immediately

---

### Test 13: Delete Training Program
1. Click Trash/Delete button on program
2. Confirm deletion
- [ ] Confirmation dialog appears
- [ ] Program removed from list after confirm
- [ ] Success toast
- [ ] Database record deleted

**Expected:** Program removed

---

## Training Assignment Tests

### Test 14: Manual Assignment - Single Employee
1. Training → Assignments → Assign Training
2. Select "Manual Assignment"
3. Choose a training program
4. Select one employee
5. Click "Assign"
- [ ] Assignment created
- [ ] Status shows "Assigned"
- [ ] Appears in assignment list
- [ ] Database record created

**Expected:** Assignment visible with correct status

---

### Test 15: Manual Assignment - Multiple Employees
1. Training → Assignments → Assign Training
2. Select "Manual Assignment"
3. Choose a training
4. Select 3+ employees
5. Click "Assign to X Employees"
- [ ] Multiple assignments created
- [ ] All visible in list
- [ ] Each has separate record

**Expected:** All 3+ assignments created

---

### Test 16: Auto Assignment Detection
1. Training → Assignments → Assign Training
2. Click "Auto Assignment" card
3. Review "Skill Gaps Detected" alert
- [ ] Alert shows number of gaps
- [ ] Shows affected employees
- [ ] List displays employee details

**Expected:** Skill gaps identified and displayed

---

### Test 17: Auto Assignment Execution
1. Continue from Test 16
2. Click "Auto-Assign Trainings"
- [ ] Success toast with count
- [ ] New assignments appear in list
- [ ] Status shows "Assigned"
- [ ] Database records created

**Expected:** Trainings auto-assigned based on gaps

---

### Test 18: Update Assignment Status
1. On Assignments page, find an assignment
2. Click status dropdown (shows "Assigned")
3. Change to "In Progress"
- [ ] Status updates immediately
- [ ] Database updated
- [ ] No page reload needed

**Expected:** Status changes reflected

---

### Test 19: Mark Assignment Completed
1. Change status to "In Progress"
2. Change to "Completed"
- [ ] Status updates
- [ ] Completion date recorded
- [ ] Can now be evaluated

**Expected:** Status and timestamp saved

---

### Test 20: Remove Assignment
1. Click "Remove" button on assignment
2. Confirm removal
- [ ] Confirmation dialog
- [ ] Assignment removed from list
- [ ] Database record deleted

**Expected:** Assignment completely removed

---

## Training Evaluation Tests

### Test 21: View Completed Trainings
1. Mark assignment as "Completed" (Test 19)
2. Training → Evaluation
- [ ] Completed training appears in list
- [ ] Shows employee name and training
- [ ] No evaluation summary yet

**Expected:** Training ready for evaluation

---

### Test 22: Create Evaluation - Ratings
1. Click "Evaluate" on completed training
2. Click 4 stars for overall rating
- [ ] Stars highlight up to clicked position
- [ ] Rating label updates ("Good")
- [ ] Form accepts input

**Expected:** 4-star rating selected

---

### Test 23: Create Evaluation - Knowledge & Performance
1. Continue evaluation form
2. Select "Knowledge Improvement" = 5
3. Select "Performance Improvement" = 4
- [ ] Dropdowns work
- [ ] Values persist
- [ ] No errors

**Expected:** Both ratings selected

---

### Test 24: Create Evaluation - Feedback
1. Continue evaluation form
2. Add trainer feedback: "Excellent progress demonstrated"
3. Click "Save Evaluation"
- [ ] Success toast
- [ ] Dialog closes
- [ ] Evaluation appears in list summary

**Expected:** Evaluation saved with all data

---

### Test 25: View Evaluation Summary
1. On Evaluation page, find training with evaluation
2. See evaluation summary card
- [ ] Shows overall rating with stars
- [ ] Knowledge & performance ratings visible
- [ ] Trainer feedback displayed
- [ ] Evaluation date shown

**Expected:** All evaluation data visible

---

### Test 26: Edit Existing Evaluation
1. Click "Edit" on existing evaluation
2. Change overall rating to 3
3. Update feedback text
4. Save
- [ ] Changes saved
- [ ] Summary updates
- [ ] No duplication

**Expected:** Evaluation updated

---

## Dashboard Tests

### Test 27: Dashboard Stats
1. Training → Dashboard
2. Verify stats cards show:
   - Total Programs (from created programs)
   - Ongoing (from assignments)
   - Completed (from marked complete)
   - Employees with Gaps
- [ ] Numbers accurate
- [ ] Stats update after changes
- [ ] Completion rate calculated correctly

**Expected:** All stats accurate and updating

---

### Test 28: Upcoming Trainings Display
1. Dashboard
2. See "Upcoming Trainings" section
- [ ] Shows assigned/in-progress trainings
- [ ] Limited to next 5
- [ ] Status badges color-coded
- [ ] Training names and durations visible

**Expected:** Upcoming trainings displayed

---

### Test 29: Recommended Trainings
1. Dashboard
2. See "Recommended Trainings" section
- [ ] Shows trainings based on gaps
- [ ] Shows affected employee count
- [ ] Type badge visible
- [ ] Based on skill gap data

**Expected:** Recommendations based on gaps

---

### Test 30: Skill Gaps List
1. Dashboard
2. See "Identified Skill Gaps" section
- [ ] Shows employee names
- [ ] Shows competency names
- [ ] Shows gap levels
- [ ] Shows current vs target level
- [ ] Scrollable if many gaps

**Expected:** All skill gaps listed with details

---

## Error Handling Tests

### Test 31: Search with No Results
1. Training Programs page
2. Search for "nonexistent_term_xyz"
- [ ] Shows "No training programs found"
- [ ] Helpful message displayed
- [ ] No errors

**Expected:** Graceful empty state

---

### Test 32: Create Training - Missing Required Fields
1. Training Programs → New Training
2. Leave Name empty
3. Try to save
- [ ] Validation error toast
- [ ] Form doesn't submit
- [ ] Error message clear

**Expected:** Validation prevents save

---

### Test 33: Assignment - No Selection
1. Assignments → Assign Training
2. Don't select employees
3. Click Assign
- [ ] Validation error
- [ ] Toast message
- [ ] Form stays open

**Expected:** Validation prevents empty assignment

---

### Test 34: Evaluation - Save Without Rating
1. Training → Evaluation → Evaluate
2. Leave overall rating default
3. Try to save
- [ ] Saves with default rating (3)
- [ ] Or shows validation error
- [ ] Database consistency maintained

**Expected:** Either saves or shows error

---

## Performance Tests

### Test 35: Load Times
1. Dashboard - measure load time
2. Programs page - measure load time
3. Assignments page - measure load time
- [ ] Dashboard loads < 2 seconds
- [ ] Programs < 1 second
- [ ] Assignments < 1 second
- [ ] No hanging/freezing

**Expected:** Fast load times

---

### Test 36: Search Performance
1. Programs page
2. Type multiple characters quickly
- [ ] Search responds smoothly
- [ ] Results filter in real-time
- [ ] No lag or freezing

**Expected:** Responsive search

---

### Test 37: Large Dataset Handling
1. Create 20+ training programs
2. Create 50+ assignments
3. Dashboard still loads quickly
- [ ] No performance degradation
- [ ] Dashboard stats accurate
- [ ] Lists scrollable
- [ ] Search still fast

**Expected:** Handles realistic data load

---

## Mobile Responsiveness Tests

### Test 38: Mobile View - Dashboard
1. Open on mobile device / use DevTools mobile view
2. 375px width (iPhone SE)
- [ ] All stat cards visible
- [ ] Cards stack vertically
- [ ] Search box full width
- [ ] Text readable

**Expected:** Responsive layout

---

### Test 39: Mobile View - Programs
1. Training Programs on mobile
2. Program cards responsive
- [ ] Cards stack vertically
- [ ] Edit/Delete buttons visible
- [ ] Search functional

**Expected:** Mobile-friendly

---

### Test 40: Mobile View - Assignments
1. Assignments page on mobile
- [ ] Assignment cards responsive
- [ ] Status dropdown accessible
- [ ] Remove button accessible

**Expected:** Touch-friendly interface

---

## Browser Compatibility Tests

### Test 41: Chrome Browser
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Test 42: Firefox Browser
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Test 43: Safari Browser
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

### Test 44: Edge Browser
- [ ] All features work
- [ ] No console errors
- [ ] Styling correct

---

## Integration Tests

### Test 45: Integration with HR1 Employees
1. Create assignment with employees from HR1
2. Verify:
- [ ] Only "Employee Activated" employees show
- [ ] Employee data (name, position, department) correct
- [ ] Can update status

**Expected:** HR1 employee data correctly integrated

---

### Test 46: Integration with Competency Management
1. Create training linked to competency
2. Dashboard shows skill gaps for that competency
- [ ] Gaps detected correctly
- [ ] Auto-assignment matches competency
- [ ] Levels compared correctly

**Expected:** Competency integration working

---

### Test 47: Integration with Learning Management
1. Create training that could link to course
2. Verify database structure supports course_id
- [ ] Foreign key exists
- [ ] Optional field (nullable)
- [ ] Future course linking possible

**Expected:** Learning Management integration ready

---

## Final Verification

### Test 48: Console Errors
1. Open browser DevTools (F12)
2. Go through all pages
3. Check Console tab
- [ ] No red errors
- [ ] No warnings about undefined functions
- [ ] No CORS errors
- [ ] No unhandled promise rejections

**Expected:** Clean console

---

### Test 49: Network Requests
1. DevTools → Network tab
2. Navigate through pages
3. Check XHR/Fetch requests
- [ ] All requests return 200/OK
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] Response times reasonable

**Expected:** Clean network requests

---

### Test 50: Database Consistency
1. Create data through UI
2. Query Supabase directly
```sql
SELECT COUNT(*) FROM training_programs;
SELECT COUNT(*) FROM employee_trainings;
SELECT COUNT(*) FROM training_evaluations;
```
- [ ] Counts match UI totals
- [ ] Data persists
- [ ] Relationships intact

**Expected:** Data consistent across UI and database

---

## Summary

**Total Tests:** 50  
**Category Breakdown:**
- Database Verification: 4 tests
- Frontend Navigation: 4 tests
- CRUD Operations: 5 tests
- Assignment Features: 7 tests
- Evaluation Features: 6 tests
- Dashboard Features: 4 tests
- Error Handling: 4 tests
- Performance: 3 tests
- Mobile: 3 tests
- Browser Compatibility: 4 tests
- Integration: 3 tests
- Final Checks: 2 tests

**Pass Criteria:** ✅ 48/50 passing (>95% success rate)

---

## Notes

| Test # | Issue Found | Resolution | Status |
|--------|------------|-----------|--------|
|        |            |           |        |
|        |            |           |        |
|        |            |           |        |

---

**Test Date:** ___________  
**Tested By:** ___________  
**Result:** ✅ PASS / ❌ FAIL / 🔄 IN PROGRESS

---

**Next Steps After Testing:**
- [ ] Fix any identified issues
- [ ] Re-test failed scenarios
- [ ] Document any edge cases
- [ ] Update documentation if needed
- [ ] Deploy to production
- [ ] Monitor for issues
