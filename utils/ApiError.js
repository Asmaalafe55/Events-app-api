class ApiError extends Error {
  constructor(statusCode, message, isOperational, stack) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  statusCode;
  isOperational;
}

module.exports = ApiError;
