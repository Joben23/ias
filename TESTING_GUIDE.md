# Hiring Process Testing Guide

## Quick Test (5 minutes)

### Step 1: Create a Test Applicant
1. Navigate to **Careers Page** (public)
2. Click any job posting
3. Fill form with test data:
   - Name: `John Doctor`
   - Email: `john.doctor@hospital.com`
   - Phone: `555-0001`
   - Position: Select one
4. Click "Submit Application"
5. Note the applicant ID or name for later

### Step 2: Move Applicant Through Pipeline
1. Go back to **Dashboard > Applicants**
2. Find your test applicant
3. Click on their row to open details
4. **Option A - Manual Status:**
   - Click status dropdown
   - Select "Offer Sent"
5. **Option B - Full Flow:**
   - Select "Shortlisted" → Click "Schedule Interview"
   - Select "Interview Scheduled" → Schedule for today
   - Select "Interview Completed"
   - Select "Selected" → Click "Send Job Offer"
   - Fill in salary, start date, contract type
   - Click "Send Offer"

### Step 3: Accept the Offer
1. In applicant detail dialog
2. Look for the job offer section showing "Offer Sent"
3. Click the blue "Accept Offer" button
4. Confirm offer status now shows "Offer Accepted"

### Step 4: Hire and Create Employee Account
1. Click the green "Hire & Create Employee Account" button
2. Wait for processing (should take 2-5 seconds)
3. **Expected Success Toast:**
```
✅ Applicant Hired Successfully!
Employee Account Created
ID: EMP-2026-0001
Username: john.doctor
Password: MedHire######!
Start Date: 2026-03-25
```

### Step 5: Verify Everything
1. **In Applicants List:**
   - Status should now show "Hired" ✅
   - Icon should show green checkmark ✅

2. **In Employee Directory:**
   - Click "Employee Directory" in sidebar
   - Should see new employee in the list ✅
   - Click to verify their details ✅

3. **In Supabase (Optional):**
   - Go to Supabase Dashboard
   - Check **Authentication > Users**
     - Should see user with email `john.doctor@hospital.com` ✅
   - Check **employees table**
     - Should have new record with employee_id like `EMP-2026-XXXX` ✅
   - Check **user_roles table**
     - Should have role = 'employee' for that user ✅

## Troubleshooting

### ❌ Error: "Job offer not found"
**Cause:** Offer wasn't created or is in wrong status  
**Solution:**
1. Go back to applicant details
2. Make sure they have a job offer shown in the "Job Offer" section
3. Offer status must be either "Offer Sent" or "Offer Accepted"
4. If missing, click "Send Job Offer" first

### ❌ Error: "Applicant not found"
**Cause:** Applicant was deleted or ID is wrong  
**Solution:**
1. Refresh the page
2. Make sure applicant exists in the list
3. Try again with a different applicant

### ❌ Error: "You do not have permission"
**Cause:** User doesn't have HR or Admin role  
**Solution:**
1. Contact system admin
2. Ensure your account has "HR" or "Admin" role
3. Try logging out and back in

### ❌ Error: Other/unclear error
**Solution:**
1. Check browser console for details (F12 → Console tab)
2. Check Supabase function logs:
   - Go to Supabase Dashboard
   - Click "Edge Functions"  
   - Click "hire-applicant"
   - Check "Logs" tab for error details
3. Report the exact error from console/logs

## Database Verification (Advanced)

### Connect to Supabase Database

1. In Supabase Dashboard
2. Click "SQL Editor"
3. Run these queries:

**Check if employee was created:**
```sql
SELECT id, employee_id, full_name, email, position, department, start_date, status, created_at
FROM public.employees
ORDER BY created_at DESC
LIMIT 1;
```

**Check if user was created in auth:**
```sql
SELECT id, email, user_metadata, created_at
FROM auth.users
WHERE email = 'john.doctor@hospital.com';
```

**Check if employee role was assigned:**
```sql
SELECT ur.id, ur.user_id, ur.role, u.email, u.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'employee'
ORDER BY ur.id DESC
LIMIT 5;
```

**Check if applicant status updated:**
```sql
SELECT id, full_name, email, position_applied, department, status, created_at
FROM public.applicants
WHERE email = 'john.doctor@hospital.com';
```

All four queries should return results showing the new records.

## Performance Notes

- Hiring process should complete in 2-5 seconds
- If taking longer than 10 seconds, there might be a timeout issue
- Check Edge Function logs for performance issues

## Test Scenarios

### Test 1: Basic Flow (REQUIRED)
- [ ] Applicant created
- [ ] Moved to "Offer Accepted" status
- [ ] Hired successfully
- [ ] Employee appears in directory

### Test 2: Error Handling
- [ ] Try hiring applicant without offer → See helpful error
- [ ] Try hiring with "Offer Sent" (not accepted) → Should work
- [ ] Refresh after hiring → Confirm status persists

### Test 3: Multiple Hires
- [ ] Hire 2-3 different applicants in sequence
- [ ] Verify each gets unique Employee ID (EMP-2026-0001, 0002, 0003)
- [ ] Check all appear in Employee Directory

### Test 4: Data Validation
- [ ] Employee has correct name, email, position, department
- [ ] Start date matches job offer
- [ ] User has correct role in auth system
- [ ] Profile updated with all data

## Success Criteria ✅

You'll know the fix is working when:

1. ✅ No error when clicking "Hire & Create Employee Account"
2. ✅ Success toast appears with employee credentials
3. ✅ Applicant status changes to "Hired"
4. ✅ New employee appears in Employee Directory
5. ✅ Employee ID generated (EMP-2026-XXXX format)
6. ✅ New user exists in Supabase Auth
7. ✅ User has "employee" role assigned

If all 7 items pass → **The fix is working! 🎉**

## Next Steps

Once confirmed working:
1. Test with real applicants
2. Train HR team on the new hire flow
3. Monitor for any issues
4. Customize employee onboarding flow if needed
