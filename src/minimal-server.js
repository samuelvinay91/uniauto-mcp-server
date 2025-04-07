// Minimal server for testing MCP with Claude Desktop
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Setup Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('UniAuto MCP Server (Minimal) is running. Access API endpoints at /api');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP manifest endpoint
app.get('/api/mcp/manifest', (req, res) => {
  try {
    // Read manifest directly from file to ensure consistency
    const manifestPath = path.join(process.cwd(), 'mcp-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    res.json(manifest);
  } catch (error) {
    console.error(`Error reading MCP manifest: ${error.message}`);
    // Fallback to simplified manifest
    res.json({
      name: 'UniAuto Test Automation (Minimal)',
      version: '1.0.0',
      description: 'Universal Test Automation with self-healing capabilities',
      protocol: 'mcp',
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
        }
      ]
    });
  }
});

// Minimal MCP invoke endpoint
app.post('/api/mcp/invoke', (req, res) => {
  const { action, parameters, executionId } = req.body;
  
  console.log(`[MCP] Received action: ${action}`);
  
  // Return mock responses for testing
  switch (action) {
    case 'navigate':
      return res.json({
        status: 'success',
        executionId,
        result: {
          url: parameters.url,
          status: 'success'
        }
      });
    
    case 'extract':
      return res.json({
        status: 'success',
        executionId,
        result: {
          selector: parameters.selector,
          data: `Example data from ${parameters.selector}`,
          status: 'success'
        }
      });
    
    case 'screenshot':
      return res.json({
        status: 'success',
        executionId,
        result: {
          path: './public/screenshots/test-screenshot.png',
          status: 'success'
        }
      });
    
    default:
      return res.status(400).json({
        status: 'error',
        executionId,
        error: {
          message: `Unsupported action: ${action}`
        }
      });
  }
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`\n=== UniAuto MCP Server (Minimal) ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`MCP Manifest: http://localhost:${PORT}/api/mcp/manifest`);
  console.log(`\nThis simplified server is for testing Claude Desktop MCP integration only.\n`);
});
