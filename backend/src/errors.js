class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    error: {
      message: err.message || "Unexpected server error",
      details: err.details || null,
    },
  };

  res.status(statusCode).json(payload);
};

module.exports = {
  AppError,
  errorHandler,
};
