# Test Generation with UniAuto MCP

UniAuto MCP Server offers powerful AI-driven test generation capabilities that can automatically create test cases in various frameworks and styles by analyzing applications.

## Features

- **Framework-Agnostic**: Generate tests for any major test framework (Playwright, Cypress, Jest, etc.)
- **Multiple Test Styles**: Support for BDD, TDD, and other testing methodologies
- **Multiple Output Formats**: JavaScript, TypeScript, Python, and other languages
- **AI-Powered Analysis**: Uses Claude AI to analyze application structure and generate appropriate tests
- **Complete Project Scaffolding**: Generate entire test projects with configuration
- **MCP Integration**: Full support through Model Context Protocol

## Test Generation APIs

The server exposes several REST endpoints for test generation:

### Generate Tests

Generate test cases for a specific URL using a chosen framework and style.

**Endpoint**: `POST /api/generate-tests`

**Parameters**:
- `url` (required): URL of the application to analyze
- `framework` (optional): Test framework to use (e.g., playwright, cypress, jest)
- `style` (optional): Test style (e.g., bdd, tdd)
- `format` (optional): Output format (e.g., javascript, typescript, python)
- `prompt` (optional): User prompt describing test requirements
- `outputPath` (optional): Path to save generated tests
- `additionalContext` (optional): Additional context for test generation

### Generate Full Test Suite

Generate a complete test suite with various test types (unit, integration, e2e, etc.) for an application.

**Endpoint**: `POST /api/generate-full-suite`

**Parameters**:
- `url` (required): URL of the application to analyze
- `framework` (optional): Test framework to use
- `format` (optional): Output format
- `outputDir` (optional): Directory to save generated tests
- `additionalContext` (optional): Additional context for test generation

### Scaffold Project

Create a complete test project structure with configuration files for a specific framework.

**Endpoint**: `POST /api/scaffold-project`

**Parameters**:
- `framework` (required): Test framework to use
- `outputDir` (required): Directory to create the project

### List Frameworks

Get a list of supported test frameworks, styles, and formats.

**Endpoint**: `GET /api/test-frameworks`

## Model Context Protocol (MCP) Integration

Test generation capabilities are fully integrated with MCP, allowing AI assistants to generate tests directly.

### MCP Actions

The following MCP actions are supported:

- `generate_tests`: Generate test cases
- `generate_test_suite`: Generate a complete test suite
- `scaffold_project`: Scaffold a test project
- `list_frameworks`: List available frameworks, styles, and formats

### Example MCP Request

```json
{
  "action": "generate_tests",
  "parameters": {
    "url": "https://demo.playwright.dev/todomvc",
    "framework": "playwright",
    "style": "bdd",
    "format": "javascript",
    "prompt": "Generate tests for a TODO application"
  },
  "executionId": "test-execution-id-123"
}
```

## Example Usage

```javascript
const axios = require('axios');

// Generate tests
const response = await axios.post('http://localhost:3000/api/generate-tests', {
  url: 'https://demo.playwright.dev/todomvc',
  framework: 'playwright',
  style: 'bdd',
  format: 'javascript',
  prompt: 'Generate tests for a TODO application'
});

console.log(response.data.testCode);
```

See the `examples/test-generation-demo.js` script for a complete demonstration.

## Supported Frameworks

- Jest
- Mocha
- Cypress
- Playwright
- Selenium
- WebDriverIO
- Cucumber
- TestCafe
- Puppeteer
- Nightwatch

## Supported Test Styles

- BDD (Behavior-Driven Development)
- TDD (Test-Driven Development)
- Component Testing
- Integration Testing
- E2E Testing
- API Testing
- Visual Testing
- Performance Testing

## Supported Output Formats

- JavaScript
- TypeScript
- Python
- Java
- C#
- Ruby