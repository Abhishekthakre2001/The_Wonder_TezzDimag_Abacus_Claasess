const ExamPaperService = require("../services/exampaper.service");

exports.getExamPaper = async (req, res) => {
  try {
    const createdBy = req.user.createdby;
    const student_category = req.user.student_category;
    const { level_id, set_id, paper_type } = req.query;

    if (!level_id || !set_id) {
      return res.status(400).json({
        success: false,
        message: "level_id and set_id are required",
      });
    }

    console.log("first", createdBy,
      student_category,
      level_id,
      set_id,
      paper_type)

    const paper = await ExamPaperService.getExamPaper(
      createdBy,
      level_id,
      set_id,
      student_category,
      paper_type
    );

    res.json({
      success: true,
      data: paper,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};