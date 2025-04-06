/**
 * Test MCP integration with a simple sequence of commands
 */
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3000';
const MANIFEST_ENDPOINT = '/api/mcp/manifest';
const INVOKE_ENDPOINT = '/api/mcp/invoke';

/**
 * Invoke an MCP action
 */
async function invokeAction(action, parameters) {
  try {
    const executionId = uuidv4();
    console.log(`\nInvoking action: ${action}`);
    console.log(`Parameters: ${JSON.stringify(parameters)}`);
    
    const response = await axios.post(`${MCP_SERVER_URL}${INVOKE_ENDPOINT}`, {
      action,
      parameters,
      executionId
    });
    
    console.log(`Status: ${response.data.status}`);
    console.log(`Result: ${JSON.stringify(response.data.result, null, 2)}`);
    return response.data;
  } catch (error) {
    console.error(`Error invoking action ${action}:`, error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return null;
  }
}

/**
 * Get the MCP manifest
 */
async function getManifest() {
  try {
    const response = await axios.get(`${MCP_SERVER_URL}${MANIFEST_ENDPOINT}`);
    console.log('MCP Manifest:');
    console.log(`Name: ${response.data.name}`);
    console.log(`Protocol: ${response.data.protocol || 'MCP'} ${response.data.protocolVersion || '1.0'}`);
    
    console.log('\nAvailable Actions:');
    response.data.actions.forEach(action => {
      console.log(`- ${action.name}: ${action.description}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching manifest:', error.message);
    return null;
  }
}

/**
 * Run a test sequence
 */
async function runTestSequence() {
  console.log('Testing MCP Integration with UniAuto Server\n');
  
  // Get the manifest
  await getManifest();
  
  // Run a sequence of actions
  console.log('\n--- Running Test Sequence ---');
  
  // 1. Navigate to example.com
  await invokeAction('navigate', { url: 'https://example.com' });
  
  // 2. Wait for page to load
  await invokeAction('wait', { milliseconds: 1000 });
  
  // 3. Extract the title
  const titleResult = await invokeAction('extract', { 
    selector: 'title', 
    attribute: 'textContent' 
  });
  
  // 4. Extract the heading
  const headingResult = await invokeAction('extract', { 
    selector: 'h1', 
    attribute: 'textContent' 
  });
  
  // 5. Take a screenshot
  await invokeAction('screenshot', {});
  
  console.log('\n--- Test Summary ---');
  console.log(`Title: ${titleResult?.result?.data || 'Not found'}`);
  console.log(`Heading: ${headingResult?.result?.data || 'Not found'}`);
  console.log('\nTest completed!');
}

// Run the test
runTestSequence().catch(console.error);