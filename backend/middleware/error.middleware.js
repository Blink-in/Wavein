export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0];
    message = `${field || "Value"} already exists`;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID provided";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};