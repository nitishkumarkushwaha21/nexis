const config = require("../config");
const { AppError } = require("../errors");
const { parseResume } = require("../services/resumeParser");
const { analyzeResumeWithAi } = require("../services/aiService");

const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Please upload a resume file", 400);
    }

    const parsedText = await parseResume(req.file);
    const normalizedText = parsedText.slice(0, config.maxCharsForAnalysis);

    if (!normalizedText.trim()) {
      throw new AppError("Resume is empty or unreadable", 422);
    }

    const toNumberOrNull = (value) => {
      if (value === undefined || value === null || value === "") return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const jobRole = req.body.jobRole ? String(req.body.jobRole).trim() : "";
    const candidateProfile = {
      relevantExperienceYears: toNumberOrNull(req.body.relevantExperienceYears),
      relevantExperienceMonths: toNumberOrNull(req.body.relevantExperienceMonths),
    };
    const analysis = await analyzeResumeWithAi({
      resumeText: normalizedText,
      jobRole,
      candidateProfile,
    });

    res.json({
      data: analysis,
      meta: {
        truncated: parsedText.length > normalizedText.length,
        charCount: normalizedText.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
};
