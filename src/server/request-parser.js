// request-parser.js
const { AppError } = require('../utils/error-handler');

/**
 * Parse request body from incoming stream
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object>} Parsed body
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      let data = '';
      
      req.on('data', chunk => {
        data += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve(parsedData);
        } catch (error) {
          reject(new AppError('Invalid JSON in request body', 400, 'Request Parser'));
        }
      });
      
      req.on('error', (error) => {
        reject(new AppError('Error reading request body', 400, 'Request Parser'));
      });
    } 
    else if (contentType.includes('application/x-www-form-urlencoded')) {
      let data = '';
      
      req.on('data', chunk => {
        data += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          // Parse URL encoded form data
          const parsedData = new URLSearchParams(data);
          const formData = {};
          
          for (const [key, value] of parsedData.entries()) {
            // Convert string "true"/"false" to booleans
            if (value.toLowerCase() === 'true') {
              formData[key] = true;
            } else if (value.toLowerCase() === 'false') {
              formData[key] = false;
            } else {
              formData[key] = value;
            }
          }
          
          resolve(formData);
        } catch (error) {
          reject(new AppError('Invalid form data in request body', 400, 'Request Parser'));
        }
      });
      
      req.on('error', (error) => {
        reject(new AppError('Error reading request body', 400, 'Request Parser'));
      });
    } 
    else {
      // For other content types or no content
      resolve({});
    }
  });
}

module.exports = {
  parseRequestBody
};
