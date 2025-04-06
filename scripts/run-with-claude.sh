#!/bin/bash

# Run UniAuto MCP Server with Claude helper
# This script provides a simple way to start the server and test it with Claude

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

# Check if server is running
check_server() {
  if ps aux | grep "node src/index.js" | grep -v grep > /dev/null; then
    echo -e "${GREEN}✓ UniAuto MCP Server is running${NC}"
    return 0
  else
    echo -e "${RED}✗ UniAuto MCP Server is not running${NC}"
    return 1
  fi
}

# Main menu
show_menu() {
  clear
  echo -e "${BLUE}==================================${NC}"
  echo -e "${YELLOW}   UniAuto MCP Server with Claude   ${NC}"
  echo -e "${BLUE}==================================${NC}\n"
  
  check_server
  
  echo -e "\nChoose an option:"
  echo -e "${GREEN}1${NC}. Start UniAuto MCP Server"
  echo -e "${GREEN}2${NC}. Stop UniAuto MCP Server"
  echo -e "${GREEN}3${NC}. Test server with demo.js"
  echo -e "${GREEN}4${NC}. View Claude setup instructions"
  echo -e "${GREEN}5${NC}. View Claude usage instructions"
  echo -e "${GREEN}0${NC}. Exit\n"
  
  read -p "Enter your choice [0-5]: " choice
  
  case $choice in
    1) start_server ;;
    2) stop_server ;;
    3) run_demo ;;
    4) view_setup_instructions ;;
    5) view_usage_instructions ;;
    0) echo -e "\n${GREEN}Goodbye!${NC}"; exit 0 ;;
    *) echo -e "\n${RED}Invalid option. Press Enter to continue...${NC}"; read; show_menu ;;
  esac
}

# Start the server
start_server() {
  display_step "1" "Starting UniAuto MCP Server"
  
  if check_server; then
    echo -e "${YELLOW}Server is already running!${NC}"
  else
    echo -e "Starting server in a new terminal window..."
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
      echo -e "${YELLOW}Installing dependencies...${NC}"
      npm install
    fi
    
    # Start the server
    node src/index.js & SERVERPID=$!
    echo -e "Server PID: $SERVERPID"
    
    # Wait for server to start
    echo -e "Waiting for server to start..."
    sleep 3
    
    # Verify if server is running
    if check_server; then
      echo -e "${GREEN}Server successfully started!${NC}"
    else
      echo -e "${RED}Failed to start server. Check logs for errors.${NC}"
    fi
  fi
  
  echo -e "\n${GREEN}Press Enter to continue...${NC}"
  read
  show_menu
}

# Stop the server
stop_server() {
  display_step "2" "Stopping UniAuto MCP Server"
  
  if ! check_server; then
    echo -e "${YELLOW}Server is not running!${NC}"
  else
    echo -e "Stopping UniAuto MCP Server..."
    pkill -f "node src/index.js"
    sleep 2
    
    if ! check_server; then
      echo -e "${GREEN}Server successfully stopped!${NC}"
    else
      echo -e "${RED}Failed to stop server. You may need to kill it manually.${NC}"
    fi
  fi
  
  echo -e "\n${GREEN}Press Enter to continue...${NC}"
  read
  show_menu
}

# Run the demo script
run_demo() {
  display_step "3" "Testing with demo.js"
  
  if ! check_server; then
    echo -e "${RED}Server is not running! Please start it first.${NC}"
  else
    echo -e "Running demo.js to test the server..."
    node demo.js
  fi
  
  echo -e "\n${GREEN}Press Enter to continue...${NC}"
  read
  show_menu
}

# View setup instructions
view_setup_instructions() {
  display_step "4" "Claude Setup Instructions"
  
  if [ -f "docs/setup/CLAUDE-SETUP.md" ]; then
    cat docs/setup/CLAUDE-SETUP.md | less
  else
    echo -e "${RED}Setup instructions file not found!${NC}"
  fi
  
  show_menu
}

# View usage instructions
view_usage_instructions() {
  display_step "5" "Claude Usage Instructions"
  
  if [ -f "docs/setup/claude-instructions.md" ]; then
    cat docs/setup/claude-instructions.md | less
  else
    echo -e "${RED}Usage instructions file not found!${NC}"
  fi
  
  show_menu
}

# Start the menu
show_menu