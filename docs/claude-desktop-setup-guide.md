# Claude Desktop MCP Setup Guide

This guide provides clear instructions for setting up the UniAuto MCP server with Claude Desktop after the recent improvements to fix connection issues.

## Overview of Changes

The following improvements have been made to ensure reliable MCP communication:

1. **Server Communication**: Fixed the Model Context Protocol implementation to properly use the stdio protocol for direct communication with Claude Desktop.
2. **Console Output Handling**: Redirected all console output to stderr when running in MCP mode to avoid interfering with the protocol messages.
3. **Configuration Management**: Updated the setup scripts to use the main server instead of the minimal server implementation.
4. **Launch Options**: Added proper MCP mode flags to ensure correct initialization.

## Setup Instructions

### Step 1: Update Environment Configuration

1. Create or update your `.env` file in the project root:

```
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-7-sonnet-20240229
PORT=3001
NODE_ENV=development
```

### Step 2: Run the Setup Script

Run the Claude Desktop configuration script:

```bash
# On Windows
node scripts\setup-claude-desktop.js

# On macOS/Linux
node scripts/setup-claude-desktop.js
```

This script will:
- Update your `.env` file with the settings you provide
- Create or update the Claude Desktop configuration file
- Configure the MCP server connection properly

### Step 3: Start the Server

Start the MCP server in the proper mode:

```bash
# On Windows (from Command Prompt)
scripts\run-uniauto-server.bat
# Or try alternative path format if the above doesn't work:
# .\scripts\run-uniauto-server.bat

# On macOS/Linux
./scripts/run-uniauto-server.sh
# Or use the npm script:
npm run start:mcp
```

You should see output indicating that the server is running and MCP mode is enabled.

### Step 4: Connect with Claude Desktop

1. Launch Claude Desktop
2. Start a new conversation
3. Ask Claude to use UniAuto to perform a task, for example:
   ```
   Using UniAuto, navigate to example.com and tell me the page title
   ```

## Troubleshooting

If you encounter connection issues:

1. **Fix the Configuration**:
   ```bash
   # On Windows
   node "scripts/fix-claude-desktop.js"
   # Or try alternative path format if the above doesn't work:
   # cd scripts && node fix-claude-desktop.js
   
   # On macOS/Linux
   node scripts/fix-claude-desktop.js
   ```

2. **Check Server Output**:
   Look for any error messages in the server console. Specific MCP protocol messages will be indicated with `[MCP]` prefix.

3. **Verify Claude Desktop Settings**:
   Ensure your Claude Desktop config has been properly updated. The config file is located at:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

4. **Restart Claude Desktop**:
   Close and reopen Claude Desktop completely to ensure it picks up the latest configuration.

## Technical Details

### MCP Server Configuration

The Claude Desktop configuration now includes the following key settings:

```json
{
  "mcpServers": {
    "uniauto": {
      "command": "node",
      "args": ["path/to/uniauto-mcp-server/src/index.js", "--mcp-server"],
      "env": {
        "CLAUDE_API_KEY": "your_claude_api_key_here",
        "CLAUDE_MODEL": "claude-3-7-sonnet-20240229",
        "PORT": "3001",
        "NODE_ENV": "development",
        "MCP_ENABLED": "true",
        "LOG_TO_STDERR": "true"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Protocol Communication

The UniAuto MCP server now properly implements the MCP stdio protocol:

1. It reads JSON requests from stdin
2. It writes JSON responses to stdout
3. All logs and error messages are written to stderr
4. The server properly separates the HTTP API from the MCP stdio protocol

This implementation ensures compatibility with Claude Desktop and other MCP clients.

## Next Steps

Once the basic communication is working, you can try more advanced examples:

- **Generate Tests**: `Using UniAuto, generate tests for a login form on example.com`
- **Run Visual Comparison**: `Using UniAuto, compare visual appearance of example.com against baseline`
- **Perform Accessibility Testing**: `Using UniAuto, check example.com for accessibility issues`
