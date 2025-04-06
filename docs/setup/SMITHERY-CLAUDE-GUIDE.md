# Using Smithery.ai with Claude 3.7 and UniAuto MCP Server

This guide provides detailed instructions for setting up and using Smithery.ai to connect Claude 3.7 with the UniAuto MCP Server.

## What is Smithery.ai?

Smithery.ai is a platform that allows AI assistants like Claude to access external tools through standardized protocols like the Model Context Protocol (MCP). It acts as a bridge, allowing Claude to control tools like UniAuto MCP Server securely.

## Prerequisites

1. Node.js v16+ and npm installed
2. Access to Claude 3.7 (via Claude Web)
3. UniAuto MCP Server installed and running
4. Smithery.ai account (sign up at https://smithery.ai if you don't have one)

## Step 1: Install Smithery CLI

Smithery provides a command-line interface (CLI) that makes it easy to connect tools to AI assistants:

```bash
# Install Smithery CLI globally
npm install -g @smithery/cli

# Verify installation
smithery --version
```

## Step 2: Log in to Smithery

```bash
# Authenticate with your Smithery account
smithery login
```

This will open a browser window where you can log in to your Smithery account. Once authenticated, the CLI will be able to manage your connections.

## Step 3: Start the UniAuto MCP Server

Make sure your UniAuto MCP Server is running before connecting it to Smithery:

```bash
# Navigate to the UniAuto directory
cd /path/to/uniauto-mcp-server

# Start the server
npm start
```

## Step 4: Register UniAuto with Smithery

Once your server is running, you can register it with Smithery:

```bash
# Register UniAuto MCP Server
smithery connect tool --name "UniAuto" --manifest-url "http://localhost:3000/api/mcp/manifest"
```

This registers your local UniAuto MCP Server as a tool that Claude can access through Smithery.

## Step 5: Connect Claude 3.7 to Smithery

There are two ways to connect Claude to Smithery:

### Option A: Using the Smithery CLI

```bash
# Connect to Claude
smithery connect claude --version 3-7-sonnet
```

### Option B: Using Claude Web Settings

1. Go to [Claude Web](https://claude.ai)
2. Click on your profile icon and select "Settings"
3. Navigate to the "Connections" or "Tools" section
4. Add Smithery as a connection
5. Follow the authentication prompts

## Step 6: Testing the Connection

To test that everything is working correctly:

1. Start a new conversation in Claude Web
2. Ask Claude to use UniAuto:

```
Can you use UniAuto to navigate to example.com and tell me what the page title is?
```

Claude should be able to:
1. Access the UniAuto tool through Smithery
2. Execute the navigation command
3. Report back the page title

## Troubleshooting

### Connection Issues

If Claude can't connect to UniAuto:

1. **Check that UniAuto is running:**
   ```bash
   node check-server.js
   ```

2. **Verify the Smithery connection:**
   ```bash
   smithery list tools
   ```

3. **Check Smithery logs:**
   ```bash
   smithery logs
   ```

### Permission Issues

Claude may need explicit permission to use external tools:

1. Look for permission dialogs in Claude Web
2. Grant permission when prompted
3. If no prompt appears, disconnect and reconnect the tool

### Network Issues

If you're running UniAuto locally:

1. Make sure your firewall allows connections on port 3000
2. Consider using a service like ngrok for external access:
   ```bash
   ngrok http 3000
   ```
   Then use the ngrok URL instead of localhost in your Smithery configuration.

## Advanced Smithery Features

### Listing Connected Tools

```bash
smithery list tools
```

### Removing a Tool

```bash
smithery disconnect tool --name "UniAuto"
```

### Updating a Tool Manifest

```bash
smithery update tool --name "UniAuto" --manifest-url "http://localhost:3000/api/mcp/manifest"
```

## Example Automation Tasks with Claude 3.7

Here are more advanced tasks you can ask Claude 3.7 to perform through Smithery:

1. **Multi-step form filling:**
   ```
   Using UniAuto, please complete a registration process on example.com/register with the following information:
   - Name: John Doe
   - Email: john.doe@example.com
   - Password: TestPassword123
   - Confirm the registration
   ```

2. **Data extraction and analysis:**
   ```
   Using UniAuto, navigate to a news website and extract the headlines of the top 5 stories. Then analyze the main themes across these headlines.
   ```

3. **Screenshot comparison:**
   ```
   Using UniAuto, take screenshots of the same product on two different e-commerce sites and tell me which one has a better price.
   ```

Claude 3.7 has enhanced capabilities to understand complex web automation tasks and can execute them through the UniAuto MCP Server with precision.