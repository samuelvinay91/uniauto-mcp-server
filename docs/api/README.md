# UniAuto MCP Server API Documentation

## Base URL

All API endpoints are relative to the base URL:

```
http://your-server:3000/api
```

## Authentication

Currently, the API does not require authentication. For production use, it's recommended to implement token-based authentication.

## Endpoints

### Health Check

```
GET /health
```

Returns the current status of the server.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-04-06T12:00:00.000Z"
}
```

### Automation Commands

```
POST /execute
```

Execute an automation command.

**Request Body:**

```json
{
  "command": "navigate",
  "params": {
    "url": "https://example.com"
  }
}
```

**Supported Commands:**

| Command | Description | Required Parameters | Optional Parameters |
|---------|-------------|---------------------|---------------------|
| `navigate` | Navigate to a URL | `url`: The URL to navigate to | `waitUntil`: Navigation strategy |
| `click` | Click on an element | `selector`: CSS selector of the element | `timeout`: Wait timeout in ms |
| `type` | Type text into a field | `selector`: CSS selector, `text`: Text to type | `clearFirst`: Clear field first (boolean) |
| `select` | Select option from dropdown | `selector`: CSS selector, `value`: Option value | `timeout`: Wait timeout in ms |
| `extract` | Extract data from element | `selector`: CSS selector | `attribute`: Attribute to extract (defaults to 'textContent') |
| `screenshot` | Take a screenshot | (none) | `fileName`: Name for the screenshot file |
| `wait` | Wait for a specified time | (none) | `milliseconds`: Time to wait (default: 1000) |
| `desktop_click` | Click at screen coordinates | `x`: X coordinate, `y`: Y coordinate | (none) |
| `desktop_type` | Type text at current position | `text`: Text to type | (none) |

**Response:**

```json
{
  "status": "success",
  "url": "https://example.com"
}
```

Different commands return different result structures. All responses include a `status` field.

### Test Case Management

#### Create Test Case

```
POST /test-cases
```

Create a new test case.

**Request Body:**

```json
{
  "name": "Login Test",
  "description": "Tests the login functionality",
  "steps": [
    {
      "command": "navigate",
      "description": "Navigate to login page",
      "parameters": {
        "url": "https://example.com/login"
      }
    },
    {
      "command": "type",
      "description": "Enter username",
      "parameters": {
        "selector": "#username",
        "text": "testuser"
      }
    }
  ],
  "tags": ["login", "authentication"]
}
```

**Response:**

```json
{
  "_id": "60a12e1bb3f4a23456789abc",
  "name": "Login Test",
  "description": "Tests the login functionality",
  "steps": [...],
  "tags": ["login", "authentication"],
  "createdAt": "2025-04-06T12:00:00.000Z"
}
```

#### Get All Test Cases

```
GET /test-cases
```

Returns all test cases.

**Response:**

```json
[
  {
    "_id": "60a12e1bb3f4a23456789abc",
    "name": "Login Test",
    "description": "Tests the login functionality",
    "steps": [...],
    "tags": ["login", "authentication"],
    "createdAt": "2025-04-06T12:00:00.000Z"
  },
  ...
]
```

#### Get Test Case by ID

```
GET /test-cases/:id
```

Returns a specific test case by ID.

**Response:**

```json
{
  "_id": "60a12e1bb3f4a23456789abc",
  "name": "Login Test",
  "description": "Tests the login functionality",
  "steps": [...],
  "tags": ["login", "authentication"],
  "createdAt": "2025-04-06T12:00:00.000Z"
}
```

#### Update Test Case

```
PUT /test-cases/:id
```

Update an existing test case.

**Request Body:**

```json
{
  "name": "Updated Login Test",
  "description": "Updated description",
  "steps": [...],
  "tags": ["login", "authentication", "updated"]
}
```

**Response:**

```json
{
  "_id": "60a12e1bb3f4a23456789abc",
  "name": "Updated Login Test",
  "description": "Updated description",
  "steps": [...],
  "tags": ["login", "authentication", "updated"],
  "createdAt": "2025-04-06T12:00:00.000Z",
  "updatedAt": "2025-04-06T14:00:00.000Z"
}
```

#### Delete Test Case

```
DELETE /test-cases/:id
```

Delete a test case.

**Response:**

```json
{
  "message": "Test case deleted successfully"
}
```

### AI Integration

```
POST /ai/process
```

Process a task with AI to generate automation steps.

**Request Body:**

```json
{
  "task": "Log into example.com with username 'testuser' and password 'password123'",
  "url": "https://example.com",
  "model": "claude",
  "context": {
    "additionalInfo": "The login button is a blue button at the bottom of the form"
  }
}
```

**Response:**

```json
{
  "task": "Log into example.com with username 'testuser' and password 'password123'",
  "steps": [
    {
      "command": "navigate",
      "description": "Navigate to example.com",
      "parameters": {
        "url": "https://example.com"
      }
    },
    {
      "command": "type",
      "description": "Enter username",
      "parameters": {
        "selector": "#username",
        "text": "testuser"
      }
    },
    {
      "command": "type",
      "description": "Enter password",
      "parameters": {
        "selector": "#password",
        "text": "password123"
      }
    },
    {
      "command": "click",
      "description": "Click login button",
      "parameters": {
        "selector": "button.login-btn"
      }
    }
  ],
  "rawResponse": "To log into example.com, follow these steps:\n1. Navigate to example.com\n2. Enter username in the #username field\n3. Enter password in the #password field\n4. Click the blue login button at the bottom"
}
```

### MCP Integration

#### MCP Invoke

```
POST /mcp/invoke
```

Execute an MCP action.

**Request Body:**

```json
{
  "action": "navigate",
  "parameters": {
    "url": "https://example.com"
  },
  "executionId": "mcp-123456"
}
```

**Response:**

```json
{
  "executionId": "mcp-123456",
  "status": "success",
  "action": "navigate",
  "result": {
    "status": "success",
    "url": "https://example.com"
  }
}
```

#### MCP Manifest

```
GET /mcp/manifest
```

Returns the MCP manifest describing the available actions.

**Response:**

```json
{
  "name": "UniAuto Test Automation",
  "version": "1.0.0",
  "description": "Universal Test Automation with self-healing capabilities",
  "author": "UniAuto Team",
  "actions": [
    {
      "name": "navigate",
      "description": "Navigate to a URL",
      "parameters": [
        { "name": "url", "type": "string", "description": "URL to navigate to", "required": true }
      ]
    },
    ...
  ]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created (for POST requests that create resources)
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

Error responses include a JSON object with an `error` field containing a descriptive message:

```json
{
  "error": "Command is required"
}
```

## WebSocket API

Connect to the WebSocket endpoint:

```
ws://your-server:3000
```

### Messages

#### Client to Server

```json
{
  "type": "command",
  "requestId": "12345",
  "command": "navigate",
  "params": {
    "url": "https://example.com"
  }
}
```

#### Server to Client (Success)

```json
{
  "type": "response",
  "requestId": "12345",
  "result": {
    "status": "success",
    "url": "https://example.com"
  }
}
```

#### Server to Client (Error)

```json
{
  "type": "error",
  "message": "Failed to navigate: invalid URL"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. For production use, it's recommended to implement appropriate rate limiting.

## Smithery.ai Integration

UniAuto MCP Server is designed to work seamlessly with Smithery.ai, which allows AI models to access the MCP capabilities.

### Setting Up Smithery.ai Connection

1. Install the Smithery CLI:

```bash
npm install -g @smithery/cli
```

2. Connect UniAuto to Smithery:

```bash
smithery connect uniauto-mcp-server
```

3. Register with an AI assistant:

```bash
smithery connect --assistant claude
```

### Using the Smithery.ai CLI

After configuration, you can use the Smithery CLI to chat with AI models that can control UniAuto:

```bash
smithery chat --model claude-3-sonnet
```

### Programmatic Access through Smithery.ai

Smithery.ai provides an SDK for programmatic access:

```javascript
const { SmitheryClient } = require('@smithery/sdk');

const smithery = new SmitheryClient({
  apiKey: 'your_smithery_api_key'
});

// Connect to an AI assistant with UniAuto MCP capabilities
const session = await smithery.createSession({
  assistant: 'claude',
  tools: ['uniauto-mcp-server']
});

// Send a message to the AI
const response = await session.sendMessage({
  content: 'Can you help me test the login form on example.com?'
});

console.log(response.content);
```

### Smithery.ai Tool Configuration

The UniAuto MCP Server can be configured in Smithery.ai with specific parameters:

```bash
smithery connect uniauto-mcp-server \
  --endpoint "http://localhost:3000" \
  --capabilities "web_automation,desktop_automation,self_healing" \
  --scope "global"
```

For more information about Smithery.ai integration, see the [Smithery Setup Guide](../smithery-setup.md).