# Cursor Integration Guide

## Overview

This guide explains how to integrate UniAuto MCP Server with Cursor, an AI-powered code editor. This integration enables you to automate testing and UI interactions directly from your development environment.

## Prerequisites

1. Cursor editor installed ([Download from cursor.sh](https://cursor.sh))
2. UniAuto MCP Server installed and running
3. Smithery.ai account (for simpler setup)

## Setup Steps

### 1. Install Smithery CLI

If you haven't already, install the Smithery CLI tool:

```bash
npm install -g @smithery/cli
```

### 2. Connect UniAuto to Smithery

```bash
smithery connect uniauto-mcp-server
```

### 3. Configure Cursor

1. Open Cursor
2. Go to Settings > AI Settings
3. Enable "Machine Control Protocol (MCP)"
4. Under MCP Tools, add UniAuto:
   - Tool Name: UniAuto
   - Manifest URL: http://localhost:3000/api/mcp/manifest
   - Invoke URL: http://localhost:3000/api/mcp/invoke

Alternatively, if using Smithery, simply enable "Use Smithery.ai for Tools" in the settings.

## Testing with Cursor + Claude

Cursor uses Claude by default, which works seamlessly with UniAuto. Here's how to use it:

### Basic Usage

1. Open the AI panel in Cursor (Cmd/Ctrl + Shift + A)
2. Ask Claude to perform automation tasks:

```
Can you automate testing the login form on our application?
```

Claude will detect that it can use UniAuto and offer to perform the automation.

### Advanced Testing

You can ask Claude to create and run complex test sequences:

```
Create a test suite for our e-commerce checkout flow using UniAuto.
The flow should:
1. Add a product to cart
2. Proceed to checkout
3. Fill out shipping information
4. Complete payment
5. Verify order confirmation
```

Claude will:
1. Generate a test plan
2. Create test scripts
3. Execute the tests using UniAuto
4. Report results and suggest improvements

## Test Case Generation

### From User Stories

You can ask Claude to generate tests from user stories or requirements:

```
Based on this user story: "As a user, I want to be able to filter products by category and price range", generate UniAuto tests.
```

### From Existing Code

Claude can analyze your application code and generate appropriate tests:

```
Analyze this React component and create UniAuto tests for it:

[paste your component code here]
```

## Self-Healing Capabilities

UniAuto's self-healing features work especially well with Cursor + Claude:

```
Create a test for our product search feature that uses UniAuto's self-healing capabilities to handle UI changes.
```

Claude will generate tests that leverage UniAuto's multiple selector strategies and visual recognition.

## CI/CD Integration

You can ask Claude to help set up CI/CD pipelines that use UniAuto:

```
Create a GitHub Actions workflow that runs our UniAuto tests on every pull request.
```

Claude will generate the necessary YAML configuration files and explain how to set them up.

## Debugging

If your tests fail, Claude can help diagnose and fix issues:

```
This UniAuto test is failing with the error "Element not found". Can you help debug it?

[paste your test code here]
```

Claude will analyze the problem and suggest fixes, possibly using UniAuto's self-healing or alternative selectors.

## Tips for Working with Cursor + UniAuto

1. **Keep the Context Window Open**: When working on complex automation, keep relevant code files open in Cursor to give Claude more context.

2. **Use Split View**: Use Cursor's split view to keep your test code visible while Claude helps debug and improve it.

3. **Save Common Patterns**: When Claude creates effective test patterns, save them as snippets for future use.

4. **Leverage Cursor's Code History**: Cursor keeps track of AI-generated code. If a test approach doesn't work, you can easily roll back to a previous version.

5. **Combine with Manual Testing**: Ask Claude to generate tests that complement your manual testing efforts, focusing on regression testing and edge cases.

## Troubleshooting

### Connection Issues

If Cursor can't connect to UniAuto:

1. Ensure UniAuto server is running
2. Check that the port (default 3000) is not blocked by a firewall
3. Verify the manifest and invoke URLs in Cursor settings

### Permission Problems

If Claude reports permission issues:

1. Make sure you've granted permission for the tool when prompted
2. Check that your Smithery.ai account has the correct permissions
3. Restart Cursor and try again

### Test Failures

For persistent test failures:

1. Ask Claude to add debug logging to the tests
2. Use UniAuto's screenshot capability to see what's happening
3. Try running with self-healing explicitly enabled

## Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [UniAuto API Reference](../api/README.md)
- [Smithery.ai Documentation](https://docs.smithery.ai)