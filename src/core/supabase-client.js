// supabase-client.js
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabaseInstance = null;

/**
 * Initialize the Supabase client
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} supabaseKey - Supabase API key
 * @returns {Object} Supabase client instance
 */
function initSupabase(supabaseUrl, supabaseKey) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client initialized');
    return supabaseInstance;
  } catch (error) {
    logger.error('Failed to initialize Supabase client', error);
    throw error;
  }
}

/**
 * Get the Supabase client instance
 * @returns {Object} Supabase client instance
 */
function getSupabaseClient() {
  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseInstance;
}

module.exports = {
  initSupabase,
  getSupabaseClient
};
