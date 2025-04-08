/**
 * Error Handler Utility
 * 
 * Provides standardized error handling across the application.
 * It defines error types, formatting, and response structures.
 */

const { logger } = require('./logger');

/**
 * Base error class for application errors
 */
class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input
 */
class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Not found error
 */
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Authentication error
 */
class AuthError extends AppError {
  constructor(message) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error
 */
class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * External service error (e.g., database, API)
 */
class ServiceError extends AppError {
  constructor(message, service) {
    super(message, 502, 'SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * Format error for HTTP response
 * 
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error) {
  // For our custom errors, use their properties
  if (error instanceof AppError) {
    const response = {
      error: error.name,
      code: error.code,
      message: error.message,
      status: error.status
    };
    
    // Add detail field for validation errors
    if (error instanceof ValidationError && error.details) {
      response.details = error.details;
    }
    
    // Add service field for service errors
    if (error instanceof ServiceError && error.service) {
      response.service = error.service;
    }
    
    return response;
  }
  
  // For other errors, create a generic response
  return {
    error: 'InternalError',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
    status: 500
  };
}

/**
 * HTTP error handler middleware for Express
 */
function errorMiddleware(err, req, res, next) {
  // Log the error
  logger.error(`${err.name || 'Error'}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Format the error response
  const errorResponse = formatErrorResponse(err);
  
  // Send the response
  res.status(errorResponse.status || 500).json(errorResponse);
}

/**
 * Wrap async route handlers to catch errors automatically
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Middleware function that catches errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AuthError,
  ForbiddenError,
  ServiceError,
  formatErrorResponse,
  errorMiddleware,
  asyncHandler
};