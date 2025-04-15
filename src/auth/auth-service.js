// auth-service.js
const { getSupabaseClient } = require('../core/supabase-client');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');

/**
 * Authentication service for Supabase
 */
class AuthService {
  constructor() {
    this.supabase = getSupabaseClient();
  }
  
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication response
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw new AppError(error.message, 401, 'Authentication');
      
      return data;
    } catch (error) {
      logger.error('Sign in failed', error);
      throw error;
    }
  }
  
  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication response
   */
  async signUp(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw new AppError(error.message, 400, 'Authentication');
      
      return data;
    } catch (error) {
      logger.error('Sign up failed', error);
      throw error;
    }
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw new AppError(error.message, 500, 'Authentication');
    } catch (error) {
      logger.error('Sign out failed', error);
      throw error;
    }
  }
  
  /**
   * Get the current user
   * @returns {Promise<Object|null>} Current user or null
   */
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      
      if (error) throw new AppError(error.message, 401, 'Authentication');
      
      return data?.user || null;
    } catch (error) {
      logger.error('Get current user failed', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
