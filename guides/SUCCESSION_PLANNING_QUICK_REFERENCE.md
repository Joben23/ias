# Succession Planning Module - Quick Reference

## 🎯 Core Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/hr2/succession` | Dashboard & overview | HR Admin |
| `/hr2/succession/positions` | Manage key positions | HR Admin |
| `/hr2/succession/candidates` | Assign successors | HR Admin |
| `/hr2/succession/development` | Create dev plans | HR Admin |
| `/hr2/succession/:employeeId` | Employee career view | HR Admin, Employee (own) |

---

## 📊 Dashboard Metrics

| Metric | Purpose |
|--------|---------|
| **Total Positions** | All key positions defined |
| **Critical** | Positions marked as critical |
| **Ready Now** | Can assume role immediately (80%+) |
| **Ready Soon** | Ready in 6-12 months (60-79%) |
| **In Development** | Requires development (<60%) |
| **⚠️ No Successors** | Critical positions without ready candidates |

---

## 🔄 Readiness Levels

| Level | Score | Meaning | Action |
|-------|-------|---------|--------|
| ✅ Ready Now | 80-100% | Can move into role immediately | Keep as backup |
| ⏱️ Ready Soon | 60-79% | Ready within 6-12 months | Create dev plan if needed |
| 🔧 Needs Development | <60% | Requires significant development | Create development plan |

---

## 📋 Quick Tasks

### Create a New Position
1. Go to **Succession → Key Positions**
2. Click **New Position**
3. Fill: Name, Department, Description
4. Check **Critical** if urgent planning needed
5. Save

### Assign a Successor
1. Go to **Succession → Candidates**
2. Click **Assign Candidate**
3. Select Position & Employee
4. Set Succession Order (1=primary)
5. System calculates readiness automatically
6. Save

### Create Development Plan
1. Go to **Succession → Development**
2. Click **New Plan**
3. Select candidate (Needs Development status)
4. Add planned trainings (comma-separated)
5. Add required competencies
6. Set target completion date
7. Add notes
8. Save

### View Employee Career
1. Go to **Succession → Employee Portal** (if employee)
2. See your opportunities
3. Review readiness scores
4. Check your development plans
5. Understand gaps & recommendations

---

## 🎨 Color Coding

| Color | Meaning |
|-------|---------|
| 🟢 Green | Ready Now (80%+) |
| 🟡 Yellow | Ready Soon (60-79%) |
| 🟠 Orange | Needs Development (<60%) |
| 🔴 Red | Critical position without ready successor |

---

## 🔧 How Readiness is Calculated

```
Readiness Score = 
  (Matched Competencies ÷ Required) × 50% +
  (Completed Trainings ÷ Required) × 50%

Result: 0-100%
```

**Example:**
- Employee has 3 of 4 required competencies = 75%
- Employee completed 2 of 3 required trainings = 67%
- **Readiness = (75 × 0.5) + (67 × 0.5) = 71% (Ready Soon)**

---

## 📈 Pipeline Health Indicators

| Indicator | Good | Warning | Critical |
|-----------|------|---------|----------|
| Ready Now % | 20-30% | 10-20% | <10% |
| Ready Soon % | 30-40% | 20-30% | <20% |
| Avg Dev Time | <12 mo | 12-18 mo | >18 mo |
| Coverage | 2+ per role | 1+ per role | <1 per role |

---

## 🔒 Permissions

| Action | HR Admin | Manager | Employee |
|--------|----------|---------|----------|
| View dashboard | ✅ | ❌ | ❌ |
| Create positions | ✅ | ❌ | ❌ |
| Assign candidates | ✅ | ❌ | ❌ |
| Create dev plans | ✅ | ❌ | ❌ |
| View own opportunity | ✅ | ❌ | ✅ |
| View all opportunities | ✅ | ❌ | ❌ |
| Update status | ✅ | ⚠️ | ❌ |

---

## 💡 Best Practices

### For HR Administrators

1. **Start with Critical Positions**
   - Define your 10-15 most critical roles first
   - Mark them as "Critical"
   - Get maximum visibility

2. **Build Deep Pipelines**
   - Maintain 2-3 successors per critical role
   - Mix ready now + ready soon candidates
   - Plan for turnover

3. **Development Planning**
   - Create plans for all "Ready Soon" candidates
   - Target 6-12 month development timelines
   - Review quarterly

4. **Continuous Monitoring**
   - Check dashboard monthly
   - Address critical gaps immediately
   - Update plans as circumstances change

### For Managers

1. **Discuss Career Paths**
   - Share succession opportunities with employees
   - Align on development goals
   - Remove surprises

2. **Support Development**
   - Assign trainings as planned
   - Provide mentoring
   - Monitor progress

3. **Manage Retention**
   - Keep ready now candidates engaged
   - Create advancement pathways
   - Recognize readiness achievements

### For Employees

1. **Understand Your Path**
   - Review identified opportunities
   - Understand readiness scores
   - Identify development gaps

2. **Complete Development**
   - Engage with planned trainings
   - Build required competencies
   - Update your skills regularly

3. **Communicate Progress**
   - Update manager on learning
   - Share achievements
   - Discuss next steps

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Readiness not updating | Refresh page (Ctrl+F5) / Check competencies |
| Can't see candidates | Check you're on Candidates page / Verify data exists |
| Dev plan won't create | Select "Needs Development" candidate only |
| Employee not appearing | Verify employee is marked as "active" status |
| Critical gap not showing | Check position is marked "Critical" / Verify no "Ready Now" |

---

## 📞 Key Contacts

- **Dashboard Issues**: Check browser console
- **Data Questions**: Contact HR Admin
- **System Error**: Contact IT Support
- **Process Questions**: Contact HR Manager

---

## 📚 Related Modules

- **Training Management**: `/hr2/training` - Track employee training completion
- **Competency Management**: `/hr2/competency` - Define & track competencies
- **Employee Directory**: `/hr1/employees` - View employee information

---

**Last Updated**: March 27, 2025 | **Version**: 1.0 | **Status**: ✅ Production Ready
