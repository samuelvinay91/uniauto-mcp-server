/**
 * AI Test Generation Integration Tests
 * 
 * Tests the AI test generation capabilities of the MCP server
 */

const axios = require('axios');

// Server configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000/api';

// Test URL for generating tests
const TEST_URL = 'https://demo.playwright.dev/todomvc';

describe('AI Test Generation', () => {
  // Skip tests if no Claude API key is set
  beforeAll(() => {
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('Skipping AI test generation tests: CLAUDE_API_KEY not set');
    }
  });
  
  test('should generate tests via AI integration', async () => {
    // Skip if no API key
    if (!process.env.CLAUDE_API_KEY) {
      return;
    }
    
    const response = await axios.post(`${SERVER_URL}/ai/generate-tests`, {
      url: TEST_URL,
      description: 'Generate tests for a TODO application that can add, complete, and delete tasks',
      framework: 'playwright',
      style: 'bdd',
      outputFormat: 'javascript'
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('testCode');
    expect(response.data.testCode).toBeTruthy();
    expect(response.data.testCode.length).toBeGreaterThan(100);
    
    // Log test code length for information
    console.log(`Generated test code length: ${response.data.testCode.length} characters`);
  }, 120000); // Allow 2 minutes for this test
  
  test('should generate Cypress tests using MCP', async () => {
    // Skip if no API key
    if (!process.env.CLAUDE_API_KEY) {
      return;
    }
    
    const response = await axios.post(`${SERVER_URL}/mcp/invoke`, {
      action: 'generate_tests',
      parameters: {
        url: TEST_URL,
        framework: 'cypress',
        style: 'bdd',
        format: 'javascript',
        prompt: 'Generate Cypress tests for a TODO application'
      },
      executionId: 'test-execution-cypress-bdd'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('success');
    expect(response.data.result).toHaveProperty('testCode');
    expect(response.data.result.testCode.length).toBeGreaterThan(100);
    
    // Check that the framework is correctly used
    expect(response.data.result.testCode).toContain('cy.');
  }, 120000); // Allow 2 minutes for this test
});