import React, { useState } from "react";
import { useFetchData } from "../hooks/useFetchData";
import setsApi from "../api/SetsApi";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import useTableState from "../hooks/useTableState";
import InputField from "../UI/InputField";

export default function Sets() {
  const {
    page,
    limit,
    search,
    debouncedSearch,
    setPage,
    handleSearchChange,
    handleLimitChange,
  } = useTableState();

  const {
    data: response,
    loading,
    reload,
  } = useFetchData(
    () => setsApi.getByAdmin(page, limit, debouncedSearch),
    [page, limit, debouncedSearch],
    { preserveResponse: true }
  );

  const sets = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;
  const totalRecords = response?.pagination?.totalRecords || 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const columns = [
    {
      key: "set_name",
      label: "Set Name",
    },
  ];

  // Open modal for creating a new set
  const openCreate = () => {
    setEditingRow(null);
    setValue("");
    setError("");
    setModalOpen(true);
  };

  // Open modal for editing an existing set
  const openEdit = (row) => {
    setEditingRow(row);
    setValue(row?.set_name ?? "");
    setError("");
    setModalOpen(true);
  };

  // Close and reset the form modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingRow(null);
    setValue("");
    setError("");
  };

  // Create or update a set
  const handleSave = async () => {
    const setName = value.trim().toUpperCase();

    if (!setName) {
      setError("Set name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Do not send createdby.
      // The backend gets the authenticated user from the JWT.
      if (editingRow?.id) {
        await setsApi.update(editingRow.id, {
          set_name: setName,
        });
      } else {
        await setsApi.create({
          set_name: setName,
        });
      }

      await reload();
      closeModal();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to save set";

      if (errorMessage.toLowerCase().includes("already exists")) {
        setError("This set already exists. Please use a different name.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  // Delete the selected set
  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);

    try {
      await setsApi.delete(deleteTarget.id);

      await reload();

      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete set error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={sets}
        title="Sets"
        currentPage={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        searchTerm={search}
        onSearchChange={handleSearchChange}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={handleDeleteClick}
        searchable
        pagination
        showActions
        loading={loading}
        exportable={false}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.set_name}"?`
            : undefined
        }
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingRow ? "Edit Set" : "Create Set"}
      >
        <div className="space-y-4">
          <div>
            <InputField
              label="Set Name"
              value={value}
              maxLength={1}
              placeholder="A, B, C..."
              required
              error={error}
              showError={!!error}
              onChange={(e) => {
                const setName = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "");

                setValue(setName);
                setError("");
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 rounded"
              disabled={saving}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}