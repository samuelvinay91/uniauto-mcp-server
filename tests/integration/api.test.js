const request = require('supertest');
const express = require('express');
const cors = require('cors');
const routes = require('../../src/handlers/routes');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

jest.mock('../../src/core/automation', () => ({
  handleAutomationCommand: jest.fn().mockImplementation((command, params) => {
    if (command === 'navigate') {
      return Promise.resolve({ status: 'success', url: params.url });
    } else if (command === 'click') {
      return Promise.resolve({ status: 'success', selector: params.selector });
    } else if (command === 'type') {
      return Promise.resolve({ status: 'success', selector: params.selector, textLength: params.text.length });
    } else if (command === 'extract') {
      return Promise.resolve({ status: 'success', selector: params.selector, data: 'Extracted data' });
    } else if (command === 'screenshot') {
      return Promise.resolve({ status: 'success', path: './public/screenshots/test.png' });
    } else {
      return Promise.resolve({ status: 'success' });
    }
  })
}));

jest.mock('../../src/handlers/test-cases', () => ({
  createTestCase: jest.fn((req, res) => res.status(201).json({ id: 'test-id', ...req.body })),
  getAllTestCases: jest.fn((req, res) => res.json([{ id: 'test-id', name: 'Test Case' }])),
  getTestCaseById: jest.fn((req, res) => res.json({ id: req.params.id, name: 'Test Case' })),
  updateTestCase: jest.fn((req, res) => res.json({ id: req.params.id, ...req.body })),
  deleteTestCase: jest.fn((req, res) => res.json({ message: 'Test case deleted successfully' }))
}));

jest.mock('../../src/handlers/ai-processing', () => ({
  aiProcessing: jest.fn((req, res) => {
    const { task } = req.body;
    res.json({
      task,
      steps: [
        {
          command: 'navigate',
          description: 'Navigate to example.com',
          parameters: { url: 'https://example.com' }
        },
        {
          command: 'click',
          description: 'Click on login button',
          parameters: { selector: '#login-button' }
        }
      ],
      rawResponse: 'AI generated response'
    });
  })
}));

// Set up the express app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

describe('API Endpoints', () => {
  test('GET /api/health returns 200 OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  
  test('POST /api/execute executes automation command', async () => {
    const response = await request(app)
      .post('/api/execute')
      .send({ command: 'navigate', params: { url: 'https://example.com' } });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'success', url: 'https://example.com' });
  });
  
  test('POST /api/test-cases creates a new test case', async () => {
    const testCase = {
      name: 'Login Test',
      description: 'Tests the login functionality',
      steps: [
        {
          command: 'navigate',
          description: 'Navigate to login page',
          parameters: { url: 'https://example.com/login' }
        }
      ]
    };
    
    const response = await request(app)
      .post('/api/test-cases')
      .send(testCase);
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Login Test');
    expect(response.body.id).toBeDefined();
  });
  
  test('GET /api/test-cases returns all test cases', async () => {
    const response = await request(app).get('/api/test-cases');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].name).toBe('Test Case');
  });
  
  test('POST /api/ai/process processes task with AI', async () => {
    const response = await request(app)
      .post('/api/ai/process')
      .send({ task: 'Log into example.com with username "user" and password "pass"' });
    
    expect(response.status).toBe(200);
    expect(response.body.steps).toBeDefined();
    expect(response.body.steps.length).toBeGreaterThan(0);
    expect(response.body.steps[0].command).toBe('navigate');
  });
  
  test('POST /api/mcp/invoke executes MCP action', async () => {
    const response = await request(app)
      .post('/api/mcp/invoke')
      .send({
        action: 'navigate',
        parameters: { url: 'https://example.com' },
        executionId: 'test-execution-1'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.executionId).toBe('test-execution-1');
    expect(response.body.result).toEqual({ status: 'success', url: 'https://example.com' });
  });
  
  test('GET /api/mcp/manifest returns MCP manifest', async () => {
    const response = await request(app).get('/api/mcp/manifest');
    
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('UniAuto Test Automation');
    expect(response.body.actions).toBeDefined();
    expect(Array.isArray(response.body.actions)).toBe(true);
  });
});
