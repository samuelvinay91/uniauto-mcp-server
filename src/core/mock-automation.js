/**
 * Mock Automation Module for UniAuto MCP Server
 * 
 * This module provides mock implementations of automation commands
 * for testing the MCP server without browser dependencies.
 */

const { logger } = require('../utils/logger');

// Mock data for responses
const mockData = {
  title: 'Example Domain',
  heading: 'Example Domain',
  paragraph: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
  screenshotPath: './public/screenshots/mock-screenshot.png'
};

async function handleAutomationCommand(command, params) {
  logger.info(`Executing command: ${command} (MOCK MODE)`);
  
  try {
    switch (command) {
      case 'navigate':
        return await mockNavigateTo(params.url);
      
      case 'click':
        return await mockClickElement(params.selector, params.options);
      
      case 'type':
        return await mockTypeText(params.selector, params.text, params.options);
      
      case 'select':
        return await mockSelectOption(params.selector, params.value, params.options);
      
      case 'extract':
        return await mockExtractData(params.selector, params.attribute, params.options);
      
      case 'screenshot':
        return await mockTakeScreenshot(params.fileName);
      
      case 'desktop_click':
        return mockDesktopClick(params.x, params.y);
      
      case 'desktop_type':
        return mockDesktopType(params.text);
      
      case 'wait':
        return await mockWait(params.milliseconds);
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    logger.error(`Mock command execution failed: ${error.message}`);
    throw error;
  }
}

async function mockNavigateTo(url) {
  logger.info(`[MOCK] Navigating to: ${url}`);
  return { status: 'success', url: url };
}

async function mockClickElement(selector, options = {}) {
  logger.info(`[MOCK] Clicking element: ${selector}`);
  return { status: 'success', selector };
}

async function mockTypeText(selector, text, options = {}) {
  logger.info(`[MOCK] Typing text in element: ${selector}`);
  return { status: 'success', selector, textLength: text.length };
}

async function mockSelectOption(selector, value, options = {}) {
  logger.info(`[MOCK] Selecting option in element: ${selector}`);
  return { status: 'success', selector, value };
}

async function mockExtractData(selector, attribute = 'textContent', options = {}) {
  logger.info(`[MOCK] Extracting data from element: ${selector}`);
  
  let data;
  if (selector === 'title') {
    data = mockData.title;
  } else if (selector === 'h1') {
    data = mockData.heading;
  } else if (selector === 'p') {
    data = mockData.paragraph;
  } else {
    data = `Mock data for ${selector}`;
  }
  
  return { status: 'success', selector, data };
}

async function mockTakeScreenshot(fileName = `screenshot-${Date.now()}.png`) {
  logger.info(`[MOCK] Taking screenshot: ${fileName}`);
  return { status: 'success', path: mockData.screenshotPath };
}

function mockDesktopClick(x, y) {
  logger.info(`[MOCK] Desktop click at coordinates: ${x}, ${y}`);
  return { status: 'success', x, y };
}

function mockDesktopType(text) {
  logger.info(`[MOCK] Desktop typing text`);
  return { status: 'success', textLength: text.length };
}

async function mockWait(milliseconds = 1000) {
  logger.info(`[MOCK] Waiting for ${milliseconds}ms`);
  await new Promise(resolve => setTimeout(resolve, 100)); // Just wait a token amount
  return { status: 'success', milliseconds };
}

module.exports = {
  handleAutomationCommand
};