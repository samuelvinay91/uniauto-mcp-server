# UniAuto MCP Server

Universal Test Automation MCP Server for web and desktop automation with self-healing capabilities and AI integration.

## Features

- Web automation using Playwright (multi-browser support)
- Desktop automation using RobotJS
- Self-healing selectors for resilient test automation
- AI integration for test generation (supports Claude and other models)
- MCP (Machine Control Protocol) compatibility for use with AI assistants
- Test case management and execution history
- Visual element matching using OpenCV

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/uniauto-mcp-server.git
cd uniauto-mcp-server

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Create environment file
cp .env.example .env
```

## Configuration

Edit the `.env` file to configure the server:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/uniauto

# AI Configuration
CLAUDE_API_KEY=your_claude_api_key
```

## Usage

```bash
# Start the server in development mode
npm run dev

# Start the server in production mode
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Automation Commands
- `POST /api/execute` - Execute automation command

### Test Case Management
- `POST /api/test-cases` - Create a test case
- `GET /api/test-cases` - Get all test cases
- `GET /api/test-cases/:id` - Get a test case by ID
- `PUT /api/test-cases/:id` - Update a test case
- `DELETE /api/test-cases/:id` - Delete a test case

### AI Integration
- `POST /api/ai/process` - Process automation task with AI

### MCP Integration
- `POST /api/mcp/invoke` - MCP compatible command execution
- `GET /api/mcp/manifest` - Get MCP manifest

## MCP Integration

This server is compatible with the Machine Control Protocol (MCP) used by AI assistants like Claude. To use it with Claude or other AI models:

1. Start the server
2. Register the MCP server with the AI assistant
3. The AI can now use the automation capabilities via the MCP protocol

### Smithery.ai Integration

For seamless integration with AI assistants, you can use Smithery.ai:

```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Connect UniAuto to Smithery
smithery connect uniauto-mcp-server

# Connect to an AI assistant
smithery connect --assistant claude
```

Once connected, you can use Claude Code, Claude Web, VSCode with Claude Extension, or Cursor to control UniAuto for automated testing.

See the [Smithery Setup Guide](docs/smithery-setup.md) for detailed instructions.

### AI Assistant Integration

UniAuto works with various AI assistants:

- [Claude Integration Guide](docs/ai-integration/claude.md)
- [VSCode Integration Guide](docs/ai-integration/vscode.md)
- [Cursor Integration Guide](docs/ai-integration/cursor.md)
- [Other AI Models Integration](docs/ai-integration/other-models.md)

## Self-Healing Capabilities

The server uses several strategies for self-healing selectors:

1. Alternative selector repository
2. Role-based selectors (Playwright specific)
3. Looser CSS selector generation
4. Visual element matching using OpenCV
5. Nearest text-based element finding

## Playwright Benefits

Playwright offers several advantages for test automation:

- **Cross-browser support**: Works with Chromium, Firefox, and WebKit
- **Modern web support**: Better handling of Shadow DOM, iframes, and web components
- **Powerful selectors**: Role-based selectors, text-based selection, and CSS/XPath support
- **Auto-waiting**: Automatically waits for elements to be ready before acting
- **Reliable actions**: More reliable element interactions with retries and timing management
- **Network control**: Intercept and modify network requests
- **Headless and headed mode**: Visual debugging when needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.