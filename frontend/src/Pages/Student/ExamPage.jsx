import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ExamLoading from "./ExamLoading";
import Button from "../../UI/Button";
import MessageModal from "../../utils/MessageModal";

import { useFetchData } from "../../hooks/useFetchData";
import { useCreate } from "../../hooks/useCreate";

import questionApi from "../../api/questionApi";
import ExamResultApi from "../../api/examResultApi";
import ResultApi from "../../api/result";

/* ============================================================
   TIME HELPERS
   ============================================================ */

// seconds -> "HH:mm:ss"
const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// add 1 second to a "HH:mm:ss" string (used to round the recorded time up slightly)
const addOneSecond = (time) => {
  if (!time || !/^\d{2}:\d{2}:\d{2}$/.test(time)) return "00:00:01";

  let [hh, mm, ss] = time.split(":").map(Number);
  ss += 1;
  if (ss >= 60) { ss = 0; mm += 1; }
  if (mm >= 60) { mm = 0; hh += 1; }

  return [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
};

// Strip HTML tags/entities that the paper importer sometimes leaves in
// question/option text (e.g. "<p>2&nbsp;+&nbsp;2</p>")
const stripHtml = (html) => {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
};

// correct_option comes back inconsistently — sometimes "3", sometimes "option3".
// Always returns a 0-based option index (or -1 if it can't be parsed).
const parseCorrectOptionIndex = (correctOption) => {
  if (correctOption === null || correctOption === undefined) return -1;

  const str = String(correctOption).trim();
  const optionMatch = str.match(/option\s*(\d+)/i);
  if (optionMatch) return Number(optionMatch[1]) - 1;

  const num = Number(str);
  return Number.isFinite(num) ? num - 1 : -1;
};

/* ============================================================
   QUESTION RENDERING (turns "12+5-3" into a stacked math column,
   handles "x%y" as a percent-of layout)
   ============================================================ */
const renderMathQuestion = (rawQuestion) => {
  const raw = stripHtml(rawQuestion);

  const questionStr = raw
    .replace(/[xX*]/g, "×")
    .replace(/\//g, "÷")
    .replace(/\s+/g, "");

  const percentMatch = questionStr.match(/^(\d+(?:\.\d+)?)%(\d+(?:\.\d+)?)$/);
  if (percentMatch) {
    const [, firstNum, secondNum] = percentMatch;
    return (
      <div className="inline-block text-right font-mono tabular-nums text-2xl leading-tight">
        <div className="flex justify-end gap-1">
          <span>{firstNum}</span>
          <span>%</span>
        </div>
        <div>{secondNum}</div>
        <div className="border-t-2 border-black my-1" />
      </div>
    );
  }

  const terms = questionStr.match(/[+\-×÷]?\d+(?:\.\d+)?/g) || [];
  if (!terms.length) {
    return <div className="text-2xl font-mono tabular-nums">{raw}</div>;
  }

  return (
    <div className="inline-block text-right font-mono tabular-nums text-2xl leading-tight">
      {terms.map((term, i) => {
        let operator = "";
        let number = term;

        if (i === 0) {
          number = term.replace(/^[+\-×÷]/, "");
        } else {
          const firstChar = term.charAt(0);
          if (["+", "-", "×", "÷"].includes(firstChar)) {
            operator = firstChar === "-" ? "−" : firstChar;
            number = term.slice(1);
          }
        }

        return (
          <div key={i} className="grid grid-cols-[40px_auto] justify-end items-center mb-1">
            <span className="text-center">{operator}</span>
            <span>{number}</span>
          </div>
        );
      })}
      <div className="border-t-2 border-black my-1" />
    </div>
  );
};

/* ============================================================
   RESULT HELPERS
   Build a per-question breakdown (question id + selected option)
   and the overall solve/unsolve/correct/incorrect summary.
   ============================================================ */
const buildQuestionResults = (questions, answers) => {
  return questions.map((question, index) => {
    const selectedOption = answers[index]; // 0-based option index, or undefined if unanswered
    const correctOption = parseCorrectOptionIndex(question?.correct_option);
    const isAnswered = selectedOption !== undefined;
    const isCorrect = isAnswered && selectedOption === correctOption;

    return {
      question_id: question?.id,
      selected_option: isAnswered ? selectedOption : null,
      correct_option: correctOption,
      status: !isAnswered ? "unsolved" : isCorrect ? "correct" : "incorrect",
    };
  });
};

const summarizeResults = (questionResults, totalExamTime, timeRemaining) => {
  const usedTime = Math.max(0, totalExamTime - timeRemaining);

  return {
    total_question: questionResults.length,
    total_solved: questionResults.filter((r) => r.status !== "unsolved").length,
    total_unsolved: questionResults.filter((r) => r.status === "unsolved").length,
    total_correct: questionResults.filter((r) => r.status === "correct").length,
    total_incorrect: questionResults.filter((r) => r.status === "incorrect").length,
    total_time: formatTime(totalExamTime),
    time_taken: addOneSecond(formatTime(usedTime)),
  };
};

/* ============================================================
   COMPONENT
   ============================================================ */
export default function ExamPage() {
  const navigate = useNavigate();

  /* ---------- Exam context (set on the dashboard before navigating here) ---------- */
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const examType = localStorage.getItem("examType");        // "mock" | "live"
  const paperSetId = localStorage.getItem("paperset");      // set_id
  const paperLevelId = localStorage.getItem("paperlevel");  // level_id
  const userLevel = localStorage.getItem("Userlevl") || paperLevelId || "";
  const examTitle = localStorage.getItem("Exam_Tittle") || "Not Available";
  const examId = localStorage.getItem("exam_id");

  /* ---------- UI state ---------- */
  const [modal, setModal] = useState({ open: false, type: "", title: "", message: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [examReady, setExamReady] = useState(false); // controls whether exam UI is shown
  const [fatalError, setFatalError] = useState(null);

  /* ---------- Exam progress state ---------- */
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});            // { [questionIndex]: selectedOptionIndex }
  const [visited, setVisited] = useState(new Set([0]));
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalExamTime, setTotalExamTime] = useState(0);

  /* ---------- Live-exam only bookkeeping ---------- */
  const [startCalled, setStartCalled] = useState(false);
  const [isFinishingMock, setIsFinishingMock] = useState(false);
  const [examRowId, setExamRowId] = useState(
    localStorage.getItem("exam_result_row_id") || null
  );

  /* ============================================================
     FETCH EXAM PAPER
     GET /exam-paper?level_id=<paperLevelId>&set_id=<paperSetId>
     ============================================================ */
  const { data: paperResponse, loading: questionLoading } = useFetchData(
    () => questionApi.getExamPaper(paperLevelId, paperSetId),
    [paperLevelId, paperSetId]
  );

  // Defensive unwrap: accept either a raw array or an axios-style { data: [...] } body
  const rawQuestions = Array.isArray(paperResponse)
    ? paperResponse
    : paperResponse?.data || [];

  // The API currently returns rows from every paper, not just the requested
  // set. Try to match paper_id === paperSetId first; if that finds nothing
  // (paperSetId comes from a different ID space than paper_id right now),
  // fall back to the first complete paper in the response so the exam still
  // loads instead of showing "no questions found".
  const matchedByRequestedSet = paperSetId
    ? rawQuestions.filter((q) => String(q.paper_id) === String(paperSetId))
    : [];

  if (paperSetId && !matchedByRequestedSet.length && rawQuestions.length) {
    console.warn(
      `No paper found with paper_id === "${paperSetId}". ` +
      `Falling back to paper_id "${rawQuestions[0]?.paper_id}". ` +
      `The /exam-paper API is not filtering by the requested set_id.`
    );
  }

  const fallbackPaperId = rawQuestions[0]?.paper_id;
  const selectedQuestions = matchedByRequestedSet.length
    ? matchedByRequestedSet
    : rawQuestions.filter((q) => String(q.paper_id) === String(fallbackPaperId));

  const paperQuestions = [...selectedQuestions].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  /* ============================================================
     START EXAM (live exams only — records the attempt server-side)
     ============================================================ */
  const { create: startExam, loading: startExamLoading } = useCreate(
    ExamResultApi.start,
    (response) => {
      const rowId = response?.id;
      if (!rowId) {
        setModal({ open: true, type: "error", title: "Error", message: "Start exam response invalid" });
        return;
      }
      localStorage.setItem("exam_result_row_id", rowId);
      setExamRowId(rowId);
      setExamReady(true);
    },
    (error) => {
      setModal({
        open: true,
        type: "error",
        title: "Start Failed",
        message: error?.message || "Unable to start exam",
      });
    }
  );

  /* ============================================================
     SUBMIT EXAM (live) — finalizes the attempt started above
     ============================================================ */
  const { create: submitLiveExam } = useCreate(
    ({ id, payload }) => ExamResultApi.submit(id, payload),
    () => finishExam(),
    (error) => {
      setSubmitting(false);
      setModal({
        open: true,
        type: "error",
        title: "Submit Failed",
        message: error?.message || "Something went wrong while submitting exam",
      });
    }
  );

  /* ---------- Shared "exam finished" cleanup + redirect ---------- */
  const finishExam = () => {
    setSubmitting(false);
    setIsFinishingMock(true);

    setModal({
      open: true,
      type: "success",
      title: "Success",
      message: "Exam Submitted successfully",
    });

    localStorage.removeItem("examState");
    localStorage.removeItem("exam_result_row_id");
    localStorage.removeItem("paperlevel");
    localStorage.removeItem("Exam_Tittle");

    setTimeout(() => {
      navigate(examType === "mock" ? "/student-result" : "/student-dashboard");
      localStorage.removeItem("examType");
    }, 2000);
  };

  /* ---------- Basic guard: do we have everything needed to run the exam? ---------- */
  const hasValidExamContext = useMemo(() => {
    return Boolean(user?.id && user?.createdby && paperSetId && paperLevelId);
  }, [user, paperSetId, paperLevelId]);

  /* ============================================================
     INITIALIZE QUESTIONS
     Restores an in-progress attempt from localStorage if present,
     otherwise starts fresh using the set's total time.
     ============================================================ */
  useEffect(() => {
    if (!paperQuestions.length) return;

    setQuestions(paperQuestions);

    const savedExamState = localStorage.getItem("examState");
    const freshSeconds = Math.max(0, Number(paperQuestions[0]?.duration || 0) * 60);

    if (savedExamState) {
      try {
        const parsed = JSON.parse(savedExamState);
        setCurrentQuestion(parsed?.currentQ ?? 0);
        setAnswers(parsed?.answers || {});
        setTimeRemaining(Number(parsed?.timeRemaining || 0));
        setVisited(new Set(parsed?.visited || [0]));
        return;
      } catch (error) {
        console.error("examState parse error:", error);
        // fall through to a fresh start below
      }
    }

    setCurrentQuestion(0);
    setAnswers({});
    setVisited(new Set([0]));
    setTimeRemaining(freshSeconds);
    setTotalExamTime(freshSeconds);
  }, [paperQuestions]);

  // Make sure totalExamTime is populated even when resuming from a saved state
  useEffect(() => {
    if (!paperQuestions.length || totalExamTime) return;
    setTotalExamTime(Math.max(0, Number(paperQuestions[0]?.duration || 0) * 60));
  }, [paperQuestions, totalExamTime]);

  /* ============================================================
     START THE EXAM ONCE QUESTIONS ARE READY
     Mock tests skip the "start" API call entirely; live exams
     call it once (or resume if already started).
     ============================================================ */
  useEffect(() => {
    if (!questions.length) return;
    if (!hasValidExamContext) return;
    if (!totalExamTime) return;
    if (examReady || submitting || isFinishingMock || startCalled) return;

    if (examType === "mock") {
      setExamReady(true);
      return;
    }

    // Resuming a live exam that already has a row id
    if (examRowId) {
      setExamReady(true);
      setStartCalled(true);
      return;
    }

    setStartCalled(true);
    startExam({
      user_id: user.id,
      exam_id: examId,
      admin_id: user.createdby,
      Exam_name: examTitle,
      exam_time: formatTime(totalExamTime),
      total_question: questions.length,
      Exam_level: userLevel,
      paper_set: paperSetId,
    });
  }, [questions.length, totalExamTime, hasValidExamContext, examType, examRowId, examReady, submitting, isFinishingMock]);

  /* ---------- Persist progress so a refresh doesn't lose answers ---------- */
  useEffect(() => {
    if (!questions.length || !examReady) return;

    localStorage.setItem(
      "examState",
      JSON.stringify({
        currentQ: currentQuestion,
        answers,
        timeRemaining,
        visited: Array.from(visited),
      })
    );
  }, [currentQuestion, answers, timeRemaining, visited, questions.length, examReady]);

  /* ---------- Countdown timer, auto-submits at zero ---------- */
  useEffect(() => {
    if (!examReady || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setModal({ open: true, type: "warning", title: "Time's Up", message: "Your exam time is over." });
          setTimeout(() => handleSubmitExam(), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examReady]);

  /* ---------- Enter key = Next / Submit ---------- */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!examReady || e.key !== "Enter" || modal.open) return;
      e.preventDefault();

      if (currentQuestion < questions.length - 1) handleNext();
      else if (questions.length > 0) openSubmitWarning();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [examReady, modal.open, currentQuestion, questions.length]);

  /* ---------- Warn before closing/refreshing the tab mid-exam ---------- */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!examReady || submitting) return;
      e.preventDefault();
      e.returnValue = "Your exam may be submitted if you leave.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examReady, submitting]);

  /* ---------- Treat browser back button as "submit and leave" ---------- */
  useEffect(() => {
    const handleBackButton = () => {
      if (!examReady || submitting) return;

      const confirmLeave = window.confirm("Leaving the exam will submit your answers. Do you want to continue?");
      if (confirmLeave) handleSubmitExam();
      else window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [examReady, submitting]);

  /* ---------- Derived values for the UI ---------- */
  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const unvisitedCount = Math.max(0, questions.length - visited.size);
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  /* ---------- Navigation / answer handlers ---------- */
  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestion >= questions.length - 1) return;
    const nextIndex = currentQuestion + 1;
    setVisited((prev) => new Set([...prev, nextIndex]));
    setCurrentQuestion(nextIndex);
  };

  const handlePrevious = () => {
    if (currentQuestion <= 0) return;
    const prevIndex = currentQuestion - 1;
    setVisited((prev) => new Set([...prev, prevIndex]));
    setCurrentQuestion(prevIndex);
  };

  const handleQuestionClick = (index) => {
    setVisited((prev) => new Set([...prev, index]));
    setCurrentQuestion(index);
    setDrawerOpen(false);
  };

  const openSubmitWarning = () => {
    setModal({ open: true, type: "warning", title: "Warning", message: "Really want to submit Exam?" });
  };

  /* ============================================================
     SUBMIT EXAM
     Builds a full per-question result (question id + selected
     option), logs a complete breakdown to the console, then
     sends the summary to the right API for mock vs live exams.
     ============================================================ */
  const handleSubmitExam = async () => {
    if (submitting || !questions.length) return;

    if (examType !== "mock" && !examRowId) {
      setModal({ open: true, type: "error", title: "Error", message: "Exam session not found. Please restart the exam." });
      return;
    }

    setSubmitting(true);

    // Per-question breakdown: question id, selected option, correct option, status
    const questionResults = buildQuestionResults(questions, answers);
    const summary = summarizeResults(questionResults, totalExamTime, timeRemaining);

    console.log("===== EXAM SUBMISSION: PER-QUESTION RESULTS =====");
    console.table(questionResults);
    console.log("===== EXAM SUBMISSION: SUMMARY =====", summary);

    // ---------------- MOCK TEST ----------------
    if (examType === "mock") {
      const now = new Date();

      const resultPayload = {
        PaperLevel: paperLevelId,
        set: paperSetId,
        Level: userLevel,
        user_id: user.id,
        total_question: summary.total_question,
        total_answer: summary.total_solved,
        total_correct: summary.total_correct,
        total_unsolve: summary.total_unsolved,
        date: now.toLocaleDateString("en-CA"),           // YYYY-MM-DD
        time: now.toLocaleString("sv-SE").replace("T", " "), // YYYY-MM-DD HH:mm:ss
        totaltime: summary.total_time,
        time_taken: summary.time_taken,
        createdby: user.createdby,
        resultfor: "Test",
        examtitle: examTitle,
        exam_id: examId || null,
        question_results: questionResults, // question id + selected option, for detailed review
      };

      localStorage.removeItem("examState");
      localStorage.setItem("result", JSON.stringify(resultPayload));

      try {
        await ResultApi.create(resultPayload);
        finishExam();
        setTimeout(() => navigate("/student-result", { state: resultPayload }), 0);
      } catch (error) {
        setSubmitting(false);

        const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
        const isLiveExamError = errorMessage === "Your exam is live now. Please give the exam, not a mock test.";

        if (isLiveExamError) {
          setFatalError(errorMessage);
          return;
        }

        setModal({ open: true, type: "error", title: "Error", message: errorMessage });
      }
      return;
    }

    // ---------------- LIVE EXAM ----------------
    const livePayload = {
      total_solve: summary.total_solved,
      total_unsolve: summary.total_unsolved,
      total_correct: summary.total_correct,
      time_taken: summary.time_taken,
      question_results: questionResults, // question id + selected option, for detailed review
    };

    localStorage.setItem(
      "result",
      JSON.stringify({
        exam_row_id: examRowId,
        total_question: summary.total_question,
        ...livePayload,
      })
    );
    localStorage.removeItem("examState");

    try {
      await submitLiveExam({ id: examRowId, payload: livePayload });
    } catch (error) {
      console.error("Live submit error:", error);
    }
  };

  const handleGoToDashboard = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });
    window.location.href = "/student-dashboard";
  };

  /* ============================================================
     RENDER: LOADING / GUARD STATES
     ============================================================ */
  if (questionLoading || (examType !== "mock" && startExamLoading)) {
    return <ExamLoading />;
  }

  if (!hasValidExamContext) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 px-4 text-center">
        Missing exam details. Please go back and start exam again.
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        No questions found for this paper.
      </div>
    );
  }

  if (!examReady && examType !== "mock") {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold">Starting Exam...</h2>
          <p className="text-gray-600 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-50 px-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{fatalError}</p>
          <Button variant="primary" onClick={handleGoToDashboard} className="w-full">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-100">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold">Submitting Exam…</h2>
          <p className="text-gray-600 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER: EXAM UI
     ============================================================ */
  return (
    <div className="max-w-full h-screen overflow-hidden flex flex-col bg-blue-50 mb-8">
      <MessageModal
        showOkButton={false}
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        onConfirm={handleSubmitExam}
      />

      <div className="flex-1 overflow-y-auto m-2">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {/* Header */}
          <div className="bg-white sticky top-0 p-2 z-50 flex justify-between items-center mb-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-bold">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <p><b>Level : </b>{userLevel}</p>
            </div>

            <div className="flex items-center gap-3">
              <Info
                icon={Clock}
                label="Time Remaining"
                value={formatTime(timeRemaining)}
                danger={timeRemaining < 300}
              />
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Toggle Questions Panel"
              >
                {drawerOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Question */}
          <div className="mb-4 flex justify-center">
            <div className="text-center">{renderMathQuestion(currentQ?.question)}</div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[currentQ?.option1, currentQ?.option2, currentQ?.option3, currentQ?.option4].map((opt, i) => (
              <label
                key={i}
                className={`border p-3 rounded cursor-pointer ${
                  answers[currentQuestion] === i ? "border-blue-600 bg-blue-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  checked={answers[currentQuestion] === i}
                  onChange={() => handleAnswerSelect(i)}
                />
                <span className="ml-2">{String.fromCharCode(65 + i)}. {stripHtml(opt)}</span>
              </label>
            ))}
          </div>

          {/* Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 px-4 py-3 z-50">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
              <Button variant="secondary" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ChevronLeft /> Previous
              </Button>

              {currentQuestion < questions.length - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next <ChevronRight />
                </Button>
              ) : (
                <Button variant="primary" onClick={openSubmitWarning}>
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-opacity-50 z-40" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Question progress drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-slate-50 to-slate-100 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-5">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-blue-200">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Question Progress</h3>
              <p className="text-xs text-gray-500 mt-1">{answeredCount}/{questions.length} Answered</p>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-red-100 rounded-lg transition duration-200">
              <X size={24} className="text-red-600" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span className="font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-0 shadow-sm border border-gray-200">
            <div className="mt-8 space-y-3 flex gap-2 p-2">
              <StatCard label="Answered" value={answeredCount} color="green" />
              <StatCard label="Unanswered" value={unansweredCount} color="yellow" />
              <StatCard label="Unvisited" value={unvisitedCount} color="gray" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Questions</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(index)}
                  className={`h-10 rounded-lg font-semibold text-xs transition-all duration-200 transform hover:scale-105 ${
                    currentQuestion === index
                      ? "bg-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-400"
                      : answers[index] !== undefined
                      ? "bg-green-500 text-white shadow-md hover:shadow-lg"
                      : visited.has(index)
                      ? "bg-yellow-500 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300 shadow-sm"
                  }`}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="danger"
            onClick={openSubmitWarning}
            className="w-full mt-6 py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            Submit Exam
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small presentational helpers ---------------- */

function Info({ icon: Icon, label, value, danger }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={danger ? "text-red-600" : "text-blue-600"} size={18} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-semibold ${danger ? "text-red-600" : "text-gray-800"}`}>{value}</p>
      </div>
    </div>
  );
}

const STAT_COLORS = {
  green: "text-green-600",
  yellow: "text-yellow-600",
  gray: "text-gray-600",
};

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex flex-col justify-between items-center">
        <span className={`text-xs font-medium ${STAT_COLORS[color]}`}>{label}</span>
        <span className={`text-lg font-bold ${STAT_COLORS[color]}`}>{value}</span>
      </div>
    </div>
  );
}