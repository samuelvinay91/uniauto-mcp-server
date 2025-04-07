/**
 * Advanced Testing Demo
 * 
 * This script demonstrates how to use the advanced testing capabilities
 * of the UniAuto MCP Server including:
 * - Visual comparison testing
 * - Accessibility testing
 * - Performance testing
 * - Network tracing
 * - Comprehensive test suite
 * 
 * Usage:
 * 1. Start the server: npm run dev
 * 2. Run this script: node examples/advanced-testing-demo.js
 */

const axios = require('axios');
require('dotenv').config();

// Server configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000/api';

// Example URL to test
const TEST_URL = 'https://demo.playwright.dev/todomvc';

/**
 * Run visual comparison testing
 */
async function runVisualComparison() {
  try {
    console.log(`Running visual comparison test for ${TEST_URL}...`);
    
    // First create a baseline
    const baselineResponse = await axios.post(`${SERVER_URL}/visual-compare`, {
      url: TEST_URL,
      updateBaseline: true,
      baselineName: 'todomvc_baseline'
    });
    
    console.log('Baseline created:', baselineResponse.data.baselinePath);
    
    // Then run a comparison
    const compareResponse = await axios.post(`${SERVER_URL}/visual-compare`, {
      url: TEST_URL,
      baselineName: 'todomvc_baseline',
      threshold: 0.1 // 0.1% difference threshold
    });
    
    console.log('Visual comparison complete!');
    console.log('Status:', compareResponse.data.status);
    console.log('Difference percentage:', compareResponse.data.diffPercentage.toFixed(4) + '%');
    console.log('Diff image:', compareResponse.data.diffPath);
  } catch (error) {
    console.error('Error in visual comparison:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run accessibility testing
 */
async function runAccessibilityTest() {
  try {
    console.log(`Running accessibility test for ${TEST_URL}...`);
    
    const response = await axios.post(`${SERVER_URL}/accessibility-test`, {
      url: TEST_URL,
      standard: 'wcag21aa' // WCAG 2.1 AA standard
    });
    
    console.log('Accessibility test complete!');
    console.log('Status:', response.data.status);
    console.log('Issues found:', response.data.issuesCount);
    
    if (response.data.issues && response.data.issues.length > 0) {
      console.log('\nTop issues:');
      response.data.issues.slice(0, 3).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.message} (${issue.impact} impact) - ${issue.selector}`);
      });
    }
    
    console.log('Full report:', response.data.reportPath);
  } catch (error) {
    console.error('Error in accessibility test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run performance testing
 */
async function runPerformanceTest() {
  try {
    console.log(`Running performance test for ${TEST_URL}...`);
    
    const response = await axios.post(`${SERVER_URL}/performance-test`, {
      url: TEST_URL,
      iterations: 2 // Run the test twice
    });
    
    console.log('Performance test complete!');
    console.log('Average metrics:');
    console.log('- Load time:', Math.round(response.data.averages.loadTime) + 'ms');
    console.log('- First contentful paint:', Math.round(response.data.averages.firstContentfulPaint) + 'ms');
    console.log('- Total resources:', Math.round(response.data.averages.totalResources));
    
    console.log('Full report:', response.data.reportPath);
  } catch (error) {
    console.error('Error in performance test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run network tracing
 */
async function runNetworkTrace() {
  try {
    console.log(`Running network trace for ${TEST_URL}...`);
    
    const response = await axios.post(`${SERVER_URL}/network-trace`, {
      url: TEST_URL
    });
    
    console.log('Network trace complete!');
    console.log('API requests captured:', response.data.requestCount);
    
    if (response.data.requests && response.data.requests.length > 0) {
      console.log('\nRequests:');
      response.data.requests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.method} ${req.url.substring(0, 60)}... (${req.status || 'no response'})`);
      });
    }
    
    console.log('Full trace:', response.data.tracePath);
  } catch (error) {
    console.error('Error in network trace:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run full test suite
 */
async function runTestSuite() {
  try {
    console.log(`Running full test suite for ${TEST_URL}...`);
    
    const response = await axios.post(`${SERVER_URL}/test-suite`, {
      url: TEST_URL,
      visual: true,
      accessibility: true,
      performance: true,
      network: true
    });
    
    console.log('Test suite complete!');
    console.log('Overall status:', response.data.status);
    console.log('Test summary:');
    console.log('- Visual:', response.data.summary.visual);
    console.log('- Accessibility:', response.data.summary.accessibility);
    console.log('- Performance:', response.data.summary.performance);
    console.log('- Network:', response.data.summary.network);
    console.log('Total duration:', Math.round(response.data.duration / 1000) + ' seconds');
    
    console.log('Full report:', response.data.reportPath);
  } catch (error) {
    console.error('Error in test suite:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run the demonstration
 */
async function runDemo() {
  try {
    // Run each test type
    await runVisualComparison();
    console.log('\n' + '-'.repeat(80) + '\n');
    
    await runAccessibilityTest();
    console.log('\n' + '-'.repeat(80) + '\n');
    
    await runPerformanceTest();
    console.log('\n' + '-'.repeat(80) + '\n');
    
    await runNetworkTrace();
    console.log('\n' + '-'.repeat(80) + '\n');
    
    // Run the full test suite
    await runTestSuite();
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

// Run the demo
runDemo();