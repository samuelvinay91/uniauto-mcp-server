const express = require('express');
const { logger } = require('../utils/logger');
// Use mock automation for testing without browser dependencies
const { handleAutomationCommand } = require('../core/mock-automation');
const { createTestCase, getAllTestCases, getTestCaseById, updateTestCase, deleteTestCase } = require('./test-cases');
const { aiProcessing, aiTestGeneration } = require('./ai-processing');
const { 
  validateMcpRequest, 
  formatMcpResponse, 
  formatMcpErrorResponse,
  detectProtocolType,
  normalizeRequest,
  formatResponse,
  PROTOCOL_TYPES,
  JSON_RPC_ERRORS
} = require('../utils/mcp-validator');
const { generateTests, generateFullTestSuite, scaffoldTestProject, TEST_FRAMEWORKS, TEST_STYLES, OUTPUT_FORMATS } = require('../core/test-generator');
const { visualCompare, accessibilityTest, performanceTest, networkTrace, runTestSuite } = require('../core/advanced-testing');
const desktopIntegration = require('../core/desktop-integration');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Automation endpoints
router.post('/execute', async (req, res) => {
  try {
    const { command, params } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    logger.info(`API execute ${command}`);
    const result = await handleAutomationCommand(command, params || {});
    res.json(result);
  } catch (error) {
    logger.error(`Execute error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Test case management endpoints
router.post('/test-cases', createTestCase);
router.get('/test-cases', getAllTestCases);
router.get('/test-cases/:id', getTestCaseById);
router.put('/test-cases/:id', updateTestCase);
router.delete('/test-cases/:id', deleteTestCase);

// AI processing
router.post('/ai/process', aiProcessing);
router.post('/ai/generate-tests', aiTestGeneration);

// Advanced testing endpoints
router.post('/visual-compare', async (req, res) => {
  try {
    const { url, selector, baselineName, updateBaseline, threshold } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Visual comparison request for ${url}`);
    
    const result = await visualCompare({
      url,
      selector,
      baselineName,
      updateBaseline,
      threshold
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Visual comparison error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/accessibility-test', async (req, res) => {
  try {
    const { url, standard } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Accessibility test request for ${url}`);
    
    const result = await accessibilityTest({
      url,
      standard
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Accessibility test error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/performance-test', async (req, res) => {
  try {
    const { url, iterations } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Performance test request for ${url}`);
    
    const result = await performanceTest({
      url,
      iterations
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Performance test error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/network-trace', async (req, res) => {
  try {
    const { url, apiEndpoints } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Network trace request for ${url}`);
    
    const result = await networkTrace({
      url,
      apiEndpoints
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Network trace error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-suite', async (req, res) => {
  try {
    const { url, visual, accessibility, performance, network } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Full test suite request for ${url}`);
    
    const result = await runTestSuite({
      url,
      visual,
      accessibility,
      performance,
      network
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Test suite error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Test generation endpoints
router.post('/generate-tests', async (req, res) => {
  try {
    const { url, framework, style, format, prompt, outputPath, additionalContext } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Test generation request for ${url} using ${framework} with ${style} style`);
    
    const result = await generateTests({
      url,
      framework,
      style,
      format,
      prompt,
      outputPath,
      additionalContext
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Test generation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-full-suite', async (req, res) => {
  try {
    const { url, framework, format, outputDir, additionalContext } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`Full test suite generation request for ${url}`);
    
    const result = await generateFullTestSuite(url, {
      framework,
      format,
      outputDir,
      additionalContext
    });
    
    res.json(result);
  } catch (error) {
    logger.error(`Full test suite generation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post('/scaffold-project', async (req, res) => {
  try {
    const { framework, outputDir } = req.body;
    
    if (!framework) {
      return res.status(400).json({ error: 'Framework is required' });
    }
    
    if (!outputDir) {
      return res.status(400).json({ error: 'Output directory is required' });
    }
    
    logger.info(`Project scaffolding request using ${framework}`);
    
    const result = await scaffoldTestProject(framework, outputDir);
    
    res.json(result);
  } catch (error) {
    logger.error(`Project scaffolding error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.get('/test-frameworks', (req, res) => {
  res.json({
    frameworks: Object.values(TEST_FRAMEWORKS),
    styles: Object.values(TEST_STYLES),
    formats: Object.values(OUTPUT_FORMATS)
  });
});

// Keep alive interval for maintaining connections
let keepAliveInterval = null;

// Unified endpoint for all protocol types
router.post('/mcp/invoke', async (req, res) => {
  try {
    // Get the integration type if available
    let integrationType = 'generic';
    try {
      const { detectIntegrationType } = require('../utils/integrations');
      integrationType = detectIntegrationType(req);
    } catch (error) {
      // If integrations module is not available or there's an error, 
      // continue with default protocol detection
    }
    
    // 1. Detect protocol type
    const protocolType = detectProtocolType(req);
    logger.info(`Request received with protocol: ${protocolType}, integration: ${integrationType}`);
    
    // 2. Validate request
    const validation = validateMcpRequest(req);
    if (!validation.isValid) {
      logger.warn(`Invalid ${protocolType} request: ${validation.error}`);
      
      if (protocolType === PROTOCOL_TYPES.JSON_RPC) {
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: JSON_RPC_ERRORS.INVALID_REQUEST,
            message: validation.error
          }
        });
      } else {
        return res.status(400).json(formatMcpErrorResponse(
          new Error(validation.error),
          req.body.executionId
        ));
      }
    }
    
    // 3. Normalize the request to a standard format
    const normalizedRequest = normalizeRequest(req, protocolType);
    const { action, parameters, metadata } = normalizedRequest;
    
    logger.info(`Processing action: ${action}, protocol: ${protocolType}, integration: ${integrationType}`);
    
    // 4. Special handling for JSON-RPC protocol methods that need direct response
    if (protocolType === PROTOCOL_TYPES.JSON_RPC) {
      if (req.body.method === 'initialize') {
        // Extract client info from params
        const clientName = req.body.params?.clientInfo?.name || 'unknown';
        const clientVersion = req.body.params?.clientInfo?.version || '0.0.0';
        const protocolVersion = req.body.params?.protocolVersion || 'unknown';
        
        logger.info(`Client connected: ${clientName} v${clientVersion} (protocol: ${protocolVersion})`);
        
        // Setup keep-alive mechanism to prevent disconnection
        setupKeepAlive();
        
        // Access config manager if available
        let manifest;
        try {
          const configManager = require('../utils/config');
          manifest = configManager.getMcpManifest();
        } catch (error) {
          // Fallback to file system read if config manager not available
          const manifestPath = path.join(process.cwd(), 'mcp-manifest.json');
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        }
        
        return res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          result: {
            serverInfo: {
              name: manifest.name || 'UniAuto',
              version: manifest.version || '1.0.0'
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
                'execute',
                'desktop_click',
                'desktop_type'
              ]
            }
          }
        });
      }
      
      if (req.body.method === 'getManifest') {
        try {
          let manifest;
          try {
            const configManager = require('../utils/config');
            manifest = configManager.getMcpManifest();
          } catch (error) {
            // Fallback to file system read if config manager not available
            const manifestPath = path.join(process.cwd(), 'mcp-manifest.json');
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          }
          
          return res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            result: manifest
          });
        } catch (error) {
          logger.error(`GetManifest error: ${error.message}`);
          return res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            error: {
              code: JSON_RPC_ERRORS.INTERNAL_ERROR,
              message: `Error getting manifest: ${error.message}`
            }
          });
        }
      }
      
      // Handle execute method for JSON-RPC
      if (req.body.method === 'execute' && req.body.params) {
        // Map the JSON-RPC execute parameters to our normalized format
        normalizedRequest.action = req.body.params.action;
        normalizedRequest.parameters = req.body.params.parameters || {};
      }
    }
    
    // 5. Process the action and generate a result
    let result;
    
    try {
      switch (action) {
        case 'navigate':
          result = await handleAutomationCommand('navigate', { url: parameters.url });
          break;
          
        case 'click':
          result = await handleAutomationCommand('click', { selector: parameters.selector });
          break;
          
        case 'type':
          result = await handleAutomationCommand('type', { 
            selector: parameters.selector, 
            text: parameters.text, 
            options: { clearFirst: parameters.clearFirst } 
          });
          break;
          
        case 'extract':
          result = await handleAutomationCommand('extract', { 
            selector: parameters.selector, 
            attribute: parameters.attribute || 'textContent' 
          });
          break;
          
        case 'screenshot':
          result = await handleAutomationCommand('screenshot', { 
            fileName: `${metadata.executionId || Date.now()}-${Date.now()}.png` 
          });
          break;
          
        case 'wait':
          result = await handleAutomationCommand('wait', { 
            milliseconds: parameters.milliseconds || 1000 
          });
          break;
          
        case 'desktop_click':
          result = await desktopIntegration.desktopClick(parameters.x, parameters.y);
          break;
          
        case 'desktop_type':
          result = await desktopIntegration.desktopType(parameters.text);
          break;
          
        case 'generate_tests':
          result = await generateTests({
            url: parameters.url,
            framework: parameters.framework,
            style: parameters.style,
            format: parameters.format,
            prompt: parameters.prompt,
            outputPath: parameters.outputPath,
            additionalContext: parameters.additionalContext
          });
          break;
          
        case 'generate_test_suite':
          result = await generateFullTestSuite(parameters.url, {
            framework: parameters.framework,
            format: parameters.format,
            outputDir: parameters.outputDir,
            additionalContext: parameters.additionalContext
          });
          break;
          
        case 'scaffold_project':
          result = await scaffoldTestProject(parameters.framework, parameters.outputDir);
          break;
          
        case 'list_frameworks':
          result = {
            frameworks: Object.values(TEST_FRAMEWORKS),
            styles: Object.values(TEST_STYLES),
            formats: Object.values(OUTPUT_FORMATS)
          };
          break;
          
        case 'visual_compare':
          result = await visualCompare({
            url: parameters.url,
            selector: parameters.selector,
            baselineName: parameters.baselineName,
            updateBaseline: parameters.updateBaseline,
            threshold: parameters.threshold
          });
          break;
          
        case 'accessibility_test':
          result = await accessibilityTest({
            url: parameters.url,
            standard: parameters.standard
          });
          break;
          
        case 'performance_test':
          result = await performanceTest({
            url: parameters.url,
            iterations: parameters.iterations
          });
          break;
          
        case 'network_trace':
          result = await networkTrace({
            url: parameters.url,
            apiEndpoints: parameters.apiEndpoints
          });
          break;
          
        case 'run_test_suite':
          result = await runTestSuite({
            url: parameters.url,
            visual: parameters.visual,
            accessibility: parameters.accessibility,
            performance: parameters.performance,
            network: parameters.network
          });
          break;
          
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
      
      // 6. Format the response based on protocol type
      const response = formatResponse(normalizedRequest, result);
      
      // 7. Send response
      res.json(response);
      
    } catch (error) {
      logger.error(`Error executing ${action}: ${error.message}`);
      
      // Format error response based on protocol type
      const errorResponse = formatResponse(normalizedRequest, null, error);
      
      if (protocolType === PROTOCOL_TYPES.JSON_RPC) {
        return res.json(errorResponse);
      } else {
        return res.status(500).json(errorResponse);
      }
    }
  } catch (error) {
    logger.error(`Unhandled error in invoke endpoint: ${error.message}`);
    
    // Fallback error response if protocol detection or normalization fails
    if (req.body && req.body.jsonrpc === '2.0') {
      return res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: JSON_RPC_ERRORS.INTERNAL_ERROR,
          message: error.message
        }
      });
    } else {
      res.status(500).json(formatMcpErrorResponse(error, req.body && req.body.executionId));
    }
  }
});

// Model Context Protocol (MCP) manifest endpoint
router.get('/mcp/manifest', (req, res) => {
  // Return tool manifest in Model Context Protocol format
  try {
    // Read manifest directly from file to ensure consistency
    const manifestPath = path.join(process.cwd(), 'mcp-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    res.json(manifest);
  } catch (error) {
    logger.error(`Error reading MCP manifest: ${error.message}`);
    // Fallback to hardcoded manifest
    res.json({
      name: 'UniAuto Test Automation',
      version: '1.0.0',
      description: 'Universal Test Automation with self-healing capabilities',
      author: 'UniAuto Team',
      protocol: 'mcp',
      protocolName: 'Model Context Protocol',
      protocolVersion: '1.0',
      actions: [
        {
          name: 'navigate',
          description: 'Navigate to a URL',
          parameters: [
            { name: 'url', type: 'string', description: 'URL to navigate to', required: true }
          ]
        },
        {
          name: 'click',
          description: 'Click on an element',
          parameters: [
            { name: 'selector', type: 'string', description: 'CSS selector of the element', required: true }
          ]
        },
        {
          name: 'type',
          description: 'Type text into an input field',
          parameters: [
            { name: 'selector', type: 'string', description: 'CSS selector of the input field', required: true },
            { name: 'text', type: 'string', description: 'Text to type', required: true },
            { name: 'clearFirst', type: 'boolean', description: 'Clear the field before typing', required: false }
          ]
        },
        {
          name: 'extract',
          description: 'Extract data from an element',
          parameters: [
            { name: 'selector', type: 'string', description: 'CSS selector of the element', required: true },
            { name: 'attribute', type: 'string', description: 'Attribute to extract (default: textContent)', required: false }
          ]
        },
        {
          name: 'screenshot',
          description: 'Take a screenshot',
          parameters: []
        },
        {
          name: 'wait',
          description: 'Wait for a specified time in milliseconds',
          parameters: [
            { name: 'milliseconds', type: 'number', description: 'Time to wait in milliseconds', required: false }
          ]
        },
        {
          name: 'desktop_click',
          description: 'Click at specific coordinates on the desktop',
          parameters: [
            { name: 'x', type: 'number', description: 'X coordinate', required: true },
            { name: 'y', type: 'number', description: 'Y coordinate', required: true }
          ]
        },
        {
          name: 'desktop_type',
          description: 'Type text on the desktop',
          parameters: [
            { name: 'text', type: 'string', description: 'Text to type', required: true }
          ]
        },
        {
          name: 'generate_tests',
          description: 'Generate test cases for an application in a specific framework and style',
          parameters: [
            { name: 'url', type: 'string', description: 'URL of the application to analyze', required: true },
            { name: 'framework', type: 'string', description: 'Test framework to use (e.g., playwright, cypress, jest)', required: false },
            { name: 'style', type: 'string', description: 'Test style (e.g., bdd, tdd)', required: false },
            { name: 'format', type: 'string', description: 'Output format (e.g., javascript, typescript, python)', required: false },
            { name: 'prompt', type: 'string', description: 'User prompt describing test requirements', required: false },
            { name: 'outputPath', type: 'string', description: 'Path to save generated tests', required: false },
            { name: 'additionalContext', type: 'object', description: 'Additional context for test generation', required: false }
          ]
        },
        {
          name: 'generate_test_suite',
          description: 'Generate a complete test suite with different test types (unit, integration, e2e, etc.)',
          parameters: [
            { name: 'url', type: 'string', description: 'URL of the application to analyze', required: true },
            { name: 'framework', type: 'string', description: 'Test framework to use', required: false },
            { name: 'format', type: 'string', description: 'Output format', required: false },
            { name: 'outputDir', type: 'string', description: 'Directory to save generated tests', required: false },
            { name: 'additionalContext', type: 'object', description: 'Additional context for test generation', required: false }
          ]
        },
        {
          name: 'scaffold_project',
          description: 'Scaffold a complete test project structure with configuration files',
          parameters: [
            { name: 'framework', type: 'string', description: 'Test framework to use', required: true },
            { name: 'outputDir', type: 'string', description: 'Directory to create the project', required: true }
          ]
        },
        {
          name: 'list_frameworks',
          description: 'Get a list of supported test frameworks, styles, and formats',
          parameters: []
        }
      ],
      capabilities: [
        "web_automation",
        "desktop_automation",
        "self_healing",
        "ai_integration",
        "screenshot_capture",
        "visual_comparison",
        "test_generation",
        "project_scaffolding"
      ]
    });
  }
});

/**
 * Set up a keep-alive mechanism to ensure the server stays connected
 * with Claude Desktop
 */
function setupKeepAlive() {
  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Set interval to log heartbeat message
  keepAliveInterval = setInterval(() => {
    logger.debug('Keep-alive heartbeat');
  }, 1000);
  
  // Allow process to exit gracefully if needed
  keepAliveInterval.unref();
}

module.exports = router;