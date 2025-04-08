# Desktop Integration Configuration

This document covers the setup and configuration for connecting Claude Desktop to the UniAuto MCP Server, enabling both web and desktop automation through natural language instructions.

## Quick Setup

1. Add desktop integration flag to `.env`:
   ```
   ENABLE_DESKTOP_INTEGRATION=true
   ```

2. Run the setup script:
   ```
   node scripts/setup-claude-desktop.js
   ```

3. Test the connection:
   ```
   node test-connection.js
   ```

4. In Claude Desktop, add the tool with this URL:
   ```
   http://localhost:3000/api/mcp/manifest
   ```

## Protocol Support

The UniAuto MCP Server supports two protocols for AI integrations:

1. **Model Context Protocol (MCP)** - Standard protocol for web automation
2. **JSON-RPC 2.0** - Protocol used by Claude Desktop with support for desktop automation

### Key Implementation Files

- `/src/utils/mcp-validator.js` - Protocol detection, validation, and format adapters
- `/src/handlers/routes.js` - Endpoint handling for JSON-RPC and MCP requests
- `/src/core/desktop-integration.js` - Desktop automation implementation
- `/test-connection.js` - Test utility for verifying connection
- `/test-desktop-integration.js` - Comprehensive test for desktop automation

## Protocol Adapter System

The MCP server implements a protocol adapter system that:
1. Detects the client protocol type (JSON-RPC 2.0, MCP, or REST)
2. Normalizes requests to a standard internal format
3. Processes the automation request
4. Formats the response according to the original protocol

This enables multiple clients (Claude Desktop, VSCode, Cursor) to communicate with the server using their preferred protocol while accessing the same core automation capabilities.

## Keep-Alive Mechanism

Claude Desktop requires a connection that stays active between requests. The MCP server implements a keep-alive mechanism that:

1. Starts during the initialization request
2. Sends periodic heartbeat signals
3. Prevents timeout disconnections
4. Maintains connection state between automation commands

## Supported Desktop Capabilities

- **Desktop Click**: Click at specific X,Y coordinates on your screen
- **Desktop Type**: Type text at the current cursor position
- **Keyboard Navigation**: Simulate keyboard shortcuts and special keys
- **Screenshot**: Capture screen state during automation

## JSON-RPC Protocol Examples

Below are examples of the protocol messages used by Claude Desktop:

### Initialize Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "claude-ai",
      "version": "0.1.0"
    }
  }
}
```

### Desktop Click Request
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

### Desktop Type Request
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "execute",
  "params": {
    "action": "desktop_type",
    "parameters": {
      "text": "Hello world"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Drops**: If Claude Desktop shows disconnections, check:
   - Server keep-alive mechanism is working
   - No network interruptions or firewalls blocking traffic
   - Server has proper permissions

2. **Desktop Actions Fail**: If desktop automation commands don't work:
   - Verify ENABLE_DESKTOP_INTEGRATION=true in .env
   - Check desktop-integration.js permissions
   - Ensure coordinates are within screen bounds

3. **Protocol Errors**: For JSON-RPC protocol issues:
   - Run test-connection.js to verify protocol compatibility
   - Check logs for detailed error messages
   - Ensure the mcp-validator.js is correctly detecting and handling protocol types

## Additional Resources

For more detailed information about the Claude Desktop integration:

- [Claude Desktop Integration Guide](docs/ai-integration/claude-desktop.md)
- [MCP Protocol Specification](docs/api/model-context-protocol.md)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)