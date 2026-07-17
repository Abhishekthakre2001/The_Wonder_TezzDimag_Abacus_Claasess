const ExamScheduleService = require("../services/examSchedule.service");

exports.createExamSchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await ExamScheduleService.createExamSchedule(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Exam Schedule created successfully",
      data: {
        id: result.insertId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error("Error creating exam schedule:", error);

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create exam schedule",
    });
  }
};


exports.getExamSchedules = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await ExamScheduleService.getAllExamSchedules(userId, req.query);

    res.status(200).json({
      success: true,
      message: "Exam Schedules retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching exam schedules:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exam schedules",
    });
  }
};


exports.getExamScheduleById = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;

    const examSchedule = await ExamScheduleService.getExamScheduleById(
      examId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Exam Schedule retrieved successfully",
      data: examSchedule,
    });
  } catch (error) {
    console.error("Error fetching exam schedule:", error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch exam schedule",
    });
  }
};


exports.updateExamSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;

    const updatedExam = await ExamScheduleService.updateExamSchedule(
      examId,
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Exam Schedule updated successfully",
      data: updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam schedule:", error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update exam schedule",
    });
  }
};


exports.deleteExamSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.id;

    await ExamScheduleService.deleteExamSchedule(examId, userId);

    res.status(200).json({
      success: true,
      message: "Exam Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exam schedule:", error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete exam schedule",
    });
  }
};


exports.exportExamSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = (req.query.format || "json").toLowerCase();

    // Validate format
    if (!["json", "csv"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Format must be 'json' or 'csv'",
      });
    }

    const exportData = await ExamScheduleService.exportExamSchedules(
      userId,
      format,
      req.query
    );

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="exam-schedules-${Date.now()}.csv"`
      );
      return res.send(exportData);
    }

    // JSON format
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="exam-schedules-${Date.now()}.json"`
    );
    res.status(200).json({
      success: true,
      message: "Export successful",
      data: exportData,
    });
  } catch (error) {
    console.error("Error exporting exam schedules:", error);

    res.status(500).json({
      success: false,
      message: "Failed to export exam schedules",
    });
  }
};

exports.getUpcomingAndLiveExams = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await ExamScheduleService.getUpcomingAndLiveExams(userId);

    res.status(200).json({
      success: true,
      message: "Exam schedules fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch exam schedules",
    });
  }
};
