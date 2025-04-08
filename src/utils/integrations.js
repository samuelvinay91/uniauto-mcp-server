/**
 * Integrations Management Module
 * 
 * This module handles protocol adapters and configurations for different
 * integrations with AI assistants and development environments:
 * - Claude (via Claude Web, Claude in VSCode, Claude Desktop)
 * - Cursor
 * - VSCode
 * - Smithery.ai
 * - CLI (command line interface)
 * - Windsurf
 */

const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');
const configManager = require('./config');
const { PROTOCOL_TYPES } = require('./mcp-validator');

// Supported integration types
const INTEGRATION_TYPES = {
  CLAUDE: 'claude',
  CURSOR: 'cursor',
  VSCODE: 'vscode',
  SMITHERY: 'smithery',
  CLI: 'cli',
  WINDSURF: 'windsurf'
};

/**
 * Get protocol adapter configuration for a specific integration
 * 
 * @param {string} integrationType - The integration type
 * @returns {Object} Protocol adapter configuration
 */
function getProtocolAdapter(integrationType) {
  switch (integrationType) {
    case INTEGRATION_TYPES.CLAUDE:
      return {
        type: PROTOCOL_TYPES.JSON_RPC,
        metadata: {
          requiresAuth: false,
          description: 'Claude Desktop and Web integration'
        }
      };
      
    case INTEGRATION_TYPES.CURSOR:
      return {
        type: PROTOCOL_TYPES.MCP,
        metadata: {
          requiresAuth: false,
          description: 'Cursor IDE integration'
        }
      };
      
    case INTEGRATION_TYPES.VSCODE:
      return {
        type: PROTOCOL_TYPES.MCP,
        metadata: {
          requiresAuth: false,
          description: 'Visual Studio Code extension integration'
        }
      };
      
    case INTEGRATION_TYPES.SMITHERY:
      return {
        type: PROTOCOL_TYPES.MCP,
        metadata: {
          requiresAuth: true,
          description: 'Smithery.ai platform integration'
        }
      };
      
    case INTEGRATION_TYPES.CLI:
      return {
        type: PROTOCOL_TYPES.REST_API,
        metadata: {
          requiresAuth: false,
          description: 'Command line interface integration'
        }
      };
      
    case INTEGRATION_TYPES.WINDSURF:
      return {
        type: PROTOCOL_TYPES.MCP,
        metadata: {
          requiresAuth: true,
          description: 'Windsurf integration'
        }
      };
      
    default:
      // Generic REST API adapter
      return {
        type: PROTOCOL_TYPES.REST_API,
        metadata: {
          requiresAuth: false,
          description: 'Generic REST API integration'
        }
      };
  }
}

/**
 * Generate integration configuration based on environment settings
 * 
 * @returns {Object} Integration configuration
 */
function generateIntegrationConfig() {
  // Base configuration
  const baseConfig = {
    server: {
      port: configManager.get('port'),
      host: 'localhost',
      protocol: 'http',
      endpoints: {
        manifest: '/api/mcp/manifest',
        invoke: '/api/mcp/invoke'
      }
    },
    enabledIntegrations: []
  };
  
  // Enable integrations based on environment variables
  if (configManager.isFeatureEnabled('desktopIntegration')) {
    baseConfig.enabledIntegrations.push(INTEGRATION_TYPES.CLAUDE);
  }
  
  // Always enable these integrations
  [
    INTEGRATION_TYPES.CURSOR, 
    INTEGRATION_TYPES.VSCODE, 
    INTEGRATION_TYPES.SMITHERY,
    INTEGRATION_TYPES.CLI,
    INTEGRATION_TYPES.WINDSURF
  ].forEach(type => {
    if (!baseConfig.enabledIntegrations.includes(type)) {
      baseConfig.enabledIntegrations.push(type);
    }
  });
  
  // Add protocol adapters for each enabled integration
  baseConfig.adapters = {};
  baseConfig.enabledIntegrations.forEach(type => {
    baseConfig.adapters[type] = getProtocolAdapter(type);
  });
  
  return baseConfig;
}

/**
 * Write configuration files for each integration type
 * 
 * @param {string} outputDir - Directory to write config files to
 */
function writeIntegrationFiles(outputDir = 'config') {
  const integrationConfig = generateIntegrationConfig();
  const basePath = path.join(process.cwd(), outputDir);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  
  // Smithery YAML config
  const smitheryConfig = {
    startCommand: {
      type: 'stdio',
      configSchema: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            default: 3000,
            description: 'Port on which the server runs'
          },
          claudeApiKey: {
            type: 'string',
            description: 'Claude API Key for AI features'
          },
          claudeModel: {
            type: 'string',
            default: 'claude-3-7-sonnet-20240229',
            description: 'Claude model to use for AI features'
          },
          logLevel: {
            type: 'string',
            default: 'info',
            enum: ['error', 'warn', 'info', 'debug'],
            description: 'Logging level for the server'
          }
        },
        required: ['claudeApiKey']
      },
      commandFunction: `(config) => ({
  "command": "node",
  "args": [
    "src/index.js"
  ],
  "env": {
    "PORT": config.port.toString(),
    "NODE_ENV": "production",
    "CLAUDE_API_KEY": config.claudeApiKey,
    "CLAUDE_MODEL": config.claudeModel,
    "LOG_LEVEL": config.logLevel || "info",
    "LOG_DIR": "logs",
    "ENABLE_DESKTOP_INTEGRATION": "true",
    "HEADLESS": "true",
    "BROWSER": "chromium"
  }
})`
    }
  };
  
  // VSCode extension settings example
  const vscodeConfig = {
    'claude.tools.enabled': true,
    'claude.tools.endpoints': [
      {
        name: 'UniAuto',
        manifestUrl: 'http://localhost:3000/api/mcp/manifest'
      }
    ],
    'claude.smithery.enabled': true,
    'claude.smithery.tools': ['uniauto-mcp-server']
  };
  
  // Cursor settings example
  const cursorConfig = {
    'ai.mcp.enabled': true,
    'ai.mcp.tools': [
      {
        name: 'uniauto-mcp-server',
        url: 'http://localhost:3000/api'
      }
    ]
  };
  
  // Windsurf connection config
  const windsurfConfig = {
    name: 'uniauto-mcp-server',
    manifestUrl: 'http://localhost:3000/api/mcp/manifest',
    authType: 'none'
  };
  
  // CLI config
  const cliConfig = {
    server: {
      url: 'http://localhost:3000/api',
      endpoints: {
        manifest: '/mcp/manifest',
        invoke: '/mcp/invoke'
      }
    }
  };
  
  try {
    // Write Smithery YAML file
    fs.writeFileSync(
      path.join(basePath, 'smithery-example.yaml'),
      JSON.stringify(smitheryConfig, null, 2)
    );
    
    // Write VSCode config example
    fs.writeFileSync(
      path.join(basePath, 'vscode-settings-example.json'),
      JSON.stringify(vscodeConfig, null, 2)
    );
    
    // Write Cursor config example
    fs.writeFileSync(
      path.join(basePath, 'cursor-settings-example.json'),
      JSON.stringify(cursorConfig, null, 2)
    );
    
    // Write Windsurf config example
    fs.writeFileSync(
      path.join(basePath, 'windsurf-config-example.json'),
      JSON.stringify(windsurfConfig, null, 2)
    );
    
    // Write CLI config example
    fs.writeFileSync(
      path.join(basePath, 'cli-config-example.json'),
      JSON.stringify(cliConfig, null, 2)
    );
    
    logger.info('Integration configuration files generated successfully');
  } catch (error) {
    logger.error(`Failed to write integration files: ${error.message}`);
  }
}

/**
 * Detect the client integration type from request headers and content
 * 
 * @param {Object} req - The HTTP request
 * @returns {string} Detected integration type
 */
function detectIntegrationType(req) {
  const userAgent = req.headers['user-agent'] || '';
  
  // Check for Claude Desktop
  if (userAgent.includes('Claude')) {
    return INTEGRATION_TYPES.CLAUDE;
  }
  
  // Check for Cursor
  if (userAgent.includes('Cursor')) {
    return INTEGRATION_TYPES.CURSOR;
  }
  
  // Check for VSCode
  if (userAgent.includes('VSCode') || userAgent.includes('Code-OSS')) {
    return INTEGRATION_TYPES.VSCODE;
  }
  
  // Check for Smithery based on headers
  if (req.headers['x-smithery-client'] || req.headers['smithery-version']) {
    return INTEGRATION_TYPES.SMITHERY;
  }
  
  // Check for CLI based on headers
  if (req.headers['x-client-type'] === 'cli') {
    return INTEGRATION_TYPES.CLI;
  }
  
  // Check for Windsurf based on headers
  if (req.headers['x-windsurf-client']) {
    return INTEGRATION_TYPES.WINDSURF;
  }
  
  // Default to generic REST API
  return 'generic';
}

module.exports = {
  INTEGRATION_TYPES,
  getProtocolAdapter,
  generateIntegrationConfig,
  writeIntegrationFiles,
  detectIntegrationType
};