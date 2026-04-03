# Email Notification Implementation Guide

## Overview

This guide explains the complete email notification system for scheduling interviews with applicants in the HR management system.

---

## Architecture

### Components Involved

```
┌─────────────────────────────────────────────────────────┐
│         Schedule Interview Dialog (React Component)     │
│  - Pre-populates applicant's email                      │
│  - Allows HR to set interview details                   │
│  - Shows email status feedback                          │
└────────────────┬────────────────────────────────────────┘
                 │ Creates interview & triggers email
                 ▼
┌─────────────────────────────────────────────────────────┐
│    Supabase Edge Function (send-interview-notification) │
│  - Fetches interview & applicant data                   │
│  - Generates professional HTML email                    │
│  - Sends via Resend API                                 │
│  - Logs all send attempts to database                   │
└────────────────┬────────────────────────────────────────┘
                 │ Records email send
                 ▼
┌─────────────────────────────────────────────────────────┐
│            Database Tables & Tracking                    │
│  - interviews: Stores email_sent, email_sent_at, etc.   │
│  - email_logs: Tracks all email sends with status       │
│  - applicants: Updated with status "Interview Scheduled"│
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### New Table: `email_logs`

Tracks all sent emails with detailed logging:

```sql
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES public.interviews(id),
  applicant_id uuid NOT NULL REFERENCES public.applicants(id),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  template_type text DEFAULT 'interview_invitation',
  status text DEFAULT 'pending', -- pending, sent, failed, bounced
  resend_id text, -- ID from Resend API
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Updated Table: `interviews`

New columns added to track email status:

```sql
ALTER TABLE public.interviews 
ADD COLUMN email_sent boolean DEFAULT false;
ADD COLUMN email_sent_at timestamptz;
ADD COLUMN last_email_resend_id text;
```

---

## Features Implemented

### 1. ✅ Applicant Email Auto-Population

**File**: `src/components/hr/ScheduleInterviewDialog.tsx`

When the Schedule Interview dialog opens:
- Loads applicant's email automatically
- Displays email in a highlighted info box
- Shows warning if no email found
- Disables submission if email issues exist

```typescript
useEffect(() => {
  if (open && applicantId) {
    loadApplicantEmail();
  }
}, [open, applicantId]);

const loadApplicantEmail = async () => {
  const { data } = await supabase
    .from('applicants')
    .select('email')
    .eq('id', applicantId)
    .single();
  
  if (data?.email) {
    setApplicantEmail(data.email);
  }
};
```

### 2. ✅ Professional HTML Email Templates

**File**: `supabase/functions/send-interview-notification/index.ts`

Generates beautiful, responsive HTML emails with:
- Pre-header text
- Company branding with gradients
- Interview details in structured boxes
- Pre-interview tips
- Professional email signature
- Support contact information

Example HTML structure:
```html
<div class="container">
  <div class="header">Interview Invitation</div>
  <div class="detail-box">
    <div>📅 Interview Date: [DATE]</div>
    <div>⏰ Interview Time: [TIME]</div>
    <div>🎯 Interview Type: [TYPE]</div>
    <div>📍 Location / 🔗 Meeting Link: [LINK]</div>
  </div>
</div>
```

### 3. ✅ Email Logging & Tracking

**File**: `supabase/migrations/20260326_create_email_logs.sql`

Every email send is logged with:
- Status tracking: `pending`, `sent`, `failed`, `bounced`
- Resend API ID for integration tracking
- Error messages for debugging
- Timestamp of send attempt
- Recipient email and subject

### 4. ✅ Error Handling & Recovery

The updated edge function provides:
- Graceful fallback if Resend API key not set
- Detailed error logging with reason codes
- Interview creation completes even if email fails
- Applicant status updated regardless of email status
- User feedback on email delivery status

### 5. ✅ User Feedback & Status Display

Dialog shows:
- ✓ Email loaded and ready to send
- ⚠ Missing email address warning
- 🔄 Loading state while fetching
- ✔ Success message when interview scheduled and email sent
- ✗ Error messages if any step fails

---

## Step-by-Step: Scheduling an Interview with Email

### Frontend Flow (HR Dashboard)

1. **Open Applicants Page**
   - Navigate to `HR1 > Applicants`

2. **Select an Applicant**
   - Click on an applicant card
   - Open applicant detail view

3. **Click Schedule Interview**
   - Opens `ScheduleInterviewDialog` modal
   - Component automatically loads applicant's email
   - Displays email in confirmation box

4. **Fill Interview Details**
   ```
   Date: [Select date]
   Time: [Select time]
   Type: [On-site OR Online]
   Location/Link: [Enter details based on type]
   Panel Members: [Select interviewers]
   Notes: [Any additional notes]
   ```

5. **Submit**
   - Click "Schedule Interview" button
   - Loading state shows "Scheduling..."

### Backend Flow (Edge Function)

1. **Interview Created** (PostgreSQL)
   ```sql
   INSERT INTO interviews (applicant_id, interview_date, interview_time, ...)
   ```

2. **Edge Function Invoked** (send-interview-notification)
   ```typescript
   supabase.functions.invoke('send-interview-notification', {
     body: { interview_id: interviewId }
   })
   ```

3. **Email Function Executes**
   - Fetches interview details
   - Fetches applicant info (name, email, position)
   - Generates professional HTML email
   - Sends via Resend API
   - Logs result to email_logs table

4. **Updates Recorded** (PostgreSQL)
   ```sql
   UPDATE interviews SET 
     email_sent = true,
     email_sent_at = now(),
     last_email_resend_id = 'resend-id-123'
   
   UPDATE applicants SET status = 'Interview Scheduled'
   
   INSERT INTO email_logs (...)
   ```

---

## Email Sending Configuration

### Setting Up Resend API

1. **Get Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Create API key from dashboard
   - Limit key permissions for security

2. **Configure in Supabase**
   - Go to Supabase Dashboard → Settings → Secrets
   - Add secret: `RESEND_API_KEY=your_api_key_here`
   - Function will automatically use this

3. **Configure Sender Email**
   - Update sender email in edge function:
     ```typescript
     from: 'HR Team <onboarding@resend.dev>'
     ```
   - Must be authorized sender in Resend account

### Testing Without Resend API

If Resend API key is not configured:
- Email logs are created with status `pending`
- Function returns with warning message
- No actual email sent
- All other functionality works normally

---

## Monitoring & Debugging

### View Email Logs

Query email_logs table to monitor sends:

```sql
SELECT 
  email_logs.*,
  applicants.full_name,
  applicants.position_applied
FROM email_logs
LEFT JOIN applicants ON email_logs.applicant_id = applicants.id
ORDER BY email_logs.created_at DESC
LIMIT 20;
```

### Check Email Status by Interview

```sql
SELECT 
  interviews.id,
  interviews.interview_date,
  interviews.email_sent,
  interviews.email_sent_at,
  email_logs.status as last_email_status,
  email_logs.error_message
FROM interviews
LEFT JOIN email_logs ON interviews.id = email_logs.interview_id
WHERE interviews.id = 'INTERVIEW_ID'
ORDER BY email_logs.created_at DESC;
```

### Failed Emails

```sql
SELECT 
  email_logs.*,
  applicants.email,
  applicants.full_name
FROM email_logs
LEFT JOIN applicants ON email_logs.applicant_id = applicants.id
WHERE email_logs.status = 'failed'
ORDER BY email_logs.created_at DESC;
```

---

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Applicant email not found" | No email on record | Add email to applicant profile |
| "RESEND_API_KEY not configured" | Missing API key in secrets | Add Resend API key to Supabase |
| "Failed to send email: 400" | Invalid email format | Check applicant email is valid |
| "Failed to send email: 429" | Rate limit exceeded | Wait before sending more emails |
| "Interview not found" | Interview ID doesn't exist | Ensure interview was created first |
| "Applicant not found" | Applicant ID invalid | Verify applicant exists |

---

## Security & Compliance

### Row Level Security (RLS) Policies

Email logs have RLS enabled:
- **View**: Authenticated users can view all logs
- **Manage**: Only HR and Admin roles can modify
- **Applicant Privacy**: Emails aren't visible to external users

### Data Protection

- Email addresses only used for interview invitations
- No unsolicited marketing emails
- Resend API handles email delivery securely
- Logs retained for audit trail

---

## TypeScript Types

### Email Log Record

```typescript
interface EmailLog {
  id: string;
  interview_id: string;
  applicant_id: string;
  recipient_email: string;
  subject: string;
  template_type: 'interview_invitation' | 'interview_reminder' | 'followup';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### Interview with Email Tracking

```typescript
interface InterviewWithEmail {
  id: string;
  applicant_id: string;
  interview_date: string;
  interview_time: string;
  interview_type: 'On-site' | 'Online';
  location: string | null;
  meeting_link: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  last_email_resend_id: string | null;
  // ... other fields
}
```

---

## Future Enhancements

### Planned Features

1. **Interview Reminders**
   - Send reminder emails 24 hours before interview
   - Template: `interview_reminder`

2. **Rejection Notifications**
   - Automatic email when applicant status changed to "Rejected"
   - Template: `rejection_notification`

3. **Offer Letters**
   - Email offer letter when job_offers created
   - Template: `offer_letter`

4. **Email Templates Management**
   - UI to customize email templates
   - Multiple template versions
   - A/B testing support

5. **Retry Logic**
   - Automatic retry for failed emails
   - Exponential backoff strategy
   - Max retry configuration

---

## Support & Troubleshooting

### Common Issues

**Q: Email not received by applicant**
- A: Check email_logs for status and error message
- Verify recipient email is correct
- Check Resend dashboard for bounces

**Q: Interview created but email not sent**
- A: Check Resend API key is configured
- Check email_logs table for error details
- Verify applicant has email address

**Q: Can't see applicant email in dialog**
- A: Email loads asynchronously - wait a moment
- Check browser console for errors
- Verify applicant record exists and has email

### Getting Help

1. Check email_logs table for status
2. Review function logs in Supabase dashboard
3. Verify all configurations are set correctly
4. Check network tab in browser DevTools

---

## Maintenance

### Regular Tasks

- Monitor email_logs table for failures
- Review bounce rates in Resend dashboard
- Clean up old email logs (archive yearly)
- Test email sending monthly

### Performance

- Email_logs table has indexes on:
  - interview_id
  - applicant_id
  - status
  - created_at

### Backups

- Include email_logs in regular database backups
- Retain logs for minimum 12 months for audit trail

---

## Summary

The email notification system provides:

✅ Automatic email invitations when interviews scheduled
✅ Professional, branded HTML emails
✅ System-wide email tracking and logging
✅ Graceful error handling with user feedback
✅ Security with RLS policies
✅ Extensible template system for future emails
✅ Complete audit trail

**Files Modified/Created:**
- `supabase/migrations/20260326_create_email_logs.sql` - New table
- `supabase/functions/send-interview-notification/index.ts` - Enhanced function
- `src/components/hr/ScheduleInterviewDialog.tsx` - Enhanced dialog
- This guide: `EMAIL_NOTIFICATION_GUIDE.md`

