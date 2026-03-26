# Email System Setup & Deployment Guide

## Overview

This system uses **Resend** for sending custom HR emails. The architecture separates:
- **Frontend (React)**: Calls edge functions, NEVER handles emails directly
- **Backend (Supabase Edge Functions)**: Handles all email sending via Resend API
- **Environment Variables**: RESEND_API_KEY stored securely in Supabase

---

## Step 1: Get Your Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Copy your API key (format: `re_xxxxxxxxxxxxxxxxxxxxxxxx`)

---

## Step 2: Configure Resend API Key in Supabase

### For Local Development (localhost):

1. Create a `.env.local` file in your project root:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

2. Start Supabase locally:
   ```bash
   supabase start
   ```

3. The local Supabase instance will automatically use `.env.local` variables

### For Production (Supabase Cloud):

1. Go to your Supabase Project Dashboard
2. Navigate to: **Settings → Functions (or Edge Functions)**
3. Look for **Environment Variables** or **Secrets** section
4. Click **Add new secret**
5. Create a new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_api_key_here`
6. Click **Save**

---

## Step 3: Deploy/Update Functions

### Deploy the resend-send-email function:

```bash
supabase functions deploy resend-send-email
```

Or if using Supabase Cloud:
```bash
supabase functions deploy resend-send-email --project-id your_project_id
```

---

## Step 4: Test the Email System

### Test locally with curl:

```bash
curl -X POST http://localhost:54321/functions/v1/resend-send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "to": "your-test-email@gmail.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1><p>This is a test</p>",
    "from": "team@hrmsystem.com"
  }'
```

### Test in the UI:

1. Open Staff Access Login modal
2. Enter any email address
3. Click "Send Verification Code"
4. Check:
   - Browser console for logs
   - Email inbox for the code
   - Supabase function logs for errors

### View Supabase Function Logs:

```bash
supabase functions logs resend-send-email
```

---

## Step 5: Staff Login Flow (How It Works)

1. **User enters email** → Frontend stores email
2. **User clicks "Send Verification Code"** → Frontend calls `/functions/v1/resend-send-email`
3. **Edge Function receives request**:
   - Gets `RESEND_API_KEY` from environment
   - Makes POST request to `https://api.resend.com/emails`
   - Returns success or error
4. **Frontend receives response**:
   - If success: Show "Code sent, check your email"
   - If error: Show error message
5. **User enters code** → Frontend validates locally
6. **User enters password** → Frontend attempts Supabase sign-in

---

## Troubleshooting

### Error: "Email provider key not configured"

**Solution:** RESEND_API_KEY environment variable is not set
- Local: Check `.env.local` file
- Cloud: Check Supabase Project Settings → Edge Functions Secrets

### Error: "Failed to send email"

**Possible causes:**
1. Invalid email address format
2. Resend API key is invalid or expired
3. Resend API quota exceeded

**Solution:**
- Check Resend dashboard for error details
- Try sending from a different email
- Verify API key is correct

### Emails not arriving

**Possible causes:**
1. Email went to spam folder
2. Received email address is blocked by Resend
3. Function didn't actually send (check logs)

**Solution:**
- Check spam/promotion folder
- Check function logs: `supabase functions logs resend-send-email`
- Try sending to a different email address

### "CORS or 403 Forbidden" errors

**Solution:** Use the edge function from the same Supabase project
- Frontend calls: `supabase.functions.invoke('resend-send-email')`
- This automatically handles CORS and authorization

---

## Email Template Customization

Edit email templates in `/supabase/services/email/templates/`:

- `verificationCode.js` - Staff login verification code
- `interview.js` - Interview scheduling notification
- `jobOffer.js` - Job offer notification

Each template is a function that returns HTML:

```javascript
export function customTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="...HTML...">
        <!-- Your email content -->
      </body>
    </html>
  `;
}
```

---

## Architecture Diagram

```
┌─────────────────────┐
│   React Frontend    │
│  (StaffLoginModal)  │
└──────────┬──────────┘
           │
           │ supabase.functions.invoke()
           │
┌──────────▼──────────────────────┐
│  Supabase Edge Function         │
│  resend-send-email              │
│  - Receives email details       │
│  - Validates inputs             │
│  - Gets RESEND_API_KEY env var  │
└──────────┬──────────────────────┘
           │
           │ fetch() POST
           │ content-type: application/json
           │
┌──────────▼──────────────────────┐
│    Resend API                   │
│  https://api.resend.com/emails  │
│  - Sends via SMTP               │
│  - Returns email ID or error    │
└─────────────────────────────────┘
```

---

## Security Checklist

- ✅ RESEND_API_KEY stored only in environment variables
- ✅ API key NOT in source code
- ✅ API key NOT in .env file (only .env.local for local dev)
- ✅ Edge functions handle all email logic
- ✅ Frontend never touches API keys
- ✅ Proper CORS headers in edge functions
- ✅ Error messages don't expose sensitive data

---

## Files Reference

### Backend Files
- `/supabase/functions/resend-send-email/index.ts` - Main email sending function
- `/supabase/services/email/sendEmail.js` - Email service helper (backend reference)
- `/supabase/services/email/templates/verificationCode.js` - Verification code template
- `/supabase/services/email/templates/interview.js` - Interview template
- `/supabase/services/email/templates/jobOffer.js` - Job offer template

### Frontend Files
- `/src/components/StaffLoginModal.tsx` - Staff login with email verification
- `/src/components/AdminResetPasswordDialog.tsx` - Admin email sending

### Configuration
- `supabase/config.toml` - Local Supabase config

---

## Next Steps

1. ✅ Get Resend API key from https://resend.com
2. ✅ Set `RESEND_API_KEY` in Supabase environment
3. ✅ Deploy edge function: `supabase functions deploy resend-send-email`
4. ✅ Test in UI: Open Staff Access and send verification code
5. ✅ Check email inbox for code
6. ✅ View logs if errors: `supabase functions logs resend-send-email`

Once emails are working, the verification code flow is complete!
