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
if (!isMcpServerStart) {
  console.log('\nStarting UniAuto MCP Server - Direct Mode');
} else {
  console.log('\nStarting UniAuto MCP Server - MCP Mode');
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
    console.log('- Environment:');
    console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`  - PORT: ${PORT}`);
    console.log(`  - MONGODB_URI: ${process.env.MONGODB_URI ? 'configured' : 'not configured'}`);
    console.log(`  - CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? 'configured' : 'not configured'}`);
    console.log(`  - LOG_DIR: ${logDir}`);
    
    // Connect to database if configured
    if (process.env.MONGODB_URI) {
      try {
        console.log('- Connecting to MongoDB...');
        await initializeDatabase();
        console.log('- Connected to MongoDB successfully');
      } catch (dbError) {
        console.error(`- MongoDB connection failed: ${dbError.message}`);
        logger.warn(`Continuing without MongoDB connection: ${dbError.message}`);
      }
    } else {
      console.log('- No MongoDB URI configured, skipping database initialization');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`- Server started successfully on port ${PORT}`);
      logger.info(`UniAuto MCP Server running on port ${PORT}`);
      console.log('\nServer is ready for connections!');
      console.log('- API endpoints available at:');
      console.log(`  http://localhost:${PORT}/api/health`);
      console.log(`  http://localhost:${PORT}/api/mcp/manifest`);
    });
    
    // Setup WebSocket server
    try {
      console.log('- Setting up WebSocket server...');
      setupWebsocketServer(server);
      console.log('- WebSocket server setup complete');
    } catch (wsError) {
      console.error(`- WebSocket setup failed: ${wsError.message}`);
      logger.error(`WebSocket setup failed: ${wsError.message}`);
    }
  } catch (error) {
    console.error(`\nFATAL ERROR: Failed to start server: ${error.message}`);
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
