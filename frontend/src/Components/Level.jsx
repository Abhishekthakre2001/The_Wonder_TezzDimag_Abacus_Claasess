
import React, { useState } from "react";
import { useFetchData } from "../hooks/useFetchData";
import levelApi from "../api/LevelApi";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import useTableState from "../hooks/useTableState";
import InputField from "../UI/InputField";

export default function Level() {
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
        () => levelApi.getbyadminid(page, limit, debouncedSearch),
        [page, limit, debouncedSearch],
        { preserveResponse: true }
    );

    const levels = response?.data || [];
    const totalPages = response?.pagination?.totalPages || 1;
    const totalRecords = response?.pagination?.totalRecords || 0;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);

    const [level, setLevel] = useState("");
    const [levelName, setLevelName] = useState("");

    // Field-level errors
    const [errors, setErrors] = useState({});

    const [saving, setSaving] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const columns = [
        { key: "level", label: "Level" },
        { key: "level_name", label: "Level Name" },
    ];

    const openCreate = () => {
        setEditingRow(null);
        setLevel("");
        setLevelName("");
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setEditingRow(row);
        setLevel(row?.level ?? "");
        setLevelName(row?.level_name ?? "");
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingRow(null);
        setLevel("");
        setLevelName("");
        setErrors({});
    };

    const handleSave = async () => {
        const newErrors = {};

        if (!level || !level.toString().trim()) {
            newErrors.level = "Level is required";
        }

        if (!levelName || !levelName.trim()) {
            newErrors.levelName = "Level name is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            const payload = {
                level,
                level_name: levelName.trim(),
            };

            if (editingRow?.id) {
                await levelApi.update(editingRow.id, payload);
            } else {
                await levelApi.create(payload);
            }

            await reload();
            closeModal();
        } catch (err) {
            const errorMsg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Save failed";

            if (errorMsg.toLowerCase().includes("already exists")) {
                setErrors({
                    level: "This level already exists. Please use a different value.",
                });
            } else {
                setErrors({
                    form: errorMsg,
                });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (row) => {
        setDeleteTarget(row);
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);

        try {
            await levelApi.delete(deleteTarget.id);

            await reload();

            setDeleteOpen(false);
            setDeleteTarget(null);
        } catch (err) {
            console.error("Delete level error:", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={levels}
                title="Levels"
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
                        ? `Are you sure you want to delete "${deleteTarget.level}"?`
                        : undefined
                }
            />

            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={editingRow ? "Edit Level" : "Create Level"}
            >
                <div className="space-y-4">

                    {/* Level */}
                    <InputField
                        label="Level"
                        type="text"
                        value={level}
                        onChange={(e) => {
                            const numericValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                            );

                            setLevel(numericValue);

                            setErrors((prev) => ({
                                ...prev,
                                level: "",
                                form: "",
                            }));
                        }}
                        placeholder="Enter numeric level (e.g., 1, 2, 3)"
                        required
                        error={errors.level}
                        showError={!!errors.level}
                    />

                    {/* Level Name */}
                    <InputField
                        label="Level Name"
                        type="text"
                        value={levelName}
                        onChange={(e) => {
                            setLevelName(e.target.value);

                            setErrors((prev) => ({
                                ...prev,
                                levelName: "",
                                form: "",
                            }));
                        }}
                        placeholder="Enter level name (e.g., Beginner)"
                        required
                        error={errors.levelName}
                        showError={!!errors.levelName}
                    />

                    {/* API / General Error */}
                    {errors.form && (
                        <p className="text-sm text-red-600">
                            {errors.form}
                        </p>
                    )}

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
