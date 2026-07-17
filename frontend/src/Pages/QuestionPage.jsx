import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import AppBar from "../UI/AppBar";
import DataTable from "../UI/DataTable";
import UpdateQuestionModal from "../Components/UpdateQuestionModal";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import MessageModal from "../utils/MessageModal";
import { useFetchData } from "../hooks/useFetchData";
import useTableState from "../hooks/useTableState";
import questionApi from "../api/questionApi";
import { downloadExcelFile } from "../utils/downloadExcelFile";
import { useNavigate } from "react-router-dom";

export default function QuestionPage() {

  const navigate = useNavigate();

  const {
    page,
    limit,
    search,
    debouncedSearch,
    setPage,
    handleSearchChange,
    handleLimitChange,
  } = useTableState();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  const {
    data: response,
    loading,
    reload,
  } = useFetchData(
    () => questionApi.getAll(page, limit, debouncedSearch || ""),
    [page, limit, debouncedSearch],
    { preserveResponse: true }
  );

  const questions = response?.records || [];
  const totalPages = response?.pagination?.totalPages || 1;
  const totalRecords = response?.pagination?.total || 0;

  const handleEdit = (row) => {
    setSelectedQuestion(row);
    setShowUpdateModal(true);
  };

  const handleUpdate = async (updatedPaper) => {
    setButtonLoading(true);

    try {
      await questionApi.update(updatedPaper.id, {
        paper_name: updatedPaper.paper_name,
        level_id: updatedPaper.level_id,
        set_id: updatedPaper.set_id,
        duration: updatedPaper.duration,
        paper_type: updatedPaper.paper_type,
        status: updatedPaper.status,
        paper_category: updatedPaper.question_paper_type,
      });

      await reload();

      setShowUpdateModal(false);
      setSelectedQuestion(null);

      setModal({
        open: true,
        type: "success",
        title: "Success",
        message: "Question paper updated successfully.",
      });
    } catch (err) {
      console.error(err);

      setModal({
        open: true,
        type: "error",
        title: "Error",
        message: "Failed to update question paper.",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleDelete = (row) => {
    setSelectedQuestion(row);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setButtonLoading(true);

    try {
      await questionApi.remove(selectedQuestion.id);

      await reload();

      setShowDeleteModal(false);
      setSelectedQuestion(null);

      setModal({
        open: true,
        type: "success",
        title: "Success",
        message: "Question paper deleted successfully.",
      });
    } catch (err) {
      console.error(err);

      setModal({
        open: true,
        type: "error",
        title: "Error",
        message: "Failed to delete question paper.",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleExport = () => {
    downloadExcelFile(
      () => questionApi.exportData(),
      "question-papers.xlsx"
    );
  };

  const columns = [
    {
      key: "paper_name",
      label: "Paper Name",
    },
    {
      key: "level_name",
      label: "Level",
    },
    {
      key: "set_name",
      label: "Set",
    },
    {
      key: "duration",
      label: "Duration (Min)",
    },
    {
      key: "total_questions",
      label: "Questions",
    },
    {
      key: "paper_type",
      label: "Paper Type",
    },
    {
  key: "question_paper_type",
  label: "Question Paper Category",
  render: (value) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value === "Vedic"
          ? "bg-purple-100 text-purple-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {value}
    </span>
  ),
},
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${value === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const handleCreate = () => {
    navigate("/add-question");
  };

  const handleView = (row) => {
    navigate("/view-question", {
      state: {
        paper: row,
      },
    });
  }

  return (
    <>
      <MessageModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />

      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main
        className={`transition-all duration-500 ${isCollapsed ? "md:ml-20" : "md:ml-64"
          } px-2 md:px-8 py-6 mb-12`}
      >
        <div className="max-w-7xl mx-auto">
          <AppBar
            title="Question Papers"
            subtitle="Manage question papers"
          />

          <div className="mt-8">
            <DataTable
              columns={columns}
              data={questions}
              title="Question Papers"
              loading={loading}
              searchable
              pagination
              showActions
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              searchTerm={search}
              onSearchChange={handleSearchChange}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onExport={handleExport}
              onCreate={handleCreate}
              onView={handleView}
            />
          </div>
        </div>
      </main>

      <UpdateQuestionModal
        open={showUpdateModal}
        question={selectedQuestion}
        loading={buttonLoading}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedQuestion(null);
        }}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        loading={buttonLoading}
        title="Delete Question Paper"
        message={`Are you sure you want to delete "${selectedQuestion?.paper_name || ""
          }"? This action cannot be undone.`}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedQuestion(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}