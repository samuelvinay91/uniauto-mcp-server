const express = require('express');
const { logger } = require('../utils/logger');
// Use mock automation for testing without browser dependencies
const { handleAutomationCommand } = require('../core/mock-automation');
const { createTestCase, getAllTestCases, getTestCaseById, updateTestCase, deleteTestCase } = require('./test-cases');
const { aiProcessing, aiTestGeneration } = require('./ai-processing');
const { validateMcpRequest, formatMcpResponse, formatMcpErrorResponse } = require('../utils/mcp-validator');
const { generateTests, generateFullTestSuite, scaffoldTestProject, TEST_FRAMEWORKS, TEST_STYLES, OUTPUT_FORMATS } = require('../core/test-generator');
const { visualCompare, accessibilityTest, performanceTest, networkTrace, runTestSuite } = require('../core/advanced-testing');

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

// Model Context Protocol (MCP) integration endpoints
router.post('/mcp/invoke', async (req, res) => {
  try {
    // Validate the incoming Model Context Protocol request
    const validation = validateMcpRequest(req);
    if (!validation.isValid) {
      return res.status(400).json(formatMcpErrorResponse(
        new Error(validation.error),
        req.body.executionId
      ));
    }
    
    // Parse Model Context Protocol request parameters
    const { action, parameters, executionId } = req.body;
    
    logger.info(`Model Context Protocol invoke: ${action}, executionId: ${executionId}`);
    
    // Map Model Context Protocol actions to internal commands
    let command, params;
    
    switch (action) {
      case 'navigate':
        command = 'navigate';
        params = { url: parameters.url };
        break;
        
      case 'click':
        command = 'click';
        params = { selector: parameters.selector };
        break;
        
      case 'type':
        command = 'type';
        params = { 
          selector: parameters.selector, 
          text: parameters.text, 
          options: { clearFirst: parameters.clearFirst } 
        };
        break;
        
      case 'extract':
        command = 'extract';
        params = { 
          selector: parameters.selector, 
          attribute: parameters.attribute || 'textContent' 
        };
        break;
        
      case 'screenshot':
        command = 'screenshot';
        params = { fileName: `${executionId}-${Date.now()}.png` };
        break;
        
      case 'wait':
        command = 'wait';
        params = { milliseconds: parameters.milliseconds || 1000 };
        break;
        
      case 'generate_tests':
        // Handle test generation action
        try {
          const result = await generateTests({
            url: parameters.url,
            framework: parameters.framework,
            style: parameters.style,
            format: parameters.format,
            prompt: parameters.prompt,
            outputPath: parameters.outputPath,
            additionalContext: parameters.additionalContext
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'generate_test_suite':
        // Handle full test suite generation
        try {
          const result = await generateFullTestSuite(parameters.url, {
            framework: parameters.framework,
            format: parameters.format,
            outputDir: parameters.outputDir,
            additionalContext: parameters.additionalContext
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'scaffold_project':
        // Handle project scaffolding
        try {
          const result = await scaffoldTestProject(parameters.framework, parameters.outputDir);
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'list_frameworks':
        // Return available test frameworks, styles, and formats
        return res.json(formatMcpResponse(action, {
          frameworks: Object.values(TEST_FRAMEWORKS),
          styles: Object.values(TEST_STYLES),
          formats: Object.values(OUTPUT_FORMATS)
        }, executionId));
      
      case 'visual_compare':
        // Handle visual comparison action
        try {
          const result = await visualCompare({
            url: parameters.url,
            selector: parameters.selector,
            baselineName: parameters.baselineName,
            updateBaseline: parameters.updateBaseline,
            threshold: parameters.threshold
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'accessibility_test':
        // Handle accessibility testing action
        try {
          const result = await accessibilityTest({
            url: parameters.url,
            standard: parameters.standard
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'performance_test':
        // Handle performance testing action
        try {
          const result = await performanceTest({
            url: parameters.url,
            iterations: parameters.iterations
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'network_trace':
        // Handle network tracing action
        try {
          const result = await networkTrace({
            url: parameters.url,
            apiEndpoints: parameters.apiEndpoints
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      case 'run_test_suite':
        // Handle test suite action
        try {
          const result = await runTestSuite({
            url: parameters.url,
            visual: parameters.visual,
            accessibility: parameters.accessibility,
            performance: parameters.performance,
            network: parameters.network
          });
          
          return res.json(formatMcpResponse(action, result, executionId));
        } catch (error) {
          return res.status(500).json(formatMcpErrorResponse(error, executionId));
        }
        
      default:
        return res.status(400).json(formatMcpErrorResponse(
          new Error(`Unsupported Model Context Protocol action: ${action}`),
          executionId
        ));
    }
    
    // Execute automation command
    const result = await handleAutomationCommand(command, params);
    
    // Format response according to Model Context Protocol specification using the validator
    res.json(formatMcpResponse(action, result, executionId));
  } catch (error) {
    // Log error with MCP context
    logger.error(`Model Context Protocol invoke error: ${error.message}`);
    
    // Return error response in MCP-compliant format using the validator
    res.status(500).json(formatMcpErrorResponse(error, req.body.executionId));
  }
});

// Model Context Protocol (MCP) manifest endpoint
router.get('/mcp/manifest', (req, res) => {
  // Return tool manifest in Model Context Protocol format
  const fs = require('fs');
  const path = require('path');
  
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

module.exports = router;