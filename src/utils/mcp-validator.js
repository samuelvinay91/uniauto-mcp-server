/**
 * Model Context Protocol (MCP) Validator
 * 
 * This module provides utilities to validate requests and responses
 * against the Model Context Protocol specification.
 */

const { logger } = require('./logger');

/**
 * Validates an incoming MCP request
 * 
 * @param {Object} req - The request object
 * @returns {Object} Validation result with isValid and error properties
 */
function validateMcpRequest(req) {
  const { action, parameters, executionId } = req.body;
  
  if (!action) {
    return {
      isValid: false,
      error: 'Action is required by Model Context Protocol'
    };
  }
  
  // Validate executionId if provided (should be a string)
  if (executionId !== undefined && typeof executionId !== 'string') {
    return {
      isValid: false,
      error: 'ExecutionId must be a string according to Model Context Protocol'
    };
  }
  
  // Validate parameters (should be an object if provided)
  if (parameters !== undefined && typeof parameters !== 'object') {
    return {
      isValid: false,
      error: 'Parameters must be an object according to Model Context Protocol'
    };
  }
  
  // Request is valid
  return { isValid: true };
}

/**
 * Formats a response according to the Model Context Protocol
 * 
 * @param {string} action - The action that was invoked
 * @param {Object} result - The result of the action
 * @param {string} [executionId] - Optional unique execution ID
 * @returns {Object} MCP-formatted response
 */
function formatMcpResponse(action, result, executionId) {
  return {
    executionId,
    status: 'success',
    action,
    result,
    metadata: {
      protocol: 'mcp',
      protocolName: 'Model Context Protocol',
      version: '1.0',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Formats an error response according to the Model Context Protocol
 * 
 * @param {Error} error - The error that occurred
 * @param {string} [executionId] - Optional unique execution ID
 * @returns {Object} MCP-formatted error response
 */
function formatMcpErrorResponse(error, executionId) {
  return {
    executionId,
    status: 'error',
    error: error.message,
    errorType: error.name || 'ExecutionError',
    metadata: {
      protocol: 'mcp',
      protocolName: 'Model Context Protocol',
      version: '1.0',
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  validateMcpRequest,
  formatMcpResponse,
  formatMcpErrorResponse
};