const pool = require("../config/db");

module.exports = {
  findById: (id) =>
    pool.query(`SELECT * FROM exam_schedule WHERE id = ?`, [id]),

  findByadmin: (id) =>
    pool.query(`SELECT * FROM exam_schedule WHERE createdby = ?`, [id]),

  create: async (data) => {
    // 1️⃣ Check questions exist
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
     FROM questions
     WHERE level = ?
       AND set_id = ?`,
      [data.exam_level, data.paper_set],
    );

    if (rows[0].total === 0) {
      const err = new Error("Set not available for this level");
      err.code = "SET_NOT_AVAILABLE";
      throw err;
    }

    // 2️⃣ Insert exam schedule
    return pool.query(
      `INSERT INTO exam_schedule
     (exam_level, exam_title, paper_set, date, start_time, end_time, createdby)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.exam_level,
        data.exam_title,
        data.paper_set,
        data.date,
        data.start_time,
        data.end_time,
        data.createdby,
      ],
    );
  },

  findAll: () =>
    pool.query(`
      SELECT es.*, l.level AS level_name
      FROM exam_schedule es
      JOIN levels l ON l.id = es.exam_level
      ORDER BY es.date, es.start_time
    `),

  // models/ExamScheduleModel.js
  findLevelWise: ({ level, createdby }) =>
    pool.query(
      `
   SELECT *
FROM exam_schedule
WHERE exam_level = ?
  AND createdby = ?
ORDER BY date, start_time;

    `,
      [level, createdby],
    ),

  findByDate: (date) =>
    pool.query(
      `SELECT es.*, l.level AS level_name
       FROM exam_schedule es
       JOIN levels l ON l.id = es.exam_level
       WHERE es.date = ?
       ORDER BY es.start_time`,
      [date],
    ),

  update: (id, data) =>
    pool.query(
      `UPDATE exam_schedule SET
        exam_level = ?,
        exam_title = ?,
        paper_set = ?,
        date = ?,
        start_time = ?,
        end_time = ?
       WHERE id = ?`,
      [
        data.exam_level,
        data.exam_title,
        data.paper_set,
        data.date,
        data.start_time,
        data.end_time,
        id,
      ],
    ),

  remove: (id) => pool.query(`DELETE FROM exam_schedule WHERE id = ?`, [id]),

  findLiveExam: ({ level, createdby }) =>
    pool.query(
      `
    SELECT *
    FROM exam_schedules
    WHERE exam_level = ?
      AND createdby = ?
      AND CONVERT_TZ(NOW(), '+00:00', '+05:30')
          BETWEEN start_time AND end_time
    LIMIT 1
    `,
      [level, createdby],
    ),
};
