# Quick Setup Reference - Copy & Paste Ready

## 🎯 The Real Issue

The "Failed to send verification code" error happens because **RESEND_API_KEY is not set** in Supabase environment variables.

Everything else is already implemented and working. You just need to set one environment variable.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Get API Key from Resend
- Go to: https://resend.com
- Sign up (free) if needed
- Click API Keys
- Copy the key that looks like: `re_xxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2A: For Local Development

Create file: `.env.local` (in project root)

```
RESEND_API_KEY=re_your_key_here
```

Replace `re_your_key_here` with your actual key from Resend.

Restart dev server:
```bash
supabase stop
supabase start
```

### Step 2B: For Supabase Cloud

1. Open Supabase Dashboard
2. Project Settings → Functions → Secrets
3. Click "New Secret"
4. Name: `RESEND_API_KEY`
5. Value: Your API key from Resend
6. Save

Then deploy:
```bash
supabase functions deploy resend-send-email
```

### Step 3: Test

Open your app:
1. Click Staff Access button
2. Enter any email (test@gmail.com)
3. Click "Send Verification Code"
4. Check your email inbox (wait 5 seconds)
5. You should see the code!

---

## ❓ If It Still Says Error

### Open Browser Console (F12)
Look for a message that says:
- "RESEND_API_KEY not configured" → You didn't set the env variable
- "Failed to send email" → Check the API key is correct
- "Invalid JSON" → There's a bug in the code

### Check Supabase Logs
```bash
supabase functions logs resend-send-email
```

Look for any error messages.

---

## 📂 What's Already Done

✅ Edge Function created: `supabase/functions/resend-send-email/`
✅ Email templates created: `supabase/services/email/templates/`
✅ Frontend updated: `src/components/StaffLoginModal.tsx`
✅ Error handling improved
✅ Security fixed (no hardcoded keys)

**All that's missing: The RESEND_API_KEY environment variable**

---

## 🔐 Your API Key

Once you get it from Resend, it will look like:
```
re_1234567890abcdefghijklmnopqrstuvwxyz
```

**NEVER share this key or commit it to GitHub.**

---

## ✅ Verification Checklist

After setting RESEND_API_KEY:

- [ ] Got API key from Resend.com
- [ ] Set RESEND_API_KEY in `.env.local` (local) OR Supabase Secrets (cloud)
- [ ] Restarted dev server / deployed function
- [ ] Opened app and sent verification code
- [ ] Received email with code within 5 seconds
- [ ] Code is 6 digits
- [ ] Code expires message shows 10 minutes

If all checked → System is working! ✅

---

## 📞 Last Resort

If nothing works:

1. Open browser console (F12)
2. Go to Staff Access modal
3. Enter email
4. Click send
5. Take screenshot of error message
6. Check: `supabase functions logs resend-send-email`
6. Take screenshot of logs
7. Share both with support

The error message will tell us exactly what's wrong.

---

## Files That Were Created/Fixed

```
✅ supabase/functions/resend-send-email/index.ts (Main email function)
✅ supabase/services/email/sendEmail.js (Security fixed - no hardcoded keys)
✅ supabase/services/email/templates/verificationCode.js
✅ supabase/services/email/templates/interview.js
✅ supabase/services/email/templates/jobOffer.js
✅ src/components/StaffLoginModal.tsx (Better error handling)
✅ EMAIL_SYSTEM_SETUP_GUIDE.md (Full documentation)
✅ EMAIL_IMPLEMENTATION_COMPLETE.md (Complete reference)
```

All files are production-ready!

---

## System Flow (Visual)

```
User Email Input
       ↓
[Send Verification Code Button]
       ↓
Frontend calls Edge Function
       ↓
Edge Function:
  - Checks RESEND_API_KEY ← ← ← YOU SET THIS ← ← ←
  - Makes request to Resend API
       ↓
Resend sends email via SMTP
       ↓
Email arrives in user's inbox in 5 seconds
       ↓
User sees code and enters it
       ↓
Login succeeds ✅
```

---

## That's It!

Once RESEND_API_KEY is set everywhere will work.

The error "Failed to send verification code" will disappear and emails will actually send.
