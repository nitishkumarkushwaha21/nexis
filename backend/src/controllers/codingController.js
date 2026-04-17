const { AppError } = require("../errors");
const { getPublicQuestions, getQuestionById } = require("../data/codingQuestions");
const { evaluateCodingSubmission, SUPPORTED_LANGUAGES } = require("../services/codingAiService");
const { evaluateSubmission } = require("../services/codeEvaluator");

const getCodingQuestions = (_req, res) => {
  res.json({ data: getPublicQuestions() });
};

const SAMPLE_RUN_CASES = 2;

const evaluateCode = async ({ mode, body }) => {
  const { problemId, code, language } = body || {};

  if (!problemId) {
    throw new AppError("problemId is required", 400);
  }

  const normalizedLanguage = String(language || "").trim().toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
    throw new AppError(
      `Unsupported language. Allowed: ${SUPPORTED_LANGUAGES.join(", ")}`,
      400
    );
  }

  const question = getQuestionById(problemId);
  if (!question) {
    throw new AppError("Coding problem not found", 404);
  }

  const baseQuestion = {
    ...question,
    testCases:
      mode === "run"
        ? question.testCases.slice(0, Math.min(SAMPLE_RUN_CASES, question.testCases.length))
        : question.testCases,
  };

  const result =
    normalizedLanguage === "javascript"
      ? evaluateSubmission({
          code,
          question: baseQuestion,
          mode,
        })
      : await evaluateCodingSubmission({
          code,
          question: baseQuestion,
          language: normalizedLanguage,
        });

  return {
    problemId,
    language: normalizedLanguage,
    result: {
      ...result,
      evaluation_mode: mode,
    },
  };
};

const submitCode = async (req, res, next) => {
  try {
    const data = await evaluateCode({ mode: "submit", body: req.body });
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const runCode = async (req, res, next) => {
  try {
    const data = await evaluateCode({ mode: "run", body: req.body });
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCodingQuestions,
  runCode,
  submitCode,
};
