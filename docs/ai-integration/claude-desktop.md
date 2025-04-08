# Claude Desktop Integration Guide

This guide explains how to connect your UniAuto MCP Server to Claude Desktop for both web and desktop automation tasks.

## Prerequisites

1. UniAuto MCP Server installed and running
2. Claude Desktop application installed 
3. Claude API key (for AI features)

## Setting Up Claude Desktop Integration

### Step 1: Enable Desktop Integration

Make sure desktop integration is enabled in your `.env` file by adding the following:

```
ENABLE_DESKTOP_INTEGRATION=true
```

### Step 2: Run the Setup Script

We've created a special setup script to configure everything for desktop integration:

```bash
node scripts/setup-claude-desktop.js
```

This script will:
- Update your MCP manifest with desktop capabilities
- Ensure your Smithery configuration is correct
- Check if the server is running and start it if needed

### Step 3: Test the Connection

To verify that your server is properly configured for Claude Desktop with the JSON-RPC 2.0 protocol:

```bash
node test-connection.js
```

This will test the following:
- Basic API connectivity
- JSON-RPC 2.0 protocol compatibility
- Keep-alive mechanism
- Web and desktop automation capabilities

### Step 4: Connect Claude Desktop to the MCP Server

1. Open Claude Desktop application
2. Click on the settings menu (gear icon)
3. Navigate to "Tools" or "Connections"
4. Click "Add Tool" 
5. Enter the MCP manifest URL: `http://localhost:3000/api/mcp/manifest`
6. Follow the authorization prompts

## Using Desktop Automation with Claude

Once connected, you can ask Claude to perform desktop automation tasks:

### Basic Examples

1. **Click at specific coordinates**:
   ```
   Can you click at position (500, 300) on my desktop?
   ```

2. **Type text**:
   ```
   Please type "Hello world" on my desktop.
   ```

3. **Combined workflows**:
   ```
   Can you help me automate this workflow: 
   1. Click at position (100, 200)
   2. Type "search query"
   3. Click at position (500, 300)
   ```

### Web Automation Examples

1. **Navigate to websites**:
   ```
   Please navigate to https://example.com
   ```

2. **Click elements on web pages**:
   ```
   Click the "Submit" button on this page
   ```

3. **Fill out forms**:
   ```
   Type "test@example.com" into the email field
   ```

### Advanced Examples

1. **Working with desktop applications**:
   ```
   Can you help me open Notepad and type "This is a test"?
   ```

2. **Custom interaction sequence**:
   ```
   I need to automate this sequence:
   1. Click the Start menu (10, 990)
   2. Type "calculator"
   3. Press Enter (simulated by typing "\n")
   4. Click buttons to calculate 2+2
   ```

## Troubleshooting

### Connection Issues

If Claude Desktop cannot connect to your MCP server:

1. Make sure the server is running on port 3000
   ```bash
   node test-connection.js
   ```

2. Verify desktop integration is enabled in your `.env` file
   ```
   ENABLE_DESKTOP_INTEGRATION=true
   ```

3. Check that the MCP manifest includes desktop capabilities
   ```bash
   cat mcp-manifest.json | grep desktop
   ```

4. Check for JSON-RPC protocol support
   ```bash
   node test-desktop-integration.js
   ```

### Desktop Actions Not Working

If Claude can connect but desktop actions don't work:

1. Make sure you're providing valid coordinates for clicks:
   - X-coordinate should be between 0 and your screen width
   - Y-coordinate should be between 0 and your screen height

2. Check the server logs for errors:
   ```bash
   tail -f logs/server.log
   ```

3. Try restarting the MCP server:
   ```bash
   npm restart
   ```

## Advanced Configuration

For advanced desktop automation settings, you can modify the desktop integration module directly:

- `/src/core/desktop-integration.js` - Main module for desktop automation
- `/src/handlers/routes.js` - Contains the MCP endpoints for desktop actions
- `/src/utils/mcp-validator.js` - Protocol adapters for JSON-RPC and MCP

## Technical Details

Claude Desktop uses the JSON-RPC 2.0 protocol to communicate with the UniAuto MCP server. The protocol works as follows:

1. **Initialize connection**:
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "initialize",
     "params": {
       "protocolVersion": "2024-11-05",
       "clientInfo": {
         "name": "claude-ai",
         "version": "0.1.0"
       }
     }
   }
   ```

2. **Execute actions**:
   ```json
   {
     "jsonrpc": "2.0",
     "id": 2,
     "method": "execute",
     "params": {
       "action": "desktop_click",
       "parameters": {
         "x": 500,
         "y": 300
       }
     }
   }
   ```

The server includes a keep-alive mechanism to maintain the connection between Claude Desktop and the MCP server.

## Security Considerations

- Desktop automation provides direct control over your machine
- Only connect Claude Desktop to MCP servers you trust
- Be cautious when giving Claude instructions for desktop automation
- Consider running in a sandboxed environment for testing

## Next Steps

After mastering basic desktop integration, explore these advanced capabilities:

1. **Create custom desktop workflows** combining web and desktop automation
2. **Build screen scraping utilities** using desktop automation with AI analysis
3. **Automate repetitive desktop tasks** with Claude providing the interface