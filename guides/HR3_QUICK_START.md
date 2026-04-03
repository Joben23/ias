# HR3 Quick Start Guide - Employee & HR Usage

## 🚀 For Employees

### Clock In

1. Log in to the system
2. Navigate to **Employee Portal** (`/employee-portal`)
3. Scroll to **Attendance** section
4. Click the **Clock In** button
5. You'll see:
   - ✅ "Clocked in successfully" message
   - Time In populated with current time
   - Status badge (green = Present, yellow = Late)

### Clock Out

1. In the **Attendance** section
2. Click the **Clock Out** button
3. System automatically calculates hours worked
4. You'll see:
   - ✅ "Clocked out successfully" message
   - Total Hours displayed (e.g., "8.25 hrs")
   - Both Time In and Time Out filled

### Why Status Matters

| Status | Meaning | Time |
|--------|---------|------|
| 🟢 **Present** | On time | Before 9:00 AM |
| 🟡 **Late** | Arrived after | 9:00 AM or later |
| 🔴 **Absent** | No record | No clock-in |

---

## 📊 For HR/Managers

### Access HR3 Dashboard

1. Log in with **HR or Admin** role
2. Click the module dropdown (top left)
3. Select **"HR3 – Workforce Operations"**
4. Default view: **Dashboard**

### HR3 Dashboard Features

#### Statistics Cards (Top Row)

- 👥 **Total Employees**: Count of active staff
- 🟢 **Present Today**: Number clocked in on time
- 🟡 **Late Today**: Number clocked in late
- 🔴 **Absent Today**: Number with no clock-in
- ⏱️ **Avg Hours**: Average hours worked today

#### Today's Attendance List

- Shows first 10 employees who clocked in
- Displays: Name, Time In, Status, Hours
- Auto-refreshes every minute
- Color-coded status badges

### Access Attendance Logs

1. In HR3 module, click **Attendance** in sidebar
2. You see the Attendance Logs page

### Filter by Period

**Today** (Default)
- Shows only today's records
- Quick daily overview

**This Week**
- Shows records from last 7 days
- Compare daily patterns
- Week-over-week analysis

### Filter by Status

**All Status** (Default)
- Shows everyone

**Present**
- Employees clocked in on time
- Status: arrives before 9:00 AM

**Late**
- Employees clocked in late
- Status: arrives 9:00 AM or later

**Absent**
- No attendance record
- Did not check in

### View Attendance Details

The table shows:

| Column | Description |
|--------|-------------|
| **Employee Name** | Full name |
| **Date** | Attendance date |
| **Time In** | Clock in timestamp |
| **Time Out** | Clock out timestamp |
| **Total Hours** | Hours worked (decimal) |
| **Status** | Present/Late/Absent |

### Export to CSV

1. Click **Export CSV** button
2. Your browser downloads a file like:
   ```
   attendance-today-2026-03-28.csv
   ```
3. Open in Excel/Sheets to analyze

### CSV File Format

```
Employee Name,Date,Time In,Time Out,Total Hours,Status
John Smith,Mar 28 2026,09:00 AM,05:30 PM,8.50,Late
Jane Doe,Mar 28 2026,08:30 AM,05:00 PM,8.50,Present
```

---

## 🎯 Common Tasks

### Check Who's Late Today

1. Go to **HR3 → Attendance**
2. Filter Period: **Today**
3. Filter Status: **Late**
4. See all late employees

### Get This Week's Summary

1. Go to **HR3 → Attendance**
2. Filter Period: **This Week**
3. Filter Status: **All Status**
4. Click **Export CSV**

### Monitor Real-Time Attendance

1. Go to **HR3 → Dashboard**
2. Watch Today's Attendance section
3. Refreshes automatically every minute
4. See current status of all clocked employees

### Find Absent Employees

1. Go to **HR3 → Attendance**
2. Filter Period: **Today**
3. Filter Status: **Absent**
4. See who hasn't clocked in

---

## ⏱️ How Hours Are Calculated

### Example Scenarios

**Scenario 1: Full Day**
- Clock In: 08:30 AM
- Clock Out: 05:15 PM
- **Total Hours**: 8.75 hours (8 hours 45 minutes)

**Scenario 2: Half Day**
- Clock In: 09:00 AM
- Clock Out: 12:30 PM
- **Total Hours**: 3.5 hours (3 hours 30 minutes)

**Scenario 3: Overtime**
- Clock In: 08:00 AM
- Clock Out: 06:00 PM
- **Total Hours**: 10 hours

### Decimal Format

- 8.25 = 8 hours 15 minutes
- 8.5 = 8 hours 30 minutes
- 8.75 = 8 hours 45 minutes
- 9.0 = 9 hours

---

## ❓ FAQ

### Q: What if I forgot to clock out?
**A**: Contact HR. They can manually update your record or add a note.

### Q: Can I clock in remotely?
**A**: Yes! Clock in from anywhere with internet access.

### Q: What if there's an error in my hours?
**A**: Notify HR immediately. They can review and correct in the admin panel.

### Q: Is the 9:00 AM deadline flexible?
**A**: Check your company policy. HR can modify based on your department.

### Q: Can I clock in for someone else?
**A**: No. System only allows clocking in for your own account. HR can manually add records if needed.

### Q: How far back can I see my attendance?
**A**: Forever. All records are stored. Use filters to find past records.

### Q: What time zone is used?
**A**: UTC (coordinated universal time). Times are consistent globally.

### Q: Can I undo a clock in/out?
**A**: Contact HR. Employees cannot undo, but HR can delete/modify records.

---

## 🔒 Privacy & Security

- ✅ Only you can see your personal clock in/out times
- ✅ Only HR/Admin can see everyone's records
- ✅ All data is encrypted in transit
- ✅ Timestamps are immutable (audit trail)
- ✅ Your employee ID links everything securely

---

## 💡 Tips & Best Practices

### For Employees

1. **Clock in immediately when you arrive**
   - Avoids "late" status
   - Accurate time tracking

2. **Use the same device/location**
   - Consistent system experience
   - Faster loading

3. **Check your hours at end of day**
   - Spot errors early
   - Report immediately

4. **Keep your employee info current**
   - Ensures name displays correctly
   - Faster admin processing

### For HR

1. **Check dashboard each morning**
   - Identify absent employees early
   - Notify managers if needed

2. **Review attendance reports weekly**
   - Spot patterns
   - Plan staffing

3. **Export before month-end**
   - Prepare for payroll
   - Archive for records

4. **Use filters efficiently**
   - Don't load all data at once
   - Filter by period/status first

---

## 🚨 Troubleshooting

### Clock In Button Doesn't Work

**Possible causes:**
- Already clocked in today
- Employee record not linked to account
- Network connection issue

**Solution:**
- Refresh page
- Contact HR to verify your employee record

### Times Show Incorrectly

**Possible causes:**
- Browser time zone settings
- Server time zone difference
- Display formatting

**Solution:**
- Check browser clock is accurate
- Contact IT for time sync issues

### Export CSV File Is Empty

**Possible causes:**
- No records matching filter
- Filter is too restrictive

**Solution:**
- Expand date range
- Remove status filter
- Try "This Week" instead of "Today"

### Can't See HR3 Module

**Possible causes:**
- Not logged in with HR/Admin role
- Page not loaded

**Solution:**
- Verify your user role
- Refresh page
- Contact admin if role is wrong

---

## 📞 Getting Help

### For Employees
- Contact your HR department
- Ask about clock in/out process
- Report any system issues

### For HR/Managers
- Check HR3_SETUP_GUIDE.md for technical details
- Review database schema if needed
- Contact IT for access issues

### For Developers
- See HR3_IMPLEMENTATION_COMPLETE.md
- Review database migration SQL
- Check component code for customization

---

## 📅 Typical Workflow

### Morning

1. Employee clocks in
2. HR Dashboard updated immediately
3. Status shows as Present or Late

### During Day

1. HR checks dashboard periodically
2. HR can see who's present, late, absent
3. Alerts sent if configured

### End of Day

1. Employee clocks out
2. Hours automatically calculated
3. Record completed

### End of Week

1. HR exports attendance data
2. Reviews for compliance
3. Prepares for payroll

### End of Month

1. Generate full attendance report
2. Analyze patterns
3. Archive for records

---

**Version**: 1.0  
**Last Updated**: March 28, 2026  
**Module**: HR3 – Workforce Operations & Time Management
