# Exam Schedule Frontend - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### 1. Verify Backend is Running
```bash
cd Backend
npm run dev
# Should see: ✅ Server running on http://localhost:4001
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should see: Vite dev server running
```

### 3. Access Exam Schedules Page
- Navigate to **Exam Schedules** from your app menu
- You should see the exam schedules list page

### 4. Create First Exam Schedule
1. Click "Add Exam Schedule" button
2. Fill in the form:
   - **Exam Title:** "Mathematics Mock Test"
   - **Start Date & Time:** 2026-07-15 10:00
   - **End Date & Time:** 2026-07-15 12:00
   - **Status:** Active
   - **Category:** Abacus
   - **Type:** Mock
   - **Level:** Select one or more
   - **Set:** Select one or more
   - **Question Paper:** Will populate after selecting level & set
   - **State:** Select one
   - **District:** Will populate after selecting state
   - **Institute:** Will populate after selecting district
3. Click "Create Exam Schedule"
4. Success! Record appears in list

---

## 📁 Files Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── examScheduleApi.js          ✅ UPDATED - New CRUD endpoints
│   ├── Components/
│   │   ├── ExamScheduleForm.jsx        ✨ NEW - Reusable form
│   │   └── ExamScheduleList.jsx        ✨ NEW - List page
│   └── Pages/
│       └── Examschedule.jsx            ✅ UPDATED - Uses new component
└── EXAM_SCHEDULE_FRONTEND_GUIDE.md    ✨ NEW - Complete documentation
```

---

## 🔌 API Endpoints Called

```
GET    /exam-schedules
GET    /exam-schedules/:id
POST   /exam-schedules
PUT    /exam-schedules/:id
DELETE /exam-schedules/:id
GET    /exam-schedules/export
GET    /levels
GET    /sets
GET    /states
GET    /districts
GET    /institute
GET    /questions
```

---

## 📊 Form Payload Structure

### Create/Update Request Body

```javascript
{
  "exam_title": "Mathematics Final Exam",
  "start_datetime": "2026-07-15T10:00:00",
  "end_datetime": "2026-07-15T12:00:00",
  "exam_status": "Active",
  "exam_category": "Abacus",
  "exam_type": "Mock",
  "exam_level": [1, 2, 3],                    // Array of level IDs
  "exam_set": [101, 102],                     // Array of set IDs
  "exam_state": [5],                          // Array of state IDs
  "exam_district": [25],                      // Array of district IDs
  "exam_institute": [50]                      // Array of institute IDs
}
```

### API Response Format

```javascript
{
  "success": true,
  "message": "Exam Schedule created successfully",
  "data": {
    "id": 1,
    "exam_title": "Mathematics Final Exam",
    "start_datetime": "2026-07-15T10:00:00Z",
    "end_datetime": "2026-07-15T12:00:00Z",
    "exam_status": "Active",
    "exam_category": "Abacus",
    "exam_type": "Mock",
    "exam_level": [1, 2, 3],
    "exam_set": [101, 102],
    "exam_state": [5],
    "exam_district": [25],
    "exam_institute": [50],
    "created_by": 1,
    "created_at": "2026-07-02T10:30:00Z",
    "updated_at": "2026-07-02T10:30:00Z"
  }
}
```

---

## ✨ Features at a Glance

| Feature | Details |
|---------|---------|
| **List** | Table with sorting, search, filters, pagination |
| **Add** | Modal form with validation and dependent dropdowns |
| **Edit** | Pre-populated form with auto-loading dependent fields |
| **Delete** | Confirmation modal before deletion |
| **Search** | Real-time search by exam title (debounced) |
| **Filter** | Status, Category, Type filters |
| **Pagination** | Page-based with limit selector (5, 10, 20, 50) |
| **Export** | CSV and JSON export with filters |
| **Validation** | Client-side validation with error messages |
| **Responsive** | Mobile-friendly design |

---

## 🎨 Component Architecture

### ExamScheduleList (Container)
- Manages list state (page, limit, search, filters)
- Fetches exam schedules data
- Renders table with CRUD actions
- Handles modal open/close for add/edit
- Handles delete confirmation
- Handles export functionality

### ExamScheduleForm (Reusable)
- Manages form state (11 fields)
- Handles validation
- Loads dependent data
- Handles conditional field enabling
- Submits create or update request

### examScheduleApi (Service)
- All API calls in one place
- Pagination support
- Filter support
- Export support
- Dependent data endpoints

---

## 🔄 Data Flow Example

### Creating a New Exam Schedule

```
1. User clicks "Add Exam Schedule"
   ↓
2. Modal opens with ExamScheduleForm (empty)
   ↓
3. Form component mounts
   - Loads levels, sets, states
   ↓
4. User fills exam title, dates, status, category, type
   ↓
5. User selects levels and sets
   - Question papers automatically load
   ↓
6. User selects question paper
   ↓
7. User selects state
   - Districts automatically load
   ↓
8. User selects district
   - Institutes automatically load
   ↓
9. User selects institute
   ↓
10. User clicks "Create Exam Schedule"
    ↓
11. Form validates all fields
    ↓
12. POST /exam-schedules with payload
    ↓
13. Success message shown
    ↓
14. Modal closes
    ↓
15. List refreshes and shows new record
```

---

## 🐛 Common Issues & Fixes

### Question Paper dropdown not loading
**Check:**
- Did you select at least one Level?
- Did you select at least one Set?
- If yes to both, question paper dropdown should be enabled

**Fix:** Make sure to select both Level AND Set before Question Paper appears

### District dropdown disabled
**Check:**
- Did you select a State?

**Fix:** Select a State first, then District dropdown will enable

### API errors in console
**Check:**
- Is backend running on http://localhost:4001?
- Is the endpoint name correct? (should be `/exam-schedules`, not `/exam-schedule`)
- Is JWT token valid?

**Fix:** 
1. Verify backend is running
2. Check network tab in DevTools
3. Verify token in localStorage

### Form not submitting
**Check:**
- Are all required fields filled?
- Do validation messages show any errors?

**Fix:** 
- Fill all required fields (marked with *)
- Ensure End Date > Start Date
- Check error messages for details

### Export not working
**Check:**
- Do you have at least one record?
- Is the file download blocked by browser?

**Fix:**
- Ensure data exists
- Check browser's download permissions
- Try different format (CSV or JSON)

---

## 📋 Checklist Before Going Live

- [ ] Backend running on http://localhost:4001
- [ ] Frontend running and accessible
- [ ] Can create exam schedule
- [ ] Can view list
- [ ] Can edit record
- [ ] Can delete record
- [ ] Can search by title
- [ ] Can filter by status/category/type
- [ ] Can export to CSV
- [ ] Can export to JSON
- [ ] Pagination working
- [ ] Form validation working
- [ ] Error messages display correctly
- [ ] JWT authentication working
- [ ] Dependent dropdowns loading correctly

---

## 🔐 Security Notes

✅ All endpoints require JWT authentication
✅ Bearer token automatically sent from localStorage
✅ Backend enforces user isolation (created_by)
✅ Input validation on both client and server
✅ Error messages safe for user display

---

## 📞 Need Help?

1. **Check the full guide:** `EXAM_SCHEDULE_FRONTEND_GUIDE.md`
2. **Check component code:** Fully commented JSX files
3. **Check API calls:** All in `api/examScheduleApi.js`
4. **Check DevTools:** Network tab shows all requests/responses

---

## 🎯 Next Steps

1. Test the module thoroughly
2. Customize styling if needed
3. Add additional features (bulk operations, etc.)
4. Deploy to production
5. Gather user feedback

---

## ✨ You're All Set!

Your Exam Schedule CRUD module is ready to use. Start with the "Quick Start" section above and explore the features!

