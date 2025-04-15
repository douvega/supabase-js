// view-engine.js
const { getSupabaseClient } = require('./supabase-client');
const dataRepository = require('./data-repository');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');

/**
 * Engine for processing and executing custom view definitions
 */
class ViewEngine {
  constructor() {
    this.supabase = getSupabaseClient();
  }
  
  /**
   * Get view definition from the database
   * @param {string} viewId - ID of the view
   * @returns {Promise<Object>} View definition
   */
  async getViewDefinition(viewId) {
    try {
      const { data, count } = await dataRepository.select(
        'view_definitions', 
        '*', 
        { id: viewId }
      );
      
      if (!data || data.length === 0) {
        throw new AppError(`View definition not found: ${viewId}`, 404, 'View Engine');
      }
      
      return data[0];
    } catch (error) {
      logger.error(`Error fetching view definition: ${viewId}`, error);
      throw error;
    }
  }
  
  /**
   * Execute a view definition with filters
   * @param {Object} viewDefinition - View definition from database
   * @param {Object} filters - Filters to apply
   * @param {Object} options - Additional options (pagination, sorting)
   * @returns {Promise<Object>} Query results
   */
  async executeView(viewDefinition, filters = {}, options = {}) {
    try {
      const joinDefinition = viewDefinition.join_definition;
      
      // Start with the base table
      let query = this.supabase.from(joinDefinition[0].from.table).select();
      
      // Apply joins
      for (const join of joinDefinition) {
        const joinTable = join.to.table;
        const fromField = join.from.field;
        const toField = join.to.field;
        
        // Build the join condition
        const joinCondition = `${join.from.table}.${fromField}=${joinTable}.${toField}`;
        
        // Add the join based on join type
        switch (join.joinType.toLowerCase()) {
          case 'left':
            query = query.select(`*, ${joinTable}(*)`).on(joinCondition);
            break;
          case 'right':
            // Note: Supabase doesn't directly support right joins
            // This would need custom implementation
            throw new AppError('Right joins not supported yet', 400, 'View Engine');
          case 'inner':
            query = query.select(`*, ${joinTable}!inner(*)`).on(joinCondition);
            break;
          default:
            throw new AppError(`Unknown join type: ${join.joinType}`, 400, 'View Engine');
        }
      }
      
      // Apply filters from request (only allowed ones)
      const allowedFilters = viewDefinition.allowed_filters || [];
      Object.entries(filters).forEach(([key, value]) => {
        if (allowedFilters.includes(key) && value !== undefined && value !== null) {
          // Apply filter, determining which table it belongs to
          // This is simplified and would need more complex logic in real implementation
          query = query.eq(key, value);
        }
      });
      
      // Apply pagination
      if (options.page && options.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }
      
      // Apply sorting
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.ascending !== false 
        });
      }
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw new AppError(error.message, 400, 'View Engine');
      
      return { data, count };
    } catch (error) {
      logger.error('Error executing view', error);
      throw error;
    }
  }
  
  /**
   * Run a view with filters
   * @param {string} viewId - ID of the view
   * @param {Object} filters - Filters to apply
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Query results
   */
  async runView(viewId, filters = {}, options = {}) {
    try {
      // Get view definition
      const viewDefinition = await this.getViewDefinition(viewId);
      
      // Check permissions (simplified)
      if (!viewDefinition.is_public) {
        // In a real app, would check user permissions here
        logger.warn(`User accessing non-public view: ${viewId}`);
      }
      
      // Execute the view
      return await this.executeView(viewDefinition, filters, options);
    } catch (error) {
      logger.error(`Error running view: ${viewId}`, error);
      throw error;
    }
  }
}

module.exports = new ViewEngine();
