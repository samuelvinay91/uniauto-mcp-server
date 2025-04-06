require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupWebsocketServer } = require('./core/websocket');
const { initializeDatabase } = require('./core/database');
const { logger } = require('./utils/logger');
const routes = require('./handlers/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// API Routes
app.use('/api', routes);

// Initialize services
async function startServer() {
  try {
    // Connect to database if configured
    if (process.env.MONGODB_URI) {
      await initializeDatabase();
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`UniAuto MCP Server running on port ${PORT}`);
    });
    
    // Setup WebSocket server
    setupWebsocketServer(server);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();