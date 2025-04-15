// http-server.js
const http = require('http');
const { handleRequest } = require('./router');
const logger = require('../utils/logger');

/**
 * Create and configure HTTP server
 */
function createServer() {
  const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }
    
    // Handle all other requests through router
    handleRequest(req, res);
  });
  
  return server;
}

/**
 * Start the HTTP server
 * @param {number} port - Port to listen on
 * @returns {http.Server} Server instance
 */
function startServer(port = 3000) {
  const server = createServer();
  
  server.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}/`);
  });
  
  server.on('error', (error) => {
    logger.error('Server error', error);
    process.exit(1);
  });
  
  return server;
}

module.exports = {
  createServer,
  startServer
};
