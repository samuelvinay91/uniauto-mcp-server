const axios = require('axios');
require('dotenv').config();

// Server configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000/api';

// Test URL
const TEST_APP_URL = 'https://demo.playwright.dev/todomvc';

/**
 * Test the MCP test generation capabilities
 */
describe('Test Generation API', () => {
  test('should generate test cases with Playwright and BDD', async () => {
    // Skip if no API key
    if (!process.env.CLAUDE_API_KEY) {
      console.log('Skipping test: CLAUDE_API_KEY not set');
      return;
    }

    const response = await axios.post(`${SERVER_URL}/generate-tests`, {
      url: TEST_APP_URL,
      framework: 'playwright',
      style: 'bdd',
      format: 'javascript',
      prompt: 'Generate BDD-style tests for a TODO application. Include tests for adding, completing, and deleting tasks.'
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.testCode).toBeTruthy();
    expect(response.data.testCode.length).toBeGreaterThan(100);
    console.log('Test code preview:', response.data.testCode.substring(0, 100) + '...');
  }, 60000); // Allow 60 seconds for this test

  test('should generate a complete test suite', async () => {
    // Skip if no API key
    if (!process.env.CLAUDE_API_KEY) {
      console.log('Skipping test: CLAUDE_API_KEY not set');
      return;
    }

    const response = await axios.post(`${SERVER_URL}/generate-full-suite`, {
      url: TEST_APP_URL,
      framework: 'jest',
      format: 'javascript'
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.testSuites).toBeTruthy();
    expect(Object.keys(response.data.testSuites)).toContain('unit');
    expect(Object.keys(response.data.testSuites)).toContain('e2e');
  }, 120000); // Allow 2 minutes for this test
});

/**
 * Test the MCP API for test generation
 */
describe('MCP Protocol for Test Generation', () => {
  test('should handle generate_tests action through MCP', async () => {
    // Skip if no API key
    if (!process.env.CLAUDE_API_KEY) {
      console.log('Skipping test: CLAUDE_API_KEY not set');
      return;
    }

    const response = await axios.post(`${SERVER_URL}/mcp/invoke`, {
      action: 'generate_tests',
      parameters: {
        url: TEST_APP_URL,
        framework: 'playwright',
        style: 'bdd',
        format: 'javascript',
        prompt: 'Generate tests for a TODO application'
      },
      executionId: 'test-execution-id-123'
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.executionId).toBe('test-execution-id-123');
    expect(response.data.result.testCode).toBeTruthy();
  }, 60000); // Allow 60 seconds for this test

  test('should list available test frameworks through MCP', async () => {
    const response = await axios.post(`${SERVER_URL}/mcp/invoke`, {
      action: 'list_frameworks',
      parameters: {},
      executionId: 'test-execution-id-456'
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.result.frameworks).toBeInstanceOf(Array);
    expect(response.data.result.frameworks).toContain('playwright');
    expect(response.data.result.styles).toBeInstanceOf(Array);
    expect(response.data.result.styles).toContain('bdd');
  });
});