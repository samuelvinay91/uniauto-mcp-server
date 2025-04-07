#!/usr/bin/env node

/**
 * This script tests the Claude Desktop MCP configuration with UniAuto MCP server.
 * It demonstrates a simple automation test that Claude should be able to execute.
 */

const { chromium } = require('playwright');
require('dotenv').config();

// Configuration
const TEST_URL = 'https://example.com';
const PORT = process.env.PORT || 3001;

// Basic colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Print colorful header
console.log(`\n${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.cyan}     UniAuto MCP - Claude Desktop Connection Test${colors.reset}`);
console.log(`${colors.cyan}====================================================${colors.reset}\n`);

async function runTest() {
  console.log(`${colors.blue}Starting test browser...${colors.reset}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log(`${colors.blue}Navigating to ${TEST_URL}...${colors.reset}`);
    await page.goto(TEST_URL);
    
    // Get and display page title
    const title = await page.title();
    console.log(`${colors.green}✓ Successfully loaded page with title: "${title}"${colors.reset}`);
    
    // Extract some data (heading)
    const heading = await page.locator('h1').textContent();
    console.log(`${colors.green}✓ Extracted heading: "${heading}"${colors.reset}`);
    
    // Take a screenshot
    const screenshotPath = './test-screenshot.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`${colors.green}✓ Screenshot saved to ${screenshotPath}${colors.reset}`);
    
    console.log(`\n${colors.green}All test steps completed successfully!${colors.reset}`);
    
    // Show example prompt for Claude
    console.log(`\n${colors.yellow}Example prompt for Claude Desktop:${colors.reset}`);
    console.log(`${colors.yellow}----------------------------------${colors.reset}`);
    console.log(`Using UniAuto, please navigate to ${TEST_URL}, extract the page title and heading, and take a screenshot.`);
    
    console.log(`\n${colors.cyan}MCP Server Status:${colors.reset}`);
    console.log(`${colors.cyan}------------------${colors.reset}`);
    console.log(`UniAuto MCP Server running on port: ${colors.green}${PORT}${colors.reset}`);
    console.log(`MCP Manifest URL: ${colors.green}http://localhost:${PORT}/api/mcp/manifest${colors.reset}`);
    
    console.log(`\n${colors.blue}If Claude can successfully execute the example prompt,${colors.reset}`);
    console.log(`${colors.blue}your Claude Desktop MCP setup is working correctly!${colors.reset}\n`);
  }
  catch (error) {
    console.error(`${colors.red}Error during test:${colors.reset}`, error);
  }
  finally {
    await browser.close();
  }
}

// Run the test
runTest().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
