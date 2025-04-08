# UniAuto MCP Server

<p align="center">
  <img src="public/Gemini_Generated_Image_ufccx0ufccx0ufcc.jpeg" alt="UniAuto Logo" width="250"/>
</p>

[![smithery badge](https://smithery.ai/badge/@samuelvinay91/uniauto-mcp-server)](https://smithery.ai/server/@samuelvinay91/uniauto-mcp-server)

Universal Test Automation MCP Server for web and desktop automation with self-healing capabilities and AI integration.

## Cutting-Edge Features

UniAuto MCP Server incorporates several cutting-edge and futuristic features that position it at the forefront of test automation technology:

### 1. Multi-Layered Self-Healing Automation
The server's 5-tier self-healing mechanism is revolutionary, using a sophisticated cascade of recovery strategies:
- Repository-based alternative selectors
- Role-based accessibility selectors
- Dynamic looser selector generation
- Visual element matching using DOM and image recognition
- Contextual text-proximity detection

This multi-strategy approach creates extraordinarily resilient tests that can survive even major UI overhauls.

### 2. AI-Driven Test Generation & Maintenance
Integration with Claude and other LLMs enables:
- Natural language test creation ("Automate the checkout process")
- Automatic test step generation with appropriate selectors
- Intelligent response parsing to turn AI outputs into executable commands
- Visual context interpretation (using screenshots as inputs)
- Automated test code generation in multiple frameworks (Playwright, Cypress, Jest, etc.)
- Support for various testing styles (BDD, TDD) and output formats
- Application structure analysis for intelligent test creation

### 3. MCP (Model Context Protocol) Integration
The MCP implementation is particularly forward-thinking:
- Allows AI assistants to directly control testing infrastructure
- Exposes a standardized API for automation actions
- Enables seamless integration with Smithery.ai and other AI orchestration platforms
- Creates a bridge between LLMs and web/desktop automation
- Full Claude Desktop integration for comprehensive desktop automation

#### Claude Desktop Integration
The enhanced Claude Desktop integration enables:
- Direct connection between Claude Desktop and your MCP server
- Ability to perform desktop clicks at specific coordinates
- Text input automation anywhere on the desktop
- Combined web and desktop automation workflows
- Easy setup with our dedicated configuration scripts

### 4. Unified Web + Desktop Automation
The integration of both web testing (via Playwright) and desktop automation within a single framework provides:
- Cross-domain testing capabilities
- Ability to test flows that span browsers and native applications
- Consistent API across different application types

### 5. Visual Intelligence
The implementation of visual matching provides:
- Element recognition by appearance rather than structure
- Testing continuity even when DOM elements change completely
- Pixel-perfect comparison capabilities

## Core Features

- Web automation using Playwright (multi-browser support)
- Desktop automation capabilities
- Self-healing selectors for resilient test automation
- AI integration for test generation (supports Claude and other models)
- Automated test code generation in multiple frameworks and styles
- MCP (Model Context Protocol) compatibility for use with AI assistants
- Test case management and execution history
- Visual element matching

## Impact on Test Automation Ecosystem

UniAuto MCP Server has the potential to transform the test automation landscape:

### 1. Maintenance Cost Reduction
The self-healing capabilities dramatically reduce the #1 pain point in test automation - maintenance costs. Studies suggest that organizations spend 30-40% of testing time on test maintenance. UniAuto could reduce this by 70-80%, freeing QA resources for more strategic work.

### 2. Democratization of Test Automation
The AI integration allows non-technical stakeholders to create tests using natural language, potentially expanding test automation adoption by:
- Allowing product managers to directly specify acceptance tests
- Enabling business analysts to validate features without coding
- Reducing the specialized skills required for test creation

### 3. Resilience Revolution
By solving the brittleness problem in modern automation, UniAuto shifts the entire ecosystem toward resilience-focused testing rather than selector-focused testing. This paradigm shift fundamentally changes how tests are written and evaluated.

### 4. AI Amplification in Testing
As an MCP-compatible system that works with Claude and other models, UniAuto positions automation as an "AI-native" technology, creating a foundation for:
- AI-driven exploratory testing
- Autonomous test maintenance
- Intelligent test prioritization based on application changes
- Natural language test reporting for stakeholders

### 5. Cross-Domain Testing Standards
By unifying web and desktop testing under one framework, UniAuto helps establish new standards for end-to-end testing that transcend the current siloed approach to different application types.

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

# Claude Configuration (required for AI processing)
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-7-sonnet-20240229

# Desktop Integration (optional)
ENABLE_DESKTOP_INTEGRATION=true
```

### Claude Desktop Integration

To set up Claude Desktop integration, follow these steps:

1. Make sure desktop integration is enabled in your `.env` file:
   ```
   ENABLE_DESKTOP_INTEGRATION=true
   ```

2. Run the setup script:
   ```bash
   npm run setup:claude-desktop
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Test the connection:
   ```bash
   npm run test:connection
   ```

5. In Claude Desktop:
   - Go to Settings > Tools
   - Click "Add Tool"
   - Enter `http://localhost:3000/api/mcp/manifest`
   - Authorize the connection when prompted

For more detailed instructions, see [Claude Desktop Integration Guide](docs/ai-integration/claude-desktop.md).

### Claude API Integration

UniAuto MCP Server uses the official Anthropic SDK to integrate with Claude:

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const response = await anthropic.messages.create({
  model: "claude-3-7-sonnet-20240229",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
});
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

### Test Generation
- `POST /api/generate-tests` - Generate test cases for an application
- `POST /api/generate-full-suite` - Generate a complete test suite with multiple test types
- `POST /api/scaffold-project` - Scaffold a complete test project structure
- `GET /api/test-frameworks` - Get available test frameworks, styles, and formats

### Advanced Testing
- `POST /api/visual-compare` - Compare a page or element against a baseline image
- `POST /api/accessibility-test` - Perform accessibility testing on a page
- `POST /api/performance-test` - Perform performance testing on a page
- `POST /api/network-trace` - Trace network activity for API testing
- `POST /api/test-suite` - Run a comprehensive test suite

### MCP Integration
- `POST /api/mcp/invoke` - MCP compatible command execution
- `GET /api/mcp/manifest` - Get MCP manifest

## MCP Integration

This server is compatible with the Model Context Protocol (MCP) used by AI assistants like Claude. To use it with Claude or other AI models:

1. Start the server
2. Register the MCP server with the AI assistant
3. The AI can now use the automation capabilities via the MCP protocol

### Supported Integrations

UniAuto MCP Server supports integrations with multiple AI assistants and development environments:

- **Claude**: Claude Web, Claude Desktop, Claude in VSCode, Claude Code CLI
- **Cursor**: AI-powered code editor with Claude integration
- **VSCode**: Visual Studio Code with Claude extension
- **Smithery.ai**: Platform for connecting AI assistants to tools
- **CLI**: Command line interface for automation
- **Windsurf**: Additional AI assistant compatibility

### Integration Setup

```bash
# Generate configuration files for all integrations
npm run setup:integrations

# Configure for Claude Desktop
npm run setup:claude-desktop

# Connect with Smithery.ai
npm run smithery:connect

# Test the connection
npm run test:connection
```

The `config` directory contains example configuration files for all supported integrations.

### Smithery.ai Integration

[![smithery badge](https://smithery.ai/badge/@samuelvinay91/uniauto-mcp-server)](https://smithery.ai/server/@samuelvinay91/uniauto-mcp-server)

UniAuto MCP Server integrates seamlessly with [Smithery.ai](https://smithery.ai), making it easy to connect with Claude 3.7 and other AI assistants:

```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Connect UniAuto to Smithery
smithery connect uniauto-mcp-server

# Connect to an AI assistant
smithery connect --assistant claude
```

Once connected, you can use Claude Code, Claude Web, VSCode with Claude Extension, or Cursor to control UniAuto for automated testing.

See the [Smithery Setup Guide](docs/setup/SMITHERY-CLAUDE-GUIDE.md) for detailed instructions.

### Integration-Specific Setup

#### Claude Desktop

1. Start the MCP server:
   ```bash
   npm start
   ```

2. In Claude Desktop:
   - Go to Settings > Tools
   - Add Tool: `http://localhost:3000/api/mcp/manifest`
   - Authorize the connection

#### VSCode with Claude Extension

1. Copy `config/vscode-settings-example.json` settings to your VSCode settings.json
2. Start the MCP server
3. Open Claude in VSCode and request automation tasks

#### Cursor IDE

1. Copy `config/cursor-settings-example.json` settings to your Cursor settings
2. Start the MCP server
3. Use Claude in Cursor to perform automation tasks

### AI Assistant Integration Documentation

For more detailed integration guides:

- [Claude Integration Guide](docs/ai-integration/claude.md)
- [VSCode Integration Guide](docs/ai-integration/vscode.md)
- [Cursor Integration Guide](docs/ai-integration/cursor.md)
- [Other AI Models Integration](docs/ai-integration/other-models.md)
- [Test Generation Guide](docs/ai-integration/test-generation.md)

## Test Generation Capabilities

UniAuto MCP Server can automatically generate test code in various frameworks and styles:

- **Multiple Frameworks**: Generate tests for Playwright, Cypress, Jest, Selenium, WebDriverIO, and more
- **Test Styles**: Support for BDD, TDD, and other testing methodologies
- **Output Formats**: JavaScript, TypeScript, Python, Java, C#, and Ruby
- **Application Analysis**: Intelligent application structure analysis for context-aware test generation
- **Project Scaffolding**: Generate complete test projects with configuration files
- **Claude AI Integration**: Uses Claude 3.7 to produce high-quality, maintainable test code
- **MCP Integration**: All test generation capabilities exposed via the Model Context Protocol

## Advanced Testing Capabilities

UniAuto MCP Server provides comprehensive testing capabilities beyond just generating test code:

- **Visual Testing**: Compare page or element screenshots against baselines with configurable thresholds
- **Accessibility Testing**: Check WCAG compliance with detailed reports on issues and suggested fixes 
- **Performance Testing**: Measure key web performance metrics like load time, FCP, LCP, and resources
- **Network Tracing**: Monitor API calls, analyze responses, and validate network behavior
- **Parallel Execution**: Run multiple test types concurrently to reduce total execution time
- **Comprehensive Test Suite**: Combined test execution with unified reporting

See the [Test Generation Guide](docs/ai-integration/test-generation.md) for detailed API documentation and examples.

## Self-Healing Capabilities

The server uses several strategies for self-healing selectors:

1. Alternative selector repository
2. Role-based selectors (Playwright specific)
3. Looser CSS selector generation
4. Visual element matching using Playwright's built-in capabilities
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
