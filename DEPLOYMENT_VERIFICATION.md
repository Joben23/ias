# Deployment Verification Checklist

## Before Testing

### 1. **Ensure Edge Function is Deployed**

**Method A: Check Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Edge Functions
4. Look for `hire-applicant` function
5. Check status:
   - ✅ Should show green checkmark or "Ready"
   - ❌ Should NOT show "Failed", "Error", or download icon

**Method B: Check Terminal**
```bash
# If you have Supabase CLI installed:
supabase functions list
# Should show: send-interview-notification, send-password-reset-email, hire-applicant (all Ready)

# Or redeploy manually:
supabase functions deploy hire-applicant
```

**Method C: Direct API Call (Test)**
```bash
# Open Supabase Dashboard → Functions → hire-applicant → Test Invite
# And run the test to verify function responds
```

### 2. **Environment Variables Configured**

In Supabase Dashboard → Project Settings → General:
- ✅ Project URL: `https://[project-id].supabase.co`
- ✅ Anon Key: `eyJ...` (long string)
- ✅ Service Role Key: `eyJ...` (long string, with `aGVhZGVyc` in it)

Edge function accesses via:
- `SUPABASE_URL` (environment automatic)
- `SUPABASE_SERVICE_ROLE_KEY` (environment automatic)

### 3. **Database Migrations Applied**

Verify all tables exist:
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should include:
- ✅ applicants
- ✅ employees
- ✅ job_offers
- ✅ email_logs
- ✅ profiles
- ✅ user_roles

### 4. **File Structure Correct**

Verify edge function file:
```bash
# File should exist at:
supabase/functions/hire-applicant/index.ts

# File should NOT be empty
# File should contain: import, Deno.serve, [HIRE] logs
```

### 5. **Code Quality Checks**

Edge function **MUST HAVE**:
```typescript
✅ import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
✅ const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
✅ console.log('[HIRE] Function started')
✅ Deno.serve(async (req) => { ... })
```

Edge function **MUST NOT HAVE**:
```typescript
❌ supabaseUser.auth.getUser()  // This causes 401 errors
❌ new Headers() setup manually  // Use corsHeaders constant
❌ error: 'Unauthorized'  // from auth verification
```

---

## Deployment Steps (If Needed)

### Using Supabase CLI

```bash
# 1. Ensure you're logged in
supabase login

# 2. Link to project
supabase link --project-ref [project-id]

# 3. Deploy just the function
supabase functions deploy hire-applicant

# 4. Check status
supabase functions list
```

### Using Browser UI

1. Go to Supabase Dashboard
2. Functions → hire-applicant
3. Click three dots → Redeploy
4. Wait for "Ready" status

### Verify Deployment

```bash
# Check logs appear
supabase functions logs hire-applicant --limit 20

# Or check via curl
curl https://[project-id].supabase.co/functions/v1/hire-applicant \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"applicant_id": "test"}' \
  -i
```

---

## Common Deployment Issues

### Function shows "Failed" status

**Solution:**
1. Click the function
2. Scroll to "Logs" section
3. Read error message carefully
4. Common issues:
   - Import error: Fix import URL syntax
   - Env var missing: Add to function secrets
   - Syntax error: Check TypeScript/JavaScript syntax

### Getting `404 Not Found` when calling function

**Solution:**
1. Verify function name is exactly: `hire-applicant`
2. Check spelling (case-sensitive on Linux)
3. Verify function is marked "Ready" (not "Failed")
4. Try redeploy

### Getting `403 Forbidden` error

**Solution:**
1. Check you're using service role key (not anon key)
2. Verify Authorization header is set correctly
3. Check edge function CORS headers are set:
   ```typescript
   headers: { ...corsHeaders, 'Content-Type': 'application/json' }
   ```

---

## Final Pre-Test Checklist

- [ ] Edge function shows "Ready" in dashboard
- [ ] Your test applicant exists with valid email
- [ ] Job offer created with start_date in future
- [ ] Job offer accepted (status = "Offer Accepted")
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Dev server restarted (Ctrl+C, npm run dev)
- [ ] DevTools console open and ready
- [ ] Supabase function logs accessible

Then follow: **HIRING_DEBUG_GUIDE.md** → Step-by-Step Test Process
