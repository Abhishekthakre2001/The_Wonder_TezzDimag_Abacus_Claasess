import React, { useEffect, useState } from "react";
import InstituteApi from "../api/Institute";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../UI/DataTable";
import Modal from "../UI/Modal";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import useTableState from "../hooks/useTableState";
import { useFetchData } from "../hooks/useFetchData";

import InputField from "../UI/InputField";
import SelectField from "../UI/SelectField";

export default function Institute() {
    const {
        page,
        limit,
        search,
        debouncedSearch,
        setPage,
        handleSearchChange,
        handleLimitChange,
    } = useTableState();

    const { data: response, loading, reload } = useFetchData(
        () => InstituteApi.getAll(page, limit, debouncedSearch),
        [page, limit, debouncedSearch],
        { preserveResponse: true }
    );

    const institutes = response?.data || [];
    const totalPages = response?.pagination?.totalPages || 1;
    const totalRecords = response?.pagination?.totalRecords || 0;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);

    // FORM STATE
    const [form, setForm] = useState({
        institute_name: "",
        institute_contact: "",
        country_id: "1",
        state_id: "",
        district_id: "",
        city: "",
        address: "",
        pincode: "",
        is_active: 1,
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    // validation
    const validateForm = () => {
        const newErrors = {};

        if (!form.institute_name.trim()) {
            newErrors.institute_name = "Institute name is required";
        }

        if (!form.institute_contact.trim()) {
            newErrors.institute_contact = "Contact is required";
        } else if (!/^\d{10}$/.test(form.institute_contact)) {
            newErrors.institute_contact = "Contact must be 10 digits";
        }

        if (!form.country_id) {
            newErrors.country_id = "Country is required";
        }

        if (!form.state_id) {
            newErrors.state_id = "State is required";
        }

        if (!form.district_id) {
            newErrors.district_id = "District is required";
        }

        if (!form.city.trim()) {
            newErrors.city = "City is required";
        }

        if (!form.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (!form.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(form.pincode)) {
            newErrors.pincode = "Pincode must be 6 digits";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // LOAD DATA
    useEffect(() => {
        axiosInstance.get("/states?page=1&limit=1000")
            .then(res => setStates(res.data.data || []));

        axiosInstance.get("/districts?page=1&limit=1000")
            .then(res => setDistricts(res.data.data || []));
    }, []);

    const filteredStates = states.filter(
        (s) => s.country_id == form.country_id
    );

    const filteredDistricts = districts.filter(
        (d) => d.state_id == form.state_id
    );

    const columns = [
        { key: "institute_name", label: "Institute" },
        { key: "institute_contact", label: "Contact" },
        { key: "country_name", label: "Country" },
        { key: "state_name", label: "State" },
        { key: "district_name", label: "District" },
        { key: "city", label: "City" },
        {
            key: "is_active",
            label: "Status",
            render: (row) => (row.is_active ? "Active" : "Inactive"),
        },
    ];

    const openCreate = () => {
        setEditingRow(null);
        setForm({
            institute_name: "",
            institute_contact: "",
            country_id: "1",
            state_id: "",
            district_id: "",
            city: "",
            address: "",
            pincode: "",
            is_active: 1,
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setEditingRow(row);
        setForm({
            institute_name: row.institute_name || "",
            institute_contact: row.institute_contact || "",
            country_id: row.country_id || "1",
            state_id: row.state_id || "",
            district_id: row.district_id || "",
            city: row.city || "",
            address: row.address || "",
            pincode: row.pincode || "",
            is_active: row.is_active ?? 1,
        });
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            if (editingRow) {
                await InstituteApi.update(editingRow.id, form);
            } else {
                await InstituteApi.create(form);
            }

            await reload();
            setModalOpen(false);
            setErrors({});
        } catch (err) {
            setErrors({
                form: err?.response?.data?.message || "Save failed",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);
        try {
            await InstituteApi.delete(deleteTarget.id);
            await reload();
            setDeleteOpen(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <DataTable
                columns={columns}
                data={institutes}
                title="Institutes"
                currentPage={page}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
                searchTerm={search}
                onSearchChange={handleSearchChange}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={(row) => {
                    setDeleteTarget(row);
                    setDeleteOpen(true);
                }}
                searchable
                pagination
                showActions
                loading={loading}
            />

            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                message={
                    deleteTarget
                        ? `Delete "${deleteTarget.institute_name}"?`
                        : ""
                }
            />

            {/* ================= MODAL ================= */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingRow ? "Edit Institute" : "Create Institute"}
            >
                <div className="grid grid-cols-2 gap-4">

                    <InputField
                        label="Institute Name"
                        name="institute_name"
                        value={form.institute_name}
                        onChange={handleChange}
                        error={errors.institute_name}
                        showError={!!errors.institute_name}
                        required
                    />

                    <InputField
                        label="Contact"
                        type="number"
                        name="institute_contact"
                        value={form.institute_contact}
                        onChange={handleChange}
                        required
                        error={errors.institute_contact}
                        showError={!!errors.institute_contact}
                        maxLength={10}
                        minLength={10}
                    />

                    <SelectField
                        label="Country"
                        value={form.country_id}
                        required
                        error={errors.country_id}
                        showError={!!errors.country_id}
                        onChange={(e) =>
                            setForm({ ...form, country_id: e.target.value, state_id: "", district_id: "" })
                        }
                        options={[
                            { label: "India", value: "1" },
                            // { label: "UAE", value: "2" },
                        ]}
                    />

                    <SelectField
                        label="State"
                        value={form.state_id}
                        error={errors.state_id}
                        showError={!!errors.state_id}
                        onChange={(e) =>
                            setForm({ ...form, state_id: e.target.value, district_id: "" })
                        }
                        options={filteredStates.map((s) => ({
                            label: s.name,
                            value: s.id,
                        }))}
                        required
                    />

                    <SelectField
                        label="District"
                        value={form.district_id}
                        onChange={(e) =>
                            setForm({ ...form, district_id: e.target.value })
                        }
                        options={filteredDistricts.map((d) => ({
                            label: d.name,
                            value: d.id,
                        }))}
                        required
                        error={errors.district_id}
                        showError={!!errors.district_id}
                    />

                    <InputField
                        label="City"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required error={errors.city}
                        showError={!!errors.city}
                    />

                    <InputField
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        error={errors.address}
                        showError={!!errors.address}
                    />

                    <InputField
                        label="Pincode"
                        name="pincode"
                        type="number"
                        value={form.pincode}
                        onChange={handleChange}
                        required
                        error={errors.pincode}
                        showError={!!errors.pincode}
                        maxLength={6}
                        minLength={6}
                    />

                    <SelectField
                        label="Status"
                        value={form.is_active}
                        onChange={(e) =>
                            setForm({ ...form, is_active: e.target.value })
                        }
                        options={[
                            { label: "Active", value: 1 },
                            { label: "Inactive", value: 0 },
                        ]}
                        required
                        error={errors.is_active}
                        showError={!!errors.is_active}
                    />


                    <div className="col-span-2 flex justify-end gap-2">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Close
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}