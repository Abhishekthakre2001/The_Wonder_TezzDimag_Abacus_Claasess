const router = require("express").Router();
const controller = require("../controllers/examSchedule.controller");
const verifyJwt = require("../middlewares/verifyJwt");

router.post("/", verifyJwt, controller.createExamSchedule);


router.get("/", verifyJwt, controller.getExamSchedules);


router.get("/upcoming-live", verifyJwt, controller.getUpcomingAndLiveExams);


router.get("/export", verifyJwt, controller.exportExamSchedules);


router.get("/:id", verifyJwt, controller.getExamScheduleById);


router.put("/:id", verifyJwt, controller.updateExamSchedule);


router.delete("/:id", verifyJwt, controller.deleteExamSchedule);

module.exports = router;
