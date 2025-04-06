# UniAuto MCP Server Setup and Testing Guide

This guide provides step-by-step instructions for setting up and testing the UniAuto MCP Server with Claude 3.7.

## Prerequisites

1. Node.js v14+ and npm installed
2. Anthropic API key for Claude 3.7
3. Git (to clone the repository)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/samuelvinay91/uniauto-mcp-server.git
cd uniauto-mcp-server

# Install dependencies
npm install
```

## Step 2: Configure Environment

```bash
# Create environment file
cp .env.sample .env

# Edit the .env file with your editor of choice
nano .env
```

Make sure to add your Anthropic API key:

```
PORT=3000
NODE_ENV=development
CLAUDE_API_KEY=sk-ant-api03-your-api-key-here
CLAUDE_MODEL=claude-3-7-sonnet-20240229
```

## Step 3: Install Browser Dependencies

For full functionality, install Playwright browser dependencies:

```bash
sudo npx playwright install-deps
npx playwright install chromium
```

Alternatively, you can use the mock implementation for testing without browser dependencies by uncommenting the mock import in `src/handlers/routes.js`.

## Step 4: Start the Server

```bash
# Start in development mode
npm run dev

# Or in production mode
npm start
```

## Step 5: Test the Server

### Test Claude Integration

This test verifies that your Claude API key works and can communicate with the Anthropic API:

```bash
node test-claude.js
```

You should see a response from Claude with steps for automating a form.

### Test MCP Integration

This test verifies that the MCP server endpoints work correctly:

```bash
node test-mcp.js
```

You should see the server respond to a sequence of MCP commands.

### Run the Demo

For a more interactive test:

```bash
node demo.js
```

This will prompt for a URL and then run a sequence of automation steps.

## Step 6: Connect to Claude via Smithery

### Install Smithery CLI

```bash
npm install -g @smithery/cli
```

### Log in to Smithery

```bash
smithery login
```

### Connect UniAuto to Smithery

```bash
smithery connect tool --name "UniAuto" --manifest-url "http://localhost:3000/api/mcp/manifest"
```

### Connect Claude to Smithery

```bash
smithery connect claude --version 3-7-sonnet
```

### Alternatively, Use the Setup Script

```bash
./setup-smithery.sh
```

This interactive script automates the Smithery setup process.

## Step 7: Test with Claude

1. Go to Claude Web (https://claude.ai)
2. Start a new conversation
3. Try asking Claude to use UniAuto:

```
Can you use UniAuto to navigate to example.com and tell me what the page title is?
```

## Troubleshooting

### Server Issues

If the server won't start:

```bash
# Check for error messages in the logs
cat logs/combined.log

# Verify the port is not in use
lsof -i :3000
```

### Claude API Issues

If Claude integration fails:

1. Verify your API key in the `.env` file
2. Check that you have access to the Claude 3.7 model
3. Test with the `test-claude.js` script

### Browser Dependencies Issues

If you encounter browser errors:

```bash
# Use the mock implementation for testing
# Edit src/handlers/routes.js to use mock-automation instead of automation

# Or install the browser dependencies
sudo npx playwright install-deps
```

### Smithery Connection Issues

If Smithery fails to connect:

1. Ensure the server is running and accessible
2. Check firewall settings
3. Verify Smithery credentials

## Usage Examples

### Process Automation with AI

```http
POST /api/ai/process
Content-Type: application/json

{
  "task": "Fill out the contact form at example.com/contact",
  "url": "https://example.com/contact"
}
```

### Execute MCP Command Directly

```http
POST /api/mcp/invoke
Content-Type: application/json

{
  "action": "navigate",
  "parameters": {
    "url": "https://example.com"
  },
  "executionId": "test-123"
}
```

## Documentation

For more detailed information, see:

- [Anthropic SDK Guide](docs/ai-integration/anthropic-sdk.md)
- [Smithery Integration](docs/smithery-setup.md)
- [Claude Integration](docs/ai-integration/claude.md)
- [Model Context Protocol](docs/api/model-context-protocol.md)

## Need Help?

If you encounter any issues, please:

1. Check the troubleshooting section above
2. Review the logs in the `logs` directory
3. Submit an issue on GitHub