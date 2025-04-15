// router.js
const url = require('url');
const { handleHttpError } = require('../utils/error-handler');
const logger = require('../utils/logger');
const { parseRequestBody } = require('./request-parser');

// Import controllers
const dataController = require('../controllers/data-controller');
const viewController = require('../controllers/view-controller');
const authController = require('../controllers/auth-controller');

/**
 * Main request handler/router
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
async function handleRequest(req, res) {
  try {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    // Log the request
    logger.info(`${req.method} ${path}`);
    
    // For POST/PUT requests, parse body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.body = await parseRequestBody(req);
    }
    
    // Route based on path and method
    
    // Auth routes
    if (path === '/api/auth/login' && req.method === 'POST') {
      return authController.login(req, res);
    }
    if (path === '/api/auth/register' && req.method === 'POST') {
      return authController.register(req, res);
    }
    if (path === '/api/auth/logout' && req.method === 'POST') {
      return authController.logout(req, res);
    }
    
    // Generic data routes
    if (path.match(/^\/api\/data\/(\w+)$/) && req.method === 'GET') {
      const tableName = path.split('/')[3];
      return dataController.getAll(req, res, tableName, query);
    }
    if (path.match(/^\/api\/data\/(\w+)$/) && req.method === 'POST') {
      const tableName = path.split('/')[3];
      return dataController.create(req, res, tableName);
    }
    if (path.match(/^\/api\/data\/(\w+)\/(\w+)$/) && req.method === 'GET') {
      const tableName = path.split('/')[3];
      const id = path.split('/')[4];
      return dataController.getById(req, res, tableName, id);
    }
    if (path.match(/^\/api\/data\/(\w+)\/(\w+)$/) && req.method === 'PUT') {
      const tableName = path.split('/')[3];
      const id = path.split('/')[4];
      return dataController.update(req, res, tableName, id);
    }
    if (path.match(/^\/api\/data\/(\w+)\/(\w+)$/) && req.method === 'DELETE') {
      const tableName = path.split('/')[3];
      const id = path.split('/')[4];
      return dataController.delete(req, res, tableName, id);
    }
    
    // View routes
    if (path.match(/^\/api\/view\/(\w+)$/) && req.method === 'GET') {
      const viewId = path.split('/')[3];
      return viewController.executeView(req, res, viewId, query);
    }
    
    // No route matched
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not Found' }));
    
  } catch (error) {
    handleHttpError(res, error, 'Router');
  }
}

module.exports = {
  handleRequest
};
