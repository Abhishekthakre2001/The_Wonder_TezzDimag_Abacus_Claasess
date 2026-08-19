const router = require("express").Router();

const controller = require("../controllers/LevelController");
const verifyJwt = require("../middlewares/verifyJwt");

router.get("/", verifyJwt, controller.getAll);
router.get("/admin", verifyJwt, controller.getAllByAdmin);
router.get("/:id", verifyJwt, controller.getById);

router.post("/save", verifyJwt, controller.create);

router.put("/:id", verifyJwt, controller.update);
router.delete("/:id", verifyJwt, controller.remove);

module.exports = router;