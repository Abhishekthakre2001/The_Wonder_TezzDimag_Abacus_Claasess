# Exam Schedule Module - Component Usage Guide

## 🎨 UI Components Reference

### 1. DataTable Component

**When to use:** List/grid display with pagination, search, filters

**Import:**
```jsx
import DataTable from "../UI/DataTable";
```

**Basic Usage:**
```jsx
<DataTable
  title="Exam Schedules"
  columns={[
    { key: "exam_title", label: "Exam Title" },
    { key: "exam_status", label: "Status", render: (v) => <Badge>{v}</Badge> }
  ]}
  data={data}
  currentPage={page}
  totalPages={totalPages}
  totalRecords={totalRecords}
  onPageChange={setPage}
  onLimitChange={setLimit}
  searchTerm={search}
  onSearchChange={setSearch}
  onCreate={openCreateModal}
  onEdit={openEditModal}
  onDelete={confirmDelete}
  searchable
  pagination
  showActions
  loading={isLoading}
/>
```

**Props:**
- `title` (string) - Table title
- `columns` (array) - Column definitions with `key`, `label`, optional `render`
- `data` (array) - Table data
- `currentPage` (number) - Current page
- `totalPages` (number) - Total pages
- `onPageChange` (func) - Page change callback
- `onLimitChange` (func) - Records per page callback
- `onCreate` (func) - Add button handler
- `onEdit` (func) - Edit row handler
- `onDelete` (func) - Delete row handler
- `searchable` (bool) - Show search input
- `pagination` (bool) - Show pagination
- `showActions` (bool) - Show action buttons
- `loading` (bool) - Loading state

---

### 2. Modal Component

**When to use:** Forms, dialogs, overlays

**Import:**
```jsx
import Modal from "../UI/Modal";
```

**Usage:**
```jsx
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Create Exam Schedule"
  width="max-w-2xl"
>
  <form className="space-y-4">
    {/* Form content */}
  </form>
</Modal>
```

**Props:**
- `open` (bool) - Modal visibility
- `onClose` (func) - Close callback
- `title` (string) - Modal title
- `width` (string) - Tailwind width class (default: max-w-lg)
- `footer` (JSX) - Optional footer content

---

### 3. DeleteConfirmModal Component

**When to use:** Confirm before delete operations

**Import:**
```jsx
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
```

**Usage:**
```jsx
<DeleteConfirmModal
  open={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  onConfirm={handleDelete}
  title="Delete Exam Schedule"
  message={`Delete "${item.exam_title}"?`}
  loading={isDeleting}
/>
```

**Props:**
- `open` (bool) - Modal visibility
- `onClose` (func) - Close callback
- `onConfirm` (func) - Delete callback
- `title` (string) - Modal title (default: Delete Confirmation)
- `message` (string) - Confirmation message
- `loading` (bool) - Deleting state

---

### 4. InputField Component

**When to use:** Text inputs, email, numbers, dates, etc.

**Import:**
```jsx
import InputField from "../UI/InputField";
```

**Usage:**
```jsx
<InputField
  label="Exam Title"
  name="exam_title"
  type="text"
  value={formData.exam_title}
  onChange={handleChange}
  onBlur={handleBlur}
  placeholder="Enter exam title"
  error={errors.exam_title}
  showError={touched.exam_title}
  required
  disabled={false}
/>
```

**Props:**
- `label` (string) - Field label
- `name` (string) - Input name attribute
- `type` (string) - Input type (text, email, number, date, datetime-local, etc.)
- `value` (any) - Input value
- `onChange` (func) - Change handler
- `onBlur` (func) - Blur handler
- `placeholder` (string) - Placeholder text
- `error` (string) - Error message
- `showError` (bool) - Show error flag
- `required` (bool) - Required indicator (*)
- `disabled` (bool) - Disabled state
- `containerClassName` (string) - Wrapper CSS class
- `className` (string) - Input CSS class

---

### 5. SelectField Component

**When to use:** Dropdowns, single/multiple selection

**Import:**
```jsx
import SelectField from "../UI/SelectField";
```

**Single Select Usage:**
```jsx
<SelectField
  label="Status"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  options={[
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ]}
  placeholder="Select status"
  required
/>
```

**Multi-Select Usage:**
```jsx
<SelectField
  label="Exam Levels"
  value={levels}
  onChange={(e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setLevels(selected);
  }}
  options={levelOptions}
  required
/>
```

**Props:**
- `label` (string) - Field label
- `value` (string/array) - Selected value(s)
- `onChange` (func) - Change handler
- `options` (array) - Options array with `value` and `label`
- `placeholder` (string) - Placeholder text
- `error` (string) - Error message
- `showError` (bool) - Show error flag
- `required` (bool) - Required indicator (*)
- `disabled` (bool) - Disabled state
- `onBlur` (func) - Blur handler
- `containerClassName` (string) - Wrapper CSS class
- `className` (string) - Input CSS class

---

### 6. Button Component

**When to use:** All button actions

**Import:**
```jsx
import Button from "../UI/Button";
```

**Usage:**
```jsx
<Button
  variant="primary"
  size="md"
  onClick={handleClick}
  loading={isLoading}
  disabled={isDisabled}
  icon={PlusIcon}
>
  Add New
</Button>
```

**Props:**
- `variant` (string) - primary, secondary, danger, outline, green
- `size` (string) - sm, md, lg
- `onClick` (func) - Click handler
- `loading` (bool) - Loading state (shows spinner)
- `disabled` (bool) - Disabled state
- `icon` (component) - Lucide React icon component
- `type` (string) - button, submit, reset
- `className` (string) - Additional CSS classes

---

## 🎯 Form Validation Pattern

```jsx
// State
const [formData, setFormData] = useState({ field: "" });
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

// Validation function
const validateForm = () => {
  const newErrors = {};
  if (!formData.field) newErrors.field = "Field is required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Input handler
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  setTouched(prev => ({ ...prev, [name]: true }));
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: "" }));
  }
};

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await api.create(formData);
    onSuccess();
  } catch (error) {
    setErrors({ submit: error.message });
  }
};

// Render
<InputField
  label="Title"
  name="field"
  value={formData.field}
  onChange={handleChange}
  onBlur={() => setTouched(prev => ({ ...prev, field: true }))}
  error={errors.field}
  showError={touched.field}
  required
/>
```

---

## 🎨 Color System

**Location:** `src/utils/Color.js`

**Available Colors:**
```javascript
colors.button.add.bg         // Blue
colors.button.export.bg      // Orange  
colors.button.clear.bg       // Gray
colors.danger                // Red
colors.success               // Green
colors.warning               // Orange
colors.info                  // Blue
```

**Usage:**
```jsx
<button
  style={{ backgroundColor: colors.button.add.bg }}
  className="text-white px-4 py-2 rounded-lg"
>
  Add
</button>
```

---

## 📐 Tailwind CSS Patterns

### Spacing
```jsx
space-y-2    /* Vertical spacing */
space-x-2    /* Horizontal spacing */
gap-4        /* Grid/flex gap */
```

### Responsive
```jsx
grid-cols-1          /* Mobile: 1 column */
md:grid-cols-2       /* Tablet: 2 columns */
lg:grid-cols-3       /* Desktop: 3 columns */
```

### Text
```jsx
text-sm              /* 14px */
font-medium          /* 500 weight */
text-gray-700        /* Color */
```

### Borders
```jsx
border              /* 1px border */
border-gray-300     /* Color */
rounded-lg          /* Border radius */
```

### Shadows
```jsx
shadow              /* Small shadow */
shadow-lg           /* Large shadow */
shadow-xl           /* Extra large */
```

---

## 🔄 Common Patterns

### Confirmation Dialog Pattern
```jsx
const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteOpen, setDeleteOpen] = useState(false);

const handleDelete = () => {
  setDeleteTarget(item);
  setDeleteOpen(true);
};

const handleConfirm = async () => {
  await api.delete(deleteTarget.id);
  setDeleteOpen(false);
  reload();
};

<DeleteConfirmModal
  open={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  onConfirm={handleConfirm}
  message={`Delete "${deleteTarget?.name}"?`}
/>
```

### Modal Form Pattern
```jsx
const [modalOpen, setModalOpen] = useState(false);

const handleOpenCreate = () => {
  setEditingData(null);
  setModalOpen(true);
};

<Modal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  title="Create Item"
>
  <Form
    onSuccess={() => {
      setModalOpen(false);
      reload();
    }}
  />
</Modal>
```

### API Call Pattern
```jsx
const handleSubmit = async () => {
  setSaving(true);
  try {
    if (editingData?.id) {
      await api.update(editingData.id, payload);
    } else {
      await api.create(payload);
    }
    onSuccess();
  } catch (error) {
    setError(error.response?.data?.message || "Error");
  } finally {
    setSaving(false);
  }
};
```

---

## ✨ Best Practices

### DO ✅
- Use existing UI components
- Follow naming conventions
- Add proper error handling
- Validate before submit
- Show loading states
- Use consistent spacing
- Organize with comments
- Keep components focused
- Use semantic HTML

### DON'T ❌
- Create custom styled elements
- Mix different button styles
- Use inline styles (except colors)
- Hardcode colors
- Skip error handling
- Forget loading states
- Use unnamed event handlers
- Make components too large
- Ignore accessibility

---

## 🚀 Example: Complete CRUD Page

```jsx
import React, { useState } from "react";
import { useFetchData } from "../hooks/useFetchData";
import useTableState from "../hooks/useTableState";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import Form from "./Form";

export default function CrudPage() {
  // State management
  const { page, limit, search, debouncedSearch, setPage, handleSearchChange, handleLimitChange } = useTableState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Data fetching
  const { data: response, loading, reload } = useFetchData(
    () => api.getAll(page, limit, debouncedSearch),
    [page, limit, debouncedSearch],
    { preserveResponse: true }
  );

  // Event handlers
  const handleOpenCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await api.delete(deleteTarget.id);
    reload();
    setDeleteOpen(false);
  };

  // Render
  return (
    <>
      <DataTable
        title="Items"
        columns={columns}
        data={response?.data || []}
        currentPage={response?.pagination?.page}
        totalPages={response?.pagination?.pages}
        totalRecords={response?.pagination?.total}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        searchTerm={search}
        onSearchChange={handleSearchChange}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
        searchable
        pagination
        showActions
        loading={loading}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRow ? "Edit" : "Create"}
      >
        <Form
          editingData={editingRow}
          onSuccess={() => {
            setModalOpen(false);
            reload();
          }}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Delete "${deleteTarget?.name}"?`}
      />
    </>
  );
}
```

---

## 📚 Additional Resources

- **DataTable Component:** Check `UI/DataTable.jsx` for full API
- **Color System:** Check `utils/Color.js` for available colors
- **Form Patterns:** Check `Components/District.jsx` for reference
- **Hooks:** Check `hooks/` directory for state management helpers
- **API Services:** Check `api/` directory for data fetching patterns

---

## ✅ Checklist for New Components

- [ ] Import required UI components
- [ ] Set up state management (useState, hooks)
- [ ] Fetch data with useFetchData hook
- [ ] Define columns array for DataTable
- [ ] Create event handlers (CRUD operations)
- [ ] Use DataTable for list display
- [ ] Use Modal for forms
- [ ] Use DeleteConfirmModal for deletion
- [ ] Use InputField/SelectField in forms
- [ ] Add error handling
- [ ] Test responsive design
- [ ] Verify with existing components
- [ ] No custom styled elements
- [ ] Proper loading states
- [ ] Validation on form submit

