require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupWebsocketServer } = require('./core/websocket');
const { initializeDatabase } = require('./core/database');
const { logger } = require('./utils/logger');
const configManager = require('./utils/config');
const { errorMiddleware } = require('./utils/error-handler');
const routes = require('./handlers/routes');

const app = express();
const PORT = configManager.get('port');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

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
      logger.info(`UniAuto MCP Server running on port ${PORT}`);
    });
    
    // Setup WebSocket server
    setupWebsocketServer(server);
    
    // Handle graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
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