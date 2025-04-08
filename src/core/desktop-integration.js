/**
 * Desktop Integration Module
 * Provides functionality for desktop automation using Playwright's capabilities
 */

const { chromium } = require('playwright');
const logger = require('../utils/logger');

// Store the browser instance for reuse
let browser = null;
let context = null;
let page = null;

/**
 * Initialize the desktop automation
 */
async function initialize() {
  try {
    if (!process.env.ENABLE_DESKTOP_INTEGRATION) {
      logger.warn('Desktop integration is disabled. Set ENABLE_DESKTOP_INTEGRATION=true in .env to enable it.');
      return false;
    }

    logger.info('Initializing desktop automation capabilities...');
    
    // Launch the browser if not already launched
    if (!browser) {
      browser = await chromium.launch({
        headless: process.env.HEADLESS === 'true',
        args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
      });
      
      // Create a context
      context = await browser.newContext({
        viewport: null, // full screen
        permissions: ['geolocation', 'clipboard-read', 'clipboard-write']
      });
      
      // Create a page for desktop automation
      page = await context.newPage();
      
      logger.info('Desktop automation initialized successfully');
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to initialize desktop automation: ${error.message}`);
    return false;
  }
}

/**
 * Perform a click operation at specific coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
async function desktopClick(x, y) {
  try {
    if (!browser || !page) {
      const initialized = await initialize();
      if (!initialized) return { success: false, message: 'Desktop integration is not initialized' };
    }
    
    logger.info(`Performing desktop click at coordinates (${x}, ${y})`);
    await page.mouse.click(x, y);
    
    return { success: true, message: `Clicked at coordinates (${x}, ${y})` };
  } catch (error) {
    logger.error(`Desktop click failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * Type text on the desktop
 * @param {string} text - Text to type
 */
async function desktopType(text) {
  try {
    if (!browser || !page) {
      const initialized = await initialize();
      if (!initialized) return { success: false, message: 'Desktop integration is not initialized' };
    }
    
    logger.info(`Typing text on desktop: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
    await page.keyboard.type(text);
    
    return { success: true, message: `Typed text: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"` };
  } catch (error) {
    logger.error(`Desktop type failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * Close the desktop automation session
 */
async function close() {
  try {
    if (browser) {
      logger.info('Closing desktop automation session...');
      await browser.close();
      browser = null;
      context = null;
      page = null;
      logger.info('Desktop automation session closed');
    }
  } catch (error) {
    logger.error(`Failed to close desktop automation: ${error.message}`);
  }
}

module.exports = {
  initialize,
  desktopClick,
  desktopType,
  close
};