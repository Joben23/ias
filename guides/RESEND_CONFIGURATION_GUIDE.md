# Resend API Configuration Guide

## Overview

This guide explains how to configure the Resend API for professional email delivery in the HR Management System. The system supports two email notifications:
1. Interview scheduling invitations
2. Employee notifications (password resets, announcements)

## Configuration Steps

### Step 1: Add Resend API Key to Supabase Secrets

1. **Log in to Supabase Console**
   - Navigate to your Supabase project dashboard
   - Go to **Settings → Secrets** in the left sidebar

2. **Add New Secret**
   - Click **"New secret"**
   - Name: `RESEND_API_KEY`
   - Value: `re_ctrKtFF5_6FjukC2hQTueA7qKvx8nwHQt`
   - Click **"Save secret"**

   The secret is now available to all Edge Functions immediately.

### Step 2: Verify Edge Functions Have Access

The following Edge Functions now have Resend integration:

**send-interview-notification** (`supabase/functions/send-interview-notification/index.ts`)
- Purpose: Sends professional HTML interview invitations
- Triggered: When HR schedules an interview on the Applicants page
- Email Template: Branded design with interview details, date, time, location
- Logs: All attempts to `email_logs` table with status and Resend ID

**send-password-reset-email** (`supabase/functions/send-password-reset-email/index.ts`)
- Purpose: Sends professional HTML password reset confirmations
- Triggered: When admin/HR initiates password reset for an employee
- Email Template: Branded design with reset instructions and 24-hour expiry notice
- Logs: All attempts to `email_logs` table with status and Resend ID

### Step 3: Enable Email Logging Table

1. **Apply Database Migration**
   ```sql
   -- File: supabase/migrations/20260326_create_email_logs.sql
   -- Run this migration in Supabase SQL Editor
   ```

   This creates the `email_logs` table that tracks:
   - Email send attempts (status: pending, sent, failed, bounced)
   - Recipient addresses and subject lines
   - Resend API response IDs
   - Error messages for debugging
   - Timestamps for compliance and auditing

2. **Verify RLS Policies**
   - The migration includes Row-Level Security policies
   - Only HR managers can view email logs
   - Emails are logged for all users per function

### Step 4: Test Email Delivery

#### Test Interview Email
1. **Navigate to Applicants Page**
   - Click "Interview" button for any applicant
   - Fill in interview details
   - Click "Schedule Interview"
   - Watch for success confirmation

2. **Verify Email Sent**
   - Check applicant's email inbox for invitation
   - Check `email_logs` table for record with status='sent'

#### Test Password Reset Email
1. **Navigate to Employee Directory**
   - Click "Reset Password" for any employee
   - Select "Send Email Reset Link" option
   - Confirm action

2. **Verify Email Sent**
   - Check employee's email inbox for reset link
   - Check `email_logs` table for record with template_type='password_reset'

### Step 5: Monitor Email Delivery

Use the Email Logs Viewer to monitor all emails:
1. Navigate to HR Module → Email Logs (if available in your version)
2. View statistics:
   - Total emails sent
   - Success rate
   - Failed sends
   - Current pending emails

3. Filter options:
   - By status (sent, failed, pending, bounced)
   - By date range
   - By email address
   - By template type

## Resend API Key Details

**Current Key:** `re_ctrKtFF5_6FjukC2hQTueA7qKvx8nwHQt`

**Key Information:**
- Format: `re_` prefix (Resend test/live key format)
- Scope: Can send emails from configured domains
- Rate Limit: 100 emails per day (test tier), production tier has higher limits
- Billing: Pay-as-you-go model

**For Production:**
- Upgrade Resend account to production tier
- Update domain configuration if using custom sender domain
- Obtain production API key (also starts with `re_`)
- Add to Supabase secrets with same name: `RESEND_API_KEY`

## Email Templates

### Interview Invitation Template
**Trigger:** Applicant scheduled for interview
**Content:**
- Greeting with applicant name
- Position title
- Interview details (date, time, location/link)
- Confirmation instructions
- Job posting details

**Branding:**
- Custom logo and color scheme
- Company name and contact details
- Professional footer with unsubscribe

### Password Reset Template
**Trigger:** Admin resets employee password
**Content:**
- Greeting with employee name
- Password reset link (24-hour expiry)
- Security notice
- Instructions if link expires

**Branding:**
- Security-focused design
- Clear call-to-action button
- Company security policy reference

## Error Handling

### Failed Email Sends

If an email fails to send:

1. **Check Resend API Key**
   - Verify `RESEND_API_KEY` is correctly set in Supabase Secrets
   - Restart edge functions: Settings → Functions → Restart all

2. **Check Email Address**
   - Verify email format is valid
   - Check for typos in `email_logs` table

3. **Check Resend Quota**
   - Review Resend dashboard for rate limiting
   - Check if daily quota reached
   - Upgrade plan if necessary

4. **Review Error Log**
   - Check `email_logs` table for error_message field
   - Error messages include Resend API response details
   - Timestamp shows when error occurred

### Fallback Behavior

If Resend API key is not configured:
- Edge functions detect missing key at startup
- System continues to run (graceful degradation)
- Error logged in `email_logs` with detailed message
- Email buttons disabled with "Not configured" message
- No emails sent but system remains functional

## Database Schema

The `email_logs` table tracks all email sends:

```typescript
interface EmailLog {
  id: string;
  interview_id?: string;           // For interview emails
  applicant_id?: string;           // For interview emails
  employee_id?: string;            // For employee emails
  recipient_email: string;         // Where email was sent
  subject: string;                 // Email subject line
  template_type: 'interview' | 'password_reset';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  resend_id?: string;              // Resend API message ID
  error_message?: string;          // If failed, error details
  sent_at?: datetime;              // When successfully sent
  created_at: datetime;            // When record created
}
```

**Queries:**
```typescript
// Get all emails for an applicant
supabase.from('email_logs').select('*').eq('applicant_id', applicantId);

// Get failed emails needing retry
supabase.from('email_logs').select('*').eq('status', 'failed');

// Get email stats by type
supabase.from('email_logs').select('template_type, status, count()');
```

## Troubleshooting

### Emails Not Sending
1. Verify Resend API key in Supabase Secrets
2. Check `email_logs` table for error_message details
3. Verify recipient email format is valid
4. Check Resend dashboard for quota limits

### Wrong Email Content
1. Verify applicant/employee details are correct
2. Check email template in edge function code
3. Review email_logs for actual sent content

### Delayed Emails
1. Check Resend dashboard for processing status
2. Verify network connectivity
3. Check Supabase function logs: edge-functions in console

### Emails Going to Spam
1. Verify SPF/DKIM records if using custom domain
2. Check Resend authentication settings
3. Review email template for spam triggers (excessive links, caps, etc.)

## Production Checklist

Before going to production:

- [ ] Resend API key configured in Supabase Secrets
- [ ] Email templates reviewed and approved
- [ ] Database migration applied (`email_logs` table)
- [ ] Test email sent successfully to real email address
- [ ] Email logging verified in database
- [ ] Error handling tested (invalid email, quota limit, etc.)
- [ ] Sender domain configured in Resend (if using custom domain)
- [ ] Email retention policy set (auto-delete logs after 90 days)
- [ ] Team trained on Email Logs Viewer for monitoring
- [ ] Backup/recovery plan for email delivery failures

## Support

For issues with:
- **Email delivery:** Check [Resend Documentation](https://resend.com/docs)
- **Supabase configuration:** Check [Supabase Secrets Documentation](https://supabase.com/docs/guides/functions/secrets)
- **Edge Functions:** Check Supabase function logs in console

## Additional Resources

- [Email Logs Viewer Component](src/components/hr/EmailLogsViewer.tsx) - Monitoring dashboard
- [Interview Email Function](supabase/functions/send-interview-notification/index.ts) - Implementation
- [Password Reset Email Function](supabase/functions/send-password-reset-email/index.ts) - Implementation
- [Email Type Definitions](src/types/email-notifications.ts) - TypeScript interfaces
