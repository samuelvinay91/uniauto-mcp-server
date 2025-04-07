/**
 * Model Context Protocol (MCP) Validator
 * 
 * This module provides utilities to validate requests and responses
 * against the Model Context Protocol specification.
 * Also implements direct MCP stdio protocol support for Claude Desktop.
 */

const { logger } = require('./logger');
const isMcpServerStart = process.argv.includes('--mcp-server');

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

/**
 * Handle MCP protocol communication via stdio
 * This function sets up handlers for MCP protocol when in MCP server mode
 */
function setupMcpStdioProtocol() {
  if (!isMcpServerStart) {
    return; // Only set up MCP stdio protocol in MCP server mode
  }
  
  // Handle process events for MCP communication
  process.stdin.on('data', async (data) => {
    try {
      const inputStr = data.toString().trim();
      
      // Skip empty messages
      if (!inputStr) return;
      
      // Try to parse the input as JSON
      const request = JSON.parse(inputStr);
      
      // Log to stderr not stdout to avoid interfering with protocol
      process.stderr.write(`[MCP] Received message: ${JSON.stringify(request, null, 2)}\n`);
      
      // Also log to console for visibility when run directly
      if (!process.env.CI) {
        console.log(`[MCP DEBUG] Received message: ${JSON.stringify(request, null, 2)}`);
      }
      
      // Handle the request based on the action
      // For now, just echo back a success response with the same action
      const response = formatMcpResponse(
        request.action || 'unknown', 
        { message: 'Received request', timestamp: new Date().toISOString() },
        request.executionId
      );
      
      // Send response to stdout for MCP protocol
      process.stdout.write(JSON.stringify(response) + '\n');
      
    } catch (error) {
      // Log parse errors to stderr
      process.stderr.write(`[MCP] Error processing message: ${error.message}\n`);
      
      // Also log to console for visibility when run directly
      if (!process.env.CI) {
        console.log(`[MCP ERROR] Error processing message: ${error.message}`);
      }
      
      // Try to send error response if possible
      try {
        const errorResponse = formatMcpErrorResponse(error);
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      } catch (responseError) {
        process.stderr.write(`[MCP] Failed to send error response: ${responseError.message}\n`);
      }
    }
  });
  
  // Handle process exit events
  process.on('SIGINT', () => {
    logger.info('MCP server stopping due to SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    logger.info('MCP server stopping due to SIGTERM');
    process.exit(0);
  });
  
  // Log MCP protocol initialization
  process.stderr.write('[MCP] Stdio protocol handlers initialized\n');
  
  // Also log to console for visibility when run directly
  if (!process.env.CI) {
    console.log('[MCP INFO] Stdio protocol handlers initialized');
  }
}

// Initialize MCP stdio protocol if in MCP server mode
if (isMcpServerStart) {
  setupMcpStdioProtocol();
}

module.exports = {
  validateMcpRequest,
  formatMcpResponse,
  formatMcpErrorResponse,
  setupMcpStdioProtocol
};
