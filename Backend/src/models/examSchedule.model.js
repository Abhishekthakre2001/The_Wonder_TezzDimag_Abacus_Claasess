const pool = require("../config/db");

/**
 * Exam Schedule Model
 * Handles all database operations for exam_schedules table
 */

const ExamScheduleModel = {
  /**
   * Create a new exam schedule
   * @param {Object} data - Exam schedule data
   * @returns {Promise} Query result with insertId
   */
  create: async (data) => {
    const sql = `
      INSERT INTO exam_schedules (
        exam_title,
        start_datetime,
        end_datetime,
        exam_status,
        exam_category,
        exam_type,
        exam_level,
        exam_set,
        exam_paper_id,
        exam_state,
        exam_district,
        exam_institute,
        created_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.query(sql, [
      data.exam_title,
      data.start_datetime,
      data.end_datetime,
      data.exam_status,
      data.exam_category,
      data.exam_type,
      JSON.stringify(data.exam_level || []),
      JSON.stringify(data.exam_set || []),
      data.exam_paper_id,
      JSON.stringify(data.exam_state || []),
      JSON.stringify(data.exam_district || []),
      JSON.stringify(data.exam_institute || []),
      data.created_by,
    ]);

    return result;
  },


  findById: async (id, userId) => {
    const sql = `
      SELECT * FROM exam_schedules 
      WHERE id = ? AND created_by = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id, userId]);
    return rows[0] || null;
  },


  findAll: async (userId, limit, offset, search = "", examStatus = "", examCategory = "", examType = "") => {
    let sql = "SELECT * FROM exam_schedules WHERE created_by = ?";
    const params = [userId];

    // Search by exam_title
    if (search) {
      sql += " AND exam_title LIKE ?";
      params.push(`%${search}%`);
    }

    // Filter by exam_status
    if (examStatus) {
      sql += " AND exam_status = ?";
      params.push(examStatus);
    }

    // Filter by exam_category
    if (examCategory) {
      sql += " AND exam_category = ?";
      params.push(examCategory);
    }

    // Filter by exam_type
    if (examType) {
      sql += " AND exam_type = ?";
      params.push(examType);
    }

    // Sort by created_at DESC and apply pagination
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  },


  countAll: async (userId, search = "", examStatus = "", examCategory = "", examType = "") => {
    let sql = "SELECT COUNT(*) as total FROM exam_schedules WHERE created_by = ?";
    const params = [userId];

    if (search) {
      sql += " AND exam_title LIKE ?";
      params.push(`%${search}%`);
    }

    if (examStatus) {
      sql += " AND exam_status = ?";
      params.push(examStatus);
    }

    if (examCategory) {
      sql += " AND exam_category = ?";
      params.push(examCategory);
    }

    if (examType) {
      sql += " AND exam_type = ?";
      params.push(examType);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  },


  update: async (id, userId, data) => {
    const sql = `
      UPDATE exam_schedules 
      SET 
        exam_title = ?,
        start_datetime = ?,
        end_datetime = ?,
        exam_status = ?,
        exam_category = ?,
        exam_type = ?,
        exam_level = ?,
        exam_set = ?,
        exam_paper_id  = ?,
        exam_state = ?,
        exam_district = ?,
        exam_institute = ?,
        updated_at = NOW()
      WHERE id = ? AND created_by = ?
    `;

    const [result] = await pool.query(sql, [
      data.exam_title,
      data.start_datetime,
      data.end_datetime,
      data.exam_status,
      data.exam_category,
      data.exam_type,
      JSON.stringify(data.exam_level || []),
      JSON.stringify(data.exam_set || []),
      data.exam_paper_id,
      JSON.stringify(data.exam_state || []),
      JSON.stringify(data.exam_district || []),
      JSON.stringify(data.exam_institute || []),
      id,
      userId,
    ]);

    return result;
  },


  delete: async (id, userId) => {
    const sql = "DELETE FROM exam_schedules WHERE id = ? AND created_by = ?";
    const [result] = await pool.query(sql, [id, userId]);
    return result;
  },


  export: async (userId, search = "", examStatus = "", examCategory = "", examType = "") => {
    let sql = "SELECT * FROM exam_schedules WHERE created_by = ?";
    const params = [userId];

    if (search) {
      sql += " AND exam_title LIKE ?";
      params.push(`%${search}%`);
    }

    if (examStatus) {
      sql += " AND exam_status = ?";
      params.push(examStatus);
    }

    if (examCategory) {
      sql += " AND exam_category = ?";
      params.push(examCategory);
    }

    if (examType) {
      sql += " AND exam_type = ?";
      params.push(examType);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);
    return rows;
  },


  getUpcomingAndLiveExams: async (userId) => {
  const sql = `
    SELECT
        *,
        CASE
            WHEN NOW() BETWEEN start_datetime AND end_datetime
                THEN 'LIVE'
            WHEN NOW() < start_datetime
                THEN 'UPCOMING'
        END AS remark
    FROM exam_schedules
    WHERE created_by = ?
      AND exam_status = 'Active'
      AND (
            NOW() BETWEEN start_datetime AND end_datetime
            OR NOW() < start_datetime
          )
    ORDER BY start_datetime ASC
  `;

  const [rows] = await pool.query(sql, [userId]);

  return rows;
},
};

module.exports = ExamScheduleModel;
