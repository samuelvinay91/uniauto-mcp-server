#!/usr/bin/env node

/**
 * This script verifies the Claude Desktop MCP configuration is properly set up.
 * It checks for all required components without modifying any configuration.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
require('dotenv').config();

// Basic colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Print header
console.log(`\n${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.cyan}     UniAuto MCP - Claude Desktop Setup Verification${colors.reset}`);
console.log(`${colors.cyan}====================================================${colors.reset}\n`);

// Determine Claude Desktop config path based on OS
let claudeConfigPath;
if (process.platform === 'win32') {
  claudeConfigPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
} else if (process.platform === 'darwin') {
  claudeConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
} else {
  // Linux or other platform
  claudeConfigPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
}

// Function to check if server is running
function checkServer(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ running: true, status: data });
        } else {
          resolve({ running: false, error: `HTTP Status: ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({ running: false, error: err.message });
    });
    
    req.setTimeout(3000, () => {
      req.abort();
      resolve({ running: false, error: 'Connection timeout' });
    });
  });
}

async function verifySetup() {
  const results = {
    envFile: false,
    claudeApiKey: false,
    claudeDesktopConfig: false,
    mcpServerConfig: false,
    serverRunning: false
  };
  
  // Check .env file
  console.log(`${colors.blue}Checking environment configuration...${colors.reset}`);
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    results.envFile = true;
    console.log(`${colors.green}✓ .env file exists${colors.reset}`);
    
    // Check for Claude API Key
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('CLAUDE_API_KEY=') && 
        !envContent.includes('CLAUDE_API_KEY=your_claude_api_key') &&
        process.env.CLAUDE_API_KEY && 
        process.env.CLAUDE_API_KEY.length > 10) {
      results.claudeApiKey = true;
      console.log(`${colors.green}✓ Claude API key is configured${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Claude API key is missing or invalid${colors.reset}`);
    }
    
    // Check for PORT configuration
    const portMatch = envContent.match(/PORT=(\d+)/);
    const port = portMatch ? portMatch[1] : '3001';
    console.log(`${colors.blue}• Server port: ${port}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ .env file is missing${colors.reset}`);
  }
  
  // Check Claude Desktop config
  console.log(`\n${colors.blue}Checking Claude Desktop configuration...${colors.reset}`);
  if (fs.existsSync(claudeConfigPath)) {
    results.claudeDesktopConfig = true;
    console.log(`${colors.green}✓ Claude Desktop config exists at:${colors.reset}`);
    console.log(`  ${claudeConfigPath}`);
    
    try {
      const config = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
      if (config.mcpServers && config.mcpServers.uniauto) {
        results.mcpServerConfig = true;
        console.log(`${colors.green}✓ UniAuto MCP Server configuration found${colors.reset}`);
        
        // Display configuration details
        const uniautoConfig = config.mcpServers.uniauto;
        console.log(`${colors.blue}• Command: ${uniautoConfig.command}${colors.reset}`);
        console.log(`${colors.blue}• Args: ${JSON.stringify(uniautoConfig.args)}${colors.reset}`);
        console.log(`${colors.blue}• Disabled: ${uniautoConfig.disabled}${colors.reset}`);
        
        // Check if config has API key
        if (uniautoConfig.env && uniautoConfig.env.CLAUDE_API_KEY) {
          console.log(`${colors.green}✓ Claude API key is configured in Desktop settings${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠ Claude API key not found in Desktop settings${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}✗ UniAuto MCP Server configuration not found in Claude Desktop config${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Error parsing Claude Desktop config: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ Claude Desktop config file not found${colors.reset}`);
    console.log(`  Expected location: ${claudeConfigPath}`);
  }
  
  // Check if server is running
  console.log(`\n${colors.blue}Checking if UniAuto MCP Server is running...${colors.reset}`);
  const port = process.env.PORT || 3001;
  const serverStatus = await checkServer(port);
  
  if (serverStatus.running) {
    results.serverRunning = true;
    console.log(`${colors.green}✓ Server is running on port ${port}${colors.reset}`);
    console.log(`${colors.green}✓ Health check response: ${serverStatus.status}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Server is not running: ${serverStatus.error}${colors.reset}`);
    console.log(`${colors.yellow}⚠ You need to start the server with 'npm start'${colors.reset}`);
  }
  
  // Overall status
  console.log(`\n${colors.cyan}=== Overall Setup Status ===${colors.reset}`);
  const successCount = Object.values(results).filter(r => r).length;
  const totalChecks = Object.keys(results).length;
  const percentage = Math.round((successCount / totalChecks) * 100);
  
  console.log(`${colors.blue}Setup completion: ${percentage}% (${successCount}/${totalChecks} checks passed)${colors.reset}`);
  
  if (percentage === 100) {
    console.log(`\n${colors.green}✓ Your Claude Desktop MCP setup is complete and ready to use!${colors.reset}`);
    console.log(`${colors.green}✓ Try testing with 'node scripts/test-claude-desktop.js'${colors.reset}`);
  } else if (percentage >= 60) {
    console.log(`\n${colors.yellow}⚠ Your Claude Desktop MCP setup is partially complete.${colors.reset}`);
    console.log(`${colors.yellow}⚠ Please address the issues above to complete the setup.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Your Claude Desktop MCP setup needs attention.${colors.reset}`);
    console.log(`${colors.red}✗ Please follow the steps in docs/claude-desktop-mcp-setup.md${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}====================================================${colors.reset}`);
}

// Run the verification
verifySetup().catch(err => {
  console.error(`${colors.red}Error during verification:${colors.reset}`, err);
});
