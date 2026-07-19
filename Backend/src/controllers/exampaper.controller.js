const ExamPaperService = require("../services/exampaper.service");

exports.getExamPaper = async (req, res) => {
  try {
    const createdBy = req.user.createdby;
    const { level_id, set_id } = req.query;

    if (!level_id || !set_id) {
      return res.status(400).json({
        success: false,
        message: "level_id and set_id are required",
      });
    }

    const paper = await ExamPaperService.getExamPaper(
      createdBy,
      level_id,
      set_id
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