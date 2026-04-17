const OpenAI = require("openai");
const config = require("../config");
const { AppError } = require("../errors");
const { buildCodingEvaluationPrompt } = require("./promptBuilder");
const { analyzeCodingMock } = require("./mockAiService");

const SUPPORTED_LANGUAGES = ["javascript", "python", "java", "cpp"];

const parseJsonFromText = (text) => {
  const rawText = String(text || "").trim();

  if (!rawText) {
    throw new AppError("AI returned empty response", 502);
  }

  const tryParse = (candidate) => {
    try {
      return JSON.parse(candidate);
    } catch (_error) {
      return null;
    }
  };

  const direct = tryParse(rawText);
  if (direct) {
    return direct;
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const fencedParsed = tryParse(fencedMatch[1].trim());
    if (fencedParsed) {
      return fencedParsed;
    }
  }

  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const sliced = rawText.slice(firstBrace, lastBrace + 1);
    const parsed = tryParse(sliced);
    if (parsed) {
      return parsed;
    }
  }

  throw new AppError("AI returned non-JSON response", 502);
};

const asString = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};

const asStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => asString(item).trim())
    .filter(Boolean);
};

const normalizeStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return normalized === "pass" ? "pass" : "fail";
};

const normalizeTestCase = (testCase, index) => ({
  id: index + 1,
  input: asString(testCase?.input, "N/A"),
  expected_output: asString(testCase?.expected_output, "N/A"),
  actual_output: asString(testCase?.actual_output, "N/A"),
  status: normalizeStatus(testCase?.status),
});

const normalizeVerdict = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "correct") {
    return "Correct";
  }
  if (normalized === "partially correct") {
    return "Partially Correct";
  }
  return "Incorrect";
};

const normalizeEvaluation = (rawResult) => {
  const incomingCases = Array.isArray(rawResult?.test_case_results)
    ? rawResult.test_case_results
    : [];

  const normalizedCases = incomingCases.map(normalizeTestCase);

  const passed = normalizedCases.filter((testCase) => testCase.status === "pass").length;
  const totalFromPayload = Number(rawResult?.total_test_cases || 0);
  const total = totalFromPayload > 0 ? totalFromPayload : normalizedCases.length;
  const failed = Math.max(0, total - passed);

  return {
    total_test_cases: total,
    passed_test_cases: passed,
    failed_test_cases: failed,
    test_case_results: normalizedCases,
    errors: {
      syntax_errors: asStringArray(rawResult?.errors?.syntax_errors),
      runtime_errors: asStringArray(rawResult?.errors?.runtime_errors),
      reference_errors: asStringArray(rawResult?.errors?.reference_errors),
      logical_issues: asStringArray(rawResult?.errors?.logical_issues),
    },
    code_quality_feedback: {
      efficiency_analysis: asString(
        rawResult?.code_quality_feedback?.efficiency_analysis,
        "Efficiency details unavailable from evaluator."
      ),
      improvements: asStringArray(rawResult?.code_quality_feedback?.improvements),
      best_practices_suggestions: asStringArray(
        rawResult?.code_quality_feedback?.best_practices_suggestions
      ),
    },
    final_verdict: normalizeVerdict(rawResult?.final_verdict),
  };
};

const getStatusCode = (error) => {
  return (
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.cause?.statusCode ||
    null
  );
};

const getUpstreamMessage = (error) => {
  return (
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    "Unknown upstream error"
  );
};

const callGroqForCodingEvaluation = async ({ question, code, language }) => {
  if (!config.groqApiKey || config.groqApiKey === "dummy_groq_key_replace_me") {
    if (config.useMockWhenUnconfigured) {
      return analyzeCodingMock({ question, code, language });
    }
    throw new AppError("Groq API key is not configured", 500);
  }

  const client = new OpenAI({
    apiKey: config.groqApiKey,
    baseURL: config.groqBaseUrl,
  });

  const prompt = buildCodingEvaluationPrompt({
    question,
    code,
    language,
  });

  try {
    const response = await client.responses.create({
      model: config.groqModel,
      input: prompt,
      temperature: 0,
      max_output_tokens: config.groqMaxOutputTokens,
    });

    const parsed = parseJsonFromText(response.output_text || "");
    return normalizeEvaluation(parsed);
  } catch (error) {
    const statusCode = getStatusCode(error);
    const statusTag = statusCode ? ` (status ${statusCode})` : "";

    if (config.useMockWhenUnconfigured && (statusCode === 401 || statusCode === 429)) {
      return analyzeCodingMock({ question, code, language });
    }

    throw new AppError(
      `AI coding evaluation failed${statusTag}. Please check Groq configuration and try again.`,
      502,
      getUpstreamMessage(error)
    );
  }
};

const evaluateCodingSubmission = async ({ question, code, language }) => {
  if (!code || !String(code).trim()) {
    throw new AppError("Code is required", 400);
  }

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new AppError(
      `Unsupported language. Allowed: ${SUPPORTED_LANGUAGES.join(", ")}`,
      400
    );
  }

  return callGroqForCodingEvaluation({
    question,
    code,
    language,
  });
};

module.exports = {
  SUPPORTED_LANGUAGES,
  evaluateCodingSubmission,
};
