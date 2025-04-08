/**
 * Claude Desktop Setup Helper
 * This script checks and configures the MCP server for Claude Desktop integration
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// Utility function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Check if server is running
async function checkServer() {
  try {
    console.log('Checking if MCP server is running...');
    const manifest = await makeRequest('http://localhost:3000/api/mcp/manifest');
    console.log('✅ MCP server is running');
    return true;
  } catch (error) {
    console.log('❌ MCP server is not running');
    return false;
  }
}

// Update MCP manifest for desktop integration
function updateManifest() {
  console.log('\nEnsuring MCP manifest is configured for Claude Desktop...');
  
  const manifestPath = path.join(__dirname, '..', 'mcp-manifest.json');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check if desktop capabilities are already present
    if (!manifest.capabilities.includes('desktop_automation')) {
      manifest.capabilities.push('desktop_automation');
      console.log('✅ Added desktop_automation capability');
    } else {
      console.log('✓ desktop_automation capability already present');
    }
    
    // Make sure desktop actions are included
    let hasDesktopClick = false;
    let hasDesktopType = false;
    
    for (const action of manifest.actions) {
      if (action.name === 'desktop_click') hasDesktopClick = true;
      if (action.name === 'desktop_type') hasDesktopType = true;
    }
    
    if (!hasDesktopClick) {
      manifest.actions.push({
        "name": "desktop_click",
        "description": "Click at specific coordinates on the desktop",
        "parameters": [
          { "name": "x", "type": "number", "description": "X coordinate", "required": true },
          { "name": "y", "type": "number", "description": "Y coordinate", "required": true }
        ]
      });
      console.log('✅ Added desktop_click action');
    }
    
    if (!hasDesktopType) {
      manifest.actions.push({
        "name": "desktop_type",
        "description": "Type text on the desktop",
        "parameters": [
          { "name": "text", "type": "string", "description": "Text to type", "required": true }
        ]
      });
      console.log('✅ Added desktop_type action');
    }
    
    // Update the manifest file
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ MCP manifest updated successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to update MCP manifest:', error.message);
    return false;
  }
}

// Update Smithery config if it exists
function updateSmitheryConfig() {
  console.log('\nUpdating Smithery configuration...');
  
  const yamlPath = path.join(__dirname, '..', 'smithery.yaml');
  const jsonPath = path.join(__dirname, '..', 'smithery.json');
  
  try {
    // Update smithery.json if it exists
    if (fs.existsSync(jsonPath)) {
      const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      if (!config.capabilities || !config.capabilities.includes('desktop_automation')) {
        config.capabilities = config.capabilities || [];
        config.capabilities.push('desktop_automation');
        fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
        console.log('✅ Updated smithery.json with desktop capabilities');
      } else {
        console.log('✓ smithery.json already has desktop capabilities');
      }
    }
    
    // Update .env file if needed
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (!envContent.includes('ENABLE_DESKTOP_INTEGRATION')) {
        envContent += '\nENABLE_DESKTOP_INTEGRATION=true\n';
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env with ENABLE_DESKTOP_INTEGRATION flag');
      } else {
        console.log('✓ .env already has ENABLE_DESKTOP_INTEGRATION flag');
      }
    }
    
    console.log('✅ Configuration files updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to update configuration:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('==============================================');
  console.log('UniAuto MCP Server - Claude Desktop Setup');
  console.log('==============================================\n');
  
  // Step 1: Update the manifest
  const manifestUpdated = updateManifest();
  
  // Step 2: Update Smithery config
  const configUpdated = updateSmitheryConfig();
  
  // Step 3: Check if server is running
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n⚠️ MCP server is not running. Starting it now...');
    try {
      // Start the server in a detached process
      require('child_process').spawn('node', ['src/index.js'], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      
      console.log('✅ MCP server started');
      console.log('Please wait a few seconds for the server to initialize...');
      
      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check again
      const serverRunningNow = await checkServer();
      if (!serverRunningNow) {
        console.log('❌ Failed to start the server. Please start it manually with: npm start');
      }
    } catch (error) {
      console.error('❌ Failed to start the server:', error.message);
      console.log('Please start it manually with: npm start');
    }
  }
  
  console.log('\n==============================================');
  console.log('Setup Complete!');
  console.log('==============================================');
  console.log('\nTo connect with Claude Desktop:');
  console.log('1. Make sure the server is running: npm start');
  console.log('2. In Claude Desktop, click on "Settings" > "Tools"');
  console.log('3. Click "Add Tool" and enter: http://localhost:3000/api/mcp/manifest');
  console.log('4. Authorize the connection when prompted');
  console.log('\nFor Smithery integration:');
  console.log('1. Run: npx @smithery/cli connect --server localhost:3000/api');
  console.log('2. Run: npx @smithery/cli connect --client claude');
  console.log('\nHappy automating! 🚀');
}

// Run the script
main().catch(console.error);