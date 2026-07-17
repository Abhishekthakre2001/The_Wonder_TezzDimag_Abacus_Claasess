import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import InputField from "../UI/InputField";
import SelectField from "../UI/SelectField";
import MessageModal from "../utils/MessageModal";

import levelApi from "../api/LevelApi";
import setsApi from "../api/SetsApi";
import questionApi from "../api/questionApi";

const EMPTY_QUESTION = {
  section: "",
  question_type: "mcq",
  marks: 1,
  negative_marks: 0,
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_option: "option1",
  explanation: "",
};

// option1 -> 1, option2 -> 2 ...
const CORRECT_OPTION_MAP = {
  option1: 1,
  option2: 2,
  option3: 3,
  option4: 4,
};

const CSV_HEADERS = [
  "section",
  "question_type",
  "marks",
  "negative_marks",
  "question",
  "option1",
  "option2",
  "option3",
  "option4",
  "correct_option",
  "explanation",
];

// ---------- CSV helpers ----------

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((f) => f.trim());
}

function parseCSV(text) {
  const lines = text
    .split(/\r\n|\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const row = {};

    headers.forEach((header, idx) => {
      row[header] = fields[idx] !== undefined ? fields[idx] : "";
    });

    let correctOption = (row.correct_option || "").toString().trim().toLowerCase();

    if (["1", "option1", "a"].includes(correctOption)) correctOption = "option1";
    else if (["2", "option2", "b"].includes(correctOption)) correctOption = "option2";
    else if (["3", "option3", "c"].includes(correctOption)) correctOption = "option3";
    else if (["4", "option4", "d"].includes(correctOption)) correctOption = "option4";
    else correctOption = "option1";

    rows.push({
      section: row.section || "",
      question_type: row.question_type || "mcq",
      marks: row.marks ? Number(row.marks) : 1,
      negative_marks: row.negative_marks ? Number(row.negative_marks) : 0,
      question: row.question || "",
      option1: row.option1 || "",
      option2: row.option2 || "",
      option3: row.option3 || "",
      option4: row.option4 || "",
      correct_option: correctOption,
      explanation: row.explanation || "",
    });
  }

  return rows;
}

// strip HTML tags for table preview text / validation checks
function stripHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

// ---------- Validation ----------

// returns { valid: boolean, message: string }
function validateQuestionFull(q) {
  if (!q.section || !q.section.trim()) {
    return { valid: false, message: "Section is required." };
  }
  if (!/^[A-Za-z]$/.test(q.section.trim())) {
    return {
      valid: false,
      message: "Section must be exactly 1 alphabet character (e.g. A, B, C).",
    };
  }

  if (!q.question_type) {
    return { valid: false, message: "Question Type is required." };
  }

  if (q.marks === "" || q.marks === null || q.marks === undefined) {
    return { valid: false, message: "Marks is required." };
  }
  if (!/^\d+(\.\d+)?$/.test(String(q.marks)) || Number(q.marks) <= 0) {
    return { valid: false, message: "Marks must be a positive number." };
  }

  if (q.negative_marks === "" || q.negative_marks === null || q.negative_marks === undefined) {
    return { valid: false, message: "Negative Marks is required." };
  }
  if (!/^\d+$/.test(String(q.negative_marks)) || Number(q.negative_marks) < 0) {
    return {
      valid: false,
      message: "Negative Marks must be a positive integer (0 or more, no decimals).",
    };
  }

  if (!q.question || !stripHtml(q.question)) {
    return { valid: false, message: "Question text is required." };
  }

  if (!q.option1 || !stripHtml(q.option1)) {
    return { valid: false, message: "Option A is required." };
  }
  if (!q.option2 || !stripHtml(q.option2)) {
    return { valid: false, message: "Option B is required." };
  }
  if (!q.option3 || !stripHtml(q.option3)) {
    return { valid: false, message: "Option C is required." };
  }
  if (!q.option4 || !stripHtml(q.option4)) {
    return { valid: false, message: "Option D is required." };
  }

  if (!q.correct_option) {
    return { valid: false, message: "Correct Option is required." };
  }

  if (!q.explanation || !stripHtml(q.explanation)) {
    return { valid: false, message: "Explanation is required." };
  }

  return { valid: true, message: "" };
}

function validatePaper(paper) {
  if (!paper.paper_name || !paper.paper_name.trim()) {
    return { valid: false, message: "Paper Name is required." };
  }
  if (!paper.level_id) {
    return { valid: false, message: "Please select a Level." };
  }
  if (!paper.set_id) {
    return { valid: false, message: "Please select a Set." };
  }
  if (!paper.paper_type) {
    return { valid: false, message: "Please select Paper Type." };
  }
  if (!paper.duration || !String(paper.duration).trim()) {
    return { valid: false, message: "Duration is required." };
  }
  if (!/^\d+$/.test(String(paper.duration)) || Number(paper.duration) <= 0) {
    return {
      valid: false,
      message: "Duration must be a positive whole number (minutes).",
    };
  }
  if (!paper.status) {
    return { valid: false, message: "Status is required." };
  }
  return { valid: true, message: "" };
}

export default function AddUpdateQuestion() {
  const adminId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;

  const [levelOptions, setLevelOptions] = useState([]);
  const [setOptions, setSetOptions] = useState([]);
  const fileInputRef = useRef(null);

  const [paper, setPaper] = useState({
    paper_name: "",
    level_id: "",
    set_id: "",
    duration: "",
    paper_type: "",
    status: "ACTIVE",
  });

  // "choice" | "manual" | "preview"
  const [mode, setMode] = useState("choice");

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(EMPTY_QUESTION);
  const [editIndex, setEditIndex] = useState(null);

  // ---------- Modal state ----------
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
    showOkButton: true,
  });

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const showError = (message, title = "Validation Error") => {
    setModal({
      open: true,
      type: "error",
      title,
      message,
      onConfirm: null,
      showOkButton: true,
    });
  };

  const showSuccess = (message, title = "Success") => {
    setModal({
      open: true,
      type: "success",
      title,
      message,
      onConfirm: null,
      showOkButton: true,
    });
  };

  const showConfirm = (message, onConfirm, title = "Are you sure?") => {
    setModal({
      open: true,
      type: "warning",
      title,
      message,
      onConfirm,
      showOkButton: true,
    });
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [levelsRes, setsRes] = await Promise.all([
        levelApi.getbyadminid(adminId, 1, 1000, ""),
        setsApi.getbyadminid(adminId, 1, 1000, ""),
      ]);

      setLevelOptions(
        (levelsRes.data.data || []).map((item) => ({
          label: `${item.level} - ${item.level_name}`,
          value: item.id,
        }))
      );

      setSetOptions(
        (setsRes.data.data || []).map((item) => ({
          label: item.set_name,
          value: item.id,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const updateCurrentQuestion = (field, value) => {
    setCurrentQuestion((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Manual entry ----------

  const startManualEntry = () => {
    setCurrentQuestion(EMPTY_QUESTION);
    setEditIndex(null);
    setMode("manual");
  };

  const persistCurrentQuestion = () => {
    const { valid, message } = validateQuestionFull(currentQuestion);
    if (!valid) {
      showError(message);
      return false;
    }

    if (editIndex !== null) {
      const updated = [...questions];
      updated[editIndex] = currentQuestion;
      setQuestions(updated);
      setEditIndex(null);
    } else {
      setQuestions((prev) => [...prev, currentQuestion]);
    }

    setCurrentQuestion(EMPTY_QUESTION);
    return true;
  };

  const handleSaveAndNext = () => {
    persistCurrentQuestion();
    // stay in manual mode for the next question
  };

  const handleSaveAndPreview = () => {
    if (persistCurrentQuestion()) {
      setMode("preview");
    }
  };

  const handleCancelManual = () => {
    setCurrentQuestion(EMPTY_QUESTION);
    setEditIndex(null);
    setMode(questions.length > 0 ? "preview" : "choice");
  };

  // ---------- Preview table actions ----------

  const handleEditFromPreview = (index) => {
    setCurrentQuestion(questions[index]);
    setEditIndex(index);
    setMode("manual");
  };

  const handleDeleteFromPreview = (index) => {
    showConfirm(
      `Delete Question ${index + 1}? This cannot be undone.`,
      () => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
      },
      "Delete Question"
    );
  };

  // ---------- CSV ----------

  const handleDownloadSampleCsv = () => {
    const sampleRow = [
      "A",
      "mcq",
      "1",
      "0",
      "What is the capital of France?",
      "Paris",
      "London",
      "Berlin",
      "Madrid",
      "option1",
      "Paris is the capital of France.",
    ];

    const csvContent =
      CSV_HEADERS.join(",") +
      "\n" +
      sampleRow.map((v) => `"${v}"`).join(",");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCsvClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsedRows = parseCSV(text);

        if (parsedRows.length === 0) {
          showError("No valid rows found in the CSV file.");
          return;
        }

        // validate every row before accepting the import
        for (let i = 0; i < parsedRows.length; i++) {
          const { valid, message } = validateQuestionFull(parsedRows[i]);
          if (!valid) {
            showError(`Row ${i + 1} in CSV: ${message}`, "CSV Import Error");
            return;
          }
        }

        setQuestions((prev) => [...prev, ...parsedRows]);
        setMode("preview");
      } catch (err) {
        console.error(err);
        showError("Failed to parse CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);

    e.target.value = "";
  };

  // ---------- Final Save (API call) ----------

  const handleFinalizeSave = async () => {
    const paperCheck = validatePaper(paper);
    if (!paperCheck.valid) {
      showError(paperCheck.message);
      return;
    }

    if (questions.length === 0) {
      showError("Please add at least one question.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const { valid, message } = validateQuestionFull(questions[i]);
      if (!valid) {
        showError(`Question ${i + 1}: ${message}`);
        return;
      }
    }

    try {
      const payload = {
        ...paper,
        level_id: Number(paper.level_id),
        set_id: Number(paper.set_id),
        duration: Number(paper.duration),
        status: paper.status.toLowerCase(),
        questions: questions.map((q) => ({
          ...q,
          section: q.section.trim().toUpperCase(),
          marks: Number(q.marks),
          negative_marks: Number(q.negative_marks),
          correct_option: CORRECT_OPTION_MAP[q.correct_option] || 1,
        })),
      };

      await questionApi.create(payload);

      showSuccess("Question paper created successfully.");

      setQuestions([]);
      setCurrentQuestion(EMPTY_QUESTION);
      setMode("choice");
    } catch (err) {
      console.error(err);
      showError("Failed to create question paper. Please try again.");
    }
  };

  const correctOptionLabel = (val) => {
    const map = { option1: "A", option2: "B", option3: "C", option4: "D" };
    return map[val] || "-";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* PAPER DETAILS */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-5">Paper Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Paper Name"
            value={paper.paper_name}
            onChange={(e) =>
              setPaper({ ...paper, paper_name: e.target.value })
            }
          />

          <SelectField
            label="Level"
            options={levelOptions}
            value={paper.level_id}
            onChange={(e) =>
              setPaper({ ...paper, level_id: e.target.value })
            }
          />

          <SelectField
            label="Set"
            options={setOptions}
            value={paper.set_id}
            onChange={(e) =>
              setPaper({ ...paper, set_id: e.target.value })
            }
          />

          <SelectField
            label="Paper Type"
            options={[
              { label: "Exam", value: "exam" },
              { label: "Practice", value: "practice" },
              { label: "Mock", value: "mock" },
            ]}
            value={paper.paper_type}
            onChange={(e) =>
              setPaper({ ...paper, paper_type: e.target.value })
            }
          />

          <InputField
            type="number"
            label="Duration (Minutes)"
            value={paper.duration}
            min={1}
            onChange={(e) => {
              const val = e.target.value;
              // allow only digits (positive whole numbers), block negative/decimal typing
              if (val === "" || /^\d+$/.test(val)) {
                setPaper({ ...paper, duration: val });
              }
            }}
          />

          <SelectField
            label="Status"
            options={[
              { label: "ACTIVE", value: "ACTIVE" },
              { label: "INACTIVE", value: "INACTIVE" },
            ]}
            value={paper.status}
            onChange={(e) =>
              setPaper({ ...paper, status: e.target.value })
            }
          />

           <SelectField
            label="Paper Category"
            options={[
              { label: "Vedic", value: "Vedic" },
              { label: "Abacus", value: "Abacus" },
            ]}
            value={paper.paper_category}
            onChange={(e) =>
              setPaper({ ...paper, paper_category: e.target.value })
            }
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 mt-6 border-t pt-5">
          <button
            onClick={startManualEntry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition"
          >
            + Add Manually
          </button>

          <button
            onClick={handleImportCsvClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition"
          >
            Import CSV
          </button>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCsvFileChange}
            className="hidden"
          />

          <button
            onClick={handleDownloadSampleCsv}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg transition"
          >
            Download Sample CSV
          </button>

          {questions.length > 0 && mode !== "preview" && (
            <button
              onClick={() => setMode("preview")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg ml-auto transition"
            >
              Preview Questions ({questions.length})
            </button>
          )}
        </div>
      </div>

      {/* MANUAL ENTRY FORM (one question at a time) */}
      {mode === "manual" && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editIndex !== null
                ? `Editing Question ${editIndex + 1}`
                : `New Question ${questions.length + 1}`}
            </h2>
            <button
              onClick={handleCancelManual}
              className="text-gray-500 px-3 py-1.5 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <label className="font-medium">
            Question <span className="text-red-500">*</span>
          </label>
          <ReactQuill
            theme="snow"
            value={currentQuestion.question}
            onChange={(v) => updateCurrentQuestion("question", v)}
          />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mt-5 font-medium">
                Option A <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={currentQuestion.option1}
                onChange={(v) => updateCurrentQuestion("option1", v)}
              />
            </div>
            <div>
              <label className="block mt-5 font-medium">
                Option B <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={currentQuestion.option2}
                onChange={(v) => updateCurrentQuestion("option2", v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mt-5 font-medium">
                Option C <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={currentQuestion.option3}
                onChange={(v) => updateCurrentQuestion("option3", v)}
              />
            </div>
            <div>
              <label className="block mt-5 font-medium">
                Option D <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={currentQuestion.option4}
                onChange={(v) => updateCurrentQuestion("option4", v)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div>
              <InputField
                label="Section (1 letter, e.g. A) *"
                value={currentQuestion.section}
                maxLength={1}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[A-Za-z]$/.test(val)) {
                    updateCurrentQuestion("section", val);
                  }
                }}
              />
            </div>

            <SelectField
              label="Question Type"
              options={[{ label: "MCQ", value: "mcq" }]}
              value={currentQuestion.question_type}
              onChange={(e) =>
                updateCurrentQuestion("question_type", e.target.value)
              }
            />

            <InputField
              label="Marks *"
              type="number"
              min={0.01}
              step="any"
              value={currentQuestion.marks}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 0) {
                  updateCurrentQuestion("marks", val);
                }
              }}
            />

            <InputField
              label="Negative Marks (whole number) *"
              type="number"
              min={0}
              step="1"
              value={currentQuestion.negative_marks}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  updateCurrentQuestion("negative_marks", val);
                }
              }}
            />

            <SelectField
              label="Correct Option"
              options={[
                { label: "Option A", value: "option1" },
                { label: "Option B", value: "option2" },
                { label: "Option C", value: "option3" },
                { label: "Option D", value: "option4" },
              ]}
              value={currentQuestion.correct_option}
              onChange={(e) =>
                updateCurrentQuestion("correct_option", e.target.value)
              }
            />
          </div>

          <div className="mt-6">
            <label className="font-medium">
              Explanation <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              theme="snow"
              value={currentQuestion.explanation}
              onChange={(v) => updateCurrentQuestion("explanation", v)}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSaveAndNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              Save & Next
            </button>
            <button
              onClick={handleSaveAndPreview}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
            >
              Save & Preview
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW TABLE */}
      {mode === "preview" && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Preview Questions ({questions.length})
            </h2>
            <button
              onClick={startManualEntry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Another
            </button>
          </div>

          {questions.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No questions added yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-3 py-3 text-left font-semibold w-10">#</th>
                    <th className="px-3 py-3 text-left font-semibold">Sec</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-[200px]">Question</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-[140px]">Option A</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-[140px]">Option B</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-[140px]">Option C</th>
                    <th className="px-3 py-3 text-left font-semibold min-w-[140px]">Option D</th>
                    <th className="px-3 py-3 text-left font-semibold">Correct</th>
                    <th className="px-3 py-3 text-left font-semibold">Marks</th>
                    <th className="px-3 py-3 text-left font-semibold">Neg.</th>
                    <th className="px-3 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition`}
                    >
                      <td className="px-3 py-3 border-t border-gray-100 font-medium text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 border-t border-gray-100">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                          {q.section?.toUpperCase() || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-t border-gray-100 max-w-xs">
                        <span className="line-clamp-2">{stripHtml(q.question) || "-"}</span>
                      </td>
                      <td
                        className={`px-3 py-3 border-t border-gray-100 max-w-[180px] ${q.correct_option === "option1"
                            ? "bg-green-50 font-medium text-green-800"
                            : ""
                          }`}
                      >
                        <span className="line-clamp-2">{stripHtml(q.option1) || "-"}</span>
                      </td>
                      <td
                        className={`px-3 py-3 border-t border-gray-100 max-w-[180px] ${q.correct_option === "option2"
                            ? "bg-green-50 font-medium text-green-800"
                            : ""
                          }`}
                      >
                        <span className="line-clamp-2">{stripHtml(q.option2) || "-"}</span>
                      </td>
                      <td
                        className={`px-3 py-3 border-t border-gray-100 max-w-[180px] ${q.correct_option === "option3"
                            ? "bg-green-50 font-medium text-green-800"
                            : ""
                          }`}
                      >
                        <span className="line-clamp-2">{stripHtml(q.option3) || "-"}</span>
                      </td>
                      <td
                        className={`px-3 py-3 border-t border-gray-100 max-w-[180px] ${q.correct_option === "option4"
                            ? "bg-green-50 font-medium text-green-800"
                            : ""
                          }`}
                      >
                        <span className="line-clamp-2">{stripHtml(q.option4) || "-"}</span>
                      </td>
                      <td className="px-3 py-3 border-t border-gray-100">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                          {correctOptionLabel(q.correct_option)}
                        </span>
                      </td>
                      <td className="px-3 py-3 border-t border-gray-100">{q.marks}</td>
                      <td className="px-3 py-3 border-t border-gray-100">{q.negative_marks}</td>
                      <td className="px-3 py-3 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFromPreview(index)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteFromPreview(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleFinalizeSave}
              disabled={questions.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition"
            >
              Finalize & Save Question Paper
            </button>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL (success / error / warning) */}
      <MessageModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        showOkButton={modal.showOkButton}
      />
    </div>
  );
}