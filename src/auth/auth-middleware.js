// auth-middleware.js
const authService = require('./auth-service');
const { handleHttpError } = require('../utils/error-handler');
const logger = require('../utils/logger');

/**
 * Middleware to check if a user is authenticated
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Function to continue processing
 */
async function requireAuth(req, res, next) {
  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Authentication required' }));
    }
    
    // Check if token is valid by getting the current user
    const user = await authService.getCurrentUser();
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Invalid or expired token' }));
    }
    
    // Add user to request for downstream handlers
    req.user = user;
    
    // Continue to next handler
    if (typeof next === 'function') {
      next();
    }
  } catch (error) {
    logger.error('Authentication check failed', error);
    handleHttpError(res, error, 'Authentication', 401);
  }
}

module.exports = {
  requireAuth
};
