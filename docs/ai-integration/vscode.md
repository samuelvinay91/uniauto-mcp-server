# VSCode Integration with UniAuto MCP Server

This guide explains how to set up and use UniAuto MCP Server with VSCode and the Claude Extension.

## Prerequisites

- Visual Studio Code (latest version recommended)
- VSCode Claude Extension installed
- UniAuto MCP Server installed and running
- Smithery.ai CLI installed

## Installation Steps

### Step 1: Install the Claude VSCode Extension

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Claude AI Assistant"
4. Click Install

### Step 2: Configure Claude Extension for Smithery Integration

1. Open VSCode settings (File > Preferences > Settings or Ctrl+,)
2. Search for "claude smithery"
3. Check the box to enable Smithery integration
4. If needed, set the path to the Smithery executable
5. Add "uniauto-mcp-server" to the list of enabled tools

Alternatively, add these settings directly to your `settings.json`:

```json
{
  "claude.smithery.enabled": true,
  "claude.smithery.path": "/path/to/smithery/executable", // Only if not in PATH
  "claude.smithery.tools": ["uniauto-mcp-server"]
}
```

### Option 2: Manual Setup

If you prefer not to use extensions:

1. Start UniAuto MCP Server in a terminal:

```bash
uniauto-server
```

2. Use the VSCode terminal to interact with it via API calls:

```bash
curl -X POST http://localhost:3000/api/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"action":"navigate","parameters":{"url":"https://example.com"}}'
```

## Usage with AI Assistants

### Claude in VSCode

Once set up, you can ask Claude to perform test automation tasks directly in VSCode:

1. Open the Claude panel (Ctrl+Shift+P → "Claude: Open Chat")
2. Ask Claude to automate a task:

```
Write a test script using UniAuto to test the login functionality of our application at http://localhost:8080.
```

Claude will generate and execute the test script, providing feedback in the chat.

### GitHub Copilot

GitHub Copilot can also work with UniAuto through custom commands:

1. Set up a GitHub Copilot custom command that uses UniAuto's API
2. Add the command to your VSCode settings
3. Invoke the command with `/test` or your chosen prefix

## Test Runner Integration

### Creating Test Files

Ask your AI assistant to create test files using UniAuto commands:

```
Create a test file for our user registration page that uses UniAuto's self-healing capabilities.
```

The assistant will generate a test file like:

```javascript
// userRegistration.test.js
const { invokeAutomation } = require('./uniauto-client');

describe('User Registration', () => {
  test('should successfully register a new user', async () => {
    await invokeAutomation('navigate', { url: 'http://localhost:8080/register' });
    await invokeAutomation('type', { selector: '#email', text: 'test@example.com' });
    // More commands...
  });
});
```

### Running Tests

Execute tests using Jest or your preferred test runner:

```bash
npm test
```

VSCode's Test Explorer will also recognize and display these tests if properly configured.

## Writing Tests with AI Assistance

### Test Generation

Use your AI assistant to generate tests based on application specs:

```
Based on this user story: "As a user, I want to reset my password", generate a UniAuto test.
```

### Test Maintenance

AI can help maintain tests when the UI changes:

```
This test is failing because the 'Submit' button selector changed. Can you update it using UniAuto's self-healing?
```

## Debugging Tests

### Visual Debugging

UniAuto can capture screenshots during test execution:

```javascript
await invokeAutomation('screenshot', { fileName: 'login-form.png' });
```

These screenshots will be saved in the `public/screenshots` directory for examination.

### VSCode Debug Configuration

Add this to your `launch.json` to debug tests:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug UniAuto Tests",
  "program": "${workspaceFolder}/node_modules/jest/bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Recommended Workflow

1. Start UniAuto MCP Server
2. Open your VSCode project
3. Use AI to generate or update tests
4. Run tests with the debug configuration
5. Review results in the Test Explorer and debug console

## Troubleshooting

### Common Issues

- **Connection Problems**: Ensure UniAuto server is running and accessible
- **Permission Errors**: Check that VSCode has necessary permissions to run automation
- **Extension Conflicts**: Disable other automation extensions that might interfere

### Getting Help

If you encounter issues, ask your AI assistant:

```
My UniAuto test is failing with "element not found". How can I debug this?
```