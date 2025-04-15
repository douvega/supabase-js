// /src/utils/filter-parser.js
const { AppError } = require('./error-handler');

/**
 * Applies filters to a Supabase query based on a filter object
 * @param {Object} query - Supabase query builder instance
 * @param {Object} filter - Filter object with logic and conditions
 * @returns {Object} Updated query with filters applied
 */
function applyFilter(query, filter) {
  if (!filter) return query;
  
  // Handle leaf node (simple condition)
  if (filter.field && filter.operator) {
    return applyCondition(query, filter);
  }
  
  // Handle group node (logical operator with multiple filters)
  if (filter.logic && filter.filters && Array.isArray(filter.filters)) {
    const { logic, filters } = filter;
    
    // No filters, return original query
    if (filters.length === 0) return query;
    
    // Single filter, no need for logical grouping
    if (filters.length === 1) {
      return applyFilter(query, filters[0]);
    }
    
    // Multiple filters with AND/OR logic
    if (logic.toUpperCase() === 'AND') {
      // For AND, we can chain the filters
      let resultQuery = query;
      for (const subFilter of filters) {
        resultQuery = applyFilter(resultQuery, subFilter);
      }
      return resultQuery;
    } else if (logic.toUpperCase() === 'OR') {
      // For OR in Supabase, we use .or()
      return query.or(
        filters.map(subFilter => {
          // Create a filter string in the format Supabase expects
          if (subFilter.field && subFilter.operator) {
            // Simple condition
            return `${subFilter.field}.${mapOperator(subFilter.operator)}.${formatValue(subFilter.value)}`;
          } else {
            // For nested conditions, we need a more advanced approach
            // This is simplified and would need extension for full support
            const subFilters = subFilter.filters.map(f => 
              `${f.field}.${mapOperator(f.operator)}.${formatValue(f.value)}`
            ).join(',');
            return subFilters;
          }
        }).join(',')
      );
    } else {
      throw new AppError(`Unsupported logic operator: ${logic}`, 400, 'Filter Parser');
    }
  }
  
  // If we get here, the filter structure is invalid
  throw new AppError('Invalid filter structure', 400, 'Filter Parser');
}

/**
 * Apply a single condition to a query
 * @param {Object} query - Supabase query
 * @param {Object} condition - Condition object
 * @returns {Object} Updated query
 */
function applyCondition(query, condition) {
  const { field, operator, value } = condition;
  
  // Convert string "true"/"false" to actual booleans if needed
  let processedValue = value;
  if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
    processedValue = value.toLowerCase() === 'true';
  }
  
  switch (operator.toUpperCase()) {
    case '=':
      return query.eq(field, processedValue);
    case '<>':
    case '!=':
      return query.neq(field, processedValue);
    case '>':
      return query.gt(field, processedValue);
    case '>=':
      return query.gte(field, processedValue);
    case '<':
      return query.lt(field, processedValue);
    case '<=':
      return query.lte(field, processedValue);
    case 'LIKE':
      return query.like(field, processedValue);
    case 'ILIKE':
      return query.ilike(field, processedValue);
    case 'IN':
      return query.in(field, Array.isArray(processedValue) ? processedValue : [processedValue]);
    case 'IS NULL':
      return query.is(field, null);
    case 'IS NOT NULL':
      return query.not(field, 'is', null);
    case 'IS':
      if (processedValue === null) return query.is(field, null);
      throw new AppError(`IS operator only supports null values`, 400, 'Filter Parser');
    case 'IS NOT':
      if (processedValue === null) return query.not(field, 'is', null);
      throw new AppError(`IS NOT operator only supports null values`, 400, 'Filter Parser');
    default:
      throw new AppError(`Unsupported operator: ${operator}`, 400, 'Filter Parser');
  }
}

/**
 * Map operator to Supabase filter string format
 * @param {string} operator - Operator (=, <>, etc)
 * @returns {string} Supabase operator string
 */
function mapOperator(operator) {
  const map = {
    '=': 'eq',
    '<>': 'neq',
    '!=': 'neq',
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    'LIKE': 'like',
    'ILIKE': 'ilike',
    'IN': 'in',
    'IS': 'is',
    'IS NOT': 'not.is',
    'IS NULL': 'is',
    'IS NOT NULL': 'not.is'
  };
  
  return map[operator.toUpperCase()] || operator;
}

/**
 * Format a value for inclusion in a filter string
 * @param {any} value - Value to format
 * @returns {string} Formatted value
 */
function formatValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value.toString();
  if (Array.isArray(value)) return `(${value.map(formatValue).join(',')})`;
  return value.toString();
}

module.exports = {
  applyFilter
};
