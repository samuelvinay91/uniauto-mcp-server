/**
 * Test Generation Demo
 * 
 * This script demonstrates how to use the test generation capabilities
 * of the UniAuto MCP Server.
 * 
 * Usage:
 * 1. Start the server: npm run dev
 * 2. Run this script: node examples/test-generation-demo.js
 */

const axios = require('axios');
require('dotenv').config();

// Server configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000/api';

// Example URL to analyze
const TEST_APP_URL = 'https://demo.playwright.dev/todomvc';

/**
 * Generate test cases using a specific framework and style
 */
async function generateTests() {
  try {
    console.log(`Generating tests for ${TEST_APP_URL} using Playwright with BDD style...`);
    
    const response = await axios.post(`${SERVER_URL}/generate-tests`, {
      url: TEST_APP_URL,
      framework: 'playwright',
      style: 'bdd',
      format: 'javascript',
      prompt: 'Generate comprehensive BDD-style tests for a TODO application. Include tests for adding, completing, editing, and deleting tasks. Make sure to test error scenarios and edge cases.'
    });
    
    console.log('Test generation successful!');
    console.log('Preview of generated code:');
    console.log('-'.repeat(80));
    console.log(response.data.testCode.substring(0, 500) + '...');
    console.log('-'.repeat(80));
    
    // Save the generated tests to a file
    const fs = require('fs');
    const outputPath = './generated-tests.js';
    fs.writeFileSync(outputPath, response.data.testCode);
    
    console.log(`Full test code saved to ${outputPath}`);
  } catch (error) {
    console.error('Error generating tests:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Generate a complete test suite with different test types
 */
async function generateFullTestSuite() {
  try {
    console.log(`Generating full test suite for ${TEST_APP_URL}...`);
    
    const response = await axios.post(`${SERVER_URL}/generate-full-suite`, {
      url: TEST_APP_URL,
      framework: 'jest',
      format: 'javascript'
    });
    
    console.log('Test suite generation successful!');
    console.log('Generated test types:');
    
    // Save each test type to a separate file
    const fs = require('fs');
    const path = require('path');
    const outputDir = './generated-suite';
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    for (const [testType, result] of Object.entries(response.data.testSuites)) {
      const outputPath = path.join(outputDir, `${testType}-tests.js`);
      fs.writeFileSync(outputPath, result.testCode);
      console.log(`- ${testType}: saved to ${outputPath}`);
    }
    
    console.log('Full test suite saved to the generated-suite directory');
  } catch (error) {
    console.error('Error generating test suite:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Demonstrate using MCP to generate tests
 */
async function generateTestsViaMcp() {
  try {
    console.log('Generating tests via MCP protocol...');
    
    const response = await axios.post(`${SERVER_URL}/mcp/invoke`, {
      action: 'generate_tests',
      parameters: {
        url: TEST_APP_URL,
        framework: 'cypress',
        style: 'bdd',
        format: 'javascript',
        prompt: 'Generate tests for a TODO application with Cypress'
      },
      executionId: 'demo-execution-id-' + Date.now()
    });
    
    console.log('MCP test generation successful!');
    console.log('Preview of generated code:');
    console.log('-'.repeat(80));
    console.log(response.data.result.testCode.substring(0, 500) + '...');
    console.log('-'.repeat(80));
    
    // Save the generated tests to a file
    const fs = require('fs');
    const outputPath = './generated-cypress-tests.js';
    fs.writeFileSync(outputPath, response.data.result.testCode);
    
    console.log(`Full test code saved to ${outputPath}`);
  } catch (error) {
    console.error('Error generating tests via MCP:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run the demonstration
 */
async function runDemo() {
  // Check if Claude API key is set
  if (!process.env.CLAUDE_API_KEY) {
    console.error('CLAUDE_API_KEY environment variable is not set. Please add it to your .env file');
    return;
  }
  
  try {
    // Generate single test file
    await generateTests();
    console.log('\n');
    
    // Generate full test suite
    await generateFullTestSuite();
    console.log('\n');
    
    // Use MCP to generate tests
    await generateTestsViaMcp();
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

// Run the demo
runDemo();