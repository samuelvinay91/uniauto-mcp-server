require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { setupWebsocketServer } = require('./core/websocket');
const { initializeDatabase } = require('./core/database');
const { logger } = require('./utils/logger');
const configManager = require('./utils/config');
const { errorMiddleware } = require('./utils/error-handler');
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
const PORT = configManager.get('port');

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

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'NotFoundError',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    status: 404
  });
});

// Initialize services
async function startServer() {
  try {
    logger.info(`Starting UniAuto MCP Server in ${configManager.get('environment')} mode`);
    
    // Connect to database if configured
    if (configManager.get('mongodbUri')) {
      await initializeDatabase();
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
    setupWebsocketServer(server);
    
    // Handle graceful shutdown
    setupGracefulShutdown(server);
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

/**
 * Setup graceful shutdown handlers
 * 
 * @param {http.Server} server - The HTTP server instance
 */
function setupGracefulShutdown(server) {
  // Handle SIGTERM and SIGINT (Ctrl+C)
  const shutdownSignals = ['SIGTERM', 'SIGINT'];
  
  shutdownSignals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`${signal} signal received. Shutting down gracefully...`);
      
      // Close the HTTP server
      server.close(() => {
        logger.info('HTTP server closed');
      });
      
      // Any other cleanup like database connections, etc.
      // ...
      
      setTimeout(() => {
        logger.info('Forcing shutdown after timeout');
        process.exit(0);
      }, 15000).unref(); // Allow process to exit if all connections are closed
    });
  });
}

startServer();
