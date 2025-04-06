/**
 * UniAuto MCP Server Demo
 * 
 * This script demonstrates the capabilities of the UniAuto MCP Server
 * by running a series of automation commands.
 */
const axios = require('axios');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3000';
const MANIFEST_ENDPOINT = '/api/mcp/manifest';
const INVOKE_ENDPOINT = '/api/mcp/invoke';

// Create readline interface for interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Get the MCP manifest
 */
async function getManifest() {
  try {
    const response = await axios.get(`${MCP_SERVER_URL}${MANIFEST_ENDPOINT}`);
    console.log('\n=== MCP Manifest ===');
    console.log(`Name: ${response.data.name}`);
    console.log(`Description: ${response.data.description}`);
    console.log(`Protocol: ${response.data.protocol || 'MCP'} v${response.data.protocolVersion || '1.0'}`);
    console.log('\nAvailable Actions:');
    response.data.actions.forEach(action => {
      console.log(`- ${action.name}: ${action.description}`);
    });
    console.log('\n');
    return response.data;
  } catch (error) {
    console.error('Error fetching manifest:', error.message);
    return null;
  }
}

/**
 * Invoke an MCP action
 */
async function invokeAction(action, parameters) {
  try {
    const executionId = uuidv4();
    console.log(`\nInvoking action: ${action}`);
    console.log(`Parameters: ${JSON.stringify(parameters)}`);
    console.log(`ExecutionId: ${executionId}`);
    
    const response = await axios.post(`${MCP_SERVER_URL}${INVOKE_ENDPOINT}`, {
      action,
      parameters,
      executionId
    });
    
    console.log('\nResponse:');
    console.log(`Status: ${response.data.status}`);
    console.log(`Result: ${JSON.stringify(response.data.result, null, 2)}`);
    return response.data;
  } catch (error) {
    console.error('Error invoking action:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

/**
 * Run a demo with a specific website
 */
async function runDemo(website) {
  console.log(`\n=== Starting UniAuto MCP Demo with ${website} ===\n`);
  
  // Get the manifest
  const manifest = await getManifest();
  if (!manifest) {
    console.error('Failed to get manifest. Is the server running?');
    process.exit(1);
  }
  
  // Navigate to the website
  console.log(`\n1. Navigating to ${website}...`);
  await invokeAction('navigate', { url: website });
  
  // Wait for page to load
  console.log('\n2. Waiting for 2 seconds...');
  await invokeAction('wait', { milliseconds: 2000 });
  
  // Extract the title
  console.log('\n3. Extracting the page title...');
  const titleResult = await invokeAction('extract', { 
    selector: 'title', 
    attribute: 'textContent' 
  });
  
  // Extract main heading
  console.log('\n4. Extracting the main heading...');
  const headingResult = await invokeAction('extract', { 
    selector: 'h1', 
    attribute: 'textContent' 
  });
  
  // Take a screenshot
  console.log('\n5. Taking a screenshot...');
  const screenshotResult = await invokeAction('screenshot', {});
  
  // Display summary
  console.log('\n=== Demo Results ===');
  console.log(`Website: ${website}`);
  console.log(`Title: ${titleResult?.result?.data || 'Not found'}`);
  console.log(`Heading: ${headingResult?.result?.data || 'Not found'}`);
  console.log(`Screenshot: ${screenshotResult?.result?.path || 'Failed to capture'}`);
  console.log('\n=== Demo Complete ===');
}

// Main function to run the demo
function main() {
  rl.question('Enter a website URL to test (or press Enter for example.com): ', (answer) => {
    const website = answer.trim() || 'https://example.com';
    runDemo(website).finally(() => {
      rl.close();
    });
  });
}

// Run the main function
main();