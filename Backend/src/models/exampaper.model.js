const pool = require("../config/db");

module.exports = {

  getExamPaper: async (createdBy,
    level,
    set_id,
    student_category,
    paper_type) => {

    console.log("levelId", createdBy, level, set_id, student_category, paper_type);

    // Step 1: Get level ID
    const [levelRows] = await pool.query(
      `
      SELECT id
      FROM levels
      WHERE createdby = ?
        AND level = ?
      LIMIT 1
      `,
      [createdBy, level]
    );

    if (levelRows.length === 0) {
      throw new Error(`Level '${level}' not found.`);
    }

    const level_id = levelRows[0].id;

    console.log("level_id", level_id)

    const sql = `
    SELECT
      qp.id AS paper_id,
      qp.paper_name,
      qp.question_paper_type,
      qp.paper_type,
      qp.duration,
      qp.total_questions,
      qp.negative_marking,

      ppq.id,
      ppq.section,
      ppq.question_no,
      ppq.question_type,
      ppq.marks,
      ppq.negative_marks,
      ppq.question,
      ppq.option1,
      ppq.option2,
      ppq.option3,
      ppq.option4,
      ppq.correct_option,
      ppq.explanation,
      ppq.sort_order

    FROM question_papers qp

    INNER JOIN question_paper_questions ppq
      ON ppq.question_paper_id = qp.id

    WHERE qp.created_by = ?
      AND qp.level_id = ?
      AND qp.set_id = ?
      AND qp.question_paper_type = ?
      AND qp.paper_type = ?

    ORDER BY ppq.sort_order ASC, ppq.question_no ASC;
  `;

    const [rows] = await pool.query(sql, [
      createdBy,
      level_id,
      set_id,
      student_category,
      paper_type
    ]);

    return rows;
  },

};