/**
 * Model Context Protocol (MCP) Validator and Protocol Adapter
 * 
 * This module provides utilities to validate requests and responses
 * against the Model Context Protocol specification and adapt to
 * different client protocols like JSON-RPC 2.0.
 * 
 * Support for multiple client types:
 * - Claude Desktop (JSON-RPC 2.0)
 * - VSCode Extension (MCP)
 * - Cursor (MCP or JSON-RPC)
 * - Smithery.ai (MCP)
 * - Custom clients (MCP)
 */

const { logger } = require('./logger');

/**
 * Client protocol types
 */
const PROTOCOL_TYPES = {
  MCP: 'mcp',        // Standard Model Context Protocol
  JSON_RPC: 'jsonrpc', // JSON-RPC 2.0 (Claude Desktop)
  REST_API: 'rest'    // Direct REST API calls
};

/**
 * Detects the protocol type from the request
 * 
 * @param {Object} req - The request object
 * @returns {String} The detected protocol type
 */
function detectProtocolType(req) {
  // First try to detect based on the headers and user agent
  // This requires the integrations module, but avoid circular dependencies
  // by not importing at the top level
  try {
    // Dynamically require to avoid circular dependency
    const { detectIntegrationType, INTEGRATION_TYPES, getProtocolAdapter } = require('./integrations');
    
    // Get the integration type
    const integrationType = detectIntegrationType(req);
    
    // Get the protocol adapter for that integration
    const adapter = getProtocolAdapter(integrationType);
    
    // Return the protocol type from the adapter
    if (adapter && adapter.type) {
      return adapter.type;
    }
  } catch (error) {
    // If there's an error or the integrations module isn't available yet,
    // fall back to the standard detection logic
  }
  
  // Standard detection logic
  
  // Check for JSON-RPC 2.0
  if (req.body && req.body.jsonrpc === '2.0' && req.body.method) {
    return PROTOCOL_TYPES.JSON_RPC;
  }
  
  // Check for standard MCP
  if (req.body && (req.body.action || req.body.command)) {
    return PROTOCOL_TYPES.MCP;
  }
  
  // Default to REST API
  return PROTOCOL_TYPES.REST_API;
}

/**
 * Validates an incoming MCP request
 * 
 * @param {Object} req - The request object
 * @returns {Object} Validation result with isValid and error properties
 */
function validateMcpRequest(req) {
  // Detect protocol type first
  const protocolType = detectProtocolType(req);
  
  // Handle JSON-RPC 2.0 validation
  if (protocolType === PROTOCOL_TYPES.JSON_RPC) {
    const { jsonrpc, method, id } = req.body;
    
    if (jsonrpc !== '2.0') {
      return {
        isValid: false,
        error: 'Invalid JSON-RPC version, must be 2.0',
        protocolType
      };
    }
    
    if (!method || typeof method !== 'string') {
      return {
        isValid: false, 
        error: 'Method is required for JSON-RPC and must be a string',
        protocolType
      };
    }
    
    // id can be null for notifications, but if provided must be string, number, or null
    if (id !== undefined && id !== null && typeof id !== 'string' && typeof id !== 'number') {
      return {
        isValid: false,
        error: 'Invalid JSON-RPC ID format',
        protocolType
      };
    }
    
    return {
      isValid: true,
      protocolType
    };
  }
  
  // Handle standard MCP validation
  if (protocolType === PROTOCOL_TYPES.MCP) {
    const { action, parameters, executionId } = req.body;
    
    if (!action) {
      return {
        isValid: false,
        error: 'Action is required by Model Context Protocol',
        protocolType
      };
    }
    
    // Validate executionId if provided (should be a string)
    if (executionId !== undefined && typeof executionId !== 'string') {
      return {
        isValid: false,
        error: 'ExecutionId must be a string according to Model Context Protocol',
        protocolType
      };
    }
    
    // Validate parameters (should be an object if provided)
    if (parameters !== undefined && typeof parameters !== 'object') {
      return {
        isValid: false,
        error: 'Parameters must be an object according to Model Context Protocol',
        protocolType
      };
    }
    
    return { 
      isValid: true, 
      protocolType 
    };
  }
  
  // REST API validation is simplest
  return {
    isValid: true,
    protocolType: PROTOCOL_TYPES.REST_API
  };
}

/**
 * Normalizes a request from any protocol into a standard internal format
 * 
 * @param {Object} req - The request object
 * @param {String} protocolType - The protocol type (from detectProtocolType)
 * @returns {Object} Normalized request with action, parameters, and metadata
 */
function normalizeRequest(req, protocolType) {
  // Default metadata to track the original protocol
  const metadata = {
    sourceProtocol: protocolType,
    timestamp: new Date().toISOString()
  };
  
  // Handle JSON-RPC normalization
  if (protocolType === PROTOCOL_TYPES.JSON_RPC) {
    const { method, params, id } = req.body;
    
    // Special handling for initialize and getManifest methods
    if (method === 'initialize') {
      return {
        action: 'initialize',
        parameters: params || {},
        metadata: {
          ...metadata,
          clientInfo: params?.clientInfo || {},
          protocolVersion: params?.protocolVersion,
          jsonRpcId: id
        }
      };
    }
    
    if (method === 'getManifest') {
      return {
        action: 'getManifest',
        parameters: {},
        metadata: {
          ...metadata,
          jsonRpcId: id
        }
      };
    }
    
    // For execute method, the action is in the params
    if (method === 'execute') {
      return {
        action: params?.action,
        parameters: params?.parameters || {},
        metadata: {
          ...metadata,
          jsonRpcId: id
        }
      };
    }
    
    // For other JSON-RPC methods, convert method to action
    return {
      action: method,
      parameters: params || {},
      metadata: {
        ...metadata,
        jsonRpcId: id
      }
    };
  }
  
  // Handle standard MCP normalization
  if (protocolType === PROTOCOL_TYPES.MCP) {
    return {
      action: req.body.action,
      parameters: req.body.parameters || {},
      metadata: {
        ...metadata,
        executionId: req.body.executionId
      }
    };
  }
  
  // REST API normalization (direct mapping)
  return {
    action: req.body.command || req.body.action,
    parameters: req.body.params || req.body.parameters || {},
    metadata
  };
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

/**
 * Formats a JSON-RPC 2.0 response
 * 
 * @param {number|string} id - The request ID
 * @param {Object} result - The result object
 * @returns {Object} JSON-RPC formatted response
 */
function formatJsonRpcResponse(id, result) {
  return {
    jsonrpc: '2.0',
    id,
    result
  };
}

/**
 * Formats a JSON-RPC 2.0 error response
 * 
 * @param {number|string} id - The request ID
 * @param {number} code - The error code
 * @param {string} message - The error message
 * @param {Object} [data] - Optional error data
 * @returns {Object} JSON-RPC formatted error response
 */
function formatJsonRpcErrorResponse(id, code, message, data) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      data
    }
  };
}

/**
 * Formats a response based on the original protocol type
 * 
 * @param {Object} normalizedRequest - The normalized request object
 * @param {Object} result - The result data to return
 * @param {Error} [error] - Optional error if the operation failed
 * @returns {Object} Response formatted according to the source protocol
 */
function formatResponse(normalizedRequest, result, error = null) {
  const { action, metadata } = normalizedRequest;
  const { sourceProtocol } = metadata;
  
  // If there's an error, handle error responses
  if (error) {
    // JSON-RPC error response
    if (sourceProtocol === PROTOCOL_TYPES.JSON_RPC) {
      return formatJsonRpcErrorResponse(
        metadata.jsonRpcId,
        -32000,  // Server error code
        error.message,
        { action, details: error.stack }
      );
    }
    
    // MCP error response
    if (sourceProtocol === PROTOCOL_TYPES.MCP) {
      return formatMcpErrorResponse(error, metadata.executionId);
    }
    
    // REST API error response
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
  
  // Success responses
  
  // JSON-RPC success response
  if (sourceProtocol === PROTOCOL_TYPES.JSON_RPC) {
    // Special case for initialize
    if (action === 'initialize') {
      return formatJsonRpcResponse(metadata.jsonRpcId, {
        serverInfo: {
          name: 'UniAuto',
          version: '1.0.0'
        },
        capabilities: {
          methods: [
            'initialize',
            'getManifest',
            'navigate',
            'click',
            'type',
            'extract',
            'screenshot',
            'execute'
          ]
        }
      });
    }
    
    return formatJsonRpcResponse(metadata.jsonRpcId, result);
  }
  
  // MCP success response
  if (sourceProtocol === PROTOCOL_TYPES.MCP) {
    return formatMcpResponse(action, result, metadata.executionId);
  }
  
  // REST API success response
  return {
    success: true,
    action,
    result,
    timestamp: new Date().toISOString()
  };
}

// JSON-RPC 2.0 Error codes
const JSON_RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};

module.exports = {
  validateMcpRequest,
  formatMcpResponse,
  formatMcpErrorResponse,
  formatJsonRpcResponse,
  formatJsonRpcErrorResponse,
  JSON_RPC_ERRORS,
  PROTOCOL_TYPES,
  detectProtocolType,
  normalizeRequest,
  formatResponse
};