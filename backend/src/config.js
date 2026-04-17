const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseCsv = (value, fallback = []) => {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DEFAULT_PORT = 5000;
const DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const DEFAULT_MAX_FILE_SIZE_MB = 5;
const DEFAULT_MAX_CHARS_FOR_ANALYSIS = 12000;
const DEFAULT_AI_PROVIDER = "openrouter";
const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4.6";
const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_SITE_URL = "http://localhost:5000";
const DEFAULT_OPENROUTER_APP_NAME = "resume-screening-module";
const DEFAULT_OPENROUTER_MAX_OUTPUT_TOKENS = 800;
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MAX_OUTPUT_TOKENS = 2200;

const corsOrigins = parseCsv(process.env.CORS_ORIGIN, DEFAULT_CORS_ORIGINS);
const openRouterMaxOutputTokens = clamp(DEFAULT_OPENROUTER_MAX_OUTPUT_TOKENS, 128, 4096);
const groqMaxOutputTokens = clamp(DEFAULT_GROQ_MAX_OUTPUT_TOKENS, 256, 8192);

module.exports = {
  port: toInt(process.env.PORT, DEFAULT_PORT),
  corsOrigins,
  maxFileSizeMb: DEFAULT_MAX_FILE_SIZE_MB,
  maxCharsForAnalysis: DEFAULT_MAX_CHARS_FOR_ANALYSIS,
  aiProvider: DEFAULT_AI_PROVIDER,
  openRouterApiKey:
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "dummy_openrouter_key_replace_me",
  openRouterModel: DEFAULT_OPENROUTER_MODEL,
  openRouterBaseUrl: DEFAULT_OPENROUTER_BASE_URL,
  openRouterSiteUrl: DEFAULT_OPENROUTER_SITE_URL,
  openRouterAppName: DEFAULT_OPENROUTER_APP_NAME,
  openRouterMaxOutputTokens,
  groqApiKey: process.env.GROQ_API_KEY || "dummy_groq_key_replace_me",
  groqModel: DEFAULT_GROQ_MODEL,
  groqBaseUrl: DEFAULT_GROQ_BASE_URL,
  groqMaxOutputTokens,
  useMockWhenUnconfigured:
    (process.env.USE_MOCK_AI_WHEN_UNCONFIGURED || "true").toLowerCase() === "true",
};
