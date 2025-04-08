/**
 * Configuration Manager
 * 
 * Centralizes access to environment variables and configuration settings
 * to ensure consistent access patterns across the application.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

class ConfigManager {
  constructor() {
    this.config = {
      // Server configuration
      port: process.env.PORT || 3000,
      environment: process.env.NODE_ENV || 'development',
      
      // Database configuration
      mongodbUri: process.env.MONGODB_URI || null,
      
      // Logger configuration
      logLevel: process.env.LOG_LEVEL || 'info',
      logDir: process.env.LOG_DIR || 'logs',
      logFile: process.env.LOG_FILE || 'logs/server.log',
      
      // AI configuration
      claudeApiKey: process.env.CLAUDE_API_KEY || null,
      claudeModel: process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240229',
      
      // Generic AI configuration (OpenAI-compatible)
      aiApiKey: process.env.AI_API_KEY || null,
      aiApiEndpoint: process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
      aiModel: process.env.AI_MODEL || 'gpt-4',
      
      // Playwright configuration
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADLESS === 'true',
      
      // Test generation settings
      testOutputDir: process.env.TEST_OUTPUT_DIR || './generated-tests',
      
      // Feature flags
      enableDesktopIntegration: process.env.ENABLE_DESKTOP_INTEGRATION === 'true',
      
      // MCP manifest
      mcpManifest: null,
    };
    
    // Load MCP manifest
    this.loadMcpManifest();
  }
  
  /**
   * Load the MCP manifest from file
   */
  loadMcpManifest() {
    try {
      const manifestPath = path.join(process.cwd(), 'mcp-manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        this.config.mcpManifest = JSON.parse(manifestContent);
        logger.info('MCP manifest loaded successfully');
      } else {
        logger.warn('MCP manifest file not found');
      }
    } catch (error) {
      logger.error(`Error loading MCP manifest: ${error.message}`);
    }
  }
  
  /**
   * Get a configuration value
   * 
   * @param {string} key - The configuration key to retrieve
   * @param {*} defaultValue - Default value if the key doesn't exist
   * @returns {*} The configuration value
   */
  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }
  
  /**
   * Get the MCP manifest or a specific section of it
   * 
   * @param {string} section - Optional section of the manifest to retrieve
   * @returns {*} The manifest or section
   */
  getMcpManifest(section = null) {
    if (!this.config.mcpManifest) {
      this.loadMcpManifest();
    }
    
    if (!section) {
      return this.config.mcpManifest;
    }
    
    return this.config.mcpManifest && this.config.mcpManifest[section] 
      ? this.config.mcpManifest[section] 
      : null;
  }
  
  /**
   * Check if a feature is enabled
   * 
   * @param {string} feature - The feature to check
   * @returns {boolean} Whether the feature is enabled
   */
  isFeatureEnabled(feature) {
    switch (feature) {
      case 'desktopIntegration':
        return this.config.enableDesktopIntegration;
      // Add other feature flags here
      default:
        return false;
    }
  }
}

// Create a singleton instance
const configManager = new ConfigManager();

module.exports = configManager;