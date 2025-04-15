// data-repository.js
const { getSupabaseClient } = require('./supabase-client');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');
const { applyFilter } = require('../utils/filter-parser');

/**
 * Generic data repository for Supabase tables
 */
class DataRepository {
  constructor() {
    this.supabase = getSupabaseClient();
  }
  
  /**
   * Select data from a table
   * @param {string} tableName - Name of the table
   * @param {string|Array} columns - Columns to select
   * @param {Object} filters - Query filters to apply
   * @param {Object} options - Additional options (pagination, sorting)
   * @returns {Promise<Object>} Query results
   */
  async select(tableName, columns = '*', filters = {}, options = {}) {
    try {
      // Start query
      let query = this.supabase.from(tableName).select(columns);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      // Apply pagination
      if (options.page && options.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.ascending !== false 
        });
      }
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400, 'Database');
      
      return { data, count };
    } catch (error) {
      logger.error(`Error selecting from ${tableName}`, error);
      throw error;
    }
  }
  
  /**
   * Select data with complex filtering
   * @param {string} tableName - Table name
   * @param {string|Array} columns - Columns to select
   * @param {Object} filterObject - Complex filter object
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Query results
   */
  async selectWithFilter(tableName, columns = '*', filterObject = null, options = {}) {
    try {
      // Start query
      let query = this.supabase.from(tableName).select(columns);
      
      // Apply complex filter if provided
      if (filterObject) {
        query = applyFilter(query, filterObject);
      }
      
      // Apply pagination
      if (options.page && options.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.ascending !== false 
        });
      }
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400, 'Database');
      
      return { data, count };
    } catch (error) {
      logger.error(`Error selecting from ${tableName} with complex filter`, error);
      throw error;
    }
  }
  
  /**
   * Insert data into a table
   * @param {string} tableName - Name of the table
   * @param {Object|Array} data - Data to insert
   * @returns {Promise<Object>} Inserted data
   */
  async insert(tableName, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(tableName)
        .insert(data)
        .select();
      
      if (error) throw new AppError(error.message, 400, 'Database');
      
      return result;
    } catch (error) {
      logger.error(`Error inserting into ${tableName}`, error);
      throw error;
    }
  }
  
  /**
   * Update data in a table
   * @param {string} tableName - Name of the table
   * @param {Object} data - Data to update
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} Updated data
   */
  async update(tableName, data, filters) {
    try {
      let query = this.supabase.from(tableName).update(data);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const { data: result, error } = await query.select();
      
      if (error) throw new AppError(error.message, 400, 'Database');
      
      return result;
    } catch (error) {
      logger.error(`Error updating ${tableName}`, error);
      throw error;
    }
  }
  
  /**
   * Delete data from a table
   * @param {string} tableName - Name of the table
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} Deleted data
   */
  async delete(tableName, filters) {
    try {
      let query = this.supabase.from(tableName).delete();
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query.select();
      
      if (error) throw new AppError(error.message, 400, 'Database');
      
      return data;
    } catch (error) {
      logger.error(`Error deleting from ${tableName}`, error);
      throw error;
    }
  }
}

module.exports = new DataRepository();
