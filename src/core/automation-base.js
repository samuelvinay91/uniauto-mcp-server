/**
 * Base Automation Interface
 * 
 * This module defines the common interface for all automation implementations
 * (browser automation, mock automation, desktop automation).
 */

const { logger } = require('../utils/logger');

/**
 * Base Automation class that defines the common interface
 */
class AutomationInterface {
  /**
   * Handle an automation command
   * 
   * @param {string} command - The automation command to execute
   * @param {Object} params - Parameters for the command
   * @returns {Promise<Object>} Result of the command
   */
  async handleAutomationCommand(command, params) {
    logger.info(`Executing command: ${command}`);
    
    try {
      switch (command) {
        case 'navigate':
          return await this.navigateTo(params.url);
        
        case 'click':
          return await this.clickElement(params.selector, params.options);
        
        case 'type':
          return await this.typeText(params.selector, params.text, params.options);
        
        case 'select':
          return await this.selectOption(params.selector, params.value, params.options);
        
        case 'extract':
          return await this.extractData(params.selector, params.attribute, params.options);
        
        case 'screenshot':
          return await this.takeScreenshot(params.fileName);
        
        case 'desktop_click':
          return await this.desktopClick(params.x, params.y);
        
        case 'desktop_type':
          return await this.desktopType(params.text);
        
        case 'wait':
          return await this.wait(params.milliseconds);
        
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      logger.error(`Command execution failed: ${error.message}`);
      throw error;
    }
  }

  // Methods that should be implemented by subclasses
  
  async navigateTo(url) {
    throw new Error('Method not implemented');
  }
  
  async clickElement(selector, options = {}) {
    throw new Error('Method not implemented');
  }
  
  async typeText(selector, text, options = {}) {
    throw new Error('Method not implemented');
  }
  
  async selectOption(selector, value, options = {}) {
    throw new Error('Method not implemented');
  }
  
  async extractData(selector, attribute = 'textContent', options = {}) {
    throw new Error('Method not implemented');
  }
  
  async takeScreenshot(fileName = `screenshot-${Date.now()}.png`) {
    throw new Error('Method not implemented');
  }
  
  async desktopClick(x, y) {
    throw new Error('Method not implemented');
  }
  
  async desktopType(text) {
    throw new Error('Method not implemented');
  }
  
  async wait(milliseconds = 1000) {
    // Default implementation - can be overridden
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    return { status: 'success', milliseconds };
  }
  
  async cleanup() {
    // Default implementation - can be overridden
    logger.info('Cleanup called');
  }
}

module.exports = {
  AutomationInterface
};