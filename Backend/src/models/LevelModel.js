const pool = require("../config/db");
const {
  buildPaginationResponse,
} = require("../utils/getPaginationParams");

module.exports = {
  create: (data, userId) =>
    pool.query(
      `
        INSERT INTO levels (
          level,
          level_name,
          createdby
        )
        VALUES (?, ?, ?)
      `,
      [data.level, data.level_name, userId]
    ),

  findByLevelAndUser: (level, userId) =>
    pool.query(
      `
        SELECT *
        FROM levels
        WHERE level = ?
          AND createdby = ?
      `,
      [level, userId]
    ),

  findAll: () =>
    pool.query(`
      SELECT *
      FROM levels
      ORDER BY id DESC
    `),

  findByIdAndUser: (id, userId) =>
    pool.query(
      `
        SELECT *
        FROM levels
        WHERE id = ?
          AND createdby = ?
      `,
      [id, userId]
    ),

  findAllByAdmin: async (
    userId,
    page = 1,
    limit = 5,
    search = ""
  ) => {
    const offset = (page - 1) * limit;

    const searchPattern = `%${search}%`;

    // Total records
    const [countRows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM levels
        WHERE createdby = ?
          AND (
            ? = ''
            OR level LIKE ?
            OR level_name LIKE ?
          )
      `,
      [
        userId,
        search,
        searchPattern,
        searchPattern,
      ]
    );

    const totalRecords = countRows[0].total;

    // Paginated records
    const [rows] = await pool.query(
      `
        SELECT *
        FROM levels
        WHERE createdby = ?
          AND (
            ? = ''
            OR level LIKE ?
            OR level_name LIKE ?
          )
        ORDER BY id DESC
        LIMIT ?
        OFFSET ?
      `,
      [
        userId,
        search,
        searchPattern,
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

  update: (id, userId, data) =>
    pool.query(
      `
        UPDATE levels
        SET
          level = ?,
          level_name = ?
        WHERE id = ?
          AND createdby = ?
      `,
      [
        data.level,
        data.level_name,
        id,
        userId,
      ]
    ),

  remove: (id, userId) =>
    pool.query(
      `
        DELETE FROM levels
        WHERE id = ?
          AND createdby = ?
      `,
      [id, userId]
    ),
};