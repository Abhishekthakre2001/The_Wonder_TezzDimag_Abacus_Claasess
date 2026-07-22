const QuestionPaperModel = require("../models/QuestionPaper");

module.exports = {
  getFilteredQuestionPapers: (filters) =>
    QuestionPaperModel.getFilteredQuestionPapers(filters),

  addnewQuestions: (data) => QuestionPaperModel.addQuestions(data),
  importQuestions: (data) => QuestionPaperModel.importQuestions(data),

  getQuestionPapers: (userId, page, limit, search) =>
    QuestionPaperModel.getQuestionPapers(userId, page, limit, search),

  getQuestionsByPaper: (paperId, userId, page, limit, search) =>
    QuestionPaperModel.getQuestionsByPaper(
      paperId,
      userId,
      page,
      limit,
      search,
    ),

  updateQuestionPaper: (id, data, userId) =>
    QuestionPaperModel.updateQuestionPaper(id, data, userId),

  deleteQuestionPaper: (id, userId) =>
    QuestionPaperModel.deleteQuestionPaper(id, userId),

  deleteQuestion: (id, userId) => QuestionPaperModel.deleteQuestion(id, userId),

  updateQuestion: (id, data, userId) =>
    QuestionPaperModel.updateQuestion(id, data, userId),

  // export
  exportQuestionPapers: (userId, search, res) =>
    QuestionPaperModel.exportQuestionPapers(userId, search, res),

  exportQuestionPaper: (paperId, userId, search, res) =>
    QuestionPaperModel.exportQuestionPaper(paperId, userId, search, res),
};
