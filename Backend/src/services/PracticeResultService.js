const PracticeResultModel = require("../models/PracticeResultModel");
const ExamPaperService = require("./exampaper.service");

module.exports = {
  startPracticeExam: async (user, body) => {
    const { paper_level, paper_set } = body;

    // Step 1: Fetch Practice Paper
    const paper = await ExamPaperService.getExamPaper(
      user.createdby,
      paper_level,
      paper_set,
      user.student_category,
      "PRACTICE",
    );

    if (!paper) {
      throw new Error("Practice paper not found.");
    }

    const examPaper = Array.isArray(paper) ? paper[0] : paper;

    // Step 2: Fetch all questions of this paper
    const [paperQuestions] = await PracticeResultModel.getPaperQuestions(
      examPaper.paper_id,
    );

    if (!paperQuestions.length) {
      throw new Error("No questions found for this paper.");
    }

    const totalQuestions = paperQuestions.length;

    // Step 3: Check if exam already started
    const [existing] = await PracticeResultModel.checkExistingResult(
      user.id,
      examPaper.paper_id,
    );

    if (existing.length) {
      return {
        result_id: existing[0].id,
      };
    }

    // Step 4: Create Practice Result
    const [result] = await PracticeResultModel.createPracticeResult({
      user_id: user.id,

      // Question Paper ID
      exam_id: examPaper.paper_id,

      admin_id: user.createdby,

      exam_name: examPaper.paper_name,

      exam_level: paper_level,

      paper_set: paper_set,

      student_category: user.student_category,

      paper_type: examPaper.paper_type,

      exam_start_at: new Date(),

      exam_time: examPaper.duration,

      total_question: totalQuestions,

      total_solve: 0,

      total_unsolve: totalQuestions,

      total_correct: 0,

      total_wrong: 0,

      total_marks: 0,

      negative_marks: examPaper.negative_marking,

      percentage: 0,

      status: "IN_PROGRESS",

      pdf_status: "PENDING",
    });

    return {
      result_id: result.insertId,
    };
  },
  saveAnswer: async (user, body) => {
    const { result_id, question_id, selected_option } = body;

    // Step 1: Validate Result
    const [results] = await PracticeResultModel.getPracticeResult(result_id);

    if (!results.length) {
      throw new Error("Practice result not found.");
    }

    const result = results[0];

    if (result.status !== "IN_PROGRESS") {
      throw new Error("Exam already completed.");
    }

    // Step 2: Fetch Question
    const [questions] = await PracticeResultModel.getQuestion(question_id);

    if (!questions.length) {
      throw new Error("Question not found.");
    }

    const question = questions[0];

    // Step 3: Check Answer
    const isCorrect =
      String(selected_option) === String(question.correct_option);

    const marksObtained = isCorrect ? Number(question.marks) : 0;

    const negativeMarks = isCorrect ? 0 : Number(question.negative_marks);

    // Step 4: Check Existing Answer
    const [existingAnswers] = await PracticeResultModel.checkAnswerExists(
      result_id,
      question_id,
    );

    let previousOption = null;

    if (existingAnswers.length) {
      previousOption = existingAnswers[0].selected_option;

      // Update Existing Answer
      await PracticeResultModel.updateAnswer({
        result_id,
        question_id,
        selected_option,
        correct_option: question.correct_option,
        is_correct: isCorrect,
        marks_obtained: marksObtained,
        negative_marks: negativeMarks,
      });
    } else {
      // Insert New Answer
      await PracticeResultModel.insertAnswer({
        result_id,
        question_id,
        selected_option,
        correct_option: question.correct_option,
        is_correct: isCorrect,
        marks_obtained: marksObtained,
        negative_marks: negativeMarks,
      });
    }

    // Step 5: Insert Log
    await PracticeResultModel.insertAnswerLog({
      result_id,
      question_id,
      previous_option: previousOption,
      selected_option,
      action_type: previousOption ? "CHANGE" : "SELECT",
    });

    // Step 6: Get Updated Summary
    const [summaryRows] = await PracticeResultModel.getAnswerSummary(result_id);

    const summary = summaryRows[0];

    const totalSolve = Number(summary.totalSolve) || 0;
    const totalCorrect = Number(summary.totalCorrect) || 0;
    const totalWrong = Number(summary.totalWrong) || 0;
    const totalMarks = Number(summary.totalMarks) || 0;

    const totalQuestion = Number(result.total_question);

    const totalUnsolve = totalQuestion - totalSolve;

    const percentage =
      totalQuestion > 0 ? (totalCorrect / totalQuestion) * 100 : 0;

    // Step 7: Update Practice Result
    await PracticeResultModel.updatePracticeResult({
      result_id,
      total_solve: totalSolve,
      total_unsolve: totalUnsolve,
      total_correct: totalCorrect,
      total_wrong: totalWrong,
      total_marks: totalMarks,
      percentage,
    });

    return {
      message: "Answer saved successfully.",
    };
  },
  submitPracticeExam: async (user, body) => {
    const { result_id } = body;

    // Get Practice Result
    const [results] = await PracticeResultModel.getPracticeResult(result_id);

    if (!results.length) {
      throw new Error("Practice result not found.");
    }

    const result = results[0];

    if (result.status === "COMPLETED") {
      throw new Error("Exam already submitted.");
    }

    // Calculate Time Taken
    const startTime = new Date(result.exam_start_at);
    const endTime = new Date();

    const timeTaken = Math.floor((endTime - startTime) / 1000 / 60);

    // Mark Completed
    await PracticeResultModel.submitPracticeResult({
      result_id,

      exam_end_at: endTime,

      time_taken: timeTaken,

      status: "COMPLETED",
    });

    return {
      result_id,

      exam_end_at: endTime,

      time_taken: timeTaken,

      status: "COMPLETED",
    };
  },
};
