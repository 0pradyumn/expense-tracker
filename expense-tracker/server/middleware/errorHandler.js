exports.notFound = (req, res) =>
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({
    message: err.name === "ValidationError"
      ? Object.values(err.errors).map((e) => e.message).join(" ")
      : err.message || "Server error",
  });
};
