// error-handler.js
const logger = require('./logger');

/**
 * Standard error response format
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 * @returns {Object} Formatted error response
 */
function formatError(error, context = '') {
  const errorResponse = {
    error: true,
    message: error.message || 'An unknown error occurred',
    context: context,
    timestamp: new Date().toISOString()
  };
  
  // Add stack trace in development environment only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }
  
  return errorResponse;
}

/**
 * Handle HTTP response errors
 * @param {Object} res - HTTP response object
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 * @param {number} statusCode - HTTP status code
 */
function handleHttpError(res, error, context, statusCode = 500) {
  logger.error(`[${context}] ${error.message}`, error);
  
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(formatError(error, context)));
}

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, context = '') {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  formatError,
  handleHttpError,
  AppError
};
