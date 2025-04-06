# Using the Anthropic SDK with UniAuto MCP Server

This guide explains how to use the official Anthropic SDK with UniAuto MCP Server for AI-powered automation with Claude 3.7 Sonnet.

## Prerequisites

1. Node.js v14+ and npm installed
2. UniAuto MCP Server installed and running
3. Anthropic API key (get one from [Anthropic Console](https://console.anthropic.com/))

## Installation

The Anthropic SDK is already included in the UniAuto MCP Server dependencies. If you need to install it separately:

```bash
npm install @anthropic-ai/sdk
```

## Configuration

1. Create a `.env` file in the root directory of your project:

```
PORT=3000
NODE_ENV=development
CLAUDE_API_KEY=sk-ant-api03-your-api-key-here
CLAUDE_MODEL=claude-3-7-sonnet-20240229
```

2. Make sure to replace `your-api-key-here` with your actual Anthropic API key.

## Using the Anthropic SDK

UniAuto MCP Server integrates the Anthropic SDK in the `ai-processing.js` file. Here's how it works:

1. **Initialize the client:**

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
```

2. **Create messages:**

```javascript
const response = await anthropic.messages.create({
  model: "claude-3-7-sonnet-20240229",
  max_tokens: 4000,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Your prompt here"
        }
      ]
    }
  ],
});
```

3. **Include images (optional):**

```javascript
const fs = require('fs');
const imageData = fs.readFileSync('screenshot.png');
const base64Image = imageData.toString('base64');

const response = await anthropic.messages.create({
  model: "claude-3-7-sonnet-20240229",
  max_tokens: 4000,
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "What's in this image?"
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: base64Image
          }
        }
      ]
    }
  ],
});
```

## Testing the Claude Integration

Use the provided test script to check if your Claude integration is working:

```bash
node test-claude.js
```

This script will:
1. Connect to the Anthropic API using your API key
2. Send a simple request to Claude
3. Display the response

## Debugging Claude API Issues

If you encounter errors:

1. **Check your API key:**
   - Make sure it's correctly set in your `.env` file
   - Verify the key is active in your Anthropic Console

2. **Check model availability:**
   - Ensure you have access to the specified model
   - Try using a different model like `claude-3-opus-20240229` or `claude-3-haiku-20240307`

3. **Check API logs:**
   - Review the server logs for detailed error messages
   - Use the Anthropic Console to check API usage and quota

## Using Claude with the MCP Server

Once Claude is properly integrated, you can use it to power the AI processing capabilities of the UniAuto MCP Server:

1. **AI-Generated Automation:**
   ```http
   POST /api/ai/process
   {
     "task": "Fill out the contact form on example.com",
     "url": "https://example.com/contact"
   }
   ```

2. **Self-Healing with AI:**
   The server automatically uses Claude to help find alternative selectors when the original ones fail.

3. **Testing with Claude:**
   See the `test-mcp.js` script for an example of how to test the MCP integration.

## Advanced Configuration

For advanced Claude configuration, edit the `processWithAI` function in `src/handlers/ai-processing.js`:

- Change the model
- Adjust token limits
- Modify the system prompt
- Add additional context

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Claude API best practices](https://docs.anthropic.com/claude/docs/claude-api-best-practices)
- [Anthropic SDK for Node.js](https://github.com/anthropics/anthropic-sdk-typescript)
- [Smithery Integration](../smithery-setup.md)