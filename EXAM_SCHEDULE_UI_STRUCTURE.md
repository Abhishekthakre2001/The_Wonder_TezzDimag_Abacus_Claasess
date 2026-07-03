# Exam Schedule Module - Component Structure & UI Layout

## 📐 Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        Exam Schedules                            │
│                                                    [+ Add Button]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Search by Exam Title: [Search Input...]                         │
│                                                                   │
│  [Status ▼]  [Category ▼]  [Type ▼]  [CSV Export] [JSON Export] │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Exam Title │ Start DateTime │ End DateTime │ Status │ Category  │
├─────────────────────────────────────────────────────────────────┤
│  Math Exam  │ 2026-07-15 ... │ 2026-07-15 │ Active │ Abacus    │
│  English... │ 2026-07-16 ... │ 2026-07-16 │ Active │ Vedic     │
│  Science... │ 2026-07-17 ... │ 2026-07-17 │ Inactive... [Edit][Del]
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Records per page: [10▼]  Page 1 of 3  [First][Prev][Next][Last]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Component Hierarchy

```
Examschedule.jsx (Page)
│
├── Sidebar (existing)
│
└── main
    └── ExamScheduleList
        │
        ├── Header Section
        │   ├── Title
        │   └── [Add Button]
        │
        ├── Filters Section
        │   ├── Search Input
        │   ├── Status Dropdown
        │   ├── Category Dropdown
        │   ├── Type Dropdown
        │   ├── CSV Export Button
        │   └── JSON Export Button
        │
        ├── Table Section
        │   ├── Table Header (7 columns)
        │   ├── Table Body (with data rows)
        │   └── Table Actions (Edit, Delete per row)
        │
        ├── Pagination Section
        │   ├── Records per page selector
        │   ├── Page info
        │   └── Navigation buttons
        │
        └── Modals
            ├── Modal (Add/Edit)
            │   └── ExamScheduleForm
            │       ├── Exam Title (Input)
            │       ├── Start DateTime (Input)
            │       ├── End DateTime (Input)
            │       ├── Status (Select)
            │       ├── Category (Select)
            │       ├── Type (Select)
            │       ├── Levels (MultiSelect)
            │       ├── Sets (MultiSelect)
            │       ├── Question Paper (Select - conditional)
            │       ├── State (MultiSelect)
            │       ├── District (MultiSelect - conditional)
            │       ├── Institute (MultiSelect - conditional)
            │       ├── Error Messages (if any)
            │       └── Buttons (Cancel, Submit)
            │
            └── DeleteConfirmModal
                ├── Title
                ├── Message
                ├── Cancel Button
                └── Delete Button
```

---

## 📋 Form Field Layout

### Desktop View (2 Column Layout)
```
┌─────────────────────────────────────────────────┐
│ Exam Title *                                    │
│ [________________ Math Final Exam _______________] │
├────────────────┬──────────────────────────────┤
│ Start DateTime │ End DateTime *               │
│ [______________] │ [________________]        │
├────────────────┴──────────────────────────────┤
│ Status *         Category *      Type *        │
│ [Active▼]      [Abacus▼]       [Mock▼]      │
├─────────────────────────────────────────────────┤
│ Exam Levels *            Exam Sets *           │
│ [Multi-Select]           [Multi-Select]        │
├─────────────────────────────────────────────────┤
│ Question Paper *                                │
│ [Disabled until Level & Set selected]         │
├────────────────┬────────────────┬──────────────┤
│ State *        │ District *     │ Institute *  │
│ [Multi ▼]      │ [Multi ▼]      │ [Multi ▼]   │
├─────────────────────────────────────────────────┤
│ Error Message (if any)                         │
├─────────────────────────────────────────────────┤
│                          [Cancel] [Create/Update]│
└─────────────────────────────────────────────────┘
```

### Mobile View (1 Column Layout)
```
┌──────────────────────────────────┐
│ Exam Title *                     │
│ [_____Math Final Exam______]    │
├──────────────────────────────────┤
│ Start DateTime *                 │
│ [______________]               │
├──────────────────────────────────┤
│ End DateTime *                   │
│ [______________]               │
├──────────────────────────────────┤
│ Status *                         │
│ [Active▼]                       │
├──────────────────────────────────┤
│ Category *                       │
│ [Abacus▼]                       │
├──────────────────────────────────┤
│ Type *                           │
│ [Mock▼]                         │
├──────────────────────────────────┤
│ Exam Levels *                    │
│ [Multi-Select]                  │
├──────────────────────────────────┤
│ Exam Sets *                      │
│ [Multi-Select]                  │
├──────────────────────────────────┤
│ Question Paper *                 │
│ [Disabled]                      │
├──────────────────────────────────┤
│ State *                          │
│ [Multi ▼]                       │
├──────────────────────────────────┤
│ District *                       │
│ [Multi ▼]                       │
├──────────────────────────────────┤
│ Institute *                      │
│ [Multi ▼]                       │
├──────────────────────────────────┤
│ [Cancel]  [Create/Update]       │
└──────────────────────────────────┘
```

---

## 🎨 UI Components Used

### Reusable UI Components
```
InputField
├─ Exam Title input
├─ DateTime inputs (start, end)
└─ Error display

SelectField
├─ Status dropdown
├─ Category dropdown
├─ Type dropdown
├─ Question Paper dropdown
└─ Multi-select for Level, Set, State, District, Institute

Button
├─ Add Exam Schedule (primary)
├─ Create/Update (primary)
├─ Cancel (secondary)
├─ CSV Export (outline)
├─ JSON Export (outline)
├─ Edit (inline)
├─ Delete (inline)
└─ Pagination buttons

Modal
├─ Add/Edit form modal
└─ Footer with action buttons

DeleteConfirmModal
├─ Delete confirmation dialog
└─ Confirm/Cancel buttons

Table (Custom)
├─ Headers
├─ Data rows
├─ Action buttons
└─ Empty state
```

---

## 🎯 Field Dependency Flow

```
User Actions → Component Updates → Condition Checks → API Calls

Example Flow:
┌─────────────────────┐
│ Select Level & Set  │
└──────────┬──────────┘
           │
    ✓ Both Selected?
           │
           ↓ YES
   ┌───────────────────┐
   │ Load Question     │
   │ Papers            │
   │ (API Call)        │
   └───────────────────┘
           │
           ↓
   ┌───────────────────┐
   │ Question Paper    │
   │ Dropdown Enabled  │
   └───────────────────┘


Example Flow:
┌──────────────┐
│ Select State │
└──────┬───────┘
       │
  ✓ State Selected?
       │
       ↓ YES
┌──────────────────┐
│ Load Districts   │
│ (API Call)       │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ District Enabled │
└──────────────────┘
       │
┌──────────────────┐
│ User Selects     │
│ District         │
└──────┬───────────┘
       │
  ✓ District Selected?
       │
       ↓ YES
┌──────────────────┐
│ Load Institutes  │
│ (API Call)       │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Institute Enabled│
└──────────────────┘
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 768px):
- All fields in single column
- Table scrolls horizontally
- Filters stack vertically
- Full-width modal

Tablet (768px - 1024px):
- 2-column form layout
- Partial table horizontal scroll
- Filters in 2 columns

Desktop (> 1024px):
- 2-3 column form layout
- Full table display
- Filters in single row
- Optimal spacing
```

---

## 🔄 State Management Visualization

### ExamScheduleList States
```
page: 1
limit: 10
search: ""
debouncedSearch: ""
exam_status: ""
exam_category: ""
exam_type: ""

modalOpen: false
editingRow: null

deleteOpen: false
deleteTarget: null
deleteLoading: false

exporting: false
```

### ExamScheduleForm States
```
formData: {
  exam_title: "",
  start_datetime: "",
  end_datetime: "",
  exam_status: "Active",
  exam_category: "",
  exam_type: "",
  exam_level: [],
  exam_set: [],
  exam_state: [],
  exam_district: [],
  exam_institute: [],
  exam_paper_id: ""
}

errors: {}
touched: {}
saving: false
```

---

## 🎬 User Interaction Flow

### Create New Record
```
User Click
    ↓
Add Button Clicked
    ↓
Modal Opens
    ↓
Form Loads (empty)
    ↓
Dependent Data Loaded
    ↓
User Fills Form
    ↓
Form Validates on Submit
    ↓
Validation Passed?
    ├─ YES → POST /exam-schedules
    │         ↓
    │         Success → Modal Close → List Refreshes
    │
    └─ NO → Error Messages Display
            User Corrects
            Resubmit
```

### Edit Existing Record
```
User Click
    ↓
Edit Button Clicked
    ↓
Modal Opens
    ↓
Form Loads with Data
    ↓
Dependent Data Loads Based on Existing Values
    ↓
All Fields Pre-populated
    ↓
User Modifies Form
    ↓
Form Validates on Submit
    ↓
Validation Passed?
    ├─ YES → PUT /exam-schedules/:id
    │         ↓
    │         Success → Modal Close → List Refreshes
    │
    └─ NO → Error Messages Display
            User Corrects
            Resubmit
```

### Delete Record
```
User Click
    ↓
Delete Button Clicked
    ↓
Confirmation Modal Opens
    ↓
User Confirms?
    ├─ YES → DELETE /exam-schedules/:id
    │         ↓
    │         Success → Modal Close → List Refreshes
    │
    └─ NO → Modal Closes
            No Action
```

---

## 🔍 Table View Details

### Columns Displayed
1. **Exam Title** - Full text
2. **Start DateTime** - Formatted date (2026-07-15 10:00)
3. **End DateTime** - Formatted date (2026-07-15 12:00)
4. **Exam Status** - Badge (Green: Active, Gray: Inactive)
5. **Exam Category** - Abacus / Vedic
6. **Exam Type** - Mock / Main Exam
7. **Created At** - Date only (2026-07-15)
8. **Actions** - Edit & Delete buttons

### Sorting
- Default: Created at DESC (newest first)
- Column click doesn't change sort (backend handles it)

### Row Rendering
- Hover effect: Subtle background change
- Conditional styling: Status badges with colors
- Formatted dates: User-friendly format
- Action buttons: Icon-based (Edit, Delete)

---

## 📊 Filter & Search Behavior

### Search
- Debounce: 500ms
- Field: Exam Title only
- Case: Insensitive
- Reset: Page goes back to 1

### Filters
- Status: Active / Inactive / (All)
- Category: Abacus / Vedic / (All)
- Type: Mock / Main Exam / (All)
- Combination: AND logic (all filters apply)
- Reset: Page goes back to 1

### Export
- Respects current search & filters
- CSV: Comma-separated, quoted strings
- JSON: Array of objects
- Downloads as file

---

## ✨ Visual Indicators

### Loading States
- Spinner during API calls
- Disabled buttons while loading
- Table shows loading indicator

### Error States
- Red error messages below fields
- Validation error styling
- Toast/modal for API errors

### Success States
- Success message in toast (if implemented)
- Modal closes on success
- List refreshes

### Disabled States
- Question Paper disabled until Level & Set selected
- District disabled until State selected
- Institute disabled until District selected

---

## 🎯 Color Scheme

```
Status Badge:
- Active: Green background (#10B981), green text
- Inactive: Gray background, gray text

Buttons:
- Primary: Blue (#3B82F6)
- Danger: Red (#EF4444)
- Outline: Border gray, gray text

Input Fields:
- Border: Gray (#D1D5DB)
- Focus: Blue ring
- Error: Red (#EF4444)

Table:
- Header: Light gray background
- Rows: White, hover gray
- Border: Light gray

Modal:
- Background: White
- Shadow: Dark with blur
- Overlay: Black with opacity
```

---

## 🚀 Performance Optimizations

1. **Debounced Search** (500ms)
   - Prevents excessive API calls

2. **Pagination**
   - Loads only current page data
   - Limits per page (5, 10, 20, 50)

3. **Conditional Data Fetching**
   - Districts load only when state selected
   - Institutes load only when district selected
   - Papers load only when level & set selected

4. **Form Reset on Edit**
   - Clear previous errors
   - Reload dependent data
   - Pre-populate all fields

5. **Efficient Re-renders**
   - Component only re-renders when state changes
   - API calls via hooks with dependency arrays
   - useCallback for event handlers

---

## 📝 Accessibility Features

- ✅ Form labels with * for required
- ✅ Clear error messages
- ✅ Proper button states
- ✅ Keyboard navigation support
- ✅ Color contrast meets standards
- ✅ Responsive design works on all devices

---

## Summary

The component structure is:
- **Modular**: Reusable form component
- **Responsive**: Works on all devices
- **Performant**: Optimized API calls
- **User-Friendly**: Clear validation and feedback
- **Maintainable**: Well-organized code with comments

