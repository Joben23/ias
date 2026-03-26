# Interview Notification System - Developer Quick Reference

## 🎯 Quick Links

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview |
| [INTERVIEW_NOTIFICATION_QUICK_START.md](./INTERVIEW_NOTIFICATION_QUICK_START.md) | Quick start for HR |
| [INTERVIEW_NOTIFICATION_SYSTEM.md](./INTERVIEW_NOTIFICATION_SYSTEM.md) | Technical details |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | What was built |
| [SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md) | Deployment guide |

---

## 📁 Key Files

### Backend/Database
```
supabase/
├── migrations/
│   └── 20260325_create_notifications_table.sql    # Notifications table
└── functions/
    └── send-interview-notification/
        └── index.ts                                 # Email notification function
```

### Frontend/UI
```
src/
├── lib/
│   └── notifications.ts                           # Notification API functions
├── components/
│   ├── NotificationBell.tsx                       # Notification UI component
│   └── hr/
│       ├── ScheduleInterviewDialog.tsx            # Interview scheduling (MODIFIED)
│       └── AppLayout.tsx                          # Header with bell (ALREADY INTEGRATED)
└── pages/
    ├── CandidateRankingPage.tsx                   # Rankings (no change needed)
    ├── InterviewsPage.tsx                         # Interviews (no change needed)
    └── ApplicantsPage.tsx                         # Applicants (no change needed)
```

---

## 🔧 API Reference

### createNotification()
Create a new notification in the database.

```typescript
import { createNotification } from '@/lib/notifications';

// Usage
const success = await createNotification(
  userId,                    // string - UUID of user
  'Interview Scheduled',     // string - title
  'Interview on March 25',   // string - message
  'interview',               // type - 'application' | 'interview' | 'hiring' | 'status_update'
  applicantId               // string - (optional) UUID of applicant
);

// Returns: boolean
```

### getUnreadNotifications()
Fetch all unread notifications for current user.

```typescript
import { getUnreadNotifications } from '@/lib/notifications';

// Usage
const notifications = await getUnreadNotifications();

// Returns: NotificationData[]
// Example response:
// [
//   {
//     id: 'abc-123',
//     user_id: 'user-123',
//     title: 'Interview Scheduled',
//     message: 'Interview on March 25 at 14:30',
//     type: 'interview',
//     is_read: false,
//     created_at: '2026-03-25T12:00:00Z'
//   }
// ]
```

### markNotificationAsRead()
Mark a single notification as read.

```typescript
import { markNotificationAsRead } from '@/lib/notifications';

// Usage
const success = await markNotificationAsRead(notificationId);

// Returns: boolean
```

### markAllNotificationsAsRead()
Mark all notifications as read for current user.

```typescript
import { markAllNotificationsAsRead } from '@/lib/notifications';

// Usage
const success = await markAllNotificationsAsRead();

// Returns: boolean
```

### getAllNotifications()
Fetch all notifications (limit 50) for current user.

```typescript
import { getAllNotifications } from '@/lib/notifications';

// Usage
const notifications = await getAllNotifications();

// Returns: NotificationData[] (max 50 most recent)
```

---

## 📧 Edge Function: send-interview-notification

### Endpoint
```
POST /functions/v1/send-interview-notification
```

### Request Body
```typescript
{
  interview_id: string  // UUID of interview
}
```

### Response (Success)
```typescript
{
  message: 'Notification sent successfully',
  resend_id: 'msg_abc123xyz'
}
```

### Response (Error)
```typescript
{
  error: 'Error description'
}
```

### Example Usage (Frontend)
```typescript
const { error } = await supabase.functions.invoke(
  'send-interview-notification',
  {
    body: { interview_id: data[0].id }
  }
);

if (error) {
  console.error('Failed to send notification:', error);
}
```

---

## 🗄️ Database Schema

### notifications table
```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  applicant_id uuid REFERENCES public.applicants(id),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'application',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### RLS Policies
- Users can SELECT own notifications
- Users can UPDATE own notifications
- HR/Admin can INSERT notifications
- Indexes on: user_id, is_read, created_at

---

## 🚀 Common Tasks

### Add a Notification
```typescript
import { createNotification } from '@/lib/notifications';

const { data: user } = await supabase.auth.getUser();
if (user.user) {
  await createNotification(
    user.user.id,
    'Interview Scheduled',
    `Interview on March 25 at 14:30`,
    'interview',
    applicantId
  );
}
```

### Check Unread Notifications
```typescript
import { getUnreadNotifications } from '@/lib/notifications';

const unread = await getUnreadNotifications();
console.log(`You have ${unread.length} unread notifications`);
```

### Use NotificationBell Component
```typescript
import { NotificationBell } from '@/components/NotificationBell';

// In your header/layout
function Header() {
  return (
    <div className="flex items-center gap-4">
      {/* Other header items */}
      <NotificationBell />
    </div>
  );
}
```

---

## 🔐 Environment Variables

### Required
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Optional
```
SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 📊 Database Queries

### Find notifications for a user
```sql
SELECT * FROM notifications 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Count unread notifications
```sql
SELECT COUNT(*) as unread_count 
FROM notifications 
WHERE user_id = 'user-uuid' AND is_read = false;
```

### Get notifications by type
```sql
SELECT * FROM notifications 
WHERE user_id = 'user-uuid' 
AND type = 'interview'
ORDER BY created_at DESC;
```

### Clean up old notifications
```sql
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 🧪 Testing

### Test Email Function
```bash
# Deploy function
supabase functions deploy send-interview-notification

# View logs
supabase functions logs send-interview-notification --tail

# Test locally (after setting RESEND_API_KEY)
curl -X POST http://localhost:54321/functions/v1/send-interview-notification \
  -H "Content-Type: application/json" \
  -d '{"interview_id": "your-interview-uuid"}'
```

### Test Notifications Table
```bash
# Connect to database
supabase db connect

# Insert test notification
INSERT INTO notifications (user_id, title, message, type)
VALUES ('your-user-uuid', 'Test Notification', 'This is a test', 'application');

# Query notifications
SELECT * FROM notifications ORDER BY created_at DESC;
```

---

## 🐛 Common Issues

### Email Not Sending
```typescript
// Check logs
supabase functions logs send-interview-notification --tail

// Verify API key
process.env.RESEND_API_KEY  // Should not be undefined

// Check email format
applicant.email  // Should be valid email address
```

### Notifications Not Showing
```typescript
// Verify RLS policies
// In Supabase dashboard: Notifications table → RLS policies

// Check user_id
const { data: user } = await supabase.auth.getUser();
console.log(user.user.id);  // Should be UUID

// Verify data in database
const { data } = await supabase
  .from('notifications')
  .select('*')
  .limit(1);
```

### Function Deploy Fails
```bash
# Check for syntax errors
supabase functions lint send-interview-notification

# View deployment logs
supabase functions logs send-interview-notification

# Redeploy
supabase functions deploy send-interview-notification --no-verify
```

---

## 📚 Learning Resources

- [Supabase Functions Guide](https://supabase.com/docs/guides/functions)
- [Resend Email API](https://resend.com/docs/send-with-nodejs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎯 Next Steps

After implementation:

1. **Monitor**: Check Supabase logs for errors
2. **Test**: Verify emails are being sent
3. **Optimize**: Consider Realtime for instant notifications
4. **Extend**: Add SMS or Slack notifications
5. **Scale**: Add notification templates and preferences

---

## 💡 Pro Tips

1. **Auto-refresh**: NotificationBell refreshes every 30s
2. **Fallback mode**: If no API key, emails are logged
3. **Error handling**: Interview creation doesn't fail if email fails
4. **RLS security**: Users can only see own notifications
5. **Indexing**: Database has indexes for fast queries

---

## 🔗 Related Documentation

- Database schema: See DATABASE_SCHEMA_REFERENCE.md
- API endpoints: Check Supabase API docs
- Email templates: Future enhancement
- Real-time updates: Supabase Realtime subscription

---

**Last Updated**: March 25, 2026
**Version**: 1.0
