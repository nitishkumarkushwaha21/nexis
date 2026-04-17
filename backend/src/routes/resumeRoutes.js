const express = require("express");
const multer = require("multer");
const config = require("../config");
const { AppError } = require("../errors");
const { analyzeResume } = require("../controllers/resumeController");

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new AppError("Only PDF, DOC, and DOCX files are supported", 400));
      return;
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post("/analyze", upload.single("resume"), analyzeResume);

module.exports = router;
