const router = require("express").Router();
const controller = require("../controllers/SetController");
const verifyJwt = require("../middlewares/verifyJwt");


router.get("/", controller.getAll);
router.get("/admin/:id", controller.getbyadminid);
router.get("/student/sets", verifyJwt, controller.getStudentSets);
router.post("/", controller.create);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
