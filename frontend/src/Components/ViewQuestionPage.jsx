import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import Sidebar from "../Components/Sidebar";
import AppBar from "../UI/AppBar";
import DataTable from "../UI/DataTable";
import DeleteConfirmModal from "../UI/DeleteConfirmModal";
import MessageModal from "../utils/MessageModal";

import { useFetchData } from "../hooks/useFetchData";
import useTableState from "../hooks/useTableState";
import questionApi from "../api/questionApi";

import { X, Save, Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const EMPTY_QUESTION = {
    section: "",
    question_type: "MCQ",
    marks: "",
    negative_marks: "",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_option: "1",
    explanation: "",
};

export default function ViewQuestionPage() {
    const location = useLocation();
    const paper = location.state?.paper;

    const [isCollapsed, setIsCollapsed] = useState(false);

    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Add Question state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState(EMPTY_QUESTION);

    // Paper Preview state
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const [buttonLoading, setButtonLoading] = useState(false);

    const [modal, setModal] = useState({
        open: false,
        type: "",
        title: "",
        message: "",
    });

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
        () => questionApi.getQuestionsByPaper(paper?.id, page, limit),
        [paper?.id, page, limit, debouncedSearch],
        { preserveResponse: true }
    );

    const questions = response?.records || [];
    const totalPages = response?.pagination?.totalPages || 1;
    const totalRecords = response?.pagination?.total || 0;

    const columns = [
        {
            key: "question_no",
            label: "No",
        },
        {
            key: "section",
            label: "Section",
        },
        {
            key: "question_type",
            label: "Type",
        },
        {
            key: "marks",
            label: "Marks",
        },
        {
            key: "negative_marks",
            label: "Negative",
        },
        {
            key: "question",
            label: "Question",
            render: (value) => (
                <div
                    className="min-w-[250px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ),
        },
        {
            key: "option1",
            label: "Option 1",
            render: (value) => (
                <div
                    className="min-w-[150px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ),
        },
        {
            key: "option2",
            label: "Option 2",
            render: (value) => (
                <div
                    className="min-w-[150px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ),
        },
        {
            key: "option3",
            label: "Option 3",
            render: (value) => (
                <div
                    className="min-w-[150px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ),
        },
        {
            key: "option4",
            label: "Option 4",
            render: (value) => (
                <div
                    className="min-w-[150px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ),
        },
        {
            key: "correct_option",
            label: "Correct",
        },
        {
            key: "explanation",
            label: "Explanation",
            render: (value) => (
                <div
                    className="min-w-[200px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            ),
        },
    ];

    const handleEdit = (row) => {
        setSelectedQuestion({ ...row });
        setShowUpdateModal(true);
    };

    const handleDelete = (row) => {
        setSelectedQuestion(row);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setButtonLoading(true);

            await questionApi.deleteQuestion(selectedQuestion.id);

            await reload();

            setShowDeleteModal(false);
            setSelectedQuestion(null);

            setModal({
                open: true,
                type: "success",
                title: "Success",
                message: "Question deleted successfully.",
            });
        } catch (err) {
            console.error(err);

            setModal({
                open: true,
                type: "error",
                title: "Error",
                message: "Failed to delete question.",
            });
        } finally {
            setButtonLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setButtonLoading(true);

            await questionApi.updateQuestion(selectedQuestion.id, {
                section: selectedQuestion.section,
                question_type: selectedQuestion.question_type,
                marks: Number(selectedQuestion.marks),
                negative_marks: Number(selectedQuestion.negative_marks),
                question: selectedQuestion.question,
                option1: selectedQuestion.option1,
                option2: selectedQuestion.option2,
                option3: selectedQuestion.option3,
                option4: selectedQuestion.option4,
                correct_option: selectedQuestion.correct_option,
                explanation: selectedQuestion.explanation,
            });

            await reload();

            setShowUpdateModal(false);
            setSelectedQuestion(null);

            setModal({
                open: true,
                type: "success",
                title: "Success",
                message: "Question updated successfully.",
            });
        } catch (err) {
            console.error(err);

            setModal({
                open: true,
                type: "error",
                title: "Error",
                message: "Failed to update question.",
            });
        } finally {
            setButtonLoading(false);
        }
    };

    // ---- Add Question ----
   
    const handleAddQuestion = async () => {
        try {
            setButtonLoading(true);

            await questionApi.create(paper.id, {
                section: newQuestion.section,
                question_type: newQuestion.question_type,
                marks: Number(newQuestion.marks),
                negative_marks: Number(newQuestion.negative_marks),
                question: newQuestion.question,
                option1: newQuestion.option1,
                option2: newQuestion.option2,
                option3: newQuestion.option3,
                option4: newQuestion.option4,
                correct_option: newQuestion.correct_option,
                explanation: newQuestion.explanation,
            });

            await reload();

            setShowAddModal(false);
            setNewQuestion(EMPTY_QUESTION);

            setModal({
                open: true,
                type: "success",
                title: "Success",
                message: "Question added successfully.",
            });
        } catch (err) {
            console.error(err);

            setModal({
                open: true,
                type: "error",
                title: "Error",
                message: "Failed to add question.",
            });
        } finally {
            setButtonLoading(false);
        }
    };

    // ---- Paper Preview ----

    const handleOpenPreview = async () => {
        setShowPreviewModal(true);
        setPreviewIndex(0);
        setPreviewLoading(true);

        try {
            const res = await questionApi.getQuestionsByPaper(paper.id, 1, 1000);
            console.log("Preview API response:", res.data.records);
            setPreviewQuestions(res?.data?.records || []);
        } catch (err) {
            console.error(err);
            setModal({
                open: true,
                type: "error",
                title: "Error",
                message: "Failed to load paper preview.",
            });
            setShowPreviewModal(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    const currentPreviewQuestion = previewQuestions[previewIndex];

    if (!paper) {
        return (
            <div className="p-6 text-center text-red-600">
                Question Paper not found.
            </div>
        );
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
                    <div className="gap-4">
                        <AppBar
                            title={paper.paper_name}
                            subtitle="Questions"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => {
                                setNewQuestion(EMPTY_QUESTION);
                                setShowAddModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Question
                        </button>

                        <button
                            onClick={handleOpenPreview}
                            className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Eye size={18} />
                            Paper Preview
                        </button>
                    </div>

                    <div className="mt-8">
                        <DataTable
                            title="Questions"
                            columns={columns}
                            data={questions}
                            loading={loading}
                            searchable
                            pagination
                            showActions
                            searchTerm={search}
                            currentPage={page}
                            totalPages={totalPages}
                            totalRecords={totalRecords}
                            onSearchChange={handleSearchChange}
                            onPageChange={setPage}
                            onLimitChange={handleLimitChange}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </main>

            <DeleteConfirmModal
                open={showDeleteModal}
                loading={buttonLoading}
                title="Delete Question"
                message={`Are you sure you want to delete Question No. ${selectedQuestion?.question_no || ""
                    } ?`}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedQuestion(null);
                }}
                onConfirm={handleDeleteConfirm}
            />

            {showUpdateModal && selectedQuestion && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">

                        {/* Header */}

                        <div className="sticky top-0 bg-white border-b flex justify-between items-center px-6 py-4 z-10">
                            <h2 className="text-xl font-semibold">
                                Update Question
                            </h2>

                            <button
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setSelectedQuestion(null);
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}

                        <div className="p-6 space-y-6">

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Section
                                    </label>

                                    <input
                                        type="text"
                                        value={selectedQuestion.section}
                                        onChange={(e) =>
                                            setSelectedQuestion({
                                                ...selectedQuestion,
                                                section: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Question Type
                                    </label>

                                    <select
                                        value={selectedQuestion.question_type}
                                        onChange={(e) =>
                                            setSelectedQuestion({
                                                ...selectedQuestion,
                                                question_type: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    >
                                        <option value="MCQ">MCQ</option>
                                        <option value="Subjective">Subjective</option>
                                        <option value="True/False">True/False</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Marks
                                    </label>

                                    <input
                                        type="number"
                                        value={selectedQuestion.marks}
                                        onChange={(e) =>
                                            setSelectedQuestion({
                                                ...selectedQuestion,
                                                marks: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Negative Marks
                                    </label>

                                    <input
                                        type="number"
                                        value={selectedQuestion.negative_marks}
                                        onChange={(e) =>
                                            setSelectedQuestion({
                                                ...selectedQuestion,
                                                negative_marks: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Question
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={selectedQuestion.question}
                                    onChange={(value) =>
                                        setSelectedQuestion({
                                            ...selectedQuestion,
                                            question: value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 1
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={selectedQuestion.option1}
                                    onChange={(value) =>
                                        setSelectedQuestion({
                                            ...selectedQuestion,
                                            option1: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 2
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={selectedQuestion.option2}
                                    onChange={(value) =>
                                        setSelectedQuestion({
                                            ...selectedQuestion,
                                            option2: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 3
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={selectedQuestion.option3}
                                    onChange={(value) =>
                                        setSelectedQuestion({
                                            ...selectedQuestion,
                                            option3: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 4
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={selectedQuestion.option4}
                                    onChange={(value) =>
                                        setSelectedQuestion({
                                            ...selectedQuestion,
                                            option4: value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Correct Option
                                    </label>

                                    <select
                                        value={selectedQuestion.correct_option}
                                        onChange={(e) =>
                                            setSelectedQuestion({
                                                ...selectedQuestion,
                                                correct_option: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    >
                                        <option value="1">Option 1</option>
                                        <option value="2">Option 2</option>
                                        <option value="3">Option 3</option>
                                        <option value="4">Option 4</option>

                                        {/* if your API stores option1/option2 instead of 1/2 */}
                                        <option value="option1">option1</option>
                                        <option value="option2">option2</option>
                                        <option value="option3">option3</option>
                                        <option value="option4">option4</option>
                                    </select>
                                </div>

                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Explanation
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={selectedQuestion.explanation}
                                    onChange={(value) =>
                                        setSelectedQuestion({
                                            ...selectedQuestion,
                                            explanation: value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                        {/* Footer */}

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">

                            <button
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setSelectedQuestion(null);
                                }}
                                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdate}
                                disabled={buttonLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
                            >
                                {buttonLoading ? (
                                    <>
                                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Update Question
                                    </>
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* Add Question Modal */}

            {showAddModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">

                        <div className="sticky top-0 bg-white border-b flex justify-between items-center px-6 py-4 z-10">
                            <h2 className="text-xl font-semibold">
                                Add Question
                            </h2>

                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewQuestion(EMPTY_QUESTION);
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Section
                                    </label>

                                    <input
                                        type="text"
                                        value={newQuestion.section}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                section: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Question Type
                                    </label>

                                    <select
                                        value={newQuestion.question_type}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                question_type: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    >
                                        <option value="MCQ">MCQ</option>
                                        <option value="Subjective">Subjective</option>
                                        <option value="True/False">True/False</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Marks
                                    </label>

                                    <input
                                        type="number"
                                        value={newQuestion.marks}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                marks: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Negative Marks
                                    </label>

                                    <input
                                        type="number"
                                        value={newQuestion.negative_marks}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                negative_marks: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Question
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={newQuestion.question}
                                    onChange={(value) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            question: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 1
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={newQuestion.option1}
                                    onChange={(value) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            option1: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 2
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={newQuestion.option2}
                                    onChange={(value) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            option2: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 3
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={newQuestion.option3}
                                    onChange={(value) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            option3: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Option 4
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={newQuestion.option4}
                                    onChange={(value) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            option4: value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block mb-2 font-medium">
                                        Correct Option
                                    </label>

                                    <select
                                        value={newQuestion.correct_option}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                correct_option: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-lg p-3"
                                    >
                                        <option value="1">Option 1</option>
                                        <option value="2">Option 2</option>
                                        <option value="3">Option 3</option>
                                        <option value="4">Option 4</option>
                                        <option value="option1">option1</option>
                                        <option value="option2">option2</option>
                                        <option value="option3">option3</option>
                                        <option value="option4">option4</option>
                                    </select>
                                </div>

                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Explanation
                                </label>

                                <ReactQuill
                                    theme="snow"
                                    value={newQuestion.explanation}
                                    onChange={(value) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            explanation: value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">

                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewQuestion(EMPTY_QUESTION);
                                }}
                                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddQuestion}
                                disabled={buttonLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
                            >
                                {buttonLoading ? (
                                    <>
                                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Question
                                    </>
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* Paper Preview Modal */}

            {showPreviewModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-center items-center p-4 overflow-y-auto">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col animate-fadeIn">

                        {/* Header */}
                        <div className="sticky top-0 bg-white/90 backdrop-blur border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                                {paper.paper_name} <span className="text-gray-400 font-normal">Preview</span>
                            </h2>

                            <button
                                onClick={() => {
                                    setShowPreviewModal(false);
                                    setPreviewQuestions([]);
                                    setPreviewIndex(0);
                                }}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto">

                            {previewLoading ? (
                                <div className="text-center py-20 text-gray-500">
                                    <div className="animate-pulse">Loading questions...</div>
                                </div>
                            ) : previewQuestions.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">
                                    No questions found for this paper.
                                </div>
                            ) : (
                                <>
                                    {/* Progress */}
                                    <div className="flex justify-between items-center mb-5">
                                        <span className="text-sm font-medium text-gray-500">
                                            Question {previewIndex + 1} of {previewQuestions.length}
                                        </span>

                                        {currentPreviewQuestion?.section && (
                                            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                                Section {currentPreviewQuestion.section}
                                            </span>
                                        )}
                                    </div>

                                    {/* Question Card */}
                                    <div className=" rounded-xl p-6 bg-gray-50 hover:shadow-sm transition">

                                        <div className="flex justify-between items-start mb-4 gap-4">
                                            <div
                                                className="font-medium text-gray-800 prose max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: currentPreviewQuestion?.question,
                                                }}
                                            />

                                            <span className="text-xs font-semibold text-white bg-gray-800 px-3 py-1 rounded-full whitespace-nowrap">
                                                {currentPreviewQuestion?.marks} Marks
                                            </span>
                                        </div>

                                        {/* Options */}
                                        <div className="space-y-3 mt-4">
                                            {[1, 2, 3, 4].map((num) => (
                                                <label
                                                    key={num}
                                                    className="flex items-start gap-3 rounded-lg p-3 bg-white hover:bg-gray-50 transition cursor-not-allowed opacity-90"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`preview-option-${previewIndex}`}
                                                        disabled
                                                        className="mt-1 accent-blue-500"
                                                    />
                                                    <div
                                                        className="text-gray-700"
                                                        dangerouslySetInnerHTML={{
                                                            __html: currentPreviewQuestion?.[`option${num}`],
                                                        }}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex justify-between items-center mt-6">

                                        <button
                                            onClick={() =>
                                                setPreviewIndex((i) => Math.max(0, i - 1))
                                            }
                                            disabled={previewIndex === 0}
                                            className="px-5 py-2 rounded-lg border bg-white hover:bg-gray-100 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={18} />
                                            Previous
                                        </button>

                                        <div className="text-sm text-gray-500">
                                            {Math.round(((previewIndex + 1) / previewQuestions.length) * 100)}% completed
                                        </div>

                                        <button
                                            onClick={() =>
                                                setPreviewIndex((i) =>
                                                    Math.min(previewQuestions.length - 1, i + 1)
                                                )
                                            }
                                            disabled={previewIndex === previewQuestions.length - 1}
                                            className="px-5 py-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight size={18} />
                                        </button>

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}