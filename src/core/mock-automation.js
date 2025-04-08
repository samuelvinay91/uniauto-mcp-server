/**
 * Mock Automation Module for UniAuto MCP Server
 * 
 * This module provides mock implementations of automation commands
 * for testing the MCP server without browser dependencies.
 */

const { logger } = require('../utils/logger');
const { AutomationInterface } = require('./automation-base');

/**
 * Mock implementation of the Automation Interface
 * for testing without browser dependencies
 */
class MockAutomation extends AutomationInterface {
  constructor() {
    super();
    
    // Mock data for responses
    this.mockData = {
      title: 'Example Domain',
      heading: 'Example Domain',
      paragraph: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
      screenshotPath: './public/screenshots/mock-screenshot.png'
    };
  }
  
  /**
   * Override the base handleAutomationCommand method to add mock mode logging
   */
  async handleAutomationCommand(command, params) {
    logger.info(`Executing command: ${command} (MOCK MODE)`);
    return await super.handleAutomationCommand(command, params);
  }
  
  // Implementation of interface methods with mock behavior
  
  async navigateTo(url) {
    logger.info(`[MOCK] Navigating to: ${url}`);
    return { status: 'success', url: url };
  }

  async clickElement(selector, options = {}) {
    logger.info(`[MOCK] Clicking element: ${selector}`);
    return { status: 'success', selector };
  }

  async typeText(selector, text, options = {}) {
    logger.info(`[MOCK] Typing text in element: ${selector}`);
    return { status: 'success', selector, textLength: text.length };
  }

  async selectOption(selector, value, options = {}) {
    logger.info(`[MOCK] Selecting option in element: ${selector}`);
    return { status: 'success', selector, value };
  }

  async extractData(selector, attribute = 'textContent', options = {}) {
    logger.info(`[MOCK] Extracting data from element: ${selector}`);
    
    let data;
    if (selector === 'title') {
      data = this.mockData.title;
    } else if (selector === 'h1') {
      data = this.mockData.heading;
    } else if (selector === 'p') {
      data = this.mockData.paragraph;
    } else {
      data = `Mock data for ${selector}`;
    }
    
    return { status: 'success', selector, data };
  }

  async takeScreenshot(fileName = `screenshot-${Date.now()}.png`) {
    logger.info(`[MOCK] Taking screenshot: ${fileName}`);
    return { status: 'success', path: this.mockData.screenshotPath };
  }

  async desktopClick(x, y) {
    logger.info(`[MOCK] Desktop click at coordinates: ${x}, ${y}`);
    return { status: 'success', x, y };
  }

  async desktopType(text) {
    logger.info(`[MOCK] Desktop typing text`);
    return { status: 'success', textLength: text.length };
  }

  async wait(milliseconds = 1000) {
    logger.info(`[MOCK] Waiting for ${milliseconds}ms`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Just wait a token amount
    return { status: 'success', milliseconds };
  }
}

// Create a singleton instance
const mockAutomationInstance = new MockAutomation();

module.exports = {
  // Export the instance method for backwards compatibility
  handleAutomationCommand: (command, params) => mockAutomationInstance.handleAutomationCommand(command, params),
  
  // Export the class and instance for future use
  MockAutomation,
  mockAutomationInstance
};