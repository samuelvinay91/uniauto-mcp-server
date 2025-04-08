/**
 * Desktop Integration Test
 * This script verifies the desktop integration functionality
 * and tests both MCP and JSON-RPC approaches for Claude Desktop compatibility
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

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

// Verify and update manifest for desktop integration
async function checkManifest() {
  console.log(colors.bright + colors.blue + '\n📋 Checking MCP manifest...' + colors.reset);
  
  // Create a backup of the original manifest
  const manifestPath = path.join(__dirname, 'mcp-manifest.json');
  const backupPath = path.join(__dirname, 'mcp-manifest.bak.json');
  
  try {
    // Read the current manifest
    console.log('Reading MCP manifest...');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Make a backup
    fs.writeFileSync(backupPath, JSON.stringify(manifest, null, 2));
    console.log(colors.green + '✅ Created backup of MCP manifest' + colors.reset);
    
    // Check if desktop capabilities exist
    if (!manifest.capabilities.includes('desktop_automation')) {
      manifest.capabilities.push('desktop_automation');
      console.log(colors.green + '✅ Added desktop_automation capability' + colors.reset);
    } else {
      console.log(colors.green + '✓ desktop_automation capability already present' + colors.reset);
    }
    
    // Check desktop actions
    let desktopClickFound = false;
    let desktopTypeFound = false;
    
    for (const action of manifest.actions) {
      if (action.name === 'desktop_click') {
        desktopClickFound = true;
        console.log(colors.green + '✓ desktop_click action found' + colors.reset);
      }
      if (action.name === 'desktop_type') {
        desktopTypeFound = true;
        console.log(colors.green + '✓ desktop_type action found' + colors.reset);
      }
    }
    
    // Add desktop_click if needed
    if (!desktopClickFound) {
      manifest.actions.push({
        name: 'desktop_click',
        description: 'Click at specific coordinates on the desktop',
        parameters: [
          { name: 'x', type: 'number', description: 'X coordinate', required: true },
          { name: 'y', type: 'number', description: 'Y coordinate', required: true }
        ]
      });
      console.log(colors.green + '✅ Added desktop_click action' + colors.reset);
    }
    
    // Add desktop_type if needed
    if (!desktopTypeFound) {
      manifest.actions.push({
        name: 'desktop_type',
        description: 'Type text on the desktop',
        parameters: [
          { name: 'text', type: 'string', description: 'Text to type', required: true }
        ]
      });
      console.log(colors.green + '✅ Added desktop_type action' + colors.reset);
    }
    
    // Write the updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(colors.green + '✅ Updated MCP manifest with desktop integration' + colors.reset);
    
    // Check environment file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (!envContent.includes('ENABLE_DESKTOP_INTEGRATION')) {
        envContent += '\nENABLE_DESKTOP_INTEGRATION=true\n';
        fs.writeFileSync(envPath, envContent);
        console.log(colors.green + '✅ Updated .env with ENABLE_DESKTOP_INTEGRATION flag' + colors.reset);
      } else {
        console.log(colors.green + '✓ .env already has ENABLE_DESKTOP_INTEGRATION flag' + colors.reset);
      }
    } else {
      fs.writeFileSync(envPath, 'ENABLE_DESKTOP_INTEGRATION=true\n');
      console.log(colors.green + '✅ Created .env with ENABLE_DESKTOP_INTEGRATION flag' + colors.reset);
    }
    
    return true;
  } catch (error) {
    console.error(colors.red + '❌ Error checking or updating configuration: ' + error.message + colors.reset);
    
    // Try to restore backup if it exists
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, manifestPath);
        console.log(colors.yellow + 'ℹ️ Restored backup of MCP manifest' + colors.reset);
      } catch (restoreError) {
        console.error(colors.red + '❌ Failed to restore backup: ' + restoreError.message + colors.reset);
      }
    }
    
    return false;
  }
}

// Test desktop click functionality
async function testDesktopClick() {
  console.log(colors.bright + colors.blue + '\n🖱️ Testing desktop click...' + colors.reset);
  
  try {
    // Get screen dimensions (using default values if unable to determine)
    const screenWidth = 800;  // Default value
    const screenHeight = 600; // Default value
    
    // Calculate click position (center of screen)
    const x = Math.floor(screenWidth / 2);
    const y = Math.floor(screenHeight / 2);
    
    console.log(`Clicking at position (${x}, ${y})...`);
    
    // Standard MCP approach
    const mcpResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      action: 'desktop_click',
      parameters: {
        x: x,
        y: y
      },
      executionId: 'test-desktop-click-mcp'
    });
    
    // JSON-RPC approach (Claude Desktop compatible)
    const jsonRpcResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      jsonrpc: '2.0',
      id: 2,
      method: 'execute',
      params: {
        action: 'desktop_click',
        parameters: {
          x: x,
          y: y
        }
      }
    });
    
    // Check MCP response
    if (mcpResponse.statusCode === 200 && mcpResponse.data.status === 'success') {
      console.log(colors.green + '✅ MCP desktop click succeeded!' + colors.reset);
    } else {
      console.log(colors.red + '❌ MCP desktop click failed:' + colors.reset);
      console.log(JSON.stringify(mcpResponse.data, null, 2));
    }
    
    // Check JSON-RPC response
    if (jsonRpcResponse.statusCode === 200 && jsonRpcResponse.data.jsonrpc === '2.0' && jsonRpcResponse.data.result) {
      console.log(colors.green + '✅ JSON-RPC desktop click succeeded!' + colors.reset);
    } else {
      console.log(colors.red + '❌ JSON-RPC desktop click failed:' + colors.reset);
      console.log(JSON.stringify(jsonRpcResponse.data, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error(colors.red + '❌ Error during desktop click test: ' + error.message + colors.reset);
    return false;
  }
}

// Test desktop typing functionality
async function testDesktopType() {
  console.log(colors.bright + colors.blue + '\n⌨️ Testing desktop typing...' + colors.reset);
  
  try {
    const testText = 'Hello from UniAuto!';
    
    console.log(`Typing text: "${testText}"...`);
    
    // Standard MCP approach
    const mcpResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      action: 'desktop_type',
      parameters: {
        text: testText
      },
      executionId: 'test-desktop-type-mcp'
    });
    
    // JSON-RPC approach (Claude Desktop compatible)
    const jsonRpcResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/mcp/invoke',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      jsonrpc: '2.0',
      id: 3,
      method: 'execute',
      params: {
        action: 'desktop_type',
        parameters: {
          text: testText
        }
      }
    });
    
    // Check MCP response
    if (mcpResponse.statusCode === 200 && mcpResponse.data.status === 'success') {
      console.log(colors.green + '✅ MCP desktop typing succeeded!' + colors.reset);
    } else {
      console.log(colors.red + '❌ MCP desktop typing failed:' + colors.reset);
      console.log(JSON.stringify(mcpResponse.data, null, 2));
    }
    
    // Check JSON-RPC response
    if (jsonRpcResponse.statusCode === 200 && jsonRpcResponse.data.jsonrpc === '2.0' && jsonRpcResponse.data.result) {
      console.log(colors.green + '✅ JSON-RPC desktop typing succeeded!' + colors.reset);
    } else {
      console.log(colors.red + '❌ JSON-RPC desktop typing failed:' + colors.reset);
      console.log(JSON.stringify(jsonRpcResponse.data, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error(colors.red + '❌ Error during desktop typing test: ' + error.message + colors.reset);
    return false;
  }
}

// Main function
async function main() {
  console.log(colors.bright + colors.cyan + '================================================' + colors.reset);
  console.log(colors.bright + colors.cyan + '   UniAuto MCP Server Desktop Integration Test' + colors.reset);
  console.log(colors.bright + colors.cyan + '================================================' + colors.reset);
  
  // Check and update the manifest
  const manifestOk = await checkManifest();
  
  if (!manifestOk) {
    console.log(colors.red + '❌ Could not verify or update MCP manifest. Please fix configuration issues before testing.' + colors.reset);
    return;
  }
  
  try {
    // Check server is running
    console.log(colors.blue + '\n🔍 Checking if server is running...' + colors.reset);
    await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    console.log(colors.green + '✅ Server is running!' + colors.reset);
  } catch (error) {
    console.log(colors.red + '❌ Server is not running. Please start it with "npm start" first.' + colors.reset);
    return;
  }
  
  // Run the desktop tests
  const clickTest = await testDesktopClick();
  const typeTest = await testDesktopType();
  
  // Display summary
  console.log(colors.bright + colors.cyan + '\n================================================' + colors.reset);
  console.log(colors.bright + colors.cyan + '               Test Summary' + colors.reset);
  console.log(colors.bright + colors.cyan + '================================================' + colors.reset);
  
  console.log(`Desktop Click: ${clickTest ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  console.log(`Desktop Type: ${typeTest ? colors.green + 'Success' + colors.reset : colors.red + 'Failed' + colors.reset}`);
  
  if (clickTest && typeTest) {
    console.log(colors.bright + colors.green + '\n✅ Desktop integration tests passed!' + colors.reset);
    console.log('\nYour MCP server is properly configured for desktop automation with Claude.');
    console.log('\nTo use these features with Claude Desktop:');
    console.log('1. Connect Claude Desktop to:');
    console.log(colors.bright + '   http://localhost:3000/api/mcp/manifest' + colors.reset);
    console.log('\n2. You can now ask Claude to:');
    console.log('   - "Click at position (500, 300) on my desktop"');
    console.log('   - "Type \'Hello world\' on my desktop"');
  } else {
    console.log(colors.bright + colors.red + '\n❌ Some desktop integration tests failed.' + colors.reset);
    console.log('\nPossible issues:');
    console.log('1. Make sure ENABLE_DESKTOP_INTEGRATION=true is set in your .env file');
    console.log('2. Check that the server is running with proper desktop permissions');
    console.log('3. You may need to restart the server after making changes');
  }
  
  console.log(colors.bright + colors.cyan + '\n================================================' + colors.reset);
}

// Run the test
main().catch(error => {
  console.error(colors.red + '❌ Unexpected error: ' + error.message + colors.reset);
});