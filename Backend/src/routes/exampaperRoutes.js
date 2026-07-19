const router = require("express").Router();
const controller = require("../controllers/exampaper.controller");
const verifyJwt = require("../middlewares/verifyJwt");

router.get("/", verifyJwt, controller.getExamPaper);

module.exports = router;