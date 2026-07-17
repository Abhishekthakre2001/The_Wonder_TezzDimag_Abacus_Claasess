const ExamScheduleModel = require("../models/examSchedule.model");

const ExamScheduleService = {
  validateExamSchedule: (data) => {
    const errors = [];

    // Validate exam_title
    if (!data.exam_title || !data.exam_title.trim()) {
      errors.push("exam_title is required");
    }

    // Validate start_datetime
    if (!data.start_datetime) {
      errors.push("start_datetime is required");
    }

    // Validate end_datetime
    if (!data.end_datetime) {
      errors.push("end_datetime is required");
    }

    // Validate end_datetime > start_datetime
    if (data.start_datetime && data.end_datetime) {
      const startTime = new Date(data.start_datetime);
      const endTime = new Date(data.end_datetime);

      if (isNaN(startTime.getTime())) {
        errors.push("start_datetime must be a valid datetime");
      } else if (isNaN(endTime.getTime())) {
        errors.push("end_datetime must be a valid datetime");
      } else if (endTime <= startTime) {
        errors.push("end_datetime must be greater than start_datetime");
      }
    }

    // Validate exam_status
    const validStatuses = ["Active", "Inactive"];
    if (data.exam_status && !validStatuses.includes(data.exam_status)) {
      errors.push(`exam_status must be one of: ${validStatuses.join(", ")}`);
    }

    // Validate exam_category
    const validCategories = ["Abacus", "Vedic"];
    if (data.exam_category && !validCategories.includes(data.exam_category)) {
      errors.push(`exam_category must be one of: ${validCategories.join(", ")}`);
    }

    // Validate exam_type
    const validTypes = ["Mock", "Main Exam"];
    if (data.exam_type && !validTypes.includes(data.exam_type)) {
      errors.push(`exam_type must be one of: ${validTypes.join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },


  createExamSchedule: async (data, userId) => {
    const validation = ExamScheduleService.validateExamSchedule(data);
    if (!validation.valid) {
      const error = new Error(validation.errors.join(", "));
      error.statusCode = 400;
      throw error;
    }

    const examData = {
      exam_title: data.exam_title.trim(),
      start_datetime: data.start_datetime,
      end_datetime: data.end_datetime,
      exam_status: data.exam_status || "Active",
      exam_category: data.exam_category,
      exam_type: data.exam_type,
      exam_level: data.exam_level || null,
      exam_set: data.exam_set || null,
      exam_paper_id: data.exam_paper_id || null,
      exam_state: data.exam_state || null,
      exam_district: data.exam_district || null,
      exam_institute: data.exam_institute || null,
      created_by: userId,
    };

    return await ExamScheduleModel.create(examData);
  },


  getExamScheduleById: async (id, userId) => {
    const examSchedule = await ExamScheduleModel.findById(id, userId);

    if (!examSchedule) {
      const error = new Error("Exam Schedule not found");
      error.statusCode = 404;
      throw error;
    }

    // Parse JSON columns
    return ExamScheduleService.parseExamSchedule(examSchedule);
  },


  getAllExamSchedules: async (userId, query) => {
    const limit = Math.min(parseInt(query.limit) || 10, 100);
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const search = query.search || "";
    const exam_status = query.exam_status || "";
    const exam_category = query.exam_category || "";
    const exam_type = query.exam_type || "";

    const [examSchedules, total] = await Promise.all([
      ExamScheduleModel.findAll(userId, limit, offset, search, exam_status, exam_category, exam_type),
      ExamScheduleModel.countAll(userId, search, exam_status, exam_category, exam_type),
    ]);

    // Parse JSON columns
    const parsedData = examSchedules.map((exam) =>
      ExamScheduleService.parseExamSchedule(exam)
    );

    return {
      data: parsedData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },


  updateExamSchedule: async (id, userId, data) => {
    // Check if exam exists and belongs to user
    const existingExam = await ExamScheduleModel.findById(id, userId);
    if (!existingExam) {
      const error = new Error("Exam Schedule not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate update data
    const validation = ExamScheduleService.validateExamSchedule({
      ...existingExam,
      ...data,
    });

    if (!validation.valid) {
      const error = new Error(validation.errors.join(", "));
      error.statusCode = 400;
      throw error;
    }

    const updateData = {
      exam_title: data.exam_title?.trim() || existingExam.exam_title,
      start_datetime: data.start_datetime || existingExam.start_datetime,
      end_datetime: data.end_datetime || existingExam.end_datetime,
      exam_status: data.exam_status || existingExam.exam_status,
      exam_category: data.exam_category || existingExam.exam_category,
      exam_type: data.exam_type || existingExam.exam_type,
      exam_level: Array.isArray(data.exam_level)
        ? data.exam_level
        : existingExam.exam_level,
      exam_set: Array.isArray(data.exam_set)
        ? data.exam_set
        : existingExam.exam_set,
      exam_paper_id: data.exam_paper_id ?? existingExam.exam_paper_id,
      exam_state: Array.isArray(data.exam_state)
        ? data.exam_state
        : existingExam.exam_state,
      exam_district: Array.isArray(data.exam_district)
        ? data.exam_district
        : existingExam.exam_district,
      exam_institute: Array.isArray(data.exam_institute)
        ? data.exam_institute
        : existingExam.exam_institute,
    };

    await ExamScheduleModel.update(id, userId, updateData);

    // Return updated record
    const updated = await ExamScheduleModel.findById(id, userId);
    return ExamScheduleService.parseExamSchedule(updated);
  },


  deleteExamSchedule: async (id, userId) => {
    // Check if exam exists and belongs to user
    const exam = await ExamScheduleModel.findById(id, userId);
    if (!exam) {
      const error = new Error("Exam Schedule not found");
      error.statusCode = 404;
      throw error;
    }

    return await ExamScheduleModel.delete(id, userId);
  },


  exportExamSchedules: async (userId, format = "json", query = {}) => {
    const search = query.search || "";
    const exam_status = query.exam_status || "";
    const exam_category = query.exam_category || "";
    const exam_type = query.exam_type || "";

    const examSchedules = await ExamScheduleModel.export(
      userId,
      search,
      exam_status,
      exam_category,
      exam_type
    );

    // Parse JSON columns
    const parsedData = examSchedules.map((exam) =>
      ExamScheduleService.parseExamSchedule(exam)
    );

    if (format === "csv") {
      return ExamScheduleService.convertToCSV(parsedData);
    }

    return parsedData;
  },


  parseExamSchedule: (exam) => {
    console.log("Parsing exam schedule:", exam);
    return {
      ...exam,
      exam_level: exam.exam_level ? JSON.parse(exam.exam_level) : [],
      exam_set: exam.exam_set ? JSON.parse(exam.exam_set) : [],
      exam_state: exam.exam_state ? JSON.parse(exam.exam_state) : [],
      exam_district: exam.exam_district ? JSON.parse(exam.exam_district) : [],
      exam_institute: exam.exam_institute ? JSON.parse(exam.exam_institute) : [],
    };
  },


  convertToCSV: (examSchedules) => {
    if (examSchedules.length === 0) {
      return "id,exam_title,start_datetime,end_datetime,exam_status,exam_category,exam_type,created_by,created_at,updated_at\n";
    }

    const headers = [
      "id",
      "exam_title",
      "start_datetime",
      "end_datetime",
      "exam_status",
      "exam_category",
      "exam_type",
      "exam_level",
      "exam_set",
      "exam_state",
      "exam_district",
      "exam_institute",
      "created_by",
      "created_at",
      "updated_at",
    ];

    const rows = examSchedules.map((exam) => [
      exam.id,
      `"${exam.exam_title}"`,
      exam.start_datetime,
      exam.end_datetime,
      exam.exam_status,
      exam.exam_category,
      exam.exam_type,
      `"${JSON.stringify(exam.exam_level)}"`,
      `"${JSON.stringify(exam.exam_set)}"`,
      `"${JSON.stringify(exam.exam_state)}"`,
      `"${JSON.stringify(exam.exam_district)}"`,
      `"${JSON.stringify(exam.exam_institute)}"`,
      exam.created_by,
      exam.created_at,
      exam.updated_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  },


  getUpcomingAndLiveExams: async (userId) => {
  const exams = await ExamScheduleModel.getUpcomingAndLiveExams(userId);

  return exams.map((exam) => ({
    ...ExamScheduleService.parseExamSchedule(exam),
    remark: exam.remark,
  }));
},
};

module.exports = ExamScheduleService;
