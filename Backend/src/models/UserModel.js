const pool = require("../config/db");
const { buildPaginationResponse } = require("../utils/getPaginationParams");

const UserModel = {
  create: async (data) => {
    const sql = `
   INSERT INTO users
(
name,
class,
address,
mobilenumber,
username,
password,
level,
dob,
subscription_end_date,
usertype,
createdby,
status,
state_id,
district_id,
city,
pincode,
institute_id,
student_category
)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

    const username = data.username?.trim();
    const password = data.password?.trim();

    const [result] = await pool.query(sql, [
      data.name,
      data.class,
      data.address,
      data.mobilenumber,
      username,
      password,
      data.level,
      data.dob,
      data.subscription_end_date,
      data.usertype,
      data.createdby,
      data.status ?? 1,
      data.state_id,
      data.district_id,
      data.city,
      data.pincode,
      data.institute_id,
      data.student_category
    ]);

    return result;
  },
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  // findByadminId: async (id) => {
  //   const [rows] = await pool.query("SELECT * FROM users WHERE createdby = ? && usertype= 'student'", [id]);
  //   return rows;
  // },
  // findByadminId: async (id) => {
  //   const [rows] = await pool.query(
  //     `SELECT
  //     u.*,
  //     l.level_name
  //   FROM users u
  //   LEFT JOIN levels l
  //     ON u.level = l.level
  //     AND u.createdby = l.createdby
  //   WHERE u.createdby = ?
  //     AND u.usertype = 'student'`,
  //     [id],
  //   );

  //   return rows;
  // },
  // findByadminId: async (id, page = 1, limit = 5, search = "") => {
  //   const offset = (page - 1) * limit;

  //   // Total Count
  //   const [countRows] = await pool.query(
  //     `
  //   SELECT COUNT(*) as total
  //   FROM users u
  //   WHERE u.createdby = ?
  //     AND u.usertype = 'student'
  //     AND (
  //       ? = ''
  //       OR u.name LIKE ?
  //       OR u.username LIKE ?
  //       OR u.mobilenumber LIKE ?
  //       OR u.class LIKE ?
  //     )
  //   `,
  //     [id, search, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`],
  //   );

  //   const totalRecords = countRows[0].total;

  //   // Main Data
  //   const [rows] = await pool.query(
  //     `
  //   SELECT
  //     u.*,
  //     l.level_name
  //   FROM users u
  //   LEFT JOIN levels l
  //     ON u.level = l.level
  //     AND u.createdby = l.createdby

  //   WHERE u.createdby = ?
  //     AND u.usertype = 'student'
  //     AND (
  //       ? = ''
  //       OR u.name LIKE ?
  //       OR u.username LIKE ?
  //       OR u.mobilenumber LIKE ?
  //       OR u.class LIKE ?
  //     )

  //   ORDER BY u.id DESC
  //   LIMIT ?
  //   OFFSET ?
  //   `,
  //     [
  //       id,
  //       search,
  //       `%${search}%`,
  //       `%${search}%`,
  //       `%${search}%`,
  //       `%${search}%`,
  //       Number(limit),
  //       Number(offset),
  //     ],
  //   );

  //   return buildPaginationResponse(rows, page, limit, totalRecords);
  // },

  findByadminId: async (
    id,
    page = 1,
    limit = 5,
    search = "",
    individual_registration,
    student_category
  ) => {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
      `
    SELECT COUNT(*) as total
    FROM users u
    WHERE u.createdby = ?
      AND u.usertype = 'student'
      AND (
        ? = ''
        OR u.name LIKE ?
        OR u.username LIKE ?
        OR u.mobilenumber LIKE ?
        OR u.class LIKE ?
      )
      AND (
        ? IS NULL
        OR u.individual_registration = ?
      )
        AND (
          ? IS NULL
          OR ? = ''
          OR u.student_category = ?
        )
    `,
      [
        id,
        search,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        individual_registration ?? null,
        individual_registration,

        student_category ?? null,
        student_category ?? "",
        student_category,
      ],
    );

    const totalRecords = countRows[0].total;

    const [rows] = await pool.query(
      `
    SELECT
      u.*,
      l.level_name
    FROM users u
    LEFT JOIN levels l
      ON u.level = l.level
      AND u.createdby = l.createdby
    WHERE u.createdby = ?
      AND u.usertype = 'student'
      AND (
        ? = ''
        OR u.name LIKE ?
        OR u.username LIKE ?
        OR u.mobilenumber LIKE ?
        OR u.class LIKE ?
      )
      AND (
        ? IS NULL
        OR u.individual_registration = ?
      )
        AND (
          ? IS NULL
          OR ? = ''
          OR u.student_category = ?
        )
    ORDER BY u.id DESC
    LIMIT ?
    OFFSET ?
    `,
      [
        id,
        search,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        individual_registration ?? null,
        individual_registration,
        student_category ?? null,
        student_category ?? "",
        student_category,
        Number(limit),
        Number(offset),
      ],
    );

    return buildPaginationResponse(rows, page, limit, totalRecords);
  },
  findBySuperAdminId: async (id, page = 1, limit = 5, search = "") => {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
      `
    SELECT COUNT(*) as total
    FROM users u
    WHERE u.createdby = ?
      AND u.usertype = 'admin'
      AND (
        ? = ''
        OR u.name LIKE ?
        OR u.username LIKE ?
        OR u.mobilenumber LIKE ?
        OR u.class LIKE ?
      )
    `,
      [
        id,
        search,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      ]
    );

    const totalRecords = countRows[0].total;

    const [rows] = await pool.query(
      `
    SELECT
      u.*,
      l.level_name
    FROM users u
    LEFT JOIN levels l
      ON u.level = l.level
      AND u.createdby = l.createdby
    WHERE u.createdby = ?
      AND u.usertype = 'admin'
      AND (
        ? = ''
        OR u.name LIKE ?
        OR u.username LIKE ?
        OR u.mobilenumber LIKE ?
        OR u.class LIKE ?
      )
    ORDER BY u.id DESC
    LIMIT ?
    OFFSET ?
    `,
      [
        id,
        search,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        Number(limit),
        Number(offset),
      ]
    );

    return buildPaginationResponse(rows, page, limit, totalRecords);
  },
  ResultfindByadminId: async (id) => {
    const [rows] = await pool.query(
      `SELECT DISTINCT
        u.*,
        l.level_name
     FROM users u
     INNER JOIN result r
       ON r.user_id = u.id
     LEFT JOIN levels l
       ON u.level = l.level
      AND u.createdby = l.createdby
     WHERE u.createdby = ?
       AND u.usertype = 'student'`,
      [id],
    );

    return rows;
  },

  update: async (id, data) => {
    const sql = `
    UPDATE users SET
      name=?,
      class=?,
      address=?,
      mobilenumber=?,
      username=?,
      password=?,
      level=?,
      dob=?,
      subscription_end_date=?,
      usertype=?,
      status=?,
      state_id=?,
      district_id=?,
      city=?,
      pincode=?,
      institute_id=?,
      student_category=?
    WHERE id=?
  `;

    const username = data.username?.trim();
    const password = data.password?.trim();

    const [result] = await pool.query(sql, [
      data.name,
      data.class,
      data.address,
      data.mobilenumber,
      username,
      password,
      data.level,
      data.dob,
      data.subscription_end_date,
      data.usertype,
      data.status,
      data.state_id,
      data.district_id,
      data.city,
      data.pincode,
      data.institute_id,
      data.student_category,
      id,
    ]);

    return result;
  },

  remove: async (id) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1️⃣ Delete child records first
      await connection.query("DELETE FROM result WHERE user_id = ?", [id]);

      // 2) Delete student registration records
      await connection.query(
        "DELETE FROM student_registration WHERE user_id = ?",
        [id],
      );

      // 3 Delete parent record
      const [userResult] = await connection.query(
        "DELETE FROM users WHERE id = ?",
        [id],
      );

      await connection.commit();
      return userResult;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  findByUsername: async (username) => {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE BINARY username = ?",
      [username],
    );

    return rows[0];
  },
  saveRefreshToken: async (userId, refreshToken, refreshTokenExpiry) => {
    const [result] = await pool.query(
      `UPDATE users
     SET refreshToken = ?,
         refreshTokenExpiry = ?
     WHERE id = ?`,
      [refreshToken, refreshTokenExpiry, userId],
    );

    return result;
  },
  findByRefreshToken: async (refreshToken) => {
    const [rows] = await pool.query(
      `SELECT * FROM users
     WHERE refreshToken = ?`,
      [refreshToken],
    );

    return rows[0];
  },

  clearRefreshToken: async (userId) => {
    const [result] = await pool.query(
      `UPDATE users
     SET refreshToken = NULL,
         refreshTokenExpiry = NULL
     WHERE id = ?`,
      [userId],
    );

    return result;
  },
};

module.exports = UserModel;
