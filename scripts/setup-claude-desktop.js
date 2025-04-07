#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

console.log(`\n=== UniAuto MCP Server - Claude Desktop Setup ===\n`);
console.log(`This script will configure Claude Desktop to use the UniAuto MCP server.`);

// Function to prompt for the Claude API key
const promptForApiKey = () => {
  return new Promise((resolve) => {
    rl.question('Enter your Claude API key: ', (apiKey) => {
      if (!apiKey.trim()) {
        console.log('API key cannot be empty. Please try again.');
        return promptForApiKey().then(resolve);
      }
      resolve(apiKey.trim());
    });
  });
};

// Function to prompt for the port
const promptForPort = () => {
  return new Promise((resolve) => {
    rl.question('Enter the port for UniAuto MCP server (default: 3001): ', (port) => {
      port = port.trim();
      if (!port) port = '3001';
      if (!/^\d+$/.test(port)) {
        console.log('Port must be a number. Please try again.');
        return promptForPort().then(resolve);
      }
      resolve(port);
    });
  });
};

// Function to prompt for the Claude model
const promptForModel = () => {
  return new Promise((resolve) => {
    rl.question('Enter the Claude model to use (default: claude-3-7-sonnet-20240229): ', (model) => {
      model = model.trim();
      if (!model) model = 'claude-3-7-sonnet-20240229';
      resolve(model);
    });
  });
};

// Main function
async function main() {
  try {
    // Check if .env file exists
    const envPath = path.join(currentDir, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('Warning: .env file not found. Creating one from .env.sample...');
      if (fs.existsSync(path.join(currentDir, '.env.sample'))) {
        fs.copyFileSync(path.join(currentDir, '.env.sample'), envPath);
      } else if (fs.existsSync(path.join(currentDir, '.env.example'))) {
        fs.copyFileSync(path.join(currentDir, '.env.example'), envPath);
      } else {
        console.log('Error: No .env.sample or .env.example file found. Please create a .env file manually.');
        process.exit(1);
      }
    }

    // Get user input
    const apiKey = await promptForApiKey();
    const port = await promptForPort();
    const model = await promptForModel();

    // Update .env file with user input
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/CLAUDE_API_KEY=.*/g, `CLAUDE_API_KEY=${apiKey}`);
    envContent = envContent.replace(/CLAUDE_MODEL=.*/g, `CLAUDE_MODEL=${model}`);
    envContent = envContent.replace(/PORT=.*/g, `PORT=${port}`);
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n.env file updated successfully.');

    // Create or update Claude Desktop config
    let claudeConfig = {};
    if (fs.existsSync(claudeConfigPath)) {
      try {
        claudeConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
        console.log('Found existing Claude Desktop configuration.');
      } catch (error) {
        console.log('Error parsing existing Claude Desktop configuration. Creating new configuration.');
      }
    } else {
      console.log('Claude Desktop configuration file not found. Creating new configuration.');
      // Ensure directory exists
      fs.mkdirSync(path.dirname(claudeConfigPath), { recursive: true });
    }

    // Ensure mcpServers object exists
    if (!claudeConfig.mcpServers) {
      claudeConfig.mcpServers = {};
    }

    // Add or update UniAuto MCP server configuration with proper MCP flags
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

    // Write updated config to file
    fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));
    console.log(`\nClaude Desktop configuration updated at: ${claudeConfigPath}`);

    console.log('\nSetup complete! You can now start the UniAuto MCP server with "npm start"');
    console.log('Then open Claude Desktop and try the example prompts from the documentation.');
    
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    rl.close();
  }
}

main();
