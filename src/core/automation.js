const { chromium } = require('playwright');
const { logger } = require('../utils/logger');
const { selfHeal } = require('./self-healing');
const { ElementRepository } = require('./element-repository');
const { AutomationInterface } = require('./automation-base');

/**
 * Browser Automation implementation using Playwright
 * Extends the common AutomationInterface
 */
class BrowserAutomation extends AutomationInterface {
  constructor() {
    super();
    this.browser = null;
    this.context = null;
    this.activePage = null;
    this.elementRepo = new ElementRepository();
    
    // Setup cleanup on process exit
    process.on('exit', this.cleanup.bind(this));
  }

  /**
   * Override base handleAutomationCommand to add self-healing capability
   */
  async handleAutomationCommand(command, params) {
    logger.info(`Executing command: ${command}`);
    
    try {
      // Use the base implementation first
      return await super.handleAutomationCommand(command, params);
    } catch (error) {
      logger.error(`Command execution failed: ${error.message}`);
      
      // Attempt self-healing if it's a selector-related error
      if (params && params.selector && (error.message.includes('selector') || 
                             error.message.includes('timeout') || 
                             error.message.includes('element'))) {
        logger.info('Attempting to self-heal');
        const healedSelector = await selfHeal(params.selector, this.activePage);
        
        if (healedSelector && healedSelector !== params.selector) {
          logger.info(`Self-healing found alternative selector: ${healedSelector}`);
          const newParams = { ...params, selector: healedSelector };
          return await super.handleAutomationCommand(command, newParams);
        }
      }
      
      throw error;
    }
  }

  async initBrowser() {
    if (!this.browser) {
      const headless = process.env.HEADLESS === 'true';
      const newBrowser = await chromium.launch({
        headless: headless !== false
      });
      const newContext = await newBrowser.newContext({
        viewport: { width: 1366, height: 768 }
      });
      
      this.browser = newBrowser;
      this.context = newContext;
      logger.info('Browser initialized');
    }
    return this.browser;
  }

  async getPage() {
    if (!this.browser) {
      await this.initBrowser();
    }
    
    if (!this.activePage) {
      const pages = this.context.pages();
      const newPage = pages.length > 0 ? pages[0] : await this.context.newPage();
      this.activePage = newPage;
    }
    
    return this.activePage;
  }

  // Implementation of interface methods
  
  async navigateTo(url) {
    const page = await this.getPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    return { status: 'success', url: page.url() };
  }

  async clickElement(selector, options = {}) {
    const page = await this.getPage();
    
    // Store element in repository for potential self-healing
    await this.elementRepo.captureElement(selector, page);
    
    // Playwright has built-in auto-waiting
    await page.click(selector, { 
      timeout: options.timeout || 10000,
      force: options.force || false,
      noWaitAfter: options.noWaitAfter || false
    });
    
    return { status: 'success', selector };
  }

  async typeText(selector, text, options = {}) {
    const page = await this.getPage();
    
    // Clear field if needed
    if (options.clearFirst) {
      await page.fill(selector, '');
    }
    
    await page.fill(selector, text);
    return { status: 'success', selector, textLength: text.length };
  }

  async selectOption(selector, value, options = {}) {
    const page = await this.getPage();
    await page.selectOption(selector, value, { 
      timeout: options.timeout || 10000 
    });
    return { status: 'success', selector, value };
  }

  async extractData(selector, attribute = 'textContent', options = {}) {
    const page = await this.getPage();
    
    let data;
    if (attribute === 'textContent') {
      data = await page.textContent(selector, { 
        timeout: options.timeout || 10000 
      });
    } else if (attribute === 'innerText') {
      data = await page.innerText(selector, { 
        timeout: options.timeout || 10000 
      });
    } else {
      data = await page.getAttribute(selector, attribute, { 
        timeout: options.timeout || 10000 
      });
    }
    
    return { status: 'success', selector, data };
  }

  async takeScreenshot(fileName = `screenshot-${Date.now()}.png`) {
    const page = await this.getPage();
    const path = `./public/screenshots/${fileName}`;
    await page.screenshot({ path, fullPage: true });
    return { status: 'success', path };
  }

  async desktopClick(x, y) {
    const page = await this.getPage();
    await page.mouse.click(x, y);
    return { status: 'success', x, y };
  }

  async desktopType(text) {
    const page = await this.getPage();
    await page.keyboard.type(text);
    return { status: 'success', textLength: text.length };
  }

  async cleanup() {
    if (this.browser) {
      const browserToClose = this.browser;
      this.browser = null;
      this.context = null;
      this.activePage = null;
      await browserToClose.close();
      logger.info('Browser closed');
    }
  }
}

// Create a singleton instance
const automationInstance = new BrowserAutomation();

module.exports = {
  // Export the instance methods for backwards compatibility
  handleAutomationCommand: (command, params) => automationInstance.handleAutomationCommand(command, params),
  initBrowser: () => automationInstance.initBrowser(),
  cleanup: () => automationInstance.cleanup(),
  
  // Export the class and instance for future use
  BrowserAutomation,
  automationInstance
};