import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

/**
 * Global Centralized Error Handling Middleware
 * Catches all errors from async handlers, ApiError instances, Mongoose validation,
 * Multer upload errors, and JWT issues, standardizing the response format.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not already an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || "Something went wrong on the server";

    error = new ApiError(
      statusCode,
      message,
      error?.errors || [],
      err.stack
    );
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `User with this ${field} already exists`);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, `Validation Error: ${messages.join(", ")}`);
  }

  // Handle Multer upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new ApiError(400, "File size too large. Please upload a smaller file.");
    } else {
      error = new ApiError(400, `Upload error: ${err.message}`);
    }
  }

  // Build the standardized JSON response
  const response = {
    statusCode: error.statusCode,
    data: null,
    message: error.message,
    success: false,
    errors: error.errors,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
