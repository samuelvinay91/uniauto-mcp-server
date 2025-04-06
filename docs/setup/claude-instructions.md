# Using Claude with UniAuto MCP Server

This document provides instructions for using Claude with the UniAuto MCP Server.

## Setup

The UniAuto MCP Server is running locally on port 3000. It implements the Model Context Protocol (MCP) which allows Claude to control its automation capabilities.

## Testing with Claude

When working with Claude, you can ask it to perform web automation tasks using the UniAuto MCP Server. Here are some example prompts:

1. **Navigate to a website**:
   "Can you use UniAuto to navigate to example.com and tell me what the page title is?"

2. **Fill out a form**:
   "Please use UniAuto to go to example.com/contact and fill out the contact form with test data."

3. **Extract information**:
   "Can you use UniAuto to navigate to example.com and extract the main heading text?"

4. **Take screenshots**:
   "Please navigate to example.com using UniAuto and take a screenshot of the page."

## Connecting to Claude

To connect Claude to your local UniAuto MCP Server, you'll need to:

1. Ensure the server is running (`npm start` in the uniauto-mcp-server directory)
2. Register the MCP server's manifest URL with Claude via Smithery or a similar tool
3. Grant Claude permission to use the tool when prompted

## MCP Server Details

- **Server URL**: http://localhost:3000
- **Manifest Endpoint**: http://localhost:3000/api/mcp/manifest
- **Invoke Endpoint**: http://localhost:3000/api/mcp/invoke

## Available Actions

The UniAuto MCP Server supports these actions:

- `navigate`: Navigate to a URL
- `click`: Click on an element
- `type`: Type text into an input field
- `select`: Select an option from a dropdown
- `extract`: Extract data from an element
- `screenshot`: Take a screenshot
- `wait`: Wait for a specified time
- `desktop_click`: Click at coordinates
- `desktop_type`: Type text
- `ai_process`: Process with AI

## Example Automation Task

Here's a sample automation task you could ask Claude to perform:

"Using UniAuto, please:
1. Navigate to example.com
2. Wait for 2 seconds
3. Extract the main heading text
4. Take a screenshot of the page
5. Tell me what you found"

Claude will use the MCP server to execute these commands and report back the results.