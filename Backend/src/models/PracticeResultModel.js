const pool = require("../config/db");

module.exports = {
  getPracticePaper: ({ levelId, paper_set, createdBy }) =>
    pool.query(
      `
    SELECT
      id,
      paper_name,
      level_id,
      set_id,
      duration,
      total_questions,
      negative_marking,
      paper_type,
      created_by
    FROM question_papers
    WHERE level_id = ?
      AND set_id = ?
      AND paper_type = 'PRACTICE'
      AND status ='ACTIVE'
      AND created_by = ?
    LIMIT 1
    `,
      [levelId, paper_set, createdBy],
    ),

  checkExistingResult: (userId, examId) =>
    pool.query(
      `
      SELECT id, status
      FROM practice_result
      WHERE user_id = ?
        AND exam_id = ?
        AND status = 'IN_PROGRESS'
      LIMIT 1
      `,
      [userId, examId],
    ),

  createPracticeResult: (data) =>
    pool.query(
      `
      INSERT INTO practice_result(

        user_id,
        exam_id,
        admin_id,

        exam_name,
        exam_level,
        paper_set,

        student_category,
        paper_type,

        exam_start_at,
        exam_time,

        total_question,
        total_solve,
        total_unsolve,

        total_correct,
        total_wrong,

        total_marks,
        negative_marks,
        percentage,

        status,
        pdf_status

      )

      VALUES(
        ?,?,?,?,?,?,
        ?,?,
        ?,?,
        ?,?,?,
        ?,?,
        ?,?,?,
        ?,?
      )
      `,
      [
        data.user_id,
        data.exam_id,
        data.admin_id,

        data.exam_name,
        data.exam_level,
        data.paper_set,

        data.student_category,
        data.paper_type,

        data.exam_start_at,
        data.exam_time,

        data.total_question,
        data.total_solve,
        data.total_unsolve,

        data.total_correct,
        data.total_wrong,

        data.total_marks,
        data.negative_marks,
        data.percentage,

        data.status,
        data.pdf_status,
      ],
    ),
  getLevelByLevel: (level) =>
    pool.query(
      `
    SELECT id
    FROM levels
    WHERE level = ?
    LIMIT 1
    `,
      [level],
    ),

  getPaperQuestions: (paperId) =>
    pool.query(
      `
    SELECT
      *
    FROM question_paper_questions
    WHERE question_paper_id = ?
    ORDER BY sort_order ASC
    `,
      [paperId],
    ),
  getPracticeResult: (resultId) =>
    pool.query(
      `
    SELECT

      id,

      total_question,

      exam_start_at,

      total_correct,

      total_wrong,

      total_marks,

      percentage,

      status

    FROM practice_result

    WHERE id=?

    LIMIT 1
    `,
      [resultId],
    ),
  getQuestion: (questionId) =>
    pool.query(
      `
    SELECT
      id,
      correct_option,
      marks,
      negative_marks
    FROM question_paper_questions
    WHERE id = ?
    LIMIT 1
    `,
      [questionId],
    ),
  checkAnswerExists: (resultId, questionId) =>
    pool.query(
      `
    SELECT
      id,
      selected_option
    FROM practice_result_answers
    WHERE result_id = ?
      AND question_id = ?
    LIMIT 1
    `,
      [resultId, questionId],
    ),
  insertAnswer: (data) =>
    pool.query(
      `
    INSERT INTO practice_result_answers (

      result_id,
      question_id,

      selected_option,
      correct_option,

      is_correct,

      marks_obtained,
      negative_marks

    )

    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.result_id,
        data.question_id,

        data.selected_option,
        data.correct_option,

        data.is_correct,

        data.marks_obtained,
        data.negative_marks,
      ],
    ),
  updateAnswer: (data) =>
    pool.query(
      `
    UPDATE practice_result_answers
    SET

      selected_option = ?,
      correct_option = ?,

      is_correct = ?,

      marks_obtained = ?,
      negative_marks = ?

    WHERE result_id = ?
      AND question_id = ?
    `,
      [
        data.selected_option,
        data.correct_option,

        data.is_correct,

        data.marks_obtained,
        data.negative_marks,

        data.result_id,
        data.question_id,
      ],
    ),
  insertAnswerLog: (data) =>
    pool.query(
      `
    INSERT INTO practice_answer_logs (

      result_id,
      question_id,

      previous_option,
      selected_option,

      action_type

    )

    VALUES (?, ?, ?, ?, ?)
    `,
      [
        data.result_id,
        data.question_id,

        data.previous_option,

        data.selected_option,

        data.action_type,
      ],
    ),
  getAnswerSummary: (resultId) =>
    pool.query(
      `
    SELECT

      COUNT(*) AS totalSolve,

      SUM(is_correct = 1) AS totalCorrect,

      SUM(is_correct = 0) AS totalWrong,

      SUM(marks_obtained) AS totalMarks

    FROM practice_result_answers

    WHERE result_id = ?
    `,
      [resultId],
    ),
  updatePracticeResult: (data) =>
    pool.query(
      `
    UPDATE practice_result
    SET

      total_solve = ?,
      total_unsolve = ?,

      total_correct = ?,
      total_wrong = ?,

      total_marks = ?,
      percentage = ?

    WHERE id = ?
    `,
      [
        data.total_solve,
        data.total_unsolve,

        data.total_correct,
        data.total_wrong,

        data.total_marks,
        data.percentage,

        data.result_id,
      ],
    ),
  submitPracticeResult: (data) =>
    pool.query(
      `
    UPDATE practice_result

    SET

      exam_end_at=?,

      time_taken=?,

      status=?

    WHERE id=?
    `,
      [data.exam_end_at, data.time_taken, data.status, data.result_id],
    ),
};
