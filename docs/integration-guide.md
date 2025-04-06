# UniAuto MCP Server Integration Guide

## Overview

This guide explains how to integrate the UniAuto MCP Server with external systems, including AI assistants like Claude, and other test automation frameworks.

## MCP Integration with AI Assistants

UniAuto MCP Server is compatible with the Machine Control Protocol (MCP) used by AI assistants like Claude. This allows AI assistants to control web and desktop automation directly.

### Setup for Claude Integration

1. Start the UniAuto MCP Server

```bash
npm start
```

2. Register the MCP server with Claude:

```
Register this MCP server: http://your-server:3000/api/mcp/manifest
```

3. Once registered, Claude can use commands like:

```
navigate to https://example.com
click on #login-button
type "myusername" into #username
```

### Example Claude Conversation

```
User: Can you help me automate logging into example.com?

Claude: I can help you automate that. Let me use the automation tool to do this.

[Claude uses MCP commands]:
1. navigate to https://example.com
2. click on #login-button
3. type "username" into #username
4. type "password" into #password
5. click on #submit

I've completed the login automation. Is there anything specific you'd like to do after logging in?
```

## API Integration

You can integrate with the UniAuto server directly via its REST API:

### Basic Authentication Flow

```javascript
const axios = require('axios');

async function automateLogin() {
  const baseUrl = 'http://localhost:3000/api';
  
  // Navigate to the login page
  await axios.post(`${baseUrl}/execute`, {
    command: 'navigate',
    params: { url: 'https://example.com/login' }
  });
  
  // Type username
  await axios.post(`${baseUrl}/execute`, {
    command: 'type',
    params: {
      selector: '#username',
      text: 'testuser',
      options: { clearFirst: true }
    }
  });
  
  // Type password
  await axios.post(`${baseUrl}/execute`, {
    command: 'type',
    params: {
      selector: '#password',
      text: 'password123',
      options: { clearFirst: true }
    }
  });
  
  // Click login button
  await axios.post(`${baseUrl}/execute`, {
    command: 'click',
    params: { selector: '#login-button' }
  });
  
  // Take a screenshot
  const screenshotResult = await axios.post(`${baseUrl}/execute`, {
    command: 'screenshot',
    params: { fileName: 'login-result.png' }
  });
  
  console.log('Login automation completed');
  console.log('Screenshot saved at:', screenshotResult.data.path);
}

automateLogin().catch(console.error);
```

## WebSocket Integration

For real-time communication, you can use the WebSocket interface:

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to UniAuto server');
  
  // Send automation command
  ws.send(JSON.stringify({
    type: 'command',
    requestId: '123',
    command: 'navigate',
    params: { url: 'https://example.com' }
  }));
});

ws.on('message', (data) => {
  const response = JSON.parse(data);
  console.log('Received response:', response);
  
  if (response.type === 'response' && response.requestId === '123') {
    // Send next command
    ws.send(JSON.stringify({
      type: 'command',
      requestId: '124',
      command: 'click',
      params: { selector: '#some-button' }
    }));
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

## Integration with Testing Frameworks

### Jest Integration

```javascript
const axios = require('axios');

const uniauto = {
  async execute(command, params) {
    const response = await axios.post('http://localhost:3000/api/execute', {
      command,
      params
    });
    return response.data;
  },
  
  async navigate(url) {
    return this.execute('navigate', { url });
  },
  
  async click(selector) {
    return this.execute('click', { selector });
  },
  
  async type(selector, text, options = {}) {
    return this.execute('type', { selector, text, options });
  }
};

describe('Login Flow', () => {
  test('should login successfully', async () => {
    await uniauto.navigate('https://example.com/login');
    await uniauto.type('#username', 'testuser');
    await uniauto.type('#password', 'password123');
    await uniauto.click('#login-button');
    
    // Extract the welcome message
    const result = await uniauto.execute('extract', {
      selector: '.welcome-message',
      attribute: 'textContent'
    });
    
    expect(result.data).toContain('Welcome, testuser');
  });
});
```

## Self-Healing Integration

The self-healing capabilities are automatically applied when selectors fail, but you can also explicitly use them:

```javascript
async function automateWithRetry() {
  try {
    // Try with normal selector
    await axios.post('http://localhost:3000/api/execute', {
      command: 'click',
      params: { selector: '#submit-button' }
    });
  } catch (error) {
    console.log('Original selector failed, the server will try to self-heal');
    
    // The server will automatically try to self-heal the selector on retry
    await axios.post('http://localhost:3000/api/execute', {
      command: 'click',
      params: { 
        selector: '#submit-button',
        options: { forceRetry: true } 
      }
    });
  }
}
```

## AI-Powered Test Generation

You can use the AI processing endpoint to generate test steps:

```javascript
async function generateTest() {
  const response = await axios.post('http://localhost:3000/api/ai/process', {
    task: 'Log into example.com with username "testuser" and password "password123", then click on the dashboard link',
    model: 'claude' // or other supported models
  });
  
  const steps = response.data.steps;
  console.log('Generated steps:', steps);
  
  // Execute the generated steps
  for (const step of steps) {
    await axios.post('http://localhost:3000/api/execute', {
      command: step.command,
      params: step.parameters
    });
    console.log(`Executed step: ${step.description}`);
  }
}
```

## Conclusion

This integration guide covers the most common ways to interact with the UniAuto MCP Server. For more detailed information, refer to the API documentation or contact the UniAuto team for support.
