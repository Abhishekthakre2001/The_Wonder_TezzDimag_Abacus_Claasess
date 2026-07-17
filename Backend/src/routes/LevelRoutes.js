const router = require("express").Router();
const controller = require("../controllers/LevelController");

router.get("/", controller.getAll);
router.post("/", controller.create);
router.get("/admin", controller.getAllByAdmin);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
   