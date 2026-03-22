# Edge Function Debugging Guide

## What Was Fixed

The Edge Function `/supabase/functions/hire-applicant/index.ts` now:

✅ Accepts both 'Offer Sent' AND 'Offer Accepted' job offer statuses  
✅ Validates all database operations with error checking  
✅ Uses applicant's real email instead of generated one  
✅ Creates employee record with correct fields only  
✅ Returns explicit HTTP 200 on success  
✅ Provides detailed error messages  
✅ Logs errors for debugging  

## How to View Edge Function Logs

### Method 1: Supabase Dashboard

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Functions** in sidebar
4. Click **hire-applicant**
5. Click **Logs** tab at the top
6. You should see recent invocations

### Method 2: Real-time Logs

```bash
# If you have Supabase CLI installed
supabase functions list
supabase functions logs hire-applicant --tail
```

### Method 3: Browser Console

1. Open your app in browser
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Perform the hiring action
5. Look for logged errors (shown in red)

## Expected Log Output - Success

```
Status: 200
Response: {
  "message": "Employee account created successfully",
  "employee_id": "EMP-2026-0001",
  "username": "john.doctor",
  "password": "MedHire######!",
  "email": "john.doctor@hospital.com",
  "position": "Doctor",
  "department": "Cardiology",
  "start_date": "2026-03-25"
}
```

## Expected Log Output - Error Scenarios

### Error: Job Offer Not Found

```
Status: 404
Response: {
  "error": "Job offer not found. Please ensure offer is created and accepted."
}
```

**Why this happens:**
- Applicant doesn't have a job offer
- Job offer is in "Offer Declined" status
- Job offer is for a different applicant

**Fix:**
- Create job offer first
- Accept the offer before hiring

### Error: Applicant Not Found

```
Status: 404
Response: {
  "error": "Applicant not found",
  "details": "optional error details"
}
```

**Why this happens:**
- Applicant ID is wrong
- Applicant was deleted
- Database connectivity issue

**Fix:**
- Verify applicant exists in list
- Try refreshing page
- Contact support if persists

### Error: Failed to Create Auth User

```
Status: 500
Response: {
  "error": "Failed to create auth user: User with this email already exists"
}
```

**Why this happens:**
- User with same email already exists (duplicate hire)
- Email is invalid
- Auth service is down

**Fix:**
- Use different applicant
- Check if user already created in Supabase Auth
- Wait and retry if service issue

### Error: Failed to Assign Role

```
Status: 500
Response: {
  "error": "Failed to assign role: duplicate key value violates unique constraint \"user_roles_user_id_role_key\""
}
```

**Why this happens:**
- Role was already assigned to this user
- Database constraint issue

**Fix:**
- Verify user_roles table in Supabase
- Contact support if persists

### Error: Server Error

```
Status: 500
Response: {
  "error": "Server error: [specific error message]"
}
```

**Why this happens:**
- Unexpected exception occurred
- Edge Function crashed
- Environment variables missing

**Fix:**
- Check Edge Function logs
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
- Report the specific error message

## Code Flow Explanation

```
┌─ START: User clicks "Hire & Create Employee Account"
│
├─ 1. VALIDATE INPUT
│  └─ Check applicant_id is provided
│
├─ 2. FETCH APPLICANT DATA
│  └─ Get full applicant record from database
│  └─ Check applicant exists
│
├─ 3. CREATE AUTH USER
│  └─ Use applicant.email (not generated email)
│  └─ Generate random password
│  └─ Set email_confirm = true (skip verification)
│
├─ 4. ASSIGN EMPLOYEE ROLE
│  └─ Create user_roles record with role='employee'
│
├─ 5. UPDATE PROFILE
│  └─ Update user's profile with department, role, etc.
│  └─ Profile was auto-created by trigger from step 3
│
├─ 6. FETCH JOB OFFER
│  └─ Search for offer with status IN ['Offer Sent', 'Offer Accepted']
│  └─ Use latest offer if multiple exist
│
├─ 7. GENERATE EMPLOYEE ID
│  └─ Count total employees in database
│  └─ Generate ID like EMP-2026-0001
│
├─ 8. CREATE EMPLOYEE RECORD
│  └─ Insert into employees table with:
│     - user_id, applicant_id, employee_id
│     - full_name, email, phone
│     - position, department, start_date, status='Active'
│
├─ 9. UPDATE APPLICANT STATUS
│  └─ Set applicant.status = 'Hired'
│
└─ RETURN SUCCESS (Status 200)
   └─ Include employee_id, username, password, etc.
```

## Error Checking Locations

Each database operation now checks for errors:

```typescript
// Example error pattern used throughout

const { error: roleError } = await supabaseAdmin.from('user_roles').insert({...});

if (roleError) {
  return new Response(JSON.stringify({ 
    error: `Failed to assign role: ${roleError.message}` 
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

This pattern is used after:
- Assign employee role
- Update profile
- Create employee record
- Update applicant status

## Testing the Fix Locally

### Step 1: Deploy Updated Function

```bash
# From project root
supabase functions deploy hire-applicant
```

### Step 2: Tail the Logs

```bash
supabase functions logs hire-applicant --tail
```

### Step 3: Trigger in UI

1. Go to app
2. Create applicant
3. Move to "Offer Accepted"
4. Click "Hire"
5. Watch logs in terminal

### Step 4: Check Output

Should see:
```
[SUCCESS] POST /functions/v1/hire-applicant - 200
```

Not:
```
[ERROR] POST /functions/v1/hire-applicant - 500
```

## Common Issues & Solutions

### Issue: "CORS Error"
**Solution:** CORS headers are set correctly. Try:
1. Refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Try in incognito mode

### Issue: "Timeout (>30 seconds)"
**Solution:** Edge Function should complete in <5 seconds. If slower:
1. Check database connectivity
2. Check Supabase region
3. Look for slow queries in logs

### Issue: "Email already exists"
**Solution:** User was partially created. To fix:
1. Delete auth user from Supabase
2. Delete employee record if created
3. Try hiring again

### Issue: "No response data"
**Solution:** Function succeeded but no data returned:
1. Check if it's in success state in Supabase Auth
2. Verify employee record was created
3. Check profiles were updated

## Monitoring in Production

### Monitor These Metrics:
- Function execution time (should be < 5s)
- Success vs failure rate
- Common error types
- Auth user creation rate

### Set Alerts For:
- Function errors (>5% failure rate)
- Execution time (> 10 seconds)
- Specific errors repeated (e.g., "Job offer not found")

## Rollback Plan (If Issues)

If the fixed version causes problems:

1. Revert to backup:
```bash
git checkout HEAD -- supabase/functions/hire-applicant/index.ts
git checkout HEAD -- src/components/hr/ApplicantDetailDialog.tsx
supabase functions deploy hire-applicant
```

2. Contact support with error logs

## Performance Benchmarks

After fix, hiring should complete in:
- **< 1 second**: Fast network, all systems operational
- **1-3 seconds**: Normal network latency
- **3-5 seconds**: High latency or high database load
- **> 5 seconds**: Slow database or network issues

If consistently > 5s, check:
- Database performance
- Network connectivity
- Supabase region health
