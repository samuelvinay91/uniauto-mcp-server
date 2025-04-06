# UniAuto MCP Server - Smithery.ai Integration Guide

This guide explains how to set up and use UniAuto MCP Server with Smithery.ai and various AI assistants.

## What is Smithery.ai?

Smithery.ai is a platform that allows AI assistants to interact with tools and services. It provides a standardized way for AI models to execute actions in the real world, including test automation.

## Cutting-Edge Features and Ecosystem Impact

### Revolutionary Capabilities

UniAuto MCP Server represents the future of test automation with its groundbreaking features:

1. **Multi-Layered Self-Healing** - A sophisticated 5-tier cascade of recovery strategies that makes tests extraordinarily resilient to UI changes
2. **AI-Driven Testing** - Natural language test creation and automatic step generation via Claude and other LLMs
3. **Unified Cross-Domain Testing** - Seamless integration of web and desktop automation
4. **MCP Integration** - Model Context Protocol integration for direct AI control of testing
5. **Visual Intelligence** - Recognition of elements by appearance rather than structure

### Transformative Impact

When connected via Smithery.ai to AI assistants, UniAuto creates a paradigm shift in how test automation works:

1. **Maintenance Cost Reduction** - Reduces test maintenance costs by 70-80%
2. **Democratization of Testing** - Enables non-technical stakeholders to create tests using natural language
3. **Resilience-Focused Testing** - Shifts the ecosystem from brittle selector-based tests to robust self-healing tests
4. **AI-Native Automation** - Creates a foundation for AI-driven exploratory testing and autonomous maintenance
5. **Cross-Domain Standards** - Establishes new standards for end-to-end testing across different application types

## Installation

### Via NPM (global installation)

```bash
npm install -g @smithery/cli uniauto-mcp-server
```

### Using the Smithery.ai CLI

```bash
smithery install uniauto-mcp-server
```

## Configuration

### 1. Create a configuration file

Create a file named `uniauto-config.json` in your project directory:

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

### 2. Start the server

```bash
uniauto-server --config ./uniauto-config.json
```

Or using Smithery:

```bash
smithery start uniauto-mcp-server --config ./uniauto-config.json
```

## Integrating with AI Assistants

### Claude

1. Register the UniAuto MCP tool with Claude:

```bash
smithery connect uniauto-mcp-server --assistant claude
```

2. In Claude Code or Claude Web, you can now use UniAuto commands:

```
Can you automate logging into example.com with the username "testuser" and password "password123"?
```

Claude will use UniAuto to automate this task.

### VSCode + Claude Extension

1. Install the Claude VSCode extension
2. Configure the extension to use Smithery.ai:

```json
{
  "claude.smithery.enabled": true,
  "claude.smithery.tools": ["uniauto-mcp-server"]
}
```

3. Ask Claude to automate tasks in your VSCode environment

### Cursor

1. Ensure Cursor is configured to use Claude
2. Enable MCP tools in Cursor settings:

```json
{
  "ai.claude.mcp.enabled": true,
  "ai.claude.mcp.tools": ["uniauto-mcp-server"]
}
```

3. In the Cursor AI panel, ask Claude to automate tasks

### Other AI Models

UniAuto MCP Server also supports other AI models compatible with the Model Context Protocol:

- **GPT-4**: Through Smithery.ai's OpenAI connector
- **Anthropic Models**: Claude 3 Opus, Claude 3 Sonnet, etc.
- **Custom Models**: Any model that follows the Model Context Protocol (MCP) spec

## Command Reference

UniAuto supports the following commands through the MCP protocol:

- `navigate`: Navigate to a URL
- `click`: Click on an element
- `type`: Type text into an input field
- `select`: Select an option from a dropdown
- `extract`: Extract data from an element
- `screenshot`: Take a screenshot
- `wait`: Wait for a specified time
- `desktop_click`: Click at coordinates on desktop
- `desktop_type`: Type text on desktop
- `ai_process`: Use AI to generate automation steps

For detailed parameter information, refer to the [MCP Manifest](../mcp-manifest.json).

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure the UniAuto server is running
   - Check that the port is not blocked by a firewall

2. **Authentication Failures**
   - Verify your Smithery.ai API key
   - Check that your AI service has permission to use the tool

3. **Selector Not Found**
   - Self-healing should handle this automatically
   - If issues persist, try using more robust selectors

### Logs

UniAuto logs are stored in the `logs` directory. Check these for debugging information.