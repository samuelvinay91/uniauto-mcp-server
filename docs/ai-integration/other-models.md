# Integration with Other AI Models

## Overview

UniAuto MCP Server is compatible with various AI models that support the Machine Control Protocol (MCP). This guide covers how to integrate UniAuto with different AI assistants beyond Claude.

## Supported Models

UniAuto has been tested and works with the following AI models:

- **Anthropic Claude** (all versions)
- **OpenAI GPT-4 and derivatives**
- **Cohere Command models**
- **Any model accessible via Smithery.ai**

## Integration Methods

There are two primary ways to integrate UniAuto with AI models:

1. **Direct MCP Integration**: For models that natively support MCP
2. **Smithery.ai Bridge**: For models that don't have native MCP support

## OpenAI GPT-4 & ChatGPT Integration

### Prerequisites

1. OpenAI API key or ChatGPT Plus subscription
2. UniAuto MCP Server installed and running
3. Smithery.ai account (recommended)

### Setup with Smithery.ai

1. Install Smithery CLI:

```bash
npm install -g @smithery/cli
```

2. Connect UniAuto to Smithery:

```bash
smithery connect uniauto-mcp-server
```

3. Connect OpenAI models:

```bash
smithery connect --assistant openai
```

4. Configure your OpenAI API key:

```bash
smithery config set openai.api_key YOUR_API_KEY
```

### Usage with GPT-4

Once connected, you can use Smithery's integration to enable GPT-4 to control UniAuto:

```
smithery chat --model gpt-4
```

Then ask GPT-4 to automate tasks:

```
Can you help me test the login form on example.com?
```

GPT-4 will use UniAuto to execute the automation.

### ChatGPT Plus with Custom GPT

If you have ChatGPT Plus, you can create a Custom GPT that uses the UniAuto tool:

1. Go to ChatGPT and create a new GPT
2. In the Configure tab, add an Action
3. Set the Authentication to "None"
4. For the API schema, use the UniAuto MCP manifest URL
5. Save and publish your GPT

Now you can chat with your Custom GPT and ask it to perform automation tasks.

## Cohere Command Integration

### Prerequisites

1. Cohere API key
2. UniAuto MCP Server running
3. Smithery.ai account

### Setup

1. Connect Cohere to Smithery:

```bash
smithery connect --assistant cohere
```

2. Configure your Cohere API key:

```bash
smithery config set cohere.api_key YOUR_API_KEY
```

### Usage

Start a conversation with a Cohere model through Smithery:

```bash
smithery chat --model command
```

Then request automation tasks as with other models.

## Local Models Integration

### Supported Local Models

UniAuto can work with local models that support function calling:

- **LM Studio models**
- **Ollama models**
- **LocalAI models**

### Setup with Local Models

1. Install and configure your local model server
2. Expose an API endpoint compatible with OpenAI's API
3. Configure Smithery to use your local endpoint:

```bash
smithery config set local.api_url http://localhost:YOUR_PORT
smithery config set local.model YOUR_MODEL_NAME
```

4. Start a chat session:

```bash
smithery chat --provider local
```

## Custom Integration for Any Model

For models without direct support, you can create a custom integration:

1. Use the UniAuto HTTP API directly
2. The key endpoints are:
   - GET `/api/mcp/manifest` - Returns the tool capabilities
   - POST `/api/mcp/invoke` - Executes automation commands

### Example Custom Integration

```javascript
async function invokeUniAuto(action, parameters) {
  const response = await fetch('http://localhost:3000/api/mcp/invoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      parameters
    })
  });
  
  return await response.json();
}

// Example usage
invokeUniAuto('navigate', { url: 'https://example.com' });
```

## Comparing Model Performance

Different AI models have different strengths when it comes to test automation:

- **Claude models**: Excellent at understanding complex workflows and adapting to UI changes
- **GPT-4**: Strong at generating complex test cases and handling edge cases
- **Specialized models**: May perform better for domain-specific testing

## Troubleshooting Cross-Model Issues

### Common Problems

1. **Model doesn't recognize UniAuto commands**
   - Ensure the model has function calling capabilities
   - Verify that the MCP manifest is being properly loaded

2. **Model generates invalid parameters**
   - Some models may not follow the parameter schema strictly
   - Use schema validation on your end before sending commands to UniAuto

3. **Different reasoning capabilities**
   - Models vary in their ability to reason about UI and test strategies
   - You may need to adjust your prompts based on the model

## Best Practices

1. **Start simple**: Begin with basic automation tasks to ensure everything is working
2. **Use standardized prompts**: Create template prompts that work well across different models
3. **Leverage self-healing**: UniAuto's self-healing features help overcome differences in selector generation
4. **Test model-specific edge cases**: Some models may handle certain automation scenarios better than others

## Resources

- [UniAuto API Reference](../api/README.md)
- [Smithery.ai Documentation](https://docs.smithery.ai)
- [Machine Control Protocol Specification](https://github.com/machinecontrolprotocol/specification)