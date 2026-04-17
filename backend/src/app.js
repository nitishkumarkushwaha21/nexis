const express = require("express");
const cors = require("cors");
const multer = require("multer");
const config = require("./config");
const { AppError, errorHandler } = require("./errors");
const resumeRoutes = require("./routes/resumeRoutes");
const codingRoutes = require("./routes/codingRoutes");

const app = express();

const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/$/, "").toLowerCase();
const allowedOrigins = new Set((config.corsOrigins || []).map(normalizeOrigin));

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  // Keep preview deployments working when frontend is hosted on Vercel.
  if (normalizedOrigin.endsWith(".vercel.app")) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(`CORS blocked for origin: ${origin}`, 403));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/coding", codingRoutes);

app.use((err, _req, _res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    next(new AppError(`File is too large. Max size is ${config.maxFileSizeMb} MB`, 400));
    return;
  }
  next(err);
});

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

module.exports = app;
