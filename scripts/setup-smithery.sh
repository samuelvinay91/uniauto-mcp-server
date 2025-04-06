#!/bin/bash

# Setup script for Smithery.ai with Claude 3.7 and UniAuto MCP Server
# This script automates the setup process for connecting UniAuto to Claude via Smithery

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display step header
display_step() {
  echo -e "\n${BLUE}=========================================${NC}"
  echo -e "${YELLOW}Step $1: $2${NC}"
  echo -e "${BLUE}=========================================${NC}\n"
}

# Check if Node.js is installed
check_node() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v16 or later.${NC}"
    exit 1
  fi
  
  NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
  if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${RED}Node.js version is too old. Please install Node.js v14 or later.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Node.js is installed: $(node -v)${NC}"
}

# Check if npm is installed
check_npm() {
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}npm is installed: $(npm -v)${NC}"
}

# Check if Smithery CLI is installed
check_smithery() {
  if ! command -v smithery &> /dev/null; then
    echo -e "${YELLOW}Smithery CLI is not installed. Would you like to install it? (y/n)${NC}"
    read -r install_smithery
    
    if [[ $install_smithery =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Installing Smithery CLI globally...${NC}"
      
      if npm install -g @smithery/cli; then
        echo -e "${GREEN}Smithery CLI installed successfully!${NC}"
      else
        echo -e "${RED}Failed to install Smithery CLI. Please try installing it manually:${NC}"
        echo -e "npm install -g @smithery/cli"
        exit 1
      fi
    else
      echo -e "${RED}Smithery CLI is required for this setup. Exiting.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}Smithery CLI is installed: $(smithery --version)${NC}"
  fi
}

# Check if UniAuto MCP Server is running
check_server() {
  echo -e "${BLUE}Checking if UniAuto MCP Server is running...${NC}"
  
  # Try to ping the health endpoint
  if node check-server.js 2>/dev/null | grep -q "UniAuto MCP Server is running successfully"; then
    echo -e "${GREEN}UniAuto MCP Server is running!${NC}"
    return 0
  else
    echo -e "${RED}UniAuto MCP Server is not running.${NC}"
    return 1
  fi
}

# Start the server
start_server() {
  echo -e "${BLUE}Starting UniAuto MCP Server...${NC}"
  
  # Check if the server is already running
  if check_server; then
    echo -e "${YELLOW}Server is already running.${NC}"
    return 0
  fi
  
  # Check if dependencies are installed
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
  fi
  
  # Start the server in the background
  echo -e "${BLUE}Starting server...${NC}"
  node src/index.js &
  
  # Save the PID
  SERVER_PID=$!
  echo $SERVER_PID > .server.pid
  
  # Wait for the server to start
  echo -e "${BLUE}Waiting for server to start...${NC}"
  sleep 5
  
  # Check if server started successfully
  if check_server; then
    echo -e "${GREEN}Server started successfully with PID: $SERVER_PID${NC}"
    return 0
  else
    echo -e "${RED}Failed to start the server. Please check the logs.${NC}"
    return 1
  fi
}

# Login to Smithery
login_to_smithery() {
  echo -e "${BLUE}Logging in to Smithery.ai...${NC}"
  
  echo -e "${YELLOW}This will open a browser window where you can log in to your Smithery account.${NC}"
  echo -e "${YELLOW}Press Enter to continue...${NC}"
  read
  
  if smithery login; then
    echo -e "${GREEN}Successfully logged in to Smithery!${NC}"
    return 0
  else
    echo -e "${RED}Failed to log in to Smithery. Please try again.${NC}"
    return 1
  fi
}

# Connect UniAuto to Smithery
connect_uniauto() {
  echo -e "${BLUE}Connecting UniAuto to Smithery...${NC}"
  
  if smithery connect tool --name "UniAuto" --manifest-url "http://localhost:3000/api/mcp/manifest"; then
    echo -e "${GREEN}Successfully connected UniAuto to Smithery!${NC}"
    return 0
  else
    echo -e "${RED}Failed to connect UniAuto to Smithery. Please try again.${NC}"
    return 1
  fi
}

# Connect Claude to Smithery
connect_claude() {
  echo -e "${BLUE}Connecting Claude to Smithery...${NC}"
  
  echo -e "${YELLOW}This will set up Claude 3.7 to use tools through Smithery.${NC}"
  echo -e "${YELLOW}Press Enter to continue...${NC}"
  read
  
  if smithery connect claude --version 3-7-sonnet; then
    echo -e "${GREEN}Successfully connected Claude to Smithery!${NC}"
    return 0
  else
    echo -e "${RED}Failed to connect Claude to Smithery.${NC}"
    echo -e "${YELLOW}You may need to manually connect Claude through the Claude Web interface.${NC}"
    return 1
  fi
}

# Show instructions for testing
show_instructions() {
  echo -e "\n${BLUE}=========================================${NC}"
  echo -e "${GREEN}Setup Complete! Here's how to test:${NC}"
  echo -e "${BLUE}=========================================${NC}\n"
  
  echo -e "1. Go to ${YELLOW}https://claude.ai${NC} and start a new conversation"
  echo -e "2. Try asking Claude to use UniAuto:"
  echo -e "   ${YELLOW}\"Can you use UniAuto to navigate to example.com and tell me the page title?\"${NC}"
  echo -e "3. Claude should execute the command and report back the results"
  
  echo -e "\n${BLUE}If you encounter any issues:${NC}"
  echo -e "- Make sure the UniAuto server is running"
  echo -e "- Check that Claude has permission to use external tools"
  echo -e "- See the SMITHERY-CLAUDE-GUIDE.md file for detailed troubleshooting"
  
  echo -e "\n${GREEN}Happy automating with Claude 3.7 and UniAuto!${NC}\n"
}

# Main setup process
main() {
  clear
  echo -e "${BLUE}==================================${NC}"
  echo -e "${YELLOW} Smithery + Claude 3.7 + UniAuto Setup ${NC}"
  echo -e "${BLUE}==================================${NC}\n"
  
  # Check prerequisites
  display_step "1" "Checking prerequisites"
  check_node
  check_npm
  check_smithery
  
  # Start the server
  display_step "2" "Starting UniAuto MCP Server"
  start_server
  
  # Login to Smithery
  display_step "3" "Logging in to Smithery.ai"
  login_to_smithery
  
  # Connect UniAuto to Smithery
  display_step "4" "Connecting UniAuto to Smithery"
  connect_uniauto
  
  # Connect Claude to Smithery
  display_step "5" "Connecting Claude to Smithery"
  connect_claude
  
  # Show instructions
  show_instructions
}

# Run the main function
main