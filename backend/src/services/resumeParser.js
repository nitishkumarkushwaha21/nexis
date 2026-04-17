const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { AppError } = require("../errors");

const cleanText = (input) => {
  if (!input) return "";
  return input
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
};

const parsePdf = async (buffer) => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return cleanText(result?.text || "");
  } finally {
    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }
  }
};

const parseDocx = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return cleanText(result.value);
};

const parseDocFallback = async (buffer) => {
  // Best-effort fallback for old DOC files.
  const text = buffer.toString("utf8");
  return cleanText(text);
};

const parseResume = async (file) => {
  if (!file || !file.buffer) {
    throw new AppError("Resume file is required", 400);
  }

  const mimeType = file.mimetype;

  try {
    if (mimeType === "application/pdf") {
      return parsePdf(file.buffer);
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return parseDocx(file.buffer);
    }

    if (mimeType === "application/msword") {
      return parseDocFallback(file.buffer);
    }
  } catch (error) {
    throw new AppError("Failed to parse the uploaded resume", 422, error.message);
  }

  throw new AppError("Unsupported file format. Use PDF, DOC, or DOCX.", 400);
};

module.exports = {
  parseResume,
};
