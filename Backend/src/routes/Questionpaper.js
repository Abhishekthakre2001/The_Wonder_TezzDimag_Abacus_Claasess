const express = require("express");
const router = express.Router();

const controller = require("../controllers/QuestionPaperController");
const verifyJwt = require("../middlewares/verifyJwt");
const allowedRoles = require("../middlewares/allowedRoles");

router.use(verifyJwt);
router.use(allowedRoles("admin"));

// Import Question Paper with Questions
router.post("/import", controller.importQuestions);
// add question to existung papaer
router.post("/:paperId/question", controller.addnewQ);

// Get all question papers (only logged-in user data)
router.get("/", controller.getQuestionPapers);

// Get active question papers by filters
router.get("/filter", controller.getFilteredQuestionPapers);

// Get questions of a paper
router.get("/:id/questions", controller.getQuestionsByPaper);

// Update question paper
router.put("/:id", controller.updateQuestionPaper);

// Delete question paper
router.delete("/:id", controller.deleteQuestionPaper);

// Delete single question
router.delete("/question/:questionId", controller.deleteQuestion);

// Update single question
router.put("/question/:questionId", controller.updateQuestion);

router.get("/export", controller.exportQuestionPapers);
router.get("/:id/export", controller.exportQuestionPaper);

module.exports = router;
