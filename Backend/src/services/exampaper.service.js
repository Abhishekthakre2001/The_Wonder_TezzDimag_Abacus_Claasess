const ExamPaperModel = require("../models/exampaper.model");

exports.getExamPaper = async (createdBy, levelId, setId) => {
  return await ExamPaperModel.getExamPaper(
    createdBy,
    levelId,
    setId
  );
};