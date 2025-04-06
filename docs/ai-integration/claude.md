# Claude Integration Guide

This guide explains how to integrate UniAuto MCP Server with Claude, Anthropic's AI assistant.

## Claude Code Integration

Claude Code is a specialized version of Claude designed for software development. It has built-in support for the Model Context Protocol (MCP) which makes it ideal for working with UniAuto.

The Model Context Protocol enables Claude to discover and use UniAuto's automation capabilities through a standardized interface.

### Prerequisites

1. Access to Claude Code
2. UniAuto MCP Server installed and running
3. Smithery.ai account (for simplified setup)

### Setup

1. **Install Smithery CLI**

```bash
npm install -g @smithery/cli
```

2. **Connect UniAuto to Smithery**

```bash
smithery connect uniauto-mcp-server
```

3. **Register with Claude**

```bash
smithery connect --assistant claude
```

### Using UniAuto with Claude Code

Once connected, you can ask Claude to perform automation tasks:

```
Can you automate filling out the contact form on example.com?
```

Claude will:
1. Navigate to the website
2. Analyze the form structure
3. Generate and execute automation steps
4. Report results

### Example Commands

Here are some examples of what you can ask Claude to do with UniAuto:

```
Can you automate the login process for GitHub?
```

```
Please fill out the registration form at example.com/register with test data.
```

```
Can you extract all product prices from example.com/shop?
```

## Claude Web Integration

Claude Web can also utilize UniAuto MCP Server through Smithery.ai.

### Setup

1. Log in to Claude Web
2. Ensure your Smithery.ai account is connected to Claude
3. Start a conversation and ask Claude to perform automation tasks

### Permissions

Claude Web will request permission to use the UniAuto tool the first time it's needed. Grant this permission to allow Claude to interact with web pages and desktop applications.

## Advanced Usage

### Custom Automation Workflows

You can ask Claude to create complex automation workflows:

```
Can you create a workflow that:
1. Logs into my Gmail account
2. Finds emails from "newsletter@example.com"
3. Downloads any attachments
4. Organizes them into a folder?
```

Claude will break this down into executable steps using UniAuto commands.

### Self-Healing Capabilities

When selectors change, UniAuto's self-healing will attempt to find the elements using alternative strategies. Claude understands this capability and will work with it:

```
If the login button selector has changed, please use self-healing to find it.
```

### Debugging

If something goes wrong, Claude can help debug the issue:

```
The click on the submit button failed. Can you check what happened and fix it?
```

Claude will analyze the error, suggest alternative approaches, and retry the automation.

## Security Considerations

- UniAuto runs in your local environment and can access any website or application that you can
- Only grant Claude access to automate tasks you're comfortable with
- Sensitive information should not be shared in the chat
- Consider running UniAuto in a controlled environment for high-security scenarios