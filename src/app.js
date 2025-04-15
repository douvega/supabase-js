// app.js
const { startServer } = require('./server/http-server');
const { initSupabase } = require('./core/supabase-client');
const logger = require('./utils/logger');

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Initialize Supabase client
    initSupabase(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    // Start the server
    const port = process.env.PORT || 3000;
    startServer(port);
    
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application', error);
    process.exit(1);
  }
}

// Start the application
initApp();
