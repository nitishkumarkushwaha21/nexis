const OpenAI = require("openai");
const config = require("../config");
const { AppError } = require("../errors");
const { buildAnalysisPrompt } = require("./promptBuilder");
const { analyzeResumeMock } = require("./mockAiService");

const SCORE_SECTIONS = [
  { id: "profileClarity", title: "Profile Clarity" },
  { id: "contactQuality", title: "Contact Information" },
  { id: "skillsCoverage", title: "Skills Coverage" },
  { id: "experienceDepth", title: "Experience Depth" },
  { id: "projectImpact", title: "Project Impact" },
  { id: "educationRelevance", title: "Education Relevance" },
  { id: "achievementsLeadership", title: "Achievements and Leadership" },
  { id: "roleAlignment", title: "Role Alignment" },
  { id: "resumeStructure", title: "Resume Structure and Clarity" },
  { id: "atsReadiness", title: "ATS Readiness" },
];

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

  const extractTopLevelJson = (input) => {
    let depth = 0;
    let startIndex = -1;
    let inString = false;
    let escaped = false;

    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === '"') {
          inString = false;
        }

        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        if (depth === 0) {
          startIndex = index;
        }
        depth += 1;
        continue;
      }

      if (char === "}") {
        if (depth === 0) {
          continue;
        }

        depth -= 1;

        if (depth === 0 && startIndex >= 0) {
          const candidate = input.slice(startIndex, index + 1);
          const parsed = tryParse(candidate);
          if (parsed) {
            return parsed;
          }
        }
      }
    }

    return null;
  };

  const extracted = extractTopLevelJson(rawText);
  if (extracted) {
    return extracted;
  }

  try {
    return JSON.parse(rawText);
  } catch (_error) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(rawText.slice(start, end + 1));
    }
    throw new AppError("AI returned non-JSON response", 502);
  }
};

const normalizeScorecard = (rawScorecard) => {
  const sectionMap = new Map();
  const incomingSections = Array.isArray(rawScorecard?.sections)
    ? rawScorecard.sections
    : [];

  for (const section of incomingSections) {
    const sectionId = String(section?.id || "").trim();
    if (sectionId) {
      sectionMap.set(sectionId, section);
    }
  }

  const sections = SCORE_SECTIONS.map((expected) => {
    const found = sectionMap.get(expected.id) || {};
    const parsedScore = Number(found.score);
    const score = Number.isFinite(parsedScore)
      ? Math.max(0, Math.min(10, Math.round(parsedScore)))
      : 0;

    return {
      id: expected.id,
      title: String(found.title || expected.title),
      score,
      maxScore: 10,
      feedback: String(found.feedback || "No specific feedback provided."),
    };
  });

  const totalScore = sections.reduce((sum, section) => sum + section.score, 0);

  return {
    sections,
    totalScore,
    maxScore: 100,
    grade: String(rawScorecard?.grade || "Unrated"),
    overallFeedback: String(
      rawScorecard?.overallFeedback || "Overall feedback is unavailable."
    ),
  };
};

const normalize = (raw, jobRole) => {
  const list = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

  let roleMatch = null;
  if (jobRole && raw && raw.roleMatch) {
    roleMatch = {
      role: String(raw.roleMatch.role || jobRole),
      score: Number.isFinite(Number(raw.roleMatch.score))
        ? Math.max(0, Math.min(100, Number(raw.roleMatch.score)))
        : 0,
      rationale: String(raw.roleMatch.rationale || "No rationale provided"),
    };
  }

  return {
    summary: String(raw?.summary || "No summary available"),
    skills: list(raw?.skills),
    experience: list(raw?.experience),
    education: list(raw?.education),
    projects: list(raw?.projects),
    strengths: list(raw?.strengths),
    weaknesses: list(raw?.weaknesses),
    suggestedRoles: list(raw?.suggestedRoles),
    roleMatch,
    scorecard: normalizeScorecard(raw?.scorecard),
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

const callOpenRouter = async ({ resumeText, jobRole, candidateProfile }) => {
  if (
    !config.openRouterApiKey ||
    config.openRouterApiKey === "dummy_openrouter_key_replace_me"
  ) {
    if (config.useMockWhenUnconfigured) {
      return analyzeResumeMock({ resumeText, jobRole, candidateProfile });
    }
    throw new AppError("OpenRouter API key is not configured", 500);
  }

  const client = new OpenAI({
    apiKey: config.openRouterApiKey,
    baseURL: config.openRouterBaseUrl,
    defaultHeaders: {
      "HTTP-Referer": config.openRouterSiteUrl,
      "X-Title": config.openRouterAppName,
    },
  });

  const prompt = buildAnalysisPrompt({ resumeText, jobRole, candidateProfile });

  try {
    const response = await client.responses.create({
      model: config.openRouterModel,
      input: prompt,
      temperature: 0.1,
      max_output_tokens: config.openRouterMaxOutputTokens,
    });

    const text = response.output_text || "";
    const parsed = parseJsonFromText(text);
    return normalize(parsed, jobRole);
  } catch (error) {
    const statusCode = getStatusCode(error);
    const isNonJsonResponse =
      error instanceof AppError &&
      String(error.message || "").toLowerCase().includes("non-json");

    if ((statusCode === 402 || isNonJsonResponse) && config.useMockWhenUnconfigured) {
      return analyzeResumeMock({ resumeText, jobRole, candidateProfile });
    }

    const upstreamMessage = getUpstreamMessage(error);
    const statusTag = statusCode ? ` (status ${statusCode})` : "";
    throw new AppError(
      `AI analysis failed${statusTag}. Please check API credits/configuration and try again.`,
      502,
      upstreamMessage
    );
  }
};

const analyzeResumeWithAi = async ({ resumeText, jobRole, candidateProfile }) => {
  if (!resumeText || !resumeText.trim()) {
    throw new AppError("Resume text is empty after parsing", 422);
  }

  if (config.aiProvider === "openrouter") {
    return callOpenRouter({ resumeText, jobRole, candidateProfile });
  }

  return analyzeResumeMock({ resumeText, jobRole, candidateProfile });
};

module.exports = {
  analyzeResumeWithAi,
};
