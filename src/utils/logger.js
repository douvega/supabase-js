// logger.js
/**
 * Simple logger utility
 */
const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};

module.exports = logger;
