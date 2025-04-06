const WebSocket = require('ws');
const { logger } = require('../utils/logger');
const { handleAutomationCommand } = require('./automation');

let wss;

function setupWebsocketServer(server) {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    logger.info('Client connected to WebSocket');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        logger.debug(`Received message: ${JSON.stringify(data)}`);
        
        if (data.type === 'command') {
          const result = await handleAutomationCommand(data.command, data.params);
          ws.send(JSON.stringify({
            type: 'response',
            requestId: data.requestId,
            result
          }));
        }
      } catch (error) {
        logger.error(`WebSocket error: ${error.message}`);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });
    
    ws.on('close', () => {
      logger.info('Client disconnected from WebSocket');
    });
  });
  
  logger.info('WebSocket server initialized');
  return wss;
}

function broadcastToClients(message) {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

module.exports = {
  setupWebsocketServer,
  broadcastToClients
};