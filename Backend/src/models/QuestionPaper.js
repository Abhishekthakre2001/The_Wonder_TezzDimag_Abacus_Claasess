const pool = require("../config/db");
const PDFDocument = require("pdfkit-table");

const QuestionPaperModel = {
  // IMPORT
  importQuestions: async (data) => {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [paper] = await conn.query(
        `INSERT INTO question_papers
                (question_paper_type, paper_name, level_id, set_id, duration, total_questions, negative_marking, paper_type, status, created_by)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          data.paper_category,
          data.paper_name,
          data.level_id,
          data.set_id,
          data.duration,
          data.questions.length,
          0,
          data.paper_type,
          data.status,
          data.created_by,
        ],
      );

      const paperId = paper.insertId;

      const values = data.questions.map((q, i) => [
        paperId,
        q.section,
        i + 1,
        q.question_type,
        q.marks,
        q.negative_marks,
        q.question,
        q.option1,
        q.option2,
        q.option3,
        q.option4,
        q.correct_option,
        q.explanation,
        i + 1,
        data.created_by,
      ]);

      await conn.query(
        `INSERT INTO question_paper_questions
                (question_paper_id, section, question_no, question_type, marks, negative_marks,
                question, option1, option2, option3, option4, correct_option, explanation, sort_order, created_by)
                VALUES ?`,
        [values],
      );

      await conn.commit();

      return { success: true, questionPaperId: paperId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
  addQuestions: async (data) => {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check paper exists
      const [papers] = await conn.query(
        `SELECT id FROM question_papers WHERE id = ?`,
        [data.paperId],
      );

      if (papers.length === 0) {
        throw new Error("Question paper not found.");
      }

      // Get next question number
      const [rows] = await conn.query(
        `SELECT COUNT(*) AS total
             FROM question_paper_questions
             WHERE question_paper_id = ?`,
        [data.paperId],
      );

      const questionNo = rows[0].total + 1;

      const [result] = await conn.query(
        `INSERT INTO question_paper_questions
            (
                question_paper_id,
                section,
                question_no,
                question_type,
                marks,
                negative_marks,
                question,
                option1,
                option2,
                option3,
                option4,
                correct_option,
                explanation,
                sort_order,
                created_by
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          data.paperId,
          data.section,
          questionNo,
          data.question_type,
          data.marks,
          data.negative_marks,
          data.question,
          data.option1,
          data.option2,
          data.option3,
          data.option4,
          data.correct_option,
          data.explanation,
          questionNo,
          data.created_by,
        ],
      );

      // Update total_questions in question_papers
      await conn.query(
        `UPDATE question_papers
             SET total_questions = total_questions + 1
             WHERE id = ?`,
        [data.paperId],
      );

      await conn.commit();

      return {
        questionId: result.insertId,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
  // GET PAPERS (OWN ONLY)
  getQuestionPapers: async (userId, page, limit, search) => {
    const offset = (page - 1) * limit;

    let where = "WHERE qp.created_by = ?";
    const params = [userId];

    if (search) {
      where += " AND qp.paper_name LIKE ?";
      params.push(`%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM question_papers qp
         ${where}`,
      params,
    );

    params.push(limit, offset);

    const [rows] = await pool.query(
      `SELECT
            qp.*,
            l.level_name,
            s.set_name
        FROM question_papers qp
        LEFT JOIN levels l
            ON l.id = qp.level_id
        LEFT JOIN sets s
            ON s.id = qp.set_id
        ${where}
        ORDER BY qp.id DESC
        LIMIT ?
        OFFSET ?`,
      params,
    );

    return {
      records: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // GET QUESTIONS (OWN ONLY)
  getQuestionsByPaper: async (paperId, userId, page, limit, search) => {
    const offset = (page - 1) * limit;

    let where = `
        WHERE
            q.question_paper_id = ?
            AND qp.created_by = ?
    `;

    const params = [paperId, userId];

    if (search) {
      where += " AND q.question LIKE ?";
      params.push(`%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM question_paper_questions q
         INNER JOIN question_papers qp
             ON qp.id = q.question_paper_id
         ${where}`,
      params,
    );

    params.push(limit, offset);

    const [rows] = await pool.query(
      `SELECT q.*
         FROM question_paper_questions q
         INNER JOIN question_papers qp
             ON qp.id = q.question_paper_id
         ${where}
         ORDER BY q.sort_order ASC
         LIMIT ?
         OFFSET ?`,
      params,
    );

    return {
      records: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // UPDATE PAPER
  updateQuestionPaper: async (id, data, userId) => {
    console.log("req", data);
    const [result] = await pool.query(
      `UPDATE question_papers
             SET question_paper_type=?, paper_name=?, level_id=?, set_id=?, duration=?, paper_type=?, status=?
             WHERE id=? AND created_by=?`,
      [
        data.paper_category,
        data.paper_name,
        data.level_id,
        data.set_id,
        data.duration,
        data.paper_type,
        data.status,
        id,
        userId,
      ],
    );
    return result;
  },

  // DELETE PAPER
  deleteQuestionPaper: async (id, userId) => {
    const [result] = await pool.query(
      `DELETE FROM question_papers WHERE id=? AND created_by=?`,
      [id, userId],
    );
    return result;
  },

  // DELETE QUESTION
  deleteQuestion: async (id, userId) => {
    const [result] = await pool.query(
      `DELETE q FROM question_paper_questions q
             INNER JOIN question_papers qp ON qp.id = q.question_paper_id
             WHERE q.id=? AND qp.created_by=?`,
      [id, userId],
    );
    return result;
  },

  // UPDATE QUESTION
  updateQuestion: async (id, data, userId) => {
    const [result] = await pool.query(
      `UPDATE question_paper_questions q
             INNER JOIN question_papers qp ON qp.id = q.question_paper_id
             SET q.section=?, q.question_type=?, q.marks=?, q.negative_marks=?,
                 q.question=?, q.option1=?, q.option2=?, q.option3=?, q.option4=?,
                 q.correct_option=?, q.explanation=?
             WHERE q.id=? AND qp.created_by=?`,
      [
        data.section,
        data.question_type,
        data.marks,
        data.negative_marks,
        data.question,
        data.option1,
        data.option2,
        data.option3,
        data.option4,
        data.correct_option,
        data.explanation,
        id,
        userId,
      ],
    );
    return result;
  },

  exportQuestionPapers: async (userId, search, res) => {
    let where = "WHERE qp.created_by=?";
    const params = [userId];

    if (search) {
      where += " AND qp.paper_name LIKE ?";
      params.push(`%${search}%`);
    }

    const [rows] = await pool.query(
      `
        SELECT
            qp.paper_name,
            l.level_name,
            s.set_name,
            qp.duration,
            qp.paper_type,
            qp.status
        FROM question_papers qp
        LEFT JOIN levels l ON l.id = qp.level_id
        LEFT JOIN sets s ON s.id = qp.set_id
        ${where}
        ORDER BY qp.id DESC
    `,
      params,
    );

    const doc = new PDFDocument({
      margin: 25,
      size: "A4",
      layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Question_Papers.pdf",
    );

    doc.pipe(res);

    // -----------------------
    // Title
    // -----------------------

    doc.fontSize(22).fillColor("#0F4C81").text("QUESTION PAPERS", {
      align: "center",
    });

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor("black")
      .text(`Generated : ${new Date().toLocaleString()}`, {
        align: "right",
      });

    doc.moveDown();

    // -----------------------
    // Summary
    // -----------------------

    doc.fontSize(12).text(`Total Question Papers : ${rows.length}`);

    doc.moveDown();

    // -----------------------
    // Table
    // -----------------------

    const table = {
      headers: [
        {
          label: "Sr.",
          property: "sr",
          width: 40,
          align: "center",
        },
        {
          label: "Paper Name",
          property: "paper_name",
          width: 170,
        },
        {
          label: "Level",
          property: "level_name",
          width: 90,
        },
        {
          label: "Set",
          property: "set_name",
          width: 90,
        },
        {
          label: "Duration",
          property: "duration",
          width: 70,
          align: "center",
        },
        {
          label: "Type",
          property: "paper_type",
          width: 70,
          align: "center",
        },
        {
          label: "Status",
          property: "status",
          width: 70,
          align: "center",
        },
      ],

      datas: rows.map((r, i) => ({
        sr: i + 1,
        paper_name: r.paper_name,
        level_name: r.level_name,
        set_name: r.set_name,
        duration: `${r.duration} Min`,
        paper_type: r.paper_type,
        status: r.status,
      })),
    };

    await doc.table(table, {
      width: 540,

      prepareHeader: () => {
        doc.font("Helvetica-Bold").fontSize(11);
      },

      prepareRow: () => {
        doc.font("Helvetica").fontSize(10);
      },

      columnSpacing: 4,
      padding: 6,
    });

    // -----------------------
    // Footer
    // -----------------------

    doc.moveDown();

    doc.fontSize(9).fillColor("gray").text("This report is system generated.", {
      align: "center",
    });

    doc.end();
  },

  exportQuestionPaper: async (paperId, userId, search, res) => {
    const [[paper]] = await pool.query(
      `SELECT
            qp.*,
            l.level_name,
            s.set_name
        FROM question_papers qp
        LEFT JOIN levels l ON l.id=qp.level_id
        LEFT JOIN sets s ON s.id=qp.set_id
        WHERE qp.id=? AND qp.created_by=?`,
      [paperId, userId],
    );

    if (!paper) {
      throw new Error("Question paper not found");
    }

    let where = "WHERE question_paper_id=?";
    const params = [paperId];

    if (search) {
      where += " AND question LIKE ?";
      params.push(`%${search}%`);
    }

    const [questions] = await pool.query(
      `SELECT *
         FROM question_paper_questions
         ${where}
         ORDER BY sort_order`,
      params,
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${paper.paper_name}.pdf"`,
    );

    doc.pipe(res);

    // ----------------------------------
    // Title
    // ----------------------------------

    doc.fontSize(22).fillColor("#1F4E79").text(paper.paper_name, {
      align: "center",
    });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("black")
      .text(`Level : ${paper.level_name}`, 40, doc.y, {
        continued: true,
      })
      .text(`        Set : ${paper.set_name}`);

    doc
      .text(`Duration : ${paper.duration} Minutes`, {
        continued: true,
      })
      .text(`        Type : ${paper.paper_type}`);

    doc.text(`Status : ${paper.status}`);

    doc.moveDown();

    // ----------------------------------
    // Questions
    // ----------------------------------

    questions.forEach((q, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      // Border
      doc.roundedRect(35, doc.y, 525, 140).strokeColor("#CCCCCC").stroke();

      doc.moveDown(0.5);

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Q${index + 1}. ${q.question}`, 50, doc.y);

      doc.moveDown(0.5);

      doc.font("Helvetica").fontSize(11);

      doc.text(`A. ${q.option1}`);
      doc.text(`B. ${q.option2}`);
      doc.text(`C. ${q.option3}`);
      doc.text(`D. ${q.option4}`);

      doc.moveDown(0.4);

      doc.font("Helvetica-Bold").text(`Correct Answer : ${q.correct_option}`);

      doc.font("Helvetica").text(`Marks : ${q.marks}`);

      doc.text(`Negative Marks : ${q.negative_marks}`);

      doc.text(`Explanation : ${q.explanation || "-"}`);

      doc.moveDown(2);
    });

    // ----------------------------------
    // Footer
    // ----------------------------------

    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      doc.fontSize(9);

      doc.text(`Page ${i + 1} of ${pages.count}`, 0, doc.page.height - 40, {
        align: "center",
      });
    }

    doc.end();
  },

  // GET ACTIVE QUESTION PAPERS BY FILTERS
  getFilteredQuestionPapers: async (filters) => {
    let where = `WHERE qp.status = 'ACTIVE'`;
    const params = [];

    if (filters.question_paper_type) {
      where += ` AND qp.question_paper_type = ?`;
      params.push(filters.question_paper_type);
    }

    if (filters.level_id) {
      where += ` AND qp.level_id = ?`;
      params.push(filters.level_id);
    }

    if (filters.set_id) {
      where += ` AND qp.set_id = ?`;
      params.push(filters.set_id);
    }

    if (filters.paper_type) {
      where += ` AND qp.paper_type = ?`;
      params.push(filters.paper_type);
    }

    const [rows] = await pool.query(
      `SELECT
            qp.id,
            qp.paper_name,
            qp.question_paper_type,
            qp.level_id,
            qp.set_id,
            qp.paper_type,
            qp.duration,
            qp.total_questions,
            l.level_name,
            s.set_name
        FROM question_papers qp
        LEFT JOIN levels l
            ON l.id = qp.level_id
        LEFT JOIN sets s
            ON s.id = qp.set_id
        ${where}
        ORDER BY qp.paper_name ASC`,
      params,
    );

    return rows;
  },
};

module.exports = QuestionPaperModel;
