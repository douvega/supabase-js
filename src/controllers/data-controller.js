// data-controller.js
const dataRepository = require('../core/data-repository');
const { handleHttpError } = require('../utils/error-handler');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');

/**
 * Get all records from a table
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} tableName - Table name
 * @param {Object} query - Query parameters
 */
async function getAll(req, res, tableName, query) {
  try {
    // Check if complex filter is provided
    let filter = null;
    if (query.filter) {
      try {
        filter = JSON.parse(query.filter);
      } catch (e) {
        throw new AppError('Invalid filter JSON', 400, 'Data Controller');
      }
    }
    
    let result;
    
    // Use the appropriate repository method based on filter type
    if (filter) {
      // Complex filter
      result = await dataRepository.selectWithFilter(
        tableName,
        '*',
        filter,
        {
          page: query.page,
          pageSize: query.pageSize,
          orderBy: query.orderBy,
          ascending: query.ascending !== 'false'
        }
      );
    } else {
      // Simple filter - convert query params to filters object
      const simpleFilters = { ...query };
      
      // Remove pagination and ordering params from filters
      delete simpleFilters.page;
      delete simpleFilters.pageSize;
      delete simpleFilters.orderBy;
      delete simpleFilters.ascending;
      delete simpleFilters.filter;
      
      result = await dataRepository.select(
        tableName,
        '*',
        simpleFilters,
        {
          page: query.page,
          pageSize: query.pageSize,
          orderBy: query.orderBy,
          ascending: query.ascending !== 'false'
        }
      );
    }
    
    // Send response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (error) {
    handleHttpError(res, error, 'Data Controller');
  }
}

/**
 * Get a record by ID
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} tableName - Table name
 * @param {string} id - Record ID
 */
async function getById(req, res, tableName, id) {
  try {
    const { data, count } = await dataRepository.select(tableName, '*', { id });
    
    if (!data || data.length === 0) {
      throw new AppError(`Record not found in ${tableName} with id ${id}`, 404, 'Data Controller');
    }
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ data: data[0] }));
  } catch (error) {
    handleHttpError(res, error, 'Data Controller');
  }
}

/**
 * Create a new record
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} tableName - Table name
 */
async function create(req, res, tableName) {
  try {
    const data = req.body;
    
    if (!data) {
      throw new AppError('Request body is required', 400, 'Data Controller');
    }
    
    const result = await dataRepository.insert(tableName, data);
    
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ data: result }));
  } catch (error) {
    handleHttpError(res, error, 'Data Controller');
  }
}

/**
 * Update a record
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} tableName - Table name
 * @param {string} id - Record ID
 */
async function update(req, res, tableName, id) {
  try {
    const data = req.body;
    
    if (!data) {
      throw new AppError('Request body is required', 400, 'Data Controller');
    }
    
    const result = await dataRepository.update(tableName, data, { id });
    
    if (!result || result.length === 0) {
      throw new AppError(`Record not found in ${tableName} with id ${id}`, 404, 'Data Controller');
    }
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ data: result[0] }));
  } catch (error) {
    handleHttpError(res, error, 'Data Controller');
  }
}

/**
 * Delete a record
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} tableName - Table name
 * @param {string} id - Record ID
 */
async function deleteRecord(req, res, tableName, id) {
  try {
    const result = await dataRepository.delete(tableName, { id });
    
    if (!result || result.length === 0) {
      throw new AppError(`Record not found in ${tableName} with id ${id}`, 404, 'Data Controller');
    }
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, data: result[0] }));
  } catch (error) {
    handleHttpError(res, error, 'Data Controller');
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteRecord
};
