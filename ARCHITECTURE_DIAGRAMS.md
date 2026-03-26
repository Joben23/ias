# Interview Notification System - Visual Architecture

## 📐 System Architecture Diagram

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    INTERVIEW NOTIFICATION SYSTEM                           ║
╚════════════════════════════════════════════════════════════════════════════╝

                          ┌─────────────────────────┐
                          │   HR Dashboard          │
                          │  (React Frontend)       │
                          └────────────┬────────────┘
                                       │
                                       │ 1. HR clicks
                                       │    "Schedule Interview"
                                       ▼
                          ┌─────────────────────────┐
                          │ ScheduleInterviewDialog │
                          │   (React Component)     │
                          └────────────┬────────────┘
                                       │
                                       │ 2. Interview data filled in:
                                       │    - Date
                                       │    - Time
                                       │    - Type
                                       │    - Location/Link
                                       ▼
                          ┌─────────────────────────┐
                          │  Supabase Database      │
                          │  (interviews table)     │
                          └────────────┬────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │  Edge Function   │  │  Create Notif    │  │  Update Status   │
        │  (Deno/TypeScript)  │                  │  │                  │
        │                  │  │  notification()  │  │  status =        │
        │ send-interview-  │  │                  │  │  "Interview      │
        │ notification     │  │  in database     │  │  Scheduled"      │
        └────────┬─────────┘  └──────────────────┘  └──────────────────┘
                 │
         3. Fetch interview
         & applicant data
                 │
                 ▼
        ┌──────────────────┐
        │  Format Email    │
        │  with details:   │
        │  - Position      │
        │  - Date (fmt)    │
        │  - Time          │
        │  - Type          │
        │  - Location      │
        └────────┬─────────┘
                 │
         4. Send via
         Resend API
                 │
                 ▼
        ┌──────────────────┐
        │   Resend API     │
        │   (Email Service)│
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Applicant Email  │
        │ Inbox ✉️          │
        │                  │
        │ Interview Details│
        │ Sent Successfully│
        └──────────────────┘
```

---

## 🔄 Notification Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION FLOW                             │
└──────────────────────────────────────────────────────────────────┘

Event Triggered (Interview Scheduled)
        │
        ▼
┌────────────────────────────────────────────┐
│ createNotification()                       │
│ (src/lib/notifications.ts)                 │
│                                            │
│ Parameters:                                │
│ - userId: string                           │
│ - title: "Interview Scheduled"             │
│ - message: "Interview on March 25..."      │
│ - type: "interview"                        │
│ - applicantId: string (optional)           │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ Supabase Database                          │
│ (notifications table)                      │
│                                            │
│ INSERT INTO notifications (                │
│   user_id, title, message,                 │
│   type, is_read, created_at                │
│ )                                          │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ getUnreadNotifications()                   │
│ (Called by NotificationBell every 30s)     │
│                                            │
│ SELECT * FROM notifications                │
│ WHERE is_read = false                      │
│ ORDER BY created_at DESC                   │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ NotificationBell Component                 │
│ (src/components/NotificationBell.tsx)      │
│                                            │
│ Updates UI:                                │
│ - Badge count 🔴 2                          │
│ - Dropdown list                            │
│ - Timestamps                               │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ User Sees Notification                     │
│                                            │
│ 🔔 2 (unread badge)                        │
│                                            │
│ Click to open:                             │
│ ┌──────────────────────────────────────┐  │
│ │ 📅 Interview Scheduled               │  │
│ │ Interview on March 25 at 14:30       │  │
│ │ March 25, 2026                       │  │
│ │                              [X] mark│  │
│ └──────────────────────────────────────┘  │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ User Clicks [X] or "Mark All as Read"      │
│                                            │
│ markNotificationAsRead(id)                 │
│ or                                         │
│ markAllNotificationsAsRead()               │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ Database Update                            │
│                                            │
│ UPDATE notifications                       │
│ SET is_read = true                         │
│ WHERE id = 'notification-uuid'             │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ Notification Removed from UI               │
│                                            │
│ Badge count: 1 (decreased)                 │
│ Dropdown: 1 notification remaining         │
└──────────────────────────────────────────────┘
```

---

## 🏗️ Component Hierarchy

```
App
├── AppLayout
│   ├── Sidebar
│   │   └── Navigation items
│   └── Header
│       ├── Logo/Brand
│       ├── Breadcrumb
│       ├── Search
│       ├── Theme Switcher
│       └── NotificationBell ⭐
│           ├── Bell Icon
│           │   └── Badge (unread count)
│           └── Dropdown Panel
│               ├── Header ("Notifications")
│               ├── Notification List
│               │   ├── Notification Item 1
│               │   ├── Notification Item 2
│               │   └── Notification Item N
│               └── Mark All as Read Button
│
├── Pages
│   ├── ApplicantsPage
│   ├── InterviewsPage
│   ├── CandidateRankingPage
│   └── ...
│
└── Dialogs
    ├── ScheduleInterviewDialog ⭐
    │   ├── Date Input
    │   ├── Time Input
    │   ├── Type Select
    │   ├── Location/Link Input
    │   └── Schedule Button (triggers notification)
    └── ...
```

---

## 📊 Database Schema Relationship Diagram

```
┌─────────────────────────────────────┐
│       auth.users                    │
│                                     │
│  id (UUID) PRIMARY KEY              │
│  email                              │
│  raw_user_meta_data                 │
│  ...                                │
└────────────┬────────────────────────┘
             │ FOREIGN KEY
             │ (user_id)
             ▼
┌─────────────────────────────────────┐
│    notifications ⭐ (NEW)             │
│                                     │
│  id (UUID) PRIMARY KEY              │
│  user_id (FK → auth.users)          │
│  applicant_id (FK → applicants)     │
│  title TEXT                         │
│  message TEXT                       │
│  type TEXT                          │
│  is_read BOOLEAN                    │
│  created_at TIMESTAMPTZ             │
│  updated_at TIMESTAMPTZ             │
│                                     │
│  Indexes:                           │
│  - user_id                          │
│  - is_read                          │
│  - created_at DESC                  │
└─────────────────────────────────────┘
             ▲
             │ FOREIGN KEY
             │ (applicant_id)
             │
┌────────────┴────────────────────────┐
│       applicants                    │
│                                     │
│  id (UUID) PRIMARY KEY              │
│  full_name                          │
│  email                              │
│  position_applied                   │
│  status                             │
│  ...                                │
└─────────────────────────────────────┘
             ▲
             │ FOREIGN KEY
             │ (applicant_id)
             │
┌────────────┴────────────────────────┐
│       interviews                    │
│                                     │
│  id (UUID) PRIMARY KEY              │
│  applicant_id (FK → applicants)     │
│  interview_date                     │
│  interview_time                     │
│  interview_type                     │
│  location / meeting_link            │
│  status                             │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                             │
└──────────────────────────────────────────────────────────────┘

Layer 1: Authentication
  ├── Supabase Auth (JWT tokens)
  └── User must be logged in

Layer 2: Row Level Security (RLS)
  ├── notifications table RLS enabled
  ├── Users see only own notifications
  ├── Users can update only own notifications
  └── HR/Admin can insert notifications

Layer 3: API Security
  ├── Environment variables for sensitive keys
  ├── RESEND_API_KEY never exposed to frontend
  ├── Edge function uses service role key
  └── No sensitive data in logs

Layer 4: Data Validation
  ├── Email format validation
  ├── UUID validation
  ├── Request body parsing with error handling
  └── Null/undefined checks

Layer 5: Error Handling
  ├── No detailed error messages to user
  ├── Errors logged for debugging
  ├── Graceful fallbacks
  └── No information leakage
```

---

## ⚡ Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│              PERFORMANCE OPTIMIZATIONS                        │
└──────────────────────────────────────────────────────────────┘

Database Level:
  ├── Index on user_id (fast user lookups)
  ├── Index on is_read (fast unread filtering)
  ├── Index on created_at DESC (fast sorting)
  └── Primary key on id (fast lookups)

Frontend Level:
  ├── NotificationBell fetches every 30 seconds
  │   (not every second to avoid server load)
  ├── Component memoization for performance
  ├── Efficient state updates
  └── AnimatePresence for smooth transitions

API Level:
  ├── Supabase edge functions (fast execution)
  ├── Service role key (no auth overhead)
  ├── Direct database access (minimal latency)
  └── Parallel operations where possible

Caching Strategy:
  ├── Browser caches component
  ├── Supabase caches queries
  ├── Edge function caches Deno runtime
  └── CDN for static assets
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA FLOW                                  │
└─────────────────────────────────────────────────────────────┘

User Action (Schedule Interview)
        │
        ▼
Frontend (React)
├─ Collect form data
│  ├─ date
│  ├─ time
│  ├─ type
│  └─ location/link
        │
        ▼
Supabase Client
├─ Create interview record
│  └─ INSERT into interviews table
        │
        ▼
Database (PostgreSQL)
├─ Store interview data
│  └─ Update applicant status
        │
        ▼
Edge Function Invocation
├─ Call send-interview-notification
│  └─ Pass interview_id
        │
        ▼
Edge Function (Deno)
├─ Fetch interview details
├─ Fetch applicant details
├─ Format email content
├─ Call Resend API
└─ Return result
        │
        ├─────────────────┬─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
  Resend API      Database         Frontend Toast
  (Email)      (Notification)      (Confirmation)
        │                 │                 │
        ▼                 ▼                 ▼
   Applicant      Notification      Success Message
   Email Box      Table Entry       Shown to HR
```

---

## 📱 UI Components Overview

```
HEADER
┌─────────────────────────────────────────────────────────────┐
│  Logo    Breadcrumb    Search    Theme    Notifications      │
│                                           🔔 2               │
│                                           ↓                  │
│                                        ┌─────────────────┐  │
│                                        │ Notifications   │  │
│                                        ├─────────────────┤  │
│                                        │ 📅 Interview    │  │
│                                        │ Scheduled       │  │
│                                        │ March 25        │  │
│                                        │ March 25, 2026  │  │
│                                        │            [X]  │  │
│                                        ├─────────────────┤  │
│                                        │ 📊 Status       │  │
│                                        │ Updated         │  │
│                                        │ March 24        │  │
│                                        │ March 24, 2026  │  │
│                                        │            [X]  │  │
│                                        ├─────────────────┤  │
│                                        │Mark all as read │  │
│                                        └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘

MAIN CONTENT
┌─────────────────────────────────────────────────────────────┐
│ Page Content (Applicants, Interviews, etc.)                  │
└─────────────────────────────────────────────────────────────┘

DIALOG (When Scheduling Interview)
┌─────────────────────────────────────────────────────────────┐
│ Schedule Interview                                           │
├─────────────────────────────────────────────────────────────┤
│ Applicant Name: John Doe                                    │
│                                                              │
│ Date: [2026-03-26]        Time: [14:30]                    │
│                                                              │
│ Type: [Online ▼]                                            │
│                                                              │
│ Meeting Link: [https://meet.google.com/...]                │
│                                                              │
│ Panel Members: ☑ HR Manager ☑ Department Head ☐ Medical Dir│
│                                                              │
│ Notes: [Optional notes...]                                  │
│                                                              │
│                              [Cancel]  [Schedule]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Notification Type Icons

```
TYPE              ICON   COLOR      WHEN TRIGGERED
─────────────────────────────────────────────────────────
application       📝     Blue       Application submitted
interview         📅     Purple     Interview scheduled
hiring            ✅     Green      Hired/Offer sent
status_update     📊     Orange     Status changed
─────────────────────────────────────────────────────────
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                DEPLOYMENT LAYERS                          │
└──────────────────────────────────────────────────────────┘

Development (Local)
├── Frontend: http://localhost:5173
├── Supabase Local: http://localhost:54321
├── Database: Local PostgreSQL
└── Edge Functions: Local Deno runtime

Staging (Supabase Cloud)
├── Frontend: Deployed to Vercel/similar
├── Database: Supabase PostgreSQL
├── Edge Functions: Supabase Deno Edge Functions
└── Email: Resend API (test key)

Production (Supabase Cloud)
├── Frontend: Deployed to CDN
├── Database: Supabase PostgreSQL (backed up)
├── Edge Functions: Supabase Deno Edge Functions
├── Email: Resend API (production key)
└── Monitoring: Supabase logs & metrics
```

---

This visual documentation complements the technical documentation and provides a quick reference for understanding the system architecture and data flow.
