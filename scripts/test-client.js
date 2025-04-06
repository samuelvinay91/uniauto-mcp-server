/**
 * Test client for UniAuto MCP Server
 * 
 * This script demonstrates how to call the MCP server directly without needing Smithery.
 */
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3000';
const MANIFEST_ENDPOINT = '/api/mcp/manifest';
const INVOKE_ENDPOINT = '/api/mcp/invoke';

/**
 * Get the MCP manifest
 */
async function getManifest() {
  try {
    const response = await axios.get(`${MCP_SERVER_URL}${MANIFEST_ENDPOINT}`);
    console.log('MCP Manifest:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error fetching manifest:', error.message);
  }
}

/**
 * Invoke an MCP action
 */
async function invokeAction(action, parameters) {
  try {
    const executionId = uuidv4();
    console.log(`Invoking action: ${action}, executionId: ${executionId}`);
    
    const response = await axios.post(`${MCP_SERVER_URL}${INVOKE_ENDPOINT}`, {
      action,
      parameters,
      executionId
    });
    
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error invoking action:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Run a simple automation test
 */
async function runTest() {
  // First get the manifest
  await getManifest();
  
  // Then perform some actions
  await invokeAction('navigate', { url: 'https://example.com' });
  
  // Wait before next action
  await invokeAction('wait', { milliseconds: 2000 });
  
  // Extract some text
  const extractResult = await invokeAction('extract', { 
    selector: 'h1', 
    attribute: 'textContent' 
  });
  
  console.log(`\nExtracted title: ${extractResult?.result?.data}`);
  
  // Take a screenshot
  await invokeAction('screenshot', {});
}

// Run the test
runTest().catch(console.error);