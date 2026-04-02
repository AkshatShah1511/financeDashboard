class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Permission denied") {
    super(message, 403);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError
};
