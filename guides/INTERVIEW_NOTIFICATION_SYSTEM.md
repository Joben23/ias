# Interview Notification System - Implementation Guide

## ✅ COMPLETED IMPROVEMENTS

### 1. Edge Function Fixes
**File**: `supabase/functions/send-interview-notification/index.ts`

Fixes Applied:
- ✅ Removed strict Authorization header requirement
- ✅ Fixed Resend email sender to `onboarding@resend.dev`
- ✅ Added safe fallback values for all interview fields
- ✅ Enhanced comprehensive logging
- ✅ Proper HTTP status codes and JSON responses
- ✅ Error handling for database and API failures

### 2. Notification System Components

#### 2.1 Notifications Database Table
**File**: `supabase/migrations/20260325_create_notifications_table.sql`

Fields:
- `id` - UUID primary key
- `user_id` - References auth.users
- `applicant_id` - References applicants
- `title` - Notification title
- `message` - Notification message
- `type` - Category (application, interview, hiring, status_update)
- `is_read` - Boolean flag
- `created_at` - Timestamp

RLS Policies:
- Users view their own notifications
- HR/Admin can create notifications

#### 2.2 Notifications Utility
**File**: `src/lib/notifications.ts`

Functions:
- `createNotification()` - Create a new notification
- `getUnreadNotifications()` - Fetch unread notifications
- `markNotificationAsRead()` - Mark single as read
- `markAllNotificationsAsRead()` - Mark all as read
- `getAllNotifications()` - Fetch all notifications (limit 50)

#### 2.3 Notification Bell UI Component
**File**: `src/components/NotificationBell.tsx`

Features:
- Bell icon with unread count badge
- Dropdown showing unread notifications
- Mark as read functionality
- Auto-refresh every 30 seconds
- Icons for different notification types
- Timestamps for each notification

#### 2.4 App Layout Integration
**File**: `src/components/hr/AppLayout.tsx`

- NotificationBell already imported and added to header
- Positioned in top navigation bar

### 3. Interview Scheduling Enhancements
**File**: `src/components/hr/ScheduleInterviewDialog.tsx`

Updates:
- Added notification creation when interview is scheduled
- Email sent via Resend API
- In-app notification for HR/Admin
- Error handling doesn't block the flow
- Comprehensive logging

### 4. Workflow Fixes

#### 4.1 Rankings Page
**File**: `src/pages/CandidateRankingPage.tsx`

Logic:
- Only shows applicants with interview evaluations
- Filters by job posting if selected
- Calculates composite score from evaluations
- Properly filters evaluated candidates

#### 4.2 Interviews Page
**File**: `src/pages/InterviewsPage.tsx`

Logic:
- Shows all scheduled interviews
- Groups by: Today, This Week, Completed
- Filters by status = 'Scheduled'
- Shows only interviews that have been scheduled

#### 4.3 Applicants Page
**File**: `src/pages/ApplicantsPage.tsx`

Features:
- View all applicants
- Filter by status and position
- Two view modes: Cards and Pipeline
- Detail dialog for each applicant

---

## 🔧 DEPLOYMENT CHECKLIST

### Step 1: Deploy Edge Function
```bash
supabase functions deploy send-interview-notification
```

### Step 2: Create Database Migration
```bash
supabase migration add create_notifications_table
# Then run:
supabase db push
```

### Step 3: Configure Environment Variables
In Supabase Dashboard → Settings → Environment Variables:
```
RESEND_API_KEY=your_resend_api_key
```

### Step 4: Verify Resend Setup
1. Go to https://resend.com
2. Create account if needed
3. Generate API key
4. Verify domain (or use onboarding@resend.dev for testing)

---

## 📧 EMAIL NOTIFICATION FLOW

1. **HR schedules interview** via `ScheduleInterviewDialog`
2. **Interview created** in database
3. **Edge Function invoked** with `interview_id`
4. **Function fetches** interview and applicant details
5. **Email sent** via Resend API to applicant.email
6. **In-app notification** created for HR/Admin
7. **Applicant receives** email with:
   - Position Applied
   - Interview Date (formatted)
   - Interview Time
   - Interview Type (Online/On-site)
   - Location or Meeting Link

---

## 🔔 IN-APP NOTIFICATION FLOW

1. **Event occurs** (interview scheduled, status changed, etc.)
2. **Notification created** via `createNotification()`
3. **Stored in database** with user_id and type
4. **NotificationBell** automatically fetches unread
5. **User sees badge** with unread count
6. **User clicks bell** to see dropdown
7. **User marks as read** by clicking X

---

## 📊 NOTIFICATION TYPES

- **application** - 📝 New application received
- **interview** - 📅 Interview scheduled
- **hiring** - ✅ Job offer/hiring decision
- **status_update** - 📊 Application status changed

---

## 🐛 TROUBLESHOOTING

### Email Not Sending?

1. **Check RESEND_API_KEY** is set
2. **Check edge function logs** in Supabase Dashboard
3. **Verify email format** in database
4. **Test with** onboarding@resend.dev first

### Notifications Not Showing?

1. **Check RLS policies** on notifications table
2. **Verify user_id** is being passed correctly
3. **Check browser console** for errors
4. **Ensure database migration** was applied

### Interview Not Triggering Notification?

1. **Check if function is deployed**
2. **Verify interview_id is passed** to function
3. **Check Supabase logs** for function errors
4. **Ensure applicant.email exists** in database

---

## 📝 FUTURE ENHANCEMENTS

- SMS notifications as alternative to email
- Notification preferences (email/in-app/both)
- Notification templates with customization
- Bulk notification sending
- Notification history/archiving
- Real-time notifications with Supabase Realtime

---

## 📚 FILES MODIFIED/CREATED

### Created:
- `supabase/migrations/20260325_create_notifications_table.sql`
- `src/lib/notifications.ts`
- `src/components/NotificationBell.tsx`
- `supabase/functions/send-interview-notification/index.ts`

### Modified:
- `src/components/hr/ScheduleInterviewDialog.tsx`
- `src/components/hr/AppLayout.tsx`
- `src/pages/JobApplicationPage.tsx`

### Verified (No changes needed):
- `src/pages/CandidateRankingPage.tsx` (already filters by evaluations)
- `src/pages/InterviewsPage.tsx` (already shows scheduled only)
- `src/pages/ApplicantsPage.tsx` (working as expected)
