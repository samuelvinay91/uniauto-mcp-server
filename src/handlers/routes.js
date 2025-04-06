const express = require('express');
const { logger } = require('../utils/logger');
const { handleAutomationCommand } = require('../core/automation');
const { createTestCase, getAllTestCases, getTestCaseById, updateTestCase, deleteTestCase } = require('./test-cases');
const { aiProcessing } = require('./ai-processing');

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

// MCP Platform integration endpoints
router.post('/mcp/invoke', async (req, res) => {
  try {
    const { action, parameters, executionId } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    logger.info(`MCP invoke: ${action}, executionId: ${executionId}`);
    
    // Map MCP actions to internal commands
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
        
      default:
        return res.status(400).json({ error: `Unsupported action: ${action}` });
    }
    
    const result = await handleAutomationCommand(command, params);
    res.json({
      executionId,
      status: 'success',
      action,
      result
    });
  } catch (error) {
    logger.error(`MCP invoke error: ${error.message}`);
    res.status(500).json({
      executionId: req.body.executionId,
      status: 'error',
      error: error.message
    });
  }
});

// MCP manifest endpoint
router.get('/mcp/manifest', (req, res) => {
  res.json({
    name: 'UniAuto Test Automation',
    version: '1.0.0',
    description: 'Universal Test Automation with self-healing capabilities',
    author: 'UniAuto Team',
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
      }
    ]
  });
});

module.exports = router;