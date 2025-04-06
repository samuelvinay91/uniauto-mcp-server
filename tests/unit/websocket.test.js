const { setupWebSocketServer, sendMessage } = require('../../src/core/websocket');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock the WebSocket module
jest.mock('ws', () => {
  // Create a mock WebSocket server
  const mockServer = {
    on: jest.fn(),
    clients: new Set()
  };
  
  // Mock WebSocket instance
  const MockWebSocket = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn()
  }));
  
  // Mock the Server constructor
  MockWebSocket.Server = jest.fn().mockImplementation(() => mockServer);
  
  return MockWebSocket;
});

describe('WebSocket Server', () => {
  let mockHttpServer;
  let mockWsServer;
  let WebSocket;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock HTTP server
    mockHttpServer = {
      on: jest.fn()
    };
    
    // Get WebSocket module
    WebSocket = require('ws');
    mockWsServer = new WebSocket.Server().on.mock.calls[0][1]; // Store the connection callback
  });
  
  test('should set up WebSocket server correctly', () => {
    const result = setupWebSocketServer(mockHttpServer);
    
    // Should create WebSocket.Server with the http server
    expect(WebSocket.Server).toHaveBeenCalled();
    expect(WebSocket.Server.mock.calls[0][0]).toHaveProperty('server', mockHttpServer);
    
    // Should set up connection handler
    expect(result.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });
  
  test('should handle incoming connections', () => {
    const mockWs = new WebSocket();
    const wsServer = setupWebSocketServer(mockHttpServer);
    
    // Simulate a connection
    const connectionHandler = wsServer.on.mock.calls[0][1];
    connectionHandler(mockWs);
    
    // Should set up message handler on the client
    expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
  });
  
  test('should send messages to connected clients', () => {
    const wsServer = setupWebSocketServer(mockHttpServer);
    
    // Create mock clients
    const mockClient1 = { readyState: 1, send: jest.fn() };
    const mockClient2 = { readyState: 1, send: jest.fn() };
    const mockClient3 = { readyState: 2, send: jest.fn() }; // Not ready
    
    // Add clients to the server
    wsServer.clients.add(mockClient1);
    wsServer.clients.add(mockClient2);
    wsServer.clients.add(mockClient3);
    
    // Send a message
    const message = { type: 'test', data: 'test-data' };
    sendMessage(message);
    
    // Ready clients should receive the message
    expect(mockClient1.send).toHaveBeenCalledWith(JSON.stringify(message));
    expect(mockClient2.send).toHaveBeenCalledWith(JSON.stringify(message));
    
    // Non-ready client should not receive the message
    expect(mockClient3.send).not.toHaveBeenCalled();
  });
});