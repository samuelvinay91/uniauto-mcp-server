#!/bin/bash
# UniAuto MCP Server Launcher
# This shell script runs the main server for Claude Desktop integration

echo
echo "=== UniAuto MCP Server - Main Server Launcher ==="
echo
echo "This will run the complete MCP server for Claude Desktop integration."
echo

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Server script path
SERVER_SCRIPT="$PROJECT_ROOT/src/index.js"

# Check if the server script exists
if [ ! -f "$SERVER_SCRIPT" ]; then
    echo "ERROR: Could not find server script at:"
    echo "$SERVER_SCRIPT"
    echo
    echo "Please make sure the file exists."
    exit 1
fi

echo "Starting UniAuto MCP server in MCP mode..."
echo
echo "The server will keep running in this window."
echo "Press Ctrl+C to stop the server when finished."
echo

# Set environment variables for proper MCP communication
export MCP_ENABLED=true
export LOG_TO_STDERR=true

# Run the main server with MCP flag
node "$SERVER_SCRIPT" --mcp-server

echo
echo "Server stopped."
