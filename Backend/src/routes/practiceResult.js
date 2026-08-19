const router = require("express").Router();

const PracticeResultController = require("../controllers/PracticeResultController");
const verifyJwt = require("../middlewares/verifyJwt");

router.post("/start", verifyJwt, PracticeResultController.startPracticeExam);
router.post("/save-answer", verifyJwt, PracticeResultController.saveAnswer);
router.post("/submit", verifyJwt, PracticeResultController.submitPracticeExam);
module.exports = router;
