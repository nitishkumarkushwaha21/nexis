const express = require("express");
const { getCodingQuestions, runCode, submitCode } = require("../controllers/codingController");

const router = express.Router();

router.get("/questions", getCodingQuestions);
router.get("/problems", getCodingQuestions);
router.post("/run", runCode);
router.post("/submit", submitCode);

module.exports = router;
