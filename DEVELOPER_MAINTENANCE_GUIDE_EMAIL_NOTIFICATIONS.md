# 🔧 Email Notification System - Developer Maintenance Guide

## Overview

This guide helps developers maintain, debug, and extend the email notification system.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                React Component Layer                 │
│  ScheduleInterviewDialog.tsx                        │
│  EmailLogsViewer.tsx                                │
└────────────┬────────────────────────────────────────┘
             │ Calls API / Creates records
             ↓
┌─────────────────────────────────────────────────────┐
│           Supabase Client Library                    │
│  - Database operations (insert, select)             │
│  - Function invocation                              │
│  - Real-time subscriptions                          │
└────────────┬────────────────────────────────────────┘
             │ RPC / HTTP
             ↓
┌─────────────────────────────────────────────────────┐
│           PostgreSQL Database                       │
│  - interviews table                                 │
│  - applicants table                                 │
│  - email_logs table (logging)                       │
└────────────┬────────────────────────────────────────┘
             │ Triggers & Functions
             ↓
┌─────────────────────────────────────────────────────┐
│      Supabase Edge Function (Deno)                  │
│  send-interview-notification                       │
│  - Fetches data                                     │
│  - Generates HTML                                   │
│  - Calls Resend API                                │
│  - Logs results                                     │
└────────────┬────────────────────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────────────────────┐
│              Resend API Service                     │
│  - Email rendering                                  │
│  - SMTP delivery                                    │
│  - Bounce handling                                  │
└─────────────────────────────────────────────────────┘
```

---

## Code Structure

### Components Layer

**File Structure:**
```
src/components/hr/
├── ScheduleInterviewDialog.tsx     # Main interview scheduling UI
└── EmailLogsViewer.tsx             # Email monitoring dashboard
```

**Responsibilities:**
- ScheduleInterviewDialog: Collects interview data, triggers function
- EmailLogsViewer: Displays email logs, provides monitoring UI

**Key Props:**
```typescript
// ScheduleInterviewDialog
interface Props {
  applicantId: string;      // ID to fetch email for
  applicantName: string;    // Display in dialog
  jobPostingId?: string;    // Link to job posting
  open: boolean;            // Dialog visibility
  onOpenChange: Function;   // Close dialog handler
  onScheduled: Function;    // Success callback
}
```

### Database Layer

**Tables:**
```sql
interviews (modified)
  - email_sent: boolean
  - email_sent_at: timestamptz
  - last_email_resend_id: text

email_logs (new)
  - id, interview_id, applicant_id
  - recipient_email, subject
  - template_type, status
  - resend_id, error_message
  - sent_at, created_at
```

**Indexes:**
```sql
idx_email_logs_interview_id
idx_email_logs_applicant_id
idx_email_logs_status
idx_email_logs_created_at
idx_email_logs_recipient_email
```

### Edge Function Layer

**File:**
```
supabase/functions/send-interview-notification/index.ts
```

**Main Functions:**
1. `generateInterviewInvitationHTML()` - Creates HTML email
2. `logEmailSend()` - Records attempt to email_logs
3. `updateInterviewEmailStatus()` - Updates interviews table
4. `Deno.serve()` - Main HTTP handler

**Flow:**
```typescript
Deno.serve(async (req) => {
  1. Validate request (interview_id)
  2. Connect to Supabase
  3. Fetch interview details
  4. Fetch applicant details
  5. Generate HTML email
  6. Send via Resend API
  7. Log result to email_logs
  8. Update interviews table
  9. Return response
})
```

---

## Development Tasks

### Adding New Email Template

1. Create template function:

```typescript
// In send-interview-notification/index.ts
function generateReminderEmailHTML(...): string {
  return `<!DOCTYPE html>...`;
}
```

2. Add template type:

```typescript
// In types/email-notifications.ts
export type EmailTemplateType = 
  | 'interview_invitation' 
  | 'interview_reminder'  // NEW
  | ...;
```

3. Use in function:

```typescript
const templateType = 'interview_reminder';
await logEmailSend(..., templateType);
```

### Adding New Email Trigger

1. Create new edge function:

```
supabase/functions/send-rejection-email/index.ts
```

2. Invoke from component:

```typescript
await supabase.functions.invoke('send-rejection-email', {
  body: { applicant_id: id }
});
```

3. Add logging:

```typescript
await logEmailSend(supabaseAdmin, 'some-id', applicantId, email, subject, 'sent', resendId);
```

### Modifying Email Template

The HTML template is in `send-interview-notification/index.ts`:

```typescript
function generateInterviewInvitationHTML(
  applicantName: string,
  positionApplied: string,
  interviewDate: string,
  interviewTime: string,
  interviewType: string,
  locationOrMeeting: string
): string {
  // Modify HTML here
  return `<html>...</html>`;
}
```

**CSS Considerations:**
- Use inline styles (email clients limited CSS support)
- Test with major email clients (Gmail, Outlook, Apple Mail)
- Mobile-responsive widths (max 600px)
- Avoid JavaScript

---

## Debugging Guide

### Local Testing

1. Check function logs:
```bash
supabase functions serve send-interview-notification
```

2. Test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/send-interview-notification \
  -H "Content-Type: application/json" \
  -d '{ "interview_id": "test-id" }'
```

3. Check response:
```
{"message": "...", "resend_id": "..." | "error": "..."}
```

### Production Debugging

1. Check Supabase Edge Function Logs:
```
Supabase Dashboard → Functions → Logs
```

2. Query email_logs:
```sql
SELECT * FROM email_logs 
WHERE status = 'failed'
ORDER BY created_at DESC 
LIMIT 10;
```

3. Check specific attempt:
```sql
SELECT * FROM email_logs 
WHERE interview_id = 'xxx-xxx-xxx' 
ORDER BY created_at DESC;
```

### Common Errors

**Error: "Interview not found"**
```typescript
// Check: Does interview_id exist?
SELECT * FROM interviews WHERE id = 'xxx';
```

**Error: "Applicant email not found"**
```typescript
// Check: Does applicant have email?
SELECT * FROM applicants WHERE id = 'xxx';
```

**Error: "RESEND_API_KEY not configured"**
```
// Solution: Add to Supabase secrets
supabase secrets set RESEND_API_KEY=key_xxx
```

**Error: "Failed to send email: 429"**
```
// Solution: Resend rate limit exceeded
// Wait 60 seconds, then retry
```

---

## Performance Optimization

### Query Optimization

Current indexes cover:
- Finding logs by interview
- Finding logs by applicant
- Finding logs by status
- Finding recent logs

**Adding new query? Add index:**
```sql
CREATE INDEX idx_email_logs_new_field ON email_logs(new_field);
```

### Email Logs Archiving

For large installations, archive old logs:

```sql
-- Archive logs older than 1 year
INSERT INTO email_logs_archive 
  SELECT * FROM email_logs 
  WHERE created_at < now() - interval '1 year';

DELETE FROM email_logs 
  WHERE created_at < now() - interval '1 year';
```

### Function Performance

Current function ~200-400ms:
- ~50ms: Supabase auth
- ~50ms: Database fetches
- ~50ms: HTML generation
- ~100ms: Resend API call
- ~50ms: Logging

Optimization opportunities:
- Cache rendered HTML templates
- Batch database operations
- Implement function-level caching

---

## Testing

### Unit Tests

Test email template generation:

```typescript
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

Deno.test("generateInterviewInvitationHTML", async () => {
  const html = generateInterviewInvitationHTML(
    "John Doe",
    "Doctor",
    "2024-04-01",
    "14:00",
    "On-site",
    "Conference Room A"
  );
  
  assertEquals(html.includes("John Doe"), true);
  assertEquals(html.includes("Conference Room A"), true);
});
```

### Integration Tests

Test full flow with Supabase:

```typescript
// 1. Create test interview
const { data: interview } = await supabase
  .from('interviews')
  .insert({ /* test data */ })
  .select()
  .single();

// 2. Call edge function
const response = await supabase.functions.invoke(
  'send-interview-notification',
  { body: { interview_id: interview.id } }
);

// 3. Verify result
assertEquals(response.data.message, 'Notification sent successfully');

// 4. Check email_logs
const { data: logs } = await supabase
  .from('email_logs')
  .select()
  .eq('interview_id', interview.id);

assertEquals(logs.length, 1);
assertEquals(logs[0].status, 'sent');
```

### Email Template Testing

Test email rendering with [Resend Email Preview](https://resend.com/preview):

1. Copy HTML from template function
2. Paste into Resend preview
3. Test on different email clients
4. Check mobile rendering

---

## Monitoring & Alerts

### Success Rate Dashboard

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  ROUND(100.0 * SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM email_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Alert Conditions

Email should trigger alerts if:
- Success rate drops below 95%
- 10+ failures in last hour
- Long queue (pending > 100)

```sql
-- Check current status
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
FROM email_logs
WHERE created_at > NOW() - interval '1 hour';
```

---

## Maintenance Checklist

### Weekly
- [ ] Check email success rate
- [ ] Review failed emails
- [ ] Monitor Resend quota usage

### Monthly
- [ ] Clean up failed email logs
- [ ] Review template performance
- [ ] Check database storage usage
- [ ] Update dependencies

### Quarterly
- [ ] Performance review
- [ ] Security audit
- [ ] Archive old logs
- [ ] Plan enhancements

---

## Security Considerations

### API Key Management
- Store Resend API key in Supabase secrets (not code)
- Rotate keys quarterly
- Use specific, minimal permissions

### Email Address Handling
- Never log full email threads
- Sanitize error messages
- Hash emails for analytics
- Follow GDPR compliance

### Rate Limiting
- Respect Resend API limits
- Implement backoff strategy
- Log rate limit errors

### SQL Injection Prevention
- Always use parameterized queries
- Supabase client handles this
- Example:
```typescript
// ✓ Safe
.eq('id', interview_id)

// ✗ Unsafe (don't do this)
.where(`id = '${interview_id}'`)
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Test locally
- [ ] Review code changes
- [ ] Update TypeScript types
- [ ] Add appropriate logging

### Deployment
- [ ] Deploy migrations first
- [ ] Deploy edge function code
- [ ] Deploy React components
- [ ] Deploy TypeScript types

### Post-Deployment
- [ ] Test with real applicant
- [ ] Monitor logs for errors
- [ ] Check success rate
- [ ] Verify email delivery

---

## Rollback Procedures

### If Email Function Breaks

```bash
# 1. Revert function code
git revert <commit>

# 2. Deploy old version
supabase functions deploy send-interview-notification

# 3. Test
curl -X POST ... (as above)

# 4. Monitor logs
# Watch for email delivery
```

### If Database Schema Issues

```sql
-- Check current state
SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'email_logs';

-- Verify constraints
SELECT constraint_name FROM information_schema.table_constraints 
  WHERE table_name = 'email_logs';

-- Fix if needed
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS ...;
```

---

## Documentation Requirements

When making changes, update:

1. This file (if maintenance task)
2. `EMAIL_NOTIFICATION_GUIDE.md` (if user-visible)
3. `HR_EMAIL_INVITATION_QUICK_START.md` (if user-facing)
4. Code comments (inline documentation)
5. TypeScript types (in `src/types/email-notifications.ts`)

---

## Dependencies

### Core Dependencies
- `@supabase/supabase-js@2` - Client library
- Resend API (REST - no SDK)
- `date-fns` - Date formatting (for logs viewer)

### Supabase Services Used
- PostgreSQL Database
- Edge Functions (Deno)
- Row Level Security
- Real-time Subscriptions (optional)

### External Services
- Resend (Email API)
- SMTP (via Resend)

---

## Resources

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend Documentation](https://resend.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Deno Manual](https://deno.land/manual)

---

## Support

### Getting Help

1. Check error message in email_logs
2. Review function logs in Supabase dashboard
3. Check this guide's debugging section
4. Review related documentation files
5. Check commit history for context

### Reporting Issues

Include:
- Error message
- Interview ID (if applicable)
- Date/time of occurrence
- Steps to reproduce
- Screenshots (if applicable)

---

**Last Updated:** 2024-03-26
**Version:** 1.0
**Maintainer:** Development Team
