require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { setupWebsocketServer } = require('./core/websocket');
const { initializeDatabase } = require('./core/database');
const { logger } = require('./utils/logger');
const routes = require('./handlers/routes');

// Check if script was called directly or from MCP
const isMcpServerStart = process.argv.includes('--mcp-server');
const logToStderr = process.env.LOG_TO_STDERR === 'true';

// Use stderr for console logs when in MCP mode to avoid interfering with protocol communication
// But still make sure logs are visible when running in MCP mode
const consoleLog = (message) => {
  if (isMcpServerStart && logToStderr) {
    process.stderr.write(`${message}\n`);
    
    // Also output to console for better visibility when run directly
    if (!process.env.CI) {
      console.log(`[MCP LOG] ${message}`);
    }
  } else {
    console.log(message);
  }
};

// Print a startup banner to show the server is running
consoleLog(`
=====================================================
  UniAuto MCP Server v1.0.0
  Mode: ${isMcpServerStart ? 'MCP Protocol' : 'Direct HTTP API'}
=====================================================
`);

if (!isMcpServerStart) {
  consoleLog('\nStarting UniAuto MCP Server - Direct Mode');
} else {
  consoleLog('\nStarting UniAuto MCP Server - MCP Mode');
}

// Create logs directory if it doesn't exist
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Setup Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Test endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('UniAuto MCP Server is running. Access API endpoints at /api');
});

// API Routes
app.use('/api', routes);

// Initialize services
async function startServer() {
  try {
    consoleLog('- Environment:');
    consoleLog(`  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    consoleLog(`  - PORT: ${PORT}`);
    consoleLog(`  - MCP Mode: ${isMcpServerStart ? 'enabled' : 'disabled'}`);
    consoleLog(`  - MONGODB_URI: ${process.env.MONGODB_URI ? 'configured' : 'not configured'}`);
    consoleLog(`  - CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? 'configured' : 'not configured'}`);
    consoleLog(`  - LOG_DIR: ${logDir}`);
    
    // Connect to database if configured
    if (process.env.MONGODB_URI) {
      try {
        consoleLog('- Connecting to MongoDB...');
        await initializeDatabase();
        consoleLog('- Connected to MongoDB successfully');
      } catch (dbError) {
        const errorMsg = `- MongoDB connection failed: ${dbError.message}`;
        if (isMcpServerStart && logToStderr) {
          process.stderr.write(`${errorMsg}\n`);
        } else {
          console.error(errorMsg);
        }
        logger.warn(`Continuing without MongoDB connection: ${dbError.message}`);
      }
    } else {
      consoleLog('- No MongoDB URI configured, skipping database initialization');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      consoleLog(`- Server started successfully on port ${PORT}`);
      logger.info(`UniAuto MCP Server running on port ${PORT}`);
      consoleLog('\nServer is ready for connections!');
      consoleLog('- API endpoints available at:');
      consoleLog(`  http://localhost:${PORT}/api/health`);
      consoleLog(`  http://localhost:${PORT}/api/mcp/manifest`);
    });
    
    // Setup WebSocket server
    try {
      consoleLog('- Setting up WebSocket server...');
      setupWebsocketServer(server);
      consoleLog('- WebSocket server setup complete');
    } catch (wsError) {
      const errorMsg = `- WebSocket setup failed: ${wsError.message}`;
      if (isMcpServerStart && logToStderr) {
        process.stderr.write(`${errorMsg}\n`);
      } else {
        console.error(errorMsg);
      }
      logger.error(`WebSocket setup failed: ${wsError.message}`);
    }
  } catch (error) {
    const fatalError = `\nFATAL ERROR: Failed to start server: ${error.message}`;
    if (isMcpServerStart && logToStderr) {
      process.stderr.write(`${fatalError}\n`);
    } else {
      console.error(fatalError);
    }
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
