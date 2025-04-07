# Claude Integration with UniAuto MCP Server

This guide provides detailed instructions for integrating Claude AI with UniAuto MCP Server for advanced test automation, test generation, and analysis.

## Overview

UniAuto MCP Server leverages Claude's advanced capabilities for:

1. **Test Code Generation** - Creating high-quality, maintainable test code
2. **Intelligent Test Analysis** - Understanding application structure and behavior
3. **Natural Language Interaction** - Converting user requirements to test automation
4. **Visual Understanding** - Analyzing screenshots for testing context

## Prerequisites

- UniAuto MCP Server installed and running
- Claude API key (Claude 3.7 Sonnet or newer recommended)
- Smithery.ai CLI installed

## Setup Process

### 1. Configure Claude API Key

Add your Claude API key to the `.env` file:

```
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-7-sonnet-20240229
```

### 2. Connect to Smithery.ai

Register UniAuto MCP Server with Smithery:

```bash
smithery connect uniauto-mcp-server
```

Connect Claude to Smithery:

```bash
smithery connect --assistant claude
```

### 3. Test the Connection

Verify the connection is working:

```bash
smithery list connections
smithery list tools
```

## Using Claude with UniAuto

Claude can interact with UniAuto MCP Server in several ways:

### 1. Claude Web / Claude Code

Simply ask Claude to perform testing tasks. Claude will use the MCP server behind the scenes.

Example prompts:
- "Generate Playwright tests for the login form at example.com"
- "Run accessibility tests on my website and highlight WCAG violations"
- "Create a visual comparison baseline for my homepage and dashboard"
- "Analyze the performance of my checkout flow"

### 2. VSCode with Claude Extension

1. Launch VSCode with the Claude extension
2. Make sure Smithery integration is enabled
3. Ask Claude to perform testing tasks

Example:
```
Claude, I need to test my React application's form validation. Can you generate tests that verify all validation rules are working correctly?
```

### 3. Cursor AI

1. Open your project in Cursor
2. In the AI panel, prompt Claude to generate or run tests
3. Claude will use the MCP server to perform the requested tasks

## Advanced Claude Features

### Visual Capabilities

Claude 3.7's multimodal capabilities can be leveraged in several ways:

1. **Screenshot Analysis**
   - Share screenshots with Claude to get targeted test suggestions
   - Ask Claude to identify visual elements for testing
   - Use screenshots to debug failed tests

2. **Interactive Testing**
   - Claude can interpret test results with screenshots
   - Ask Claude to explain visual differences in regression tests
   - Use Claude to identify accessibility issues from visual evidence

Example prompt:
```
Here's a screenshot of my application. Can you generate tests that verify all the form fields are working correctly? Pay special attention to the validation messages.
```

### Natural Language Test Requirements

Claude excels at converting natural language requirements into formal test cases:

Example:
```
I need tests for an e-commerce checkout flow with these requirements:
1. Users must be logged in to checkout
2. The cart must have at least one item
3. Payment information must be validated
4. Users should receive an order confirmation
5. The inventory should be updated after purchase

Can you create a comprehensive test suite for this?
```

### Test Maintenance and Evolution

Claude can help maintain and evolve your test suite:

1. **Test Refactoring**
   - Ask Claude to refactor tests for better maintainability
   - Request updates to tests when application requirements change

2. **Test Coverage Analysis**
   - Share your current tests with Claude for analysis
   - Ask for recommendations on improving coverage

Example:
```
Here are my current tests for the user authentication system. Can you analyze them for coverage gaps and suggest additional tests to ensure comprehensive testing?
```

## MCP Actions Available to Claude

Through the MCP protocol, Claude can use these actions:

### Basic Automation
- `navigate`: Open URLs
- `click`: Interact with elements
- `type`: Enter text
- `extract`: Get data from pages

### Test Generation
- `generate_tests`: Create tests for specific frameworks
- `generate_test_suite`: Build complete test suites
- `scaffold_project`: Create project structure
- `list_frameworks`: Get available frameworks

### Advanced Testing
- `visual_compare`: Visual regression testing
- `accessibility_test`: Check accessibility compliance
- `performance_test`: Measure performance metrics
- `network_trace`: API and network monitoring
- `run_test_suite`: Execute comprehensive test suites

## Best Practices

1. **Be Specific**
   - Provide Claude with detailed requirements
   - Specify target frameworks and styles
   - Include acceptance criteria

2. **Iterative Development**
   - Start with basic test generation
   - Refine generated tests with follow-up prompts
   - Build test suites incrementally

3. **Provide Context**
   - Share application URLs for direct testing
   - Describe application architecture
   - Mention specific technologies being used

4. **Leverage Claude's Memory**
   - Reference previous tests in follow-up requests
   - Ask Claude to build upon existing test suites
   - Provide feedback on generated tests

## Troubleshooting Claude Integration

### Common Issues

1. **Claude API Rate Limits**
   - If you hit rate limits, try spacing out requests
   - Consider upgrading to a higher tier Claude API plan

2. **Context Window Limitations**
   - For large applications, focus Claude on specific components
   - Break down large test suites into manageable segments

3. **Prompt Engineering**
   - If Claude generates incorrect tests, refine your prompts
   - Provide examples of desired test structure
   - Use step-by-step instructions for complex scenarios

## Examples

### Example 1: Generate BDD Tests

```
Claude, I need Playwright tests in BDD style for a user registration flow. The flow should test:
1. Successful registration with valid data
2. Validation errors for invalid email format
3. Password strength requirements
4. Username availability check
5. Account activation via email

Please generate a complete test suite using the UniAuto MCP server.
```

### Example 2: Accessibility Testing

```
Claude, please use UniAuto to run accessibility tests on https://example.com. I'm particularly concerned about WCAG 2.1 AA compliance issues related to:
1. Color contrast
2. Keyboard navigation
3. Screen reader compatibility
4. Form label associations

Please provide a detailed report of any issues found.
```

### Example 3: Visual Testing

```
Claude, I've updated my website's UI. Can you use UniAuto to:
1. Create a baseline screenshot of the homepage
2. Compare it against the production version
3. Highlight any visual differences
4. Generate a report explaining the changes

I'm especially concerned about responsive behavior and element positioning.
```