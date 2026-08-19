const pool = require("../config/db");
const { buildPaginationResponse } = require("../utils/getPaginationParams");

const ExamRegistration = {
  createRegistration: async (data) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Find Admin ID from URL username
      const [admin] = await connection.query(
        `SELECT id
         FROM users
         WHERE username = ?
         LIMIT 1`,
        [data.createdByUsername]
      );

      if (admin.length === 0) {
        throw new Error("Invalid registration link.");
      }

      const createdBy = admin[0].id;

      // Insert Student
      const [result] = await connection.query(
        `INSERT INTO users
        (
            name,
            class,
            mobilenumber,
            institute_id,
            dob,
            address,
            state_id,
            district_id,
            city,
            pincode,
            level,
            username,
            password,
            createdby,
            usertype,
            status,
            individual_registration,
            student_category
        )
        VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          data.name,
          data.class,
          data.mobile,
          data.institute_id,
          data.dob,
          data.address,
          data.state_id,
          data.district_id,
          data.city,
          data.pincode,
          data.level,
          data.username.trim(),
          data.password.trim(),
          createdBy,
          "Student",
          1,
          1,
          data.studentcategory || data.student_category
        ]
      );

      await connection.commit();

      return {
        success: true,
        userId: result.insertId,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // ✅ FIXED — now inside same object
  // getByCreatedBy: async (createdby) => {
  //   const connection = await pool.getConnection();

  //   try {

  //     const [rows] = await connection.query(`
  //     SELECT
  //       u.id AS user_id,
  //       u.name,
  //       u.class,
  //       u.address,
  //       u.mobilenumber,
  //       u.username,
  //       u.level,
  //       u.dob,
  //       u.subscription_end_date,
  //       u.usertype,
  //       u.status,

  //       s.learning_center_name,
  //       s.city,
  //       s.parent_name,
  //       s.whatsapp_number,
  //       s.registration_date

  //     FROM users u
  //     INNER JOIN student_registration s
  //     ON u.id = s.user_id,

  //     WHERE u.createdby = ?
  //     ORDER BY s.registration_date DESC
  //   `, [createdby]);

  //     return rows;

  //   } finally {
  //     connection.release();
  //   }
  // }

  getByCreatedBy: async (createdby, page = 1, limit = 5, search = "") => {
    const connection = await pool.getConnection();

    try {
      const offset = (page - 1) * limit;

      // Count Query
      const [countRows] = await connection.query(
        `
                SELECT COUNT(*) AS total

                FROM users u

                INNER JOIN student_registration s
                    ON u.id = s.user_id

                WHERE u.createdby = ?
                  AND (
                        ? = ''
                        OR u.name LIKE ?
                        OR u.username LIKE ?
                        OR u.mobilenumber LIKE ?
                        OR s.parent_name LIKE ?
                        OR s.city LIKE ?
                        OR s.learning_center_name LIKE ?
                        OR u.class LIKE ?
                  )
                `,
        [
          createdby,
          search,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
        ],
      );

      const totalRecords = countRows[0].total;

      // Main Query
      const [rows] = await connection.query(
        `
                SELECT 
                    u.id AS user_id,
                    u.name,
                    u.class,
                    u.address,
                    u.mobilenumber,
                    u.username,
                    u.password,
                    u.level,
                    u.dob,
                    u.subscription_end_date,
                    u.usertype,
                    u.status,

                    s.age,
                    s.learning_center_name,
                    s.city,
                    s.parent_name,
                    s.whatsapp_number,
                    s.registration_date

                FROM users u

                INNER JOIN student_registration s
                    ON u.id = s.user_id

                WHERE u.createdby = ?
                  AND (
                        ? = ''
                        OR u.name LIKE ?
                        OR u.username LIKE ?
                        OR u.mobilenumber LIKE ?
                        OR s.parent_name LIKE ?
                        OR s.city LIKE ?
                        OR s.learning_center_name LIKE ?
                        OR u.class LIKE ?
                  )

                ORDER BY
                    s.registration_date DESC

                LIMIT ?
                OFFSET ?
                `,
        [
          createdby,
          search,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          Number(limit),
          Number(offset),
        ],
      );

      return buildPaginationResponse(rows, page, limit, totalRecords);
    } finally {
      connection.release();
    }
  },
};

module.exports = ExamRegistration;
