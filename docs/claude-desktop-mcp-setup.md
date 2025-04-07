# Setting Up Claude Desktop MCP for Testing UniAuto MCP Server

This guide provides comprehensive instructions for setting up Claude Desktop with your UniAuto MCP server using Smithery for seamless integration and testing.

## Prerequisites

1. Node.js v16+ and npm installed
2. Claude Desktop application installed
3. Anthropic Claude API key
4. UniAuto MCP Server installed (current repository)

## Step 1: Configure the UniAuto MCP Server

1. Set up your environment variables by editing the `.env` file:

```bash
# Open the .env file and update these values
CLAUDE_API_KEY=your_claude_api_key_here  # Replace with your actual Claude API key
CLAUDE_MODEL=claude-3-7-sonnet-20240229  # You can keep this as is or change to a different model
PORT=3001                                # The port where UniAuto MCP Server will run
```

2. Install dependencies if you haven't already:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install chromium
```

## Step 2: Install and Configure Smithery

1. Install Smithery CLI globally:

```bash
npm install -g @smithery/cli
```

2. Authenticate with Smithery (if you have a Smithery account):

```bash
npx @smithery/cli login --client claude
```

3. If you don't have a Smithery account or prefer a local setup, you can skip the login step.

## Step 3: Start the UniAuto MCP Server

There are two ways to run the server for testing with Claude Desktop:

### Option A: Using the Minimal Server (Recommended for Testing)

For the most reliable experience when testing the Claude Desktop integration, use the minimal server:

```bash
# On Windows:
scripts\run-minimal-server.bat

# On macOS/Linux:
node src/minimal-server.js
```

The minimal server provides a simplified version with just the essential MCP functionality needed for testing the Claude Desktop integration.

### Option B: Using the Full Server

If you want to use all features of the UniAuto MCP server:

```bash
npm start
```

Verify the server is running:

```bash
node scripts/check-server.js
```

You should see a success message indicating the server is running.

## Step 4: Configure Claude Desktop App for MCP

1. Open the Claude Desktop application

2. Create/edit the Claude Desktop MCP configuration file at:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json` 
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. Add the UniAuto MCP server configuration:

```json
{
  "mcpServers": {
    "uniauto": {
      "command": "node",
      "args": ["path/to/uniauto-mcp-server/src/index.js"],
      "env": {
        "CLAUDE_API_KEY": "your_claude_api_key_here",
        "CLAUDE_MODEL": "claude-3-7-sonnet-20240229",
        "PORT": "3001",
        "NODE_ENV": "development"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace `path/to/uniauto-mcp-server` with the absolute path to your UniAuto MCP server directory.

## Step 5: Connect UniAuto to Claude via Smithery (Alternative Method)

If you prefer using Smithery to manage the connection:

1. Register the server with Smithery:

```bash
npx @smithery/cli connect tool --client claude --name "UniAuto" --manifest-url "http://localhost:3001/api/mcp/manifest"
```

2. (Optional) Connect Claude to Smithery:

```bash
npx @smithery/cli connect --client claude
```

## Step 6: Testing the Setup

1. Start a new conversation in Claude Desktop

2. Test the connection by asking Claude to use the UniAuto MCP server:

```
Can you use UniAuto to navigate to example.com and tell me what the page title is?
```

Claude should be able to:
- Access the UniAuto tool
- Execute the navigation command
- Report back the page title

## Step 7: Advanced Testing

Try more complex examples to test the full capabilities:

1. **Generate Test Cases**:
```
Using UniAuto, can you generate Playwright tests for a login form on example.com?
```

2. **Run Test Suite**:
```
Using UniAuto, please run a basic test suite against my application at http://localhost:3000
```

3. **Accessibility Testing**:
```
Using UniAuto, can you perform an accessibility test on example.com and identify any WCAG issues?
```

## Troubleshooting

### Claude Not Recognizing UniAuto MCP

If Claude Desktop doesn't recognize or use the UniAuto MCP server:

1. Run the configuration fix script:
   ```bash
   # On Windows:
   scripts\fix-claude-desktop.bat
   
   # On macOS/Linux:
   node scripts/fix-claude-desktop.js
   ```

2. Close and restart Claude Desktop completely

3. Make sure the server is actually running:
   ```bash
   # Run the minimal server (most reliable)
   node src/minimal-server.js
   ```

4. Try using the exact prompt format: "Using UniAuto, navigate to example.com and tell me the page title"

### Server Connection Issues

If Claude cannot connect to the UniAuto MCP server:

1. Ensure the server is running:
   ```bash
   node scripts/check-server.js
   ```

2. Verify the port is correct in your `.env` file and Claude Desktop configuration

3. Check the logs for any errors:
   ```bash
   cat logs/server.log
   ```

4. Try using the minimal server instead of the full server:
   ```bash
   node src/minimal-server.js
   ```

### Claude API Key Issues

If you encounter authentication errors:

1. Verify your Claude API key is valid and correctly set in the `.env` file
2. Make sure the same API key is used in the Claude Desktop config
3. Check that you're using a supported Claude model (claude-3-7-sonnet-20240229 is recommended)

### Smithery Connection Issues

If Smithery fails to connect:

1. Check Smithery's status:
   ```bash
   npx @smithery/cli list tools --client claude
   ```

2. Try reconnecting the tool:
   ```bash
   npx @smithery/cli disconnect tool --client claude --name "UniAuto"
   npx @smithery/cli connect tool --client claude --name "UniAuto" --manifest-url "http://localhost:3001/api/mcp/manifest"
   ```

## Notes

- The default port for the UniAuto MCP server is 3001, but you can change it in the `.env` file
- Claude Desktop will automatically start the MCP server when needed if configured correctly in `claude_desktop_config.json`
- For production use, consider setting `NODE_ENV=production` in the environment variables
- You may want to adjust the `HEADLESS` variable to `false` in the `.env` file for debugging automation issues

## Next Steps

After successfully setting up Claude Desktop MCP integration with UniAuto:

1. Explore test generation capabilities
2. Try self-healing test creation
3. Experiment with visual testing features
4. Build and run comprehensive test suites for your applications
