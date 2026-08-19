import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../UI/DataTable";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import AppBar from "../UI/AppBar";
import colors from "../utils/Color";
import { useFetchData } from "../hooks/useFetchData";
import userApi from "../api/userApi";
import { useDelete } from "../hooks/useDelete";
import useTableState from "../hooks/useTableState";
import { downloadExcelFile } from "../utils/downloadExcelFile";
import Tabs from "../UI/Tabs";
import SelectField from "../UI/SelectField";

export default function StudentList() {
  const navigate = useNavigate();
  const [studentCategory, setStudentCategory] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [registrationType, setRegistrationType] = useState(undefined);
  const {
    page,
    limit,
    search,
    debouncedSearch,

    setPage,
    handleSearchChange,
    handleLimitChange,
  } = useTableState();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { remove, loading: deleteLoading } = useDelete(userApi.delete, () => {
    setDeleteOpen(false);
    setSelectedRow(null);
    reload(); // 🔄 reload table after delete
  });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const {
    data: response,
    loading,
    reload,
  } = useFetchData(
    () => {
      if (!user?.id) return Promise.resolve(null);

      return userApi.getbyadminid(
        user.id,
        page,
        limit,
        debouncedSearch,
        registrationType,
        studentCategory
      );
    },
    [page, limit, debouncedSearch, activeTab, registrationType, studentCategory],
    { preserveResponse: true },
  );

  const students = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const totalRecords = response?.pagination?.totalRecords || 0;

  const handleEdit = (row) => {
    // Navigate to add-student in update mode with id
    navigate(`/add-student/${row.id}?from=students-list`);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };
  const handleConfirmDelete = () => {
    if (selectedRow?.id) {
      remove(selectedRow.id);
    }
  };

  const columns = [

    {
      key: "name",
      label: "Student Name",
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },

    {
      key: "createdat",
      label: "Reg. Date",
      sortable: true,
      isDate: true,
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "",
    },

    {
      key: "class",
      label: "Class",
      sortable: true,
      render: (value) => value || "N/A",
    },
    {
      key: "student_category",
      label: "Category",
      sortable: true,
      render: (value) => value || "N/A",
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "mobilenumber",
      label: "Mobile Number",
      sortable: true,
    },
    {
      key: "dob",
      label: "Date of Birth",
      sortable: true,
      isDate: true,
      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "",
    },
    {
      key: "subscription_end_date",
      label: "Subscription End Date",
      sortable: true,
      isDate: true,

      render: (value) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "-",
    },


    {
      key: "level",
      label: "Level",
      sortable: true,
      render: (value, row) => {
        const levelText = row.level_name
          ? `${value} - ${row.level_name}`
          : value;

        return (
          <span
            className="px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: colors.common.blue100,
              color: colors.common.blue700,
            }}
          >
            {levelText}
          </span>
        );
      },
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
      render: (value) => (
        <span className="font-medium" style={{ color: colors.common.gray600 }}>
          {value}
        </span>
      ),
    },
    {
      key: "password",
      label: "Password",
      sortable: true,
      render: (value) => (
        <span className="font-medium" style={{ color: colors.common.gray600 }}>
          {value}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    downloadExcelFile(() => userApi.exportData(user?.id), "users.xlsx");
  };
  const handleTabChange = (index) => {
    console.log("Clicked:", index);
    setActiveTab(index);

    if (index === 0) {
      setRegistrationType(undefined);
    } else if (index === 1) {
      setRegistrationType(0);
    } else {
      setRegistrationType(1);
    }
  };
  return (
    <>
      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Student"
        message={`Are you sure you want to delete "${selectedRow?.name}"? This action cannot be undone.`}
      />

      <div className="max-w-7xl mx-auto">
        <AppBar
          title="Student Management"
          subtitle="Manage and view all students"
        />
      </div>

      <div className="p-6">

        <div className="mb-6 max-w-sm">
          <SelectField
            label="Student Category"
            placeholder="Select Student Category"
            options={[
              { label: "All", value: "" },
              { label: "Abacus", value: "Abacus" },
              { label: "Vedic", value: "Vedic" },
            ]}
            value={studentCategory}
            onChange={(e) => {
              setStudentCategory(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Tabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={[
            {
              label: "All Students",
              content: (
                <div className="p-0 my-8">
                  <DataTable
                    columns={columns}
                    data={students}
                    title="All Students"
                    currentPage={page}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                    searchTerm={search}
                    onSearchChange={handleSearchChange}
                    onCreate={() => navigate("/add-student")}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchable
                    pagination
                    showActions
                    loading={loading}
                    onExport={handleExport}
                  />
                </div>
              ),
            },
            {
              label: "Admin Registered",
              content: (
                <div className="p-0 my-8">
                  <DataTable
                    columns={columns}
                    data={students}
                    title="Admin Registered"
                    currentPage={page}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                    searchTerm={search}
                    onSearchChange={handleSearchChange}
                    // onCreate={() => navigate("/add-student")}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchable
                    pagination
                    showActions
                    loading={loading}
                    onExport={handleExport}
                  />
                </div>
              ),
            },
            {
              label: "Self Registered",
              content: (
                <div className="p-0 my-8">
                  <DataTable
                    columns={columns}
                    data={students}
                    title="Self Registered"
                    currentPage={page}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                    searchTerm={search}
                    onSearchChange={handleSearchChange}
                    // onCreate={() => navigate("/add-student")}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchable
                    pagination
                    showActions
                    loading={loading}
                    onExport={handleExport}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Student Table */}
      {/* <div className="p-0 my-8">
        <DataTable
          columns={columns}
          data={students}
          title="All Students"
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          searchTerm={search}
          onSearchChange={handleSearchChange}
          onCreate={() => navigate("/add-student")}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable
          pagination
          showActions
          loading={loading}
          onExport={handleExport}
        />
      </div> */}
    </>
  );
}
