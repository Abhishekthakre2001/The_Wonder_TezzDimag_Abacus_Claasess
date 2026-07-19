const pool = require("../config/db");
const { buildPaginationResponse } = require("../utils/getPaginationParams");

module.exports = {
  create: (data) =>
    pool.query("INSERT INTO sets (set_name, createdby) VALUES (?, ?)", [
      data.set_name,
      data.createdby,
    ]),

  findBySetNameAndUser: (set_name, createdby) =>
    pool.query("SELECT * FROM sets WHERE set_name = ? AND createdby = ?", [
      set_name,
      createdby,
    ]),

  findAll: () => pool.query("SELECT * FROM sets"),

  findbyadminid: async (id, page = 1, limit = 5, search = "") => {
    const offset = (page - 1) * limit;

    // Count Query
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
      [id, search, `%${search}%`],
    );

    const totalRecords = countRows[0].total;

    // Main Query
    const [rows] = await pool.query(
      `
    SELECT *
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
      [id, search, `%${search}%`, Number(limit), Number(offset)],
    );

    return buildPaginationResponse(rows, page, limit, totalRecords);
  },

  findById: (id) => pool.query("SELECT * FROM sets WHERE id = ?", [id]),

  update: (id, data) =>
    pool.query("UPDATE sets SET set_name=? WHERE id=?", [data.set_name, id]),

  remove: (id) => pool.query("DELETE FROM sets WHERE id = ?", [id]),

  getStudentSets: async (createdby, level) => {
    // Step 1: Get level id
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

    console.log("levelId",levelId)

    // Step 2: Get unique set_ids from question_papers
    const [paperRows] = await pool.query(
      `
    SELECT DISTINCT set_id
    FROM question_papers
    WHERE level_id = ?
      AND created_by = ?
    `,
      [levelId, createdby]
    );

    console.log("paperRows",paperRows)

    if (paperRows.length === 0) {
      return [[]];
    }

    // Extract set ids
    const setIds = paperRows.map((row) => row.set_id);

    // Step 3: Get sets from sets table
    const placeholders = setIds.map(() => "?").join(",");

    return pool.query(
      `
    SELECT id, set_name
    FROM sets
    WHERE createdby = ?
      AND id IN (${placeholders})
    ORDER BY set_name ASC
    `,
      [createdby, ...setIds]
    );
  },
};
