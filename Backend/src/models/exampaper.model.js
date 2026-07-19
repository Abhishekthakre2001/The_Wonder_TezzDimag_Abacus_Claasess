const pool = require("../config/db");

module.exports = {

 getExamPaper: async (createdBy, levelId, setId) => {
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

    ORDER BY ppq.sort_order ASC, ppq.question_no ASC;
  `;

  const [rows] = await pool.query(sql, [
    createdBy,
    levelId,
    setId,
  ]);

  return rows;
},

};