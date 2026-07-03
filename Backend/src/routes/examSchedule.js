const router = require("express").Router();

const controller = require("../controllers/examSchedule.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.post("/", verifyToken, controller.createExam);

router.get("/", verifyToken, controller.getAllExam);

router.get("/export", verifyToken, controller.exportExam);

router.get("/:id", verifyToken, controller.getExam);

router.put("/:id", verifyToken, controller.updateExam);

router.delete("/:id", verifyToken, controller.deleteExam);

module.exports = router;