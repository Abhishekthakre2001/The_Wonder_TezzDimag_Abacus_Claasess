const router = require("express").Router();

const controller = require("../controllers/SetController");
const verifyJwt = require("../middlewares/verifyJwt");

// Get sets belonging to the authenticated user
router.get("/admin", verifyJwt, controller.getByAdmin);

// Get sets available to the authenticated student
router.get("/student/sets", verifyJwt, controller.getStudentSets);

// Get all sets
router.get("/", verifyJwt, controller.getAll);

// Create a set
router.post("/", verifyJwt, controller.create);

// Get a single set
router.get("/:id", verifyJwt, controller.getById);

// Update a set
router.put("/:id", verifyJwt, controller.update);

// Delete a set
router.delete("/:id", verifyJwt, controller.remove);

module.exports = router;