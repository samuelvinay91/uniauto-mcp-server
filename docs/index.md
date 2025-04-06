# UniAuto MCP Server Documentation

Welcome to the UniAuto MCP Server documentation. This site provides comprehensive information about installation, configuration, and usage of the Universal Test Automation MCP Server.

## What is UniAuto MCP Server?

UniAuto MCP Server is a universal test automation solution that provides web and desktop automation with self-healing capabilities and AI integration. It follows the Machine Control Protocol (MCP) standard to enable seamless integration with AI assistants like Claude, GPT-4, and others.

## Key Features

- **Web Automation** - Cross-browser automation using Playwright (Chrome, Firefox, WebKit)
- **Desktop Automation** - Native desktop automation using RobotJS
- **Self-healing** - Multiple strategies to recover from broken selectors
- **AI Integration** - Generate test steps using Claude and other AI models
- **Smithery.ai Compatible** - Seamless integration with AI assistants through Smithery.ai
- **MCP Protocol** - Standard interface for AI tools to control automation

## Quick Start

```bash
# Install from npm
npm install -g uniauto-mcp-server

# Start the server
uniauto-server
```

Or clone the repository and run:

```bash
git clone https://github.com/samuelvinay91/uniauto-mcp-server.git
cd uniauto-mcp-server
npm install
npm start
```

## Smithery.ai Integration

UniAuto MCP Server is designed to work seamlessly with Smithery.ai, which allows AI models to access the MCP capabilities:

```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Connect UniAuto to Smithery
smithery connect uniauto-mcp-server

# Connect to AI assistant
smithery connect --assistant claude
```

## Documentation Sections

- [API Reference](api/README.md) - Detailed API documentation
- [Smithery.ai Setup](smithery-setup.md) - Guide for setting up with Smithery.ai
- [Self-healing](self-healing.md) - How self-healing capabilities work
- [Integration Guide](integration-guide.md) - How to integrate with other systems

### AI Model Integration

- [Claude Integration](ai-integration/claude.md) - Setup with Claude
- [VSCode Integration](ai-integration/vscode.md) - Using with VSCode
- [Cursor Integration](ai-integration/cursor.md) - Using with Cursor
- [Other AI Models](ai-integration/other-models.md) - Integration with other AI models

## Enterprise Support

For organizations that require dedicated support, custom features, and SLAs, check out our [Enterprise Support](../ENTERPRISE-SUPPORT.md) options.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](../CONTRIBUTING.md) for details on how to contribute to the project.

## License

UniAuto MCP Server is licensed under the [MIT License](../LICENSE).