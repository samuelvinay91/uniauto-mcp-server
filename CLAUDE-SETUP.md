# Setting Up Claude with UniAuto MCP Server

This guide explains how to connect Claude to your locally running UniAuto MCP Server, allowing Claude to perform web automation tasks.

## Prerequisites

1. Node.js v14+ and npm installed
2. Access to Claude (via Claude Web, Claude in VSCode, or Cursor)
3. UniAuto MCP Server installed and running

## Step 1: Start the UniAuto MCP Server

1. Navigate to the UniAuto MCP Server directory:
   ```bash
   cd /path/to/uniauto-mcp-server
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Create a `.env` file with your Claude API key:
   ```
   PORT=3000
   NODE_ENV=development
   CLAUDE_API_KEY=your_claude_api_key
   CLAUDE_MODEL=claude-3-sonnet-20240229
   ```

4. Install Playwright browser (if not already done):
   ```bash
   npx playwright install chromium
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Verify the server is running by checking the health endpoint:
   ```bash
   node check-server.js
   ```

## Step 2: Connect Claude to the MCP Server

There are three main ways to connect Claude to your local MCP server:

### Option 1: Using Smithery.ai (Recommended)

1. Install Smithery CLI:
   ```bash
   npm install -g @smithery/cli
   ```

2. Connect UniAuto to Smithery:
   ```bash
   smithery connect uniauto-mcp-server
   ```

3. Register with Claude:
   ```bash
   smithery connect --assistant claude
   ```

### Option 2: Manual MCP Registration (Claude Web)

1. Navigate to Claude Web (https://claude.ai)
2. Start a new conversation
3. Click on your profile icon and go to "Settings"
4. Find the "Connections" or "Tools" section
5. Select "Add Tool" or "Connect Tool"
6. Enter the MCP manifest URL: `http://localhost:3000/api/mcp/manifest`
7. Follow the authentication and permission prompts

### Option 3: VSCode Extension Setup

1. Install the Claude VSCode extension
2. Configure the extension settings:
   ```json
   {
     "claude.tools.enabled": true,
     "claude.tools.endpoints": [
       {
         "name": "UniAuto",
         "manifestUrl": "http://localhost:3000/api/mcp/manifest"
       }
     ]
   }
   ```

## Step 3: Testing with Claude

Once connected, you can ask Claude to use UniAuto for web automation tasks:

1. **Basic navigation**:
   "Can you use UniAuto to navigate to example.com and tell me what the page title is?"

2. **Form filling**:
   "Please use UniAuto to navigate to example.com/contact and fill out the contact form with test data."

3. **Data extraction**:
   "Can you use UniAuto to navigate to example.com and extract all the links from the page?"

4. **Complex workflows**:
   "Using UniAuto, please navigate to Wikipedia, search for 'artificial intelligence', extract the first paragraph, and take a screenshot."

## Troubleshooting

### Server Not Starting

- Check if the port is already in use:
  ```bash
  lsof -i :3000
  ```
- Ensure all dependencies are installed
- Check for errors in the console output

### Connection Issues

- Verify the server is running
- Check that the manifest URL is correct
- Ensure network permissions are granted
- Check that Claude has permission to use external tools

### Automation Failures

- Check the UniAuto server logs for errors
- Make sure Playwright is properly installed
- Try with simple selectors first before complex automations

## Advanced Configuration

For advanced use cases, you can modify the `uniauto-config.json` file:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "automation": {
    "headless": false,
    "browser": "chromium",
    "slowMo": 50
  },
  "selfHealing": {
    "enabled": true,
    "strategies": ["repository", "role", "visual", "text"]
  },
  "ai": {
    "defaultModel": "claude-3-sonnet",
    "apiKey": "YOUR_API_KEY"
  }
}
```

This allows you to customize the automation behavior, server settings, and AI integration options.