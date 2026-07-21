const ExamPaperModel = require("../models/exampaper.model");

exports.getExamPaper = async (createdBy,
  level_id,
  set_id,
  student_category,
  paper_type) => {
  return await ExamPaperModel.getExamPaper(
    createdBy,
    level_id,
    set_id,
    student_category,
    paper_type
  );
};