# UniAuto MCP Server - Getting Started Tutorial

This tutorial will guide you through setting up UniAuto MCP Server and using it to generate tests, perform advanced testing, and integrate with AI assistants like Claude.

## Prerequisites

- Node.js (v16+) installed
- npm or yarn installed
- Basic knowledge of JavaScript and testing concepts
- A Claude API key (for AI-driven features)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/uniauto-mcp-server.git
cd uniauto-mcp-server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create an environment file:

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

### Step 4: Start the Server

```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port you configured in .env).

## Basic Usage Tutorial

### 1. Generate Basic Test Cases

Let's start by generating a basic test case for a login form:

```bash
curl -X POST http://localhost:3000/api/generate-tests \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "framework": "playwright",
    "style": "bdd",
    "format": "javascript",
    "prompt": "Generate tests for adding and completing todo items"
  }'
```

This will return generated test code that you can save to a file.

### 2. Run Accessibility Testing

Let's check a website for accessibility issues:

```bash
curl -X POST http://localhost:3000/api/accessibility-test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "standard": "wcag21aa"
  }'
```

This will return a detailed report of accessibility issues found on the page.

### 3. Perform Visual Testing

First, create a baseline for visual comparison:

```bash
curl -X POST http://localhost:3000/api/visual-compare \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "updateBaseline": true,
    "baselineName": "todomvc_baseline"
  }'
```

Later, you can compare against this baseline:

```bash
curl -X POST http://localhost:3000/api/visual-compare \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "baselineName": "todomvc_baseline"
  }'
```

### 4. Run Performance Tests

Check performance metrics of a website:

```bash
curl -X POST http://localhost:3000/api/performance-test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "iterations": 3
  }'
```

## Advanced Features Tutorial

### 1. Generate a Complete Test Suite

Generate a comprehensive test suite with multiple test types:

```bash
curl -X POST http://localhost:3000/api/generate-full-suite \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "framework": "playwright",
    "format": "javascript",
    "outputDir": "./generated-tests"
  }'
```

### 2. Scaffold a Test Project

Create a complete test project structure:

```bash
curl -X POST http://localhost:3000/api/scaffold-project \
  -H "Content-Type: application/json" \
  -d '{
    "framework": "playwright",
    "outputDir": "./test-project"
  }'
```

### 3. Run a Comprehensive Test Suite

Execute multiple test types at once:

```bash
curl -X POST http://localhost:3000/api/test-suite \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.playwright.dev/todomvc",
    "visual": true,
    "accessibility": true,
    "performance": true,
    "network": true
  }'
```

## Integrating with Claude and AI Assistants

### 1. Install Smithery CLI

```bash
npm install -g @smithery/cli
```

### 2. Connect to Smithery.ai

```bash
# Connect UniAuto to Smithery
smithery connect uniauto-mcp-server

# Connect to Claude
smithery connect --assistant claude
```

### 3. Using Claude to Generate Tests

Now you can use Claude Web or Claude Code to generate tests:

Example prompt:
```
I need Playwright tests for a todo application that verify I can add items, complete them, and delete them. Can you generate these tests using UniAuto MCP server?
```

Claude will use the MCP server to:
1. Analyze the application structure
2. Generate appropriate test code
3. Return the complete test suite

### 4. Using Claude for Visual Analysis

You can also use Claude to interpret visual test results:

Example prompt:
```
I've run a visual comparison test on my application and got some differences. Can you help me understand what changed?
```

Share the visual diff image with Claude, and it will analyze and explain the changes.

## Working with VSCode and Cursor

### 1. VSCode Integration

If you're using VSCode with the Claude extension:

1. Install the Claude VSCode extension
2. Configure it to use Smithery and UniAuto
3. Ask Claude to generate tests directly in your editor

### 2. Cursor Integration

If you're using Cursor:

1. Configure Cursor to use Claude with MCP tools
2. In your project, ask Claude to help with test automation
3. Claude will use UniAuto MCP server to assist with testing tasks

## Common Workflows

### Workflow 1: Rapid Test Development

1. Start with a simple prompt to Claude: "Generate basic tests for feature X"
2. Review the generated tests
3. Ask Claude to enhance specific areas: "Add more error cases to the login tests"
4. Run the tests with your preferred test runner

### Workflow 2: Application Analysis

1. Use the MCP server to analyze an application: `POST /api/test-suite`
2. Review the results for accessibility, performance, and visual issues
3. Ask Claude to suggest improvements based on the analysis
4. Implement the suggested changes

### Workflow 3: CI/CD Integration

1. Set up the MCP server in your CI/CD environment
2. Add a step to your pipeline that calls the MCP server
3. Generate and run tests as part of your automated build process
4. Store test reports for review

## Next Steps

- Explore the [API Documentation](./docs/api/README.md) for all available endpoints
- Check out the [MCP Protocol Guide](./docs/ai-integration/mcp-protocol.md) for advanced integration
- See [Advanced Testing Features](./docs/advanced-testing.md) for more testing capabilities
- Contribute to the project on GitHub