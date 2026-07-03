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
        exam_state,
        exam_district,
        exam_institute,
        created_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
      JSON.stringify(data.exam_state || []),
      JSON.stringify(data.exam_district || []),
      JSON.stringify(data.exam_institute || []),
      data.created_by,
    ]);

    return result;
  },

  /**
   * Find exam schedule by ID (check ownership)
   * @param {number} id - Exam schedule ID
   * @param {number} userId - User ID for ownership check
   * @returns {Promise} Exam schedule record or null
   */
  findById: async (id, userId) => {
    const sql = `
      SELECT * FROM exam_schedules 
      WHERE id = ? AND created_by = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id, userId]);
    return rows[0] || null;
  },

  /**
   * Find all exam schedules with pagination, search, filter, and sort
   * @param {number} userId - User ID to get their records
   * @param {number} limit - Records per page
   * @param {number} offset - Pagination offset
   * @param {string} search - Search by exam_title
   * @param {string} examStatus - Filter by exam_status
   * @param {string} examCategory - Filter by exam_category
   * @param {string} examType - Filter by exam_type
   * @returns {Promise} Array of exam schedules
   */
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

  /**
   * Count total exam schedules with filters
   * @param {number} userId - User ID
   * @param {string} search - Search term
   * @param {string} examStatus - Status filter
   * @param {string} examCategory - Category filter
   * @param {string} examType - Type filter
   * @returns {Promise} Total count
   */
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

  /**
   * Update exam schedule
   * @param {number} id - Exam schedule ID
   * @param {number} userId - User ID for ownership check
   * @param {Object} data - Updated data
   * @returns {Promise} Query result
   */
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
      JSON.stringify(data.exam_state || []),
      JSON.stringify(data.exam_district || []),
      JSON.stringify(data.exam_institute || []),
      id,
      userId,
    ]);

    return result;
  },

  /**
   * Delete exam schedule
   * @param {number} id - Exam schedule ID
   * @param {number} userId - User ID for ownership check
   * @returns {Promise} Query result
   */
  delete: async (id, userId) => {
    const sql = "DELETE FROM exam_schedules WHERE id = ? AND created_by = ?";
    const [result] = await pool.query(sql, [id, userId]);
    return result;
  },

  /**
   * Export exam schedules (for CSV export)
   * @param {number} userId - User ID
   * @param {string} search - Search term
   * @param {string} examStatus - Status filter
   * @param {string} examCategory - Category filter
   * @param {string} examType - Type filter
   * @returns {Promise} Array of all records matching criteria
   */
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
};

module.exports = ExamScheduleModel;
