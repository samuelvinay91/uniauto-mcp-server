# Model Context Protocol (MCP) Integration

UniAuto MCP Server implements the Model Context Protocol (MCP) to enable AI assistants like Claude to interact with automation capabilities. This document explains how the MCP implementation works and how to use it.

## What is the Model Context Protocol?

The Model Context Protocol (MCP) is a standardized way for AI assistants to interact with external tools. It provides:

1. A manifest format that defines tool capabilities
2. A standardized request/response format for tool invocation
3. Consistent error handling and metadata

With MCP, AI assistants can discover, understand, and use the automation capabilities of UniAuto MCP Server without requiring custom integration code.

## MCP Endpoints

UniAuto MCP Server provides two main MCP endpoints:

### 1. Manifest Endpoint

```
GET /api/mcp/manifest
```

This endpoint returns a JSON description of the available actions, their parameters, and requirements. AI assistants use this to understand what automation commands are available.

### 2. Invoke Endpoint

```
POST /api/mcp/invoke
```

This endpoint accepts action requests from AI assistants. The request body should be formatted according to the Model Context Protocol specification:

```json
{
  "action": "navigate",
  "parameters": {
    "url": "https://example.com"
  },
  "executionId": "optional-tracking-id"
}
```

## Response Format

All API responses follow the Model Context Protocol format:

### Success Response

```json
{
  "executionId": "tracking-id",
  "status": "success",
  "action": "navigate",
  "result": {
    "status": "success",
    "url": "https://example.com"
  },
  "metadata": {
    "protocol": "mcp",
    "protocolName": "Model Context Protocol",
    "version": "1.0",
    "timestamp": "2025-04-06T12:34:56.789Z"
  }
}
```

### Error Response

```json
{
  "executionId": "tracking-id",
  "status": "error",
  "error": "Failed to navigate: Network error",
  "errorType": "NetworkError",
  "metadata": {
    "protocol": "mcp",
    "protocolName": "Model Context Protocol",
    "version": "1.0",
    "timestamp": "2025-04-06T12:34:56.789Z"
  }
}
```

## Available Actions

The following automation actions are available through the Model Context Protocol:

1. `navigate` - Navigate to a URL
2. `click` - Click on an element
3. `type` - Type text into an input field
4. `select` - Select an option from a dropdown
5. `extract` - Extract data from an element
6. `screenshot` - Take a screenshot
7. `wait` - Wait for a specified time
8. `desktop_click` - Click at specific coordinates
9. `desktop_type` - Type text on the desktop
10. `ai_process` - Process a task with AI to generate automation steps

For details on the parameters for each action, see the manifest endpoint or the `mcp-manifest.json` file.

## Using with AI Assistants

To use UniAuto MCP Server with AI assistants:

1. Register the server as an MCP-compatible tool with the AI platform
2. Provide the manifest endpoint URL
3. Ensure the AI assistant has permission to invoke actions

For Claude integration specifically, see the [Claude Integration Guide](../ai-integration/claude.md).

## Model Context Protocol Compliance

UniAuto MCP Server maintains strict compliance with the Model Context Protocol through several mechanisms:

1. Request validation using the `mcp-validator.js` utility
2. Standardized response formatting for both success and error cases
3. Proper error type classification and propagation
4. Consistent metadata inclusion for protocol versioning

This ensures that AI assistants can reliably interact with our automation capabilities using standardized interfaces.