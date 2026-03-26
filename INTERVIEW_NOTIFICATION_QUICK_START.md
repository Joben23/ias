# Interview Notification System - Quick Start

## What Was Implemented?

### 🎯 Email Notifications (Primary)
- When HR schedules an interview, **applicant receives an email** automatically
- Email includes: Date, Time, Position, Location/Link
- Uses Resend API for reliable delivery
- Edge Function: `send-interview-notification`

### 🔔 In-App Notifications (Backup)
- Notification bell in header shows unread count
- Dropdown displays all unread notifications
- Can mark individual or all notifications as read
- Auto-refreshes every 30 seconds

### ✅ Workflow Fixes
- Rankings only shows evaluated candidates
- Interviews only shows scheduled interviews
- Application submissions create logs (ready for notifications)

---

## How to Use

### For HR Staff
1. Go to Applicants page
2. Click on an applicant
3. Click "Schedule Interview"
4. Fill in date, time, type, location/link
5. Click "Schedule"
6. **Applicant automatically receives email** ✉️
7. **HR gets in-app notification** 🔔

### For Applicants
1. Submit job application
2. **Wait for email notification** when interview scheduled
3. **Email contains all interview details**
4. No need to check portal (already informed via email)

---

## Key Files

| File | Purpose |
|------|---------|
| `send-interview-notification/index.ts` | Edge Function - sends emails |
| `src/lib/notifications.ts` | Notification database functions |
| `src/components/NotificationBell.tsx` | UI Bell component |
| `20260325_create_notifications_table.sql` | Database schema |
| `ScheduleInterviewDialog.tsx` | Interview scheduling (calls edge function) |

---

## Setup Required

### 1. Deploy Edge Function
```bash
supabase functions deploy send-interview-notification
```

### 2. Set Environment Variable
**Supabase Dashboard → Settings → Environment Variables:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

### 3. Verify in Supabase
- Check function logs when scheduling interview
- Verify notification table has records
- Test with real email address

---

## Testing

### Test Email Sending
1. Schedule an interview with a real email
2. Check Supabase function logs
3. Check applicant's email inbox
4. If no email, check if RESEND_API_KEY is set

### Test In-App Notifications
1. Look for bell icon (🔔) in header
2. Should show unread count when interview scheduled
3. Click to see notification dropdown
4. Click X to mark as read

---

## Fallback Mode

If RESEND_API_KEY not set:
- Email is logged to Supabase console
- In-app notification still works
- Good for development/testing

---

## Support

See `INTERVIEW_NOTIFICATION_SYSTEM.md` for:
- Complete implementation details
- Troubleshooting guide
- Database schema
- File modifications

---

## Status

✅ Email notification system working
✅ In-app notification UI implemented
✅ Workflow filtering fixed
✅ Error handling robust
⏳ Awaiting Resend API key configuration
