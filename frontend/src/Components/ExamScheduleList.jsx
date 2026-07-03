import React, { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { useFetchData } from "../hooks/useFetchData";
import useTableState from "../hooks/useTableState";
import examScheduleApi from "../api/examScheduleApi";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import SelectField from "../UI/SelectField";
import ExamScheduleForm from "./ExamScheduleForm";
import colors from "../utils/Color";

export default function ExamScheduleList() {
  // ==========================================
  // Table State Management
  // ==========================================
  const {
    page,
    limit,
    search,
    debouncedSearch,
    setPage,
    handleSearchChange,
    handleLimitChange,
  } = useTableState();

  // ==========================================
  // Filter State
  // ==========================================
  const [exam_status, setExamStatus] = useState("");
  const [exam_category, setExamCategory] = useState("");
  const [exam_type, setExamType] = useState("");

  // ==========================================
  // Modal State
  // ==========================================
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ==========================================
  // Fetch Data with Filters
  // ==========================================
  const {
    data: response,
    loading,
    reload,
  } = useFetchData(
    () =>
      examScheduleApi.getAll(
        page,
        limit,
        debouncedSearch,
        exam_status,
        exam_category,
        exam_type
      ),
    [page, limit, debouncedSearch, exam_status, exam_category, exam_type],
    { preserveResponse: true }
  );

  const examSchedules = response?.data || [];
  const pagination = response?.pagination || {};

  // ==========================================
  // Table Columns with Custom Renderers
  // ==========================================
  const columns = [
    { 
      key: "exam_title", 
      label: "Exam Title" 
    },
    {
      key: "start_datetime",
      label: "Start Date Time",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "end_datetime",
      label: "End Date Time",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "exam_status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    { 
      key: "exam_category", 
      label: "Category" 
    },
    { 
      key: "exam_type", 
      label: "Type" 
    },
  ];

  // ==========================================
  // Filter Options
  // ==========================================
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Abacus", label: "Abacus" },
    { value: "Vedic", label: "Vedic" },
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Mock", label: "Mock" },
    { value: "Main Exam", label: "Main Exam" },
  ];

  // ==========================================
  // Event Handlers
  // ==========================================
  const handleOpenCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingRow(null);
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await examScheduleApi.delete(deleteTarget.id);
      await reload();
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await examScheduleApi.export(
        "csv",
        debouncedSearch,
        exam_status,
        exam_category,
        exam_type
      );
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // Render
  // ==========================================
  return (
    <>
      {/* Filters Section */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SelectField
            label="Status"
            value={exam_status}
            onChange={(e) => {
              setExamStatus(e.target.value);
              setPage(1);
            }}
            options={statusOptions}
          />

          <SelectField
            label="Category"
            value={exam_category}
            onChange={(e) => {
              setExamCategory(e.target.value);
              setPage(1);
            }}
            options={categoryOptions}
          />

          <SelectField
            label="Type"
            value={exam_type}
            onChange={(e) => {
              setExamType(e.target.value);
              setPage(1);
            }}
            options={typeOptions}
          />

          <div className="flex items-end">
            <button
              onClick={handleExportExcel}
              disabled={exporting || examSchedules.length === 0}
              style={{
                backgroundColor: colors.button.export.bg,
                color: colors.button.export.text,
              }}
              className="w-full flex items-center justify-center gap-2 hover:bg-[#e86f2c] text-white px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Exam Schedules"
        columns={columns}
        data={examSchedules}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalRecords={pagination.total}
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
        exportable={false}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingRow ? "Edit Exam Schedule" : "Create Exam Schedule"}
        width="max-w-2xl"
      >
        <ExamScheduleForm
          editingData={editingRow}
          onClose={handleCloseModal}
          onSuccess={() => {
            reload();
            setPage(1);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Exam Schedule"
        message={`Are you sure you want to delete "${deleteTarget?.exam_title}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </>
  );
}
