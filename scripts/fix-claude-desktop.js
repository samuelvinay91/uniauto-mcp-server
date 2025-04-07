#!/usr/bin/env node

/**
 * This script fixes Claude Desktop MCP configuration to ensure it's correctly recognized.
 * It makes specific adjustments to improve compatibility with Claude Desktop.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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
console.log(`${colors.cyan}     UniAuto MCP - Claude Desktop Configuration Fix${colors.reset}`);
console.log(`${colors.cyan}====================================================${colors.reset}\n`);

// Determine current directory path
const currentDir = path.resolve(process.cwd());

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

async function fixClaudeDesktopConfig() {
  try {
    // Check if Claude Desktop config exists
    if (!fs.existsSync(claudeConfigPath)) {
      console.log(`${colors.red}Claude Desktop configuration file not found at:${colors.reset}`);
      console.log(`  ${claudeConfigPath}`);
      process.exit(1);
    }

    console.log(`${colors.blue}Reading Claude Desktop configuration from:${colors.reset}`);
    console.log(`  ${claudeConfigPath}`);
    
    // Read current configuration
    let claudeConfig;
    try {
      claudeConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
    } catch (error) {
      console.log(`${colors.red}Error parsing Claude Desktop configuration: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Creating new configuration file...${colors.reset}`);
      claudeConfig = {};
    }

    // Create mcpServers if it doesn't exist
    if (!claudeConfig.mcpServers) {
      claudeConfig.mcpServers = {};
    }

    // Load API key from .env file if it exists
    let apiKey = '';
    let port = '3001';
    let model = 'claude-3-7-sonnet-20240229';
    
    try {
      const envPath = path.join(currentDir, '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Extract API key
        const apiKeyMatch = envContent.match(/CLAUDE_API_KEY=([^\r\n]+)/);
        if (apiKeyMatch && apiKeyMatch[1]) {
          apiKey = apiKeyMatch[1].trim();
          console.log(`${colors.green}✓ Found Claude API key in .env file${colors.reset}`);
        }
        
        // Extract port
        const portMatch = envContent.match(/PORT=([^\r\n]+)/);
        if (portMatch && portMatch[1]) {
          port = portMatch[1].trim();
          console.log(`${colors.green}✓ Found port in .env file: ${port}${colors.reset}`);
        }
        
        // Extract model
        const modelMatch = envContent.match(/CLAUDE_MODEL=([^\r\n]+)/);
        if (modelMatch && modelMatch[1]) {
          model = modelMatch[1].trim();
          console.log(`${colors.green}✓ Found Claude model in .env file: ${model}${colors.reset}`);
        }
      }
    } catch (error) {
      console.log(`${colors.yellow}Could not read .env file: ${error.message}${colors.reset}`);
    }
    
    // Prompt for API key if not found
    if (!apiKey) {
      console.log(`${colors.yellow}⚠ Claude API key not found. Please enter it manually.${colors.reset}`);
      apiKey = await promptForInput('Enter your Claude API key: ');
    }

    // Update all UniAuto configurations to ensure consistency
    // First, remove existing UniAuto configurations
    Object.keys(claudeConfig.mcpServers).forEach(key => {
      if (key === 'uniauto' || key.toLowerCase().includes('uniauto')) {
        console.log(`${colors.yellow}Removing existing configuration: ${key}${colors.reset}`);
        delete claudeConfig.mcpServers[key];
      }
    });
    
    // Add the main server configuration with proper MCP flags
    claudeConfig.mcpServers.uniauto = {
      command: "node",
      args: [path.join(currentDir, "src", "index.js"), "--mcp-server"],
      env: {
        CLAUDE_API_KEY: apiKey,
        CLAUDE_MODEL: model,
        PORT: port,
        NODE_ENV: "development",
        // Adding specific MCP environment variables to ensure proper communication
        MCP_ENABLED: "true",
        LOG_TO_STDERR: "true"
      },
      disabled: false,
      autoApprove: []
    };
    
    // Save updated configuration with pretty formatting
    console.log(`${colors.blue}Updating Claude Desktop configuration...${colors.reset}`);
    fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));
    
    console.log(`\n${colors.green}✓ Claude Desktop configuration successfully updated!${colors.reset}`);
    console.log(`${colors.green}✓ Configured main server with MCP protocol support${colors.reset}`);
    
    // Display instructions
    console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
    console.log(`${colors.blue}1. Close Claude Desktop if it's running${colors.reset}`);
    console.log(`${colors.blue}2. Start the server with: ${colors.yellow}npm start${colors.reset}`);
    console.log(`${colors.blue}3. Open Claude Desktop${colors.reset}`);
    console.log(`${colors.blue}4. Ask Claude: "${colors.yellow}Using UniAuto, navigate to example.com and tell me the page title${colors.reset}"\n`);
    
  } catch (error) {
    console.error(`${colors.red}Error fixing Claude Desktop configuration: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Helper function to prompt for input
function promptForInput(question) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

// Run the fix
fixClaudeDesktopConfig();
