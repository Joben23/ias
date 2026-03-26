# Interview Notification System - Complete Setup & Testing Guide

## 📚 DOCUMENTATION STRUCTURE

1. **README.md** - Project overview and setup instructions
2. **INTERVIEW_NOTIFICATION_QUICK_START.md** - Quick reference for HR staff
3. **INTERVIEW_NOTIFICATION_SYSTEM.md** - Detailed technical documentation
4. **IMPLEMENTATION_SUMMARY.md** - What was built and why
5. **SETUP_AND_TESTING_GUIDE.md** - This file - complete deployment walkthrough

---

## 🚀 DEPLOYMENT CHECKLIST

### Prerequisites
- [ ] Node.js & npm installed
- [ ] Supabase CLI installed (`npm install -g @supabase/cli`)
- [ ] Supabase project created
- [ ] Git repository configured
- [ ] Resend account created (https://resend.com)

### Step 1: Clone and Setup Project
```bash
# Clone the repository
git clone <your-git-url>
cd ias

# Install dependencies
npm install

# Create environment file if needed
cp .env.example .env.local
```

### Step 2: Configure Supabase
```bash
# Link to your Supabase project
supabase link

# You'll be asked for:
# - Project ID (find in Supabase dashboard)
# - Database password (use the one from Supabase)

# Start local development server
supabase start
```

### Step 3: Generate Resend API Key
1. Go to https://resend.com
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Click **+ New API Key**
5. Name it "Hospital HR System"
6. Copy the key (starts with `re_`)
7. **Save somewhere safe** - you'll need it

### Step 4: Set Environment Variables in Supabase
```bash
# Open Supabase dashboard
# Navigate to: Settings → Environment Variables

# Add:
RESEND_API_KEY=re_your_api_key_here

# Then click Save
```

### Step 5: Deploy Edge Function
```bash
# Deploy the send-interview-notification function
supabase functions deploy send-interview-notification

# Verify deployment
supabase functions list

# You should see: send-interview-notification   deployed
```

### Step 6: Apply Database Migrations
```bash
# Push all migrations to database
supabase db push

# Verify migrations applied successfully
supabase db tables list

# You should see: notifications table in the list
```

### Step 7: Start Development Server
```bash
# In a new terminal
npm run dev

# Should show:
# > vite dev
# ➜ Local: http://localhost:5173/
```

---

## 🧪 TESTING WORKFLOW

### Test 1: Email Notification on Interview Scheduling

**Setup**:
- Have a real email address handy (Gmail works well)
- Create a test applicant (if not already in database)

**Steps**:
1. Navigate to HR Dashboard → Applicants
2. Click on an applicant
3. Click "Schedule Interview"
4. Fill in details:
   - **Date**: Tomorrow (or any future date)
   - **Time**: 14:30 (2:30 PM)
   - **Type**: Online
   - **Meeting Link**: https://meet.google.com/your-link
   - **Panel**: Select at least one member
5. Click "Schedule"

**Expected**:
- ✅ Interview created in database
- ✅ Success toast appears
- ✅ Notification bell shows unread count
- ✅ Email sent to applicant

**Verify Email**:
1. Check applicant's email inbox (may take 30 seconds)
2. Look for subject: "Your Interview Has Been Scheduled"
3. Email should contain:
   - Position Applied
   - Interview Date (formatted)
   - Interview Time
   - Interview Type
   - Meeting Link

**If Email Not Received**:
- Check Supabase function logs:
  ```bash
  supabase functions logs send-interview-notification
  ```
- Look for errors:
  - `RESEND_API_KEY not set` → Set environment variable
  - `Invalid JSON` → Check request body
  - `Applicant email not found` → Verify applicant has email
  - `Failed to send email` → Check Resend API key validity

### Test 2: In-App Notifications

**Setup**:
- Complete Test 1 first

**Steps**:
1. Look at top navigation bar
2. You should see bell icon (🔔)
3. Bell should show unread count badge
4. Click bell to open dropdown
5. Should see notification:
   - Icon: 📅
   - Title: "Interview Scheduled"
   - Message: "Interview scheduled for [Name] on [Date] at [Time]"
   - Timestamp

**Verify**:
- [ ] Notification appears in dropdown
- [ ] Unread count badge shows number
- [ ] Click X to mark as read
- [ ] Count decreases by 1
- [ ] Notification disappears from dropdown

### Test 3: Notifications Auto-Refresh

**Steps**:
1. Open HR Dashboard in two browser tabs
2. In Tab 1: Schedule an interview
3. In Tab 2: Watch the bell icon
4. Within 30 seconds, notification should appear
5. Badge count should increase

**Expected**:
- [ ] Notifications appear without manual refresh
- [ ] Auto-refresh works every 30 seconds
- [ ] Notifications persist across navigation

### Test 4: Mark All Notifications as Read

**Steps**:
1. Schedule multiple interviews (creates multiple notifications)
2. Open notification dropdown
3. Click "Mark all as read"
4. All notifications should disappear

**Expected**:
- [ ] Badge count goes to 0
- [ ] Dropdown shows "No new notifications"
- [ ] Mark all button disappears

### Test 5: Workflow Filtering

**Test Rankings**:
1. Go to HR Dashboard → Rankings
2. Should only show applicants WITH evaluations
3. Verify no unevaluated applicants appear

**Test Interviews**:
1. Go to HR Dashboard → Interviews
2. Schedule an interview (from Test 1)
3. Interview should appear in "Scheduled" section
4. Should show interview details correctly

---

## 🐛 DEBUGGING

### Check Edge Function Logs
```bash
# View real-time logs
supabase functions logs send-interview-notification --tail

# You'll see logs like:
# 2026-03-25 14:30:45 Send Interview Notification Edge Function called at 2026-03-25T14:30:45.123Z
# 2026-03-25 14:30:45 Processing notification for interview_id: abc-123
# 2026-03-25 14:30:46 Email sent successfully, Resend ID: msg_abc123xyz
```

### Check Browser Console
```javascript
// Open DevTools (F12)
// Look for errors in Console tab

// Common errors:
// - CORS error → Check corsHeaders in edge function
// - TypeError: Cannot read property 'id' → Data issue
// - Unauthorized → Check authentication
```

### Check Database
```bash
# Connect to database
supabase db connect

# Check notifications table
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5;

# Check interviews table
SELECT * FROM public.interviews ORDER BY created_at DESC LIMIT 5;

# Check if user exists
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

### Check Resend API
1. Go to https://resend.com/dashboard
2. Click "Emails"
3. Should see sent emails
4. Click on email to see details
5. Check if delivered or bounced

---

## 💾 TROUBLESHOOTING

### Issue: "RESEND_API_KEY not set" in logs

**Solution**:
1. Go to Supabase Dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_key_here`
4. Redeploy function:
   ```bash
   supabase functions deploy send-interview-notification
   ```

### Issue: Email sent but not received

**Possible Causes**:
1. Email in spam folder → Check spam/promotions
2. Resend domain not verified → Use `onboarding@resend.dev` for testing
3. Invalid email address → Verify format is correct
4. Email bounced → Check Resend dashboard for bounce reason

**Solution**:
1. For testing: Use Gmail or other major providers
2. Verify applicant email: `SELECT email FROM applicants WHERE id = 'xyz'`
3. Check Resend dashboard for bounce/failure reasons

### Issue: Notifications not showing in dropdown

**Possible Causes**:
1. RLS policies blocking access
2. Not authenticated
3. No notifications created
4. Browser cache issue

**Solution**:
1. Verify user is logged in
2. Check browser console for errors
3. Try hard refresh (Ctrl+F5)
4. Check database for notifications:
   ```bash
   SELECT * FROM notifications WHERE user_id = current_user_id;
   ```

### Issue: Edge function deployment fails

**Solution**:
```bash
# Check syntax
supabase functions lint send-interview-notification

# Check logs
supabase functions logs send-interview-notification

# Redeploy with force
supabase functions deploy --no-verify send-interview-notification
```

---

## 📊 PERFORMANCE OPTIMIZATION

### Notification Polling
- Currently: Fetches every 30 seconds
- Can be optimized: Use Supabase Realtime for instant updates
- File to modify: `src/components/NotificationBell.tsx` (lines 19-21)

### Database Indexes
Already created for:
- user_id (fast filtering by user)
- is_read (fast filtering for unread)
- created_at (fast sorting)

### Notification Retention
- Currently: Keeps all notifications
- Consider: Archive old notifications after 30 days
- Can be added: Cron job in Supabase

---

## 🎯 PRODUCTION CHECKLIST

Before going live:

- [ ] Email domain verified in Resend
- [ ] Change email from: `onboarding@resend.dev` to your domain
- [ ] Test with real applicants
- [ ] Monitor email delivery for first week
- [ ] Set up email template (optional)
- [ ] Configure notification retention policy
- [ ] Set up backup notifications (SMS) - future feature
- [ ] Train HR staff on notification system
- [ ] Create help documentation for applicants

---

## 📱 USER GUIDANCE

### For HR Staff

**Scheduling Interviews**:
1. Go to Applicants page
2. Click on applicant name
3. Click "Schedule Interview"
4. Fill in all details
5. Click "Schedule"
6. ✅ Email automatically sent to applicant

**Checking Notifications**:
1. Look for bell icon (🔔) in top right
2. Red badge shows unread count
3. Click to see notification list
4. Click X to mark as read

### For Applicants

**What They'll Receive**:
- Email with interview details when scheduled
- Interview date, time, location/link included
- Can reply to email if they have questions

**What They Should Do**:
- Check email for interview notification
- Add meeting link to calendar
- Prepare for interview
- Arrive 10 minutes early (if on-site)

---

## 🔄 UPDATE & MAINTENANCE

### Regular Tasks
- [ ] Monitor edge function logs weekly
- [ ] Check email delivery rates
- [ ] Clear old notifications (monthly)
- [ ] Update email template (as needed)
- [ ] Review notification types usage

### Upgrade Path
Future enhancements planned:
- SMS notifications
- Slack integration
- Calendar invitations
- Email templates with branding
- Notification scheduling (send at specific times)
- Bulk notification sending

---

## ✅ FINAL VERIFICATION

After deployment, verify:

```checklist
- [ ] Edge function deployed successfully
- [ ] RESEND_API_KEY set in environment
- [ ] Database migrations applied
- [ ] Notifications table exists
- [ ] NotificationBell shows in header
- [ ] Can schedule interview without errors
- [ ] Email received by applicant within 1 minute
- [ ] Notification appears in dropdown
- [ ] Can mark notifications as read
- [ ] Auto-refresh works (30 seconds)
- [ ] No console errors
- [ ] No database errors in logs
```

---

## 🎉 YOU'RE READY!

The Interview Notification System is now fully deployed and ready for use.

**Next Steps**:
1. Test with real data
2. Train HR team
3. Inform applicants about email notifications
4. Monitor for 1 week
5. Optimize based on feedback

**Questions?** Review the documentation:
- Quick questions → See INTERVIEW_NOTIFICATION_QUICK_START.md
- Technical issues → See INTERVIEW_NOTIFICATION_SYSTEM.md
- Architecture → See IMPLEMENTATION_SUMMARY.md

**Support**: Check Supabase logs for any errors:
```bash
supabase functions logs send-interview-notification --tail
```
