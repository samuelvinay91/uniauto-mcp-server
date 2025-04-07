# UniAuto MCP Server - Smithery.ai Integration Guide

This guide explains how to set up and use UniAuto MCP Server with Smithery.ai to integrate with Claude, VSCode, Cursor, and other AI assistants.

## What is Smithery.ai?

Smithery.ai is a platform that connects AI assistants to tools and services, acting as a bridge between large language models and real-world applications. It enables AI models to execute actions through a standardized protocol.

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- A Claude API key (for AI-driven features)

### Step 1: Install Smithery CLI

```bash
npm install -g @smithery/cli
```

### Step 2: Install UniAuto MCP Server

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/uniauto-mcp-server.git
cd uniauto-mcp-server
npm install
```

Alternatively, you can install the package globally:

```bash
npm install -g uniauto-mcp-server
```

### Step 3: Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file to add your Claude API key:

```
# Claude API key for AI integration
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-7-sonnet-20240229

# Server configuration
PORT=3000
```

## Connecting to Smithery.ai

### Step 1: Start the MCP Server

```bash
# Start the server
npm run dev
```

The server will start on http://localhost:3000 (or the port you configured in .env).

### Step 2: Connect to Smithery

```bash
# Connect UniAuto to Smithery
smithery connect uniauto-mcp-server
```

This will register the UniAuto MCP server with Smithery.ai.

### Step 3: Connect to AI Assistant

```bash
# Connect to Claude
smithery connect --assistant claude
```

## AI Assistant Integration

### 1. Claude Web / Claude Code

After connecting via Smithery, simply use Claude Web or Claude Code as usual. You can now ask Claude to:

- "Generate Playwright tests for my login form"
- "Create a visual comparison test for my homepage"
- "Run accessibility tests on example.com"
- "Analyze performance metrics for my website"

Claude will use the UniAuto MCP server capabilities through Smithery's connection.

Example prompt:
```
I'd like you to generate comprehensive Playwright tests for a login form at https://example.com/login. Make sure to test successful login, validation errors, and forgot password flow. Then run accessibility tests on the same page.
```

### 2. VSCode with Claude Extension

1. Install the Claude VSCode extension
2. Configure the extension to use Smithery tools:

   Open VSCode settings.json and add:
   ```json
   {
     "claude.smithery.enabled": true,
     "claude.smithery.path": "/path/to/smithery/executable", // Optional - only if not in PATH
     "claude.smithery.tools": ["uniauto-mcp-server"]
   }
   ```

3. In VSCode, open the Claude extension and ask it to perform automation tasks.

Example prompt:
```
Can you generate a test suite for my React application? I need tests for the login component, user profile, and settings page. Use the UniAuto MCP server to analyze the application and create appropriate tests.
```

### 3. Cursor

1. Install the latest version of Cursor
2. Enable Model Context Protocol in Cursor settings:

   Open Cursor settings and add:
   ```json
   {
     "ai.mcp.enabled": true,
     "ai.mcp.tools": [
       {
         "name": "uniauto-mcp-server",
         "url": "http://localhost:3000/api"
       }
     ]
   }
   ```

3. In Cursor, use the AI command palette to ask Claude to automate testing tasks.

Example prompt:
```
I'd like to test my e-commerce application's checkout flow. Can you generate E2E tests and run performance tests on each step of the flow?
```

### 4. GitHub Copilot Chat (Experimental)

If using GitHub Copilot Chat with Claude:

1. Ensure you have GitHub Copilot Chat enabled
2. Configure the Copilot extension in VSCode:

   ```json
   {
     "github.copilot.chat.tools": [
       {
         "name": "UniAuto MCP",
         "description": "Universal test automation with self-healing capabilities",
         "endpoint": "http://localhost:3000/api/mcp/invoke",
         "manifest": "http://localhost:3000/api/mcp/manifest"
       }
     ]
   }
   ```

## Available Capabilities

When using UniAuto MCP server through Smithery, the AI assistants can leverage the following capabilities:

### 1. Basic Automation
- Navigate to URLs
- Click elements
- Type text
- Extract data
- Take screenshots

### 2. Test Generation
- Generate test cases in various frameworks (Playwright, Cypress, Jest, etc.)
- Create comprehensive test suites
- Scaffold complete test projects
- Support for BDD, TDD, and other test styles

### 3. Advanced Testing
- Visual comparison testing
- Accessibility testing (WCAG compliance)
- Performance testing (Core Web Vitals)
- Network tracing and API testing
- Comprehensive test suite execution

### 4. Self-Healing
- Automatic recovery from selector failures
- Visual element matching
- Role-based selectors
- Context-aware element finding

## Command Reference

Here are the key MCP actions available to AI assistants:

```
Basic Commands:
- navigate: Open a URL
- click: Click on an element
- type: Enter text in a field
- extract: Get data from a page

Test Generation:
- generate_tests: Create tests for a specific framework
- generate_test_suite: Create a full suite of tests
- scaffold_project: Set up a test project structure

Advanced Testing:
- visual_compare: Compare against baseline images
- accessibility_test: Check for accessibility issues
- performance_test: Measure performance metrics
- network_trace: Monitor API and network activity
- run_test_suite: Execute a comprehensive test suite
```

For complete details, see the [MCP manifest](../mcp-manifest.json).

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Ensure the UniAuto MCP server is running
   - Check that the port (default 3000) is not blocked
   - Verify your Smithery.ai connection with `smithery list connections`

2. **Authorization Failed**
   - Check that your Claude API key is valid and set correctly in .env
   - Ensure you're using the correct Smithery account

3. **AI Assistant Cannot Use Tool**
   - Verify the tool is properly registered with `smithery list tools`
   - Restart the AI assistant if it was connected before the tool

4. **Test Generation Fails**
   - Ensure the URL is accessible
   - Check that Playwright is installed correctly
   - Verify your Claude API key has not expired

### Logs and Debugging

- Server logs are stored in the `logs` directory
- Use `smithery logs` to view Smithery connection logs
- Enable debug mode in the .env file: `DEBUG=uniauto:*`

## Support

If you encounter issues, please:

1. Check the [GitHub issues](https://github.com/yourusername/uniauto-mcp-server/issues)
2. Join our [Discord community](https://discord.gg/your-discord)
3. Contact us at support@example.com