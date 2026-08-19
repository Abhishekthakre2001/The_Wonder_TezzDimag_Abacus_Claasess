const pool = require("../config/db");
const {
  buildPaginationResponse,
} = require("../utils/getPaginationParams");

module.exports = {
  /**
   * Create a set for a user.
   */
  create: (setName, userId) =>
    pool.query(
      `
        INSERT INTO sets (
          set_name,
          createdby
        )
        VALUES (?, ?)
      `,
      [setName, userId]
    ),

  /**
   * Find a set by name for a specific user.
   */
  findBySetNameAndUser: (setName, userId) =>
    pool.query(
      `
        SELECT *
        FROM sets
        WHERE set_name = ?
          AND createdby = ?
      `,
      [setName, userId]
    ),

  /**
   * Get all sets belonging to a specific user.
   */
  findAllByUser: async (
    userId,
    page = 1,
    limit = 5,
    search = ""
  ) => {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    // Get total number of matching records.
    const [countRows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM sets
        WHERE createdby = ?
          AND (
            ? = ''
            OR set_name LIKE ?
          )
      `,
      [
        userId,
        search,
        searchPattern,
      ]
    );

    const totalRecords = countRows[0].total;

    // Get paginated records.
    const [rows] = await pool.query(
      `
        SELECT
          id,
          set_name,
          createdby
        FROM sets
        WHERE createdby = ?
          AND (
            ? = ''
            OR set_name LIKE ?
          )
        ORDER BY id DESC
        LIMIT ?
        OFFSET ?
      `,
      [
        userId,
        search,
        searchPattern,
        Number(limit),
        Number(offset),
      ]
    );

    return buildPaginationResponse(
      rows,
      page,
      limit,
      totalRecords
    );
  },

  /**
   * Find a specific set owned by a user.
   */
  findByIdAndUser: (id, userId) =>
    pool.query(
      `
        SELECT *
        FROM sets
        WHERE id = ?
          AND createdby = ?
      `,
      [id, userId]
    ),

  /**
   * Update a set only if it belongs to the user.
   */
  update: (id, userId, setName) =>
    pool.query(
      `
        UPDATE sets
        SET set_name = ?
        WHERE id = ?
          AND createdby = ?
      `,
      [setName, id, userId]
    ),

  /**
   * Delete a set only if it belongs to the user.
   */
  remove: (id, userId) =>
    pool.query(
      `
        DELETE FROM sets
        WHERE id = ?
          AND createdby = ?
      `,
      [id, userId]
    ),

  /**
   * Get sets available to a student based on
   * the student's creator/admin and level.
   */
  getStudentSets: async (createdby, level) => {
    // Find the level belonging to this admin/user.
    const [levelRows] = await pool.query(
      `
        SELECT id
        FROM levels
        WHERE level = ?
          AND createdby = ?
        LIMIT 1
      `,
      [level, createdby]
    );

    if (levelRows.length === 0) {
      return [[]];
    }

    const levelId = levelRows[0].id;

    // Find all sets used by question papers
    // for this level and creator.
    const [paperRows] = await pool.query(
      `
        SELECT DISTINCT set_id
        FROM question_papers
        WHERE level_id = ?
          AND created_by = ?
          AND set_id IS NOT NULL
      `,
      [levelId, createdby]
    );

    if (paperRows.length === 0) {
      return [[]];
    }

    const setIds = paperRows.map((row) => row.set_id);

    const placeholders = setIds
      .map(() => "?")
      .join(",");

    // Return only sets belonging to the same creator.
    return pool.query(
      `
        SELECT
          id,
          set_name
        FROM sets
        WHERE createdby = ?
          AND id IN (${placeholders})
        ORDER BY set_name ASC
      `,
      [createdby, ...setIds]
    );
  },
};