const PracticeResultService = require("../services/PracticeResultService");

module.exports = {
  startPracticeExam: async (req, res) => {
    try {
      const result = await PracticeResultService.startPracticeExam(
        req.user,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Practice exam started successfully.",
        data: result,
      });
    } catch (error) {
      console.error("Start Practice Exam Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Something went wrong.",
      });
    }
  },
  saveAnswer: async (req, res) => {
    try {
      const result = await PracticeResultService.saveAnswer(req.user, req.body);

      return res.status(200).json({
        success: true,
        message: "Answer saved successfully.",
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  submitPracticeExam: async (req, res) => {
    try {
      const result = await PracticeResultService.submitPracticeExam(
        req.user,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Practice exam submitted successfully.",
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
