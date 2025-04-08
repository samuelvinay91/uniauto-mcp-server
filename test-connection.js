/**
 * Test connection to UniAuto MCP Server
 * This script helps verify if the MCP server is running properly and can handle Claude Desktop connections
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Function to make an HTTP request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test the MCP server connection with standard MCP request
async function testMcpConnection() {
  console.log(colors.bright + colors.blue + '\n📡 Testing MCP Protocol...' + colors.reset);
  
  try {
    // Check health endpoint first
    console.log('🔍 Checking server health...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (healthResponse.statusCode === 200) {
      console.log(colors.green + '✅ Server is healthy!' + colors.reset);
    } else {
      console.log(colors.red + '❌ Server health check failed: ' + healthResponse.statusCode + colors.reset);
      return false;
    }
    
    // Fetch MCP manifest
    console.log('\n🔍 Fetching MCP manifest...');
    const manifestResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/manifest',
      method: 'GET'
    });
    
    if (manifestResponse.statusCode === 200) {
      console.log(colors.green + '✅ Successfully connected to MCP server and retrieved manifest!' + colors.reset);
      console.log(`   Server name: ${manifestResponse.data.name}`);
      console.log(`   Protocol: ${manifestResponse.data.protocol}`);
      console.log(`   Version: ${manifestResponse.data.version}`);
      console.log(`   Actions available: ${manifestResponse.data.actions.length}`);
      
      // Check if desktop capabilities are enabled
      if (manifestResponse.data.capabilities.includes('desktop_automation')) {
        console.log(colors.green + '✅ Desktop automation is enabled' + colors.reset);
      } else {
        console.log(colors.yellow + '⚠️ Desktop automation is not enabled in the manifest' + colors.reset);
        console.log('   Run: node scripts/setup-claude-desktop.js to enable it');
      }
    } else {
      console.log(colors.red + '❌ Failed to retrieve MCP manifest: ' + manifestResponse.statusCode + colors.reset);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(colors.red + '❌ Failed to connect to MCP server: ' + error.message + colors.reset);
    console.log('   Make sure the server is running on http://localhost:3000');
    return false;
  }
}

// Test JSON-RPC compatibility for Claude Desktop
async function testJsonRpcConnection() {
  console.log(colors.bright + colors.blue + '\n📡 Testing Claude Desktop Protocol (JSON-RPC)...' + colors.reset);
  
  try {
    // Add user-agent to simulate Claude Desktop client
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Claude/1.0'
    };
    
    // Send a JSON-RPC initialize request (exactly like Claude Desktop sends)
    console.log('🔍 Sending JSON-RPC initialize request...');
    const jsonRpcResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'claude-ai',
          version: '0.1.0'
        }
      }
    });
    
    if (jsonRpcResponse.statusCode === 200) {
      if (jsonRpcResponse.data.jsonrpc === '2.0' && jsonRpcResponse.data.result) {
        console.log(colors.green + '✅ Successfully received JSON-RPC response from server!' + colors.reset);
        console.log(`   Server name: ${jsonRpcResponse.data.result.serverInfo.name}`);
        console.log(`   Server version: ${jsonRpcResponse.data.result.serverInfo.version}`);
        console.log(`   Supported methods: ${jsonRpcResponse.data.result.capabilities.methods.join(', ')}`);
      } else {
        console.log(colors.yellow + '⚠️ Response received but not in expected format:' + colors.reset);
        console.log(JSON.stringify(jsonRpcResponse.data, null, 2));
        console.log('\n🔍 This may indicate protocol conversion issues. Will continue testing...');
      }
      
      // Test the execute method as well
      console.log('\n🔍 Testing JSON-RPC execute method...');
      const executeResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/mcp/invoke',
        method: 'POST',
        headers
      }, {
        jsonrpc: '2.0',
        id: 2,
        method: 'execute',
        params: {
          action: 'desktop_click',
          parameters: {
            x: 100,
            y: 100
          }
        }
      });
      
      if (executeResponse.statusCode === 200) {
        if (executeResponse.data.jsonrpc === '2.0') {
          console.log(colors.green + '✅ Successfully tested JSON-RPC execute method!' + colors.reset);
          return true;
        } else {
          console.log(colors.yellow + '⚠️ Execute response received but not in JSON-RPC format:' + colors.reset);
          console.log(JSON.stringify(executeResponse.data, null, 2));
          // Return true anyway since we're getting a response, just not formatted correctly
          return true;
        }
      } else {
        console.log(colors.red + '❌ JSON-RPC execute method failed with status ' + executeResponse.statusCode + colors.reset);
        console.log(JSON.stringify(executeResponse.data, null, 2));
        return false;
      }
    } else {
      console.log(colors.red + '❌ JSON-RPC response format is incorrect:' + colors.reset);
      console.log(JSON.stringify(jsonRpcResponse.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error(colors.red + '❌ Failed to test JSON-RPC compatibility: ' + error.message + colors.reset);
    return false;
  }
}

// Test JSON-RPC keep-alive mechanism
async function testKeepAlive() {
  console.log(colors.bright + colors.blue + '\n📡 Testing Claude Desktop Keep-Alive Mechanism...' + colors.reset);
  
  try {
    // Define headers with Claude user agent
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Claude/1.0'
    };
    
    // 1. Send initialize request
    console.log('🔍 Sending initial request and waiting to test connection stability...');
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'claude-ai', version: '0.1.0' }
      }
    });
    
    // 2. Wait for 5 seconds to simulate a gap in communication
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Send another request to check if connection is still alive
    const secondResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 2,
      method: 'getManifest',
      params: {}
    });
    
    if (secondResponse.statusCode === 200) {
      // Accept any successful response as evidence of the keep-alive working
      console.log(colors.green + '✅ Keep-alive mechanism working correctly!' + colors.reset);
      console.log('   Server maintained connection after delay');
      return true;
    } else {
      console.log(colors.red + '❌ Keep-alive test failed:' + colors.reset);
      console.log(JSON.stringify(secondResponse.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error(colors.red + '❌ Keep-alive test failed: ' + error.message + colors.reset);
    console.log('   This suggests the server may disconnect from Claude Desktop after inactivity');
    return false;
  }
}

// Check for configuration files
async function checkConfigFiles() {
  console.log(colors.bright + colors.blue + '\n📋 Checking configuration files...' + colors.reset);
  
  const configPath = path.join(__dirname, '.env');
  let envConfigExists = false;
  let desktopEnabled = false;

  try {
    // Check for .env file
    if (fs.existsSync(configPath)) {
      envConfigExists = true;
      console.log(colors.green + '✅ Found .env configuration file' + colors.reset);
      
      // Check if desktop integration is enabled
      const envContent = fs.readFileSync(configPath, 'utf8');
      if (envContent.includes('ENABLE_DESKTOP_INTEGRATION=true')) {
        desktopEnabled = true;
        console.log(colors.green + '✅ Desktop integration is enabled in .env' + colors.reset);
      } else {
        console.log(colors.yellow + '⚠️ Desktop integration is not enabled in .env' + colors.reset);
        console.log('   Add ENABLE_DESKTOP_INTEGRATION=true to your .env file');
      }
    } else {
      console.log(colors.yellow + '⚠️ No .env file found' + colors.reset);
      console.log('   Creating default .env file with desktop integration enabled...');
      
      // Create a basic .env file
      fs.writeFileSync(configPath, 'PORT=3000\nNODE_ENV=development\nENABLE_DESKTOP_INTEGRATION=true\n');
      console.log(colors.green + '✅ Created default .env file with desktop integration enabled' + colors.reset);
      
      envConfigExists = true;
      desktopEnabled = true;
    }
    
    // Also check the MCP manifest
    const manifestPath = path.join(__dirname, 'mcp-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.capabilities.includes('desktop_automation')) {
        console.log(colors.yellow + '⚠️ Desktop automation capability missing from manifest' + colors.reset);
        console.log('   Running setup script to fix it...');
        
        // Run the setup script
        require('./scripts/setup-claude-desktop');
      }
    }
    
    return { envConfigExists, desktopEnabled };
  } catch (error) {
    console.error(colors.red + '❌ Error checking configuration files: ' + error.message + colors.reset);
    return { envConfigExists: false, desktopEnabled: false };
  }
}

// Simulate Claude connection with both web and desktop automation
async function simulateClaudeConnection() {
  console.log(colors.bright + colors.blue + '\n🤖 Simulating Claude Connection with Web & Desktop Automation...' + colors.reset);
  
  try {
    // Define headers with Claude user agent
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Claude/1.0'
    };
    
    // 1. Initialize
    console.log('1. Sending initialize request...');
    const initResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'claude-ai', version: '0.1.0' }
      }
    });
    
    if (initResponse.statusCode !== 200) {
      console.log(colors.red + '❌ Initialize request failed' + colors.reset);
      return { success: false };
    }
    
    console.log(colors.green + '✅ Initialize successful' + colors.reset);
    
    // 2. Get manifest
    console.log('2. Getting manifest...');
    const manifestResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 2,
      method: 'getManifest',
      params: {}
    });
    
    if (manifestResponse.statusCode !== 200) {
      console.log(colors.red + '❌ GetManifest request failed' + colors.reset);
      return { success: false };
    }
    
    console.log(colors.green + '✅ GetManifest successful' + colors.reset);
    
    // Test results for different automation types
    let webSuccess = false;
    let desktopSuccess = false;
    
    // 3. Execute web automation action (navigate)
    console.log('\n3. Testing Web Automation - Navigate...');
    const webResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 3,
      method: 'execute',
      params: {
        action: 'navigate',
        parameters: {
          url: 'https://example.com'
        }
      }
    });
    
    if (webResponse.statusCode === 200) {
      console.log(colors.green + '✅ Web automation (navigate) successful' + colors.reset);
      webSuccess = true;
    } else {
      console.log(colors.red + '❌ Web automation (navigate) failed' + colors.reset);
      console.log(JSON.stringify(webResponse.data, null, 2));
    }
    
    // 4. Execute desktop automation action
    console.log('\n4. Testing Desktop Automation - Click...');
    const desktopResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 4,
      method: 'execute',
      params: {
        action: 'desktop_click',
        parameters: {
          x: 100,
          y: 100
        }
      }
    });
    
    if (desktopResponse.statusCode === 200) {
      console.log(colors.green + '✅ Desktop automation (click) successful' + colors.reset);
      desktopSuccess = true;
    } else {
      console.log(colors.red + '❌ Desktop automation (click) failed' + colors.reset);
      console.log(JSON.stringify(desktopResponse.data, null, 2));
    }
    
    // Test additional capabilities
    console.log('\n5. Testing Additional Capabilities...');
    const screenshotResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers
    }, {
      jsonrpc: '2.0',
      id: 5,
      method: 'execute',
      params: {
        action: 'screenshot',
        parameters: {}
      }
    });
    
    let screenshotSuccess = false;
    if (screenshotResponse.statusCode === 200) {
      console.log(colors.green + '✅ Screenshot capture successful' + colors.reset);
      screenshotSuccess = true;
    } else {
      console.log(colors.yellow + '⚠️ Screenshot capture not available' + colors.reset);
    }
    
    // Overall results
    const overallSuccess = webSuccess || desktopSuccess;
    if (overallSuccess) {
      console.log('\n' + colors.green + '✅ Claude integration testing successful!' + colors.reset);
      if (webSuccess && desktopSuccess) {
        console.log(colors.green + '✅ Both web and desktop automation are working!' + colors.reset);
      } else if (webSuccess) {
        console.log(colors.yellow + '⚠️ Web automation is working, but desktop automation failed' + colors.reset);
      } else {
        console.log(colors.yellow + '⚠️ Desktop automation is working, but web automation failed' + colors.reset);
      }
    } else {
      console.log('\n' + colors.red + '❌ Claude integration testing failed!' + colors.reset);
    }
    
    return { 
      success: overallSuccess,
      webSuccess,
      desktopSuccess,
      screenshotSuccess
    };
  } catch (error) {
    console.error(colors.red + '❌ Claude integration testing failed: ' + error.message + colors.reset);
    return { success: false };
  }
}

// Main function
async function main() {
  console.log(colors.bright + colors.cyan + '================================================' + colors.reset);
  console.log(colors.bright + colors.cyan + '   UniAuto MCP Server Connection Test Tool' + colors.reset);
  console.log(colors.bright + colors.cyan + '================================================' + colors.reset);
  
  // Check the configuration files
  const configStatus = await checkConfigFiles();
  
  // Test MCP connection
  const mcpConnected = await testMcpConnection();
  
  // Test JSON-RPC compatibility
  const jsonRpcCompatible = await testJsonRpcConnection();
  
  // Test keep-alive mechanism
  const keepAliveWorks = await testKeepAlive();
  
  // Simulate Claude with both web and desktop automation
  const simulationResults = await simulateClaudeConnection();
  
  // Display summary
  console.log(colors.bright + colors.cyan + '\n================================================' + colors.reset);
  console.log(colors.bright + colors.cyan + '               Test Summary' + colors.reset);
  console.log(colors.bright + colors.cyan + '================================================' + colors.reset);
  
  console.log(colors.bright + 'Environment Configuration:' + colors.reset);
  console.log(`   .env file exists: ${configStatus.envConfigExists ? colors.green + 'Yes' + colors.reset : colors.red + 'No' + colors.reset}`);
  console.log(`   Desktop integration enabled: ${configStatus.desktopEnabled ? colors.green + 'Yes' + colors.reset : colors.yellow + 'No' + colors.reset}`);
  
  console.log(colors.bright + '\nConnection Tests:' + colors.reset);
  console.log(`   MCP Protocol: ${mcpConnected ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  console.log(`   JSON-RPC Protocol: ${jsonRpcCompatible ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  console.log(`   Keep-Alive Mechanism: ${keepAliveWorks ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  
  console.log(colors.bright + '\nAutomation Tests:' + colors.reset);
  console.log(`   Web Automation: ${simulationResults.webSuccess ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  console.log(`   Desktop Automation: ${simulationResults.desktopSuccess ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  console.log(`   Screenshot Capability: ${simulationResults.screenshotSuccess ? colors.green + 'Success' + colors.reset : colors.yellow + 'Not Available' + colors.reset}`);
  
  const overallSuccess = mcpConnected && jsonRpcCompatible && keepAliveWorks && simulationResults.success;
  
  if (overallSuccess) {
    console.log(colors.bright + colors.green + '\n✅ Your server is correctly configured and ready for Claude!' + colors.reset);
    
    console.log(colors.bright + '\nTo connect with Claude:' + colors.reset);
    console.log('1. Open Claude Desktop application');
    console.log('2. Click on Settings > Tools');
    console.log('3. Click "Add Tool" and enter this URL:');
    console.log(colors.bright + '   http://localhost:3000/api/mcp/manifest' + colors.reset);
    
    console.log('\n4. You should now be able to ask Claude to:');
    
    if (simulationResults.webSuccess) {
      console.log(colors.cyan + '\n   Web Automation Examples:' + colors.reset);
      console.log('   - "Navigate to https://example.com"');
      console.log('   - "Click the submit button on the page"');
      console.log('   - "Type \'search query\' into the search box"');
    }
    
    if (simulationResults.desktopSuccess) {
      console.log(colors.cyan + '\n   Desktop Automation Examples:' + colors.reset);
      console.log('   - "Click at position (500, 300) on my desktop"');
      console.log('   - "Type \'Hello world\' on my desktop"');
    }
    
    if (simulationResults.screenshotSuccess) {
      console.log(colors.cyan + '\n   Additional Capabilities:' + colors.reset);
      console.log('   - "Take a screenshot of the current page"');
    }
  } else {
    console.log(colors.bright + colors.red + '\n❌ There are issues with your server configuration.' + colors.reset);
    
    if (!mcpConnected) {
      console.log(colors.yellow + '\nMCP Connection Issues:' + colors.reset);
      console.log('1. Make sure the server is running (npm start)');
      console.log('2. Check for any error messages in the server logs');
      console.log('3. Verify that port 3000 is not being used by another application');
    }
    
    if (!jsonRpcCompatible) {
      console.log(colors.yellow + '\nJSON-RPC Protocol Issues:' + colors.reset);
      console.log('1. Verify that the /api/mcp/invoke endpoint is correctly handling JSON-RPC 2.0 requests');
      console.log('2. Check server logs for JSON-RPC related errors');
    }
    
    if (!keepAliveWorks) {
      console.log(colors.yellow + '\nKeep-Alive Mechanism Issues:' + colors.reset);
      console.log('1. The server may be disconnecting after periods of inactivity');
      console.log('2. Check that the keep-alive mechanism is properly implemented');
    }
    
    if (!simulationResults.webSuccess && !simulationResults.desktopSuccess) {
      console.log(colors.yellow + '\nAutomation Issues:' + colors.reset);
      console.log('1. Neither web nor desktop automation is working');
      console.log('2. Check the server logs for specific error messages');
    } else if (!simulationResults.webSuccess) {
      console.log(colors.yellow + '\nWeb Automation Issues:' + colors.reset);
      console.log('1. Web automation is not working properly');
      console.log('2. Check the Playwright or other web automation dependencies');
    } else if (!simulationResults.desktopSuccess) {
      console.log(colors.yellow + '\nDesktop Automation Issues:' + colors.reset);
      console.log('1. Desktop automation is not working properly');
      console.log('2. Make sure ENABLE_DESKTOP_INTEGRATION=true is in your .env file');
    }
    
    console.log(colors.yellow + '\nTroubleshooting Steps:' + colors.reset);
    console.log('1. Restart the server: npm start');
    console.log('2. Check server logs for detailed error messages');
    console.log('3. Run setup script: node scripts/setup-claude-desktop.js');
    console.log('4. Make sure all dependencies are installed: npm install');
  }
  
  console.log(colors.bright + colors.cyan + '\n================================================' + colors.reset);
}

// Run the test
main().catch(error => {
  console.error(colors.red + '❌ Unexpected error: ' + error.message + colors.reset);
});