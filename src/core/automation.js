const { chromium } = require('playwright');
const { logger } = require('../utils/logger');
const { selfHeal } = require('./self-healing');
const { ElementRepository } = require('./element-repository');

let browser;
let context;
let activePage;
const elementRepo = new ElementRepository();

async function initBrowser() {
  if (!browser) {
    const newBrowser = await chromium.launch({
      headless: false
    });
    const newContext = await newBrowser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    
    browser = newBrowser;
    context = newContext;
    logger.info('Browser initialized');
  }
  return browser;
}

async function getPage() {
  if (!browser) {
    await initBrowser();
  }
  
  if (!activePage) {
    const pages = context.pages();
    const newPage = pages.length > 0 ? pages[0] : await context.newPage();
    activePage = newPage;
  }
  
  return activePage;
}

async function handleAutomationCommand(command, params) {
  logger.info(`Executing command: ${command}`);
  
  try {
    switch (command) {
      case 'navigate':
        return await navigateTo(params.url);
      
      case 'click':
        return await clickElement(params.selector, params.options);
      
      case 'type':
        return await typeText(params.selector, params.text, params.options);
      
      case 'select':
        return await selectOption(params.selector, params.value, params.options);
      
      case 'extract':
        return await extractData(params.selector, params.attribute, params.options);
      
      case 'screenshot':
        return await takeScreenshot(params.fileName);
      
      case 'desktop_click':
        return await desktopClick(params.x, params.y);
      
      case 'desktop_type':
        return await desktopType(params.text);
      
      case 'wait':
        return await wait(params.milliseconds);
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    logger.error(`Command execution failed: ${error.message}`);
    
    // Attempt self-healing if it's a selector-related error
    if (params.selector && (error.message.includes('selector') || error.message.includes('timeout') || error.message.includes('element'))) {
      logger.info('Attempting to self-heal');
      const healedSelector = await selfHeal(params.selector, activePage);
      
      if (healedSelector && healedSelector !== params.selector) {
        logger.info(`Self-healing found alternative selector: ${healedSelector}`);
        const newParams = { ...params, selector: healedSelector };
        return await handleAutomationCommand(command, newParams);
      }
    }
    
    throw error;
  }
}

async function navigateTo(url) {
  const page = await getPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  return { status: 'success', url: page.url() };
}

async function clickElement(selector, options = {}) {
  const page = await getPage();
  
  // Store element in repository for potential self-healing
  await elementRepo.captureElement(selector, page);
  
  // Playwright has built-in auto-waiting
  await page.click(selector, { 
    timeout: options.timeout || 10000,
    force: options.force || false,
    noWaitAfter: options.noWaitAfter || false
  });
  
  return { status: 'success', selector };
}

async function typeText(selector, text, options = {}) {
  const page = await getPage();
  
  // Clear field if needed
  if (options.clearFirst) {
    await page.fill(selector, '');
  }
  
  await page.fill(selector, text);
  return { status: 'success', selector, textLength: text.length };
}

async function selectOption(selector, value, options = {}) {
  const page = await getPage();
  await page.selectOption(selector, value, { 
    timeout: options.timeout || 10000 
  });
  return { status: 'success', selector, value };
}

async function extractData(selector, attribute = 'textContent', options = {}) {
  const page = await getPage();
  
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

async function takeScreenshot(fileName = `screenshot-${Date.now()}.png`) {
  const page = await getPage();
  const path = `./public/screenshots/${fileName}`;
  await page.screenshot({ path, fullPage: true });
  return { status: 'success', path };
}

async function desktopClick(x, y) {
  const page = await getPage();
  await page.mouse.click(x, y);
  return { status: 'success', x, y };
}

async function desktopType(text) {
  const page = await getPage();
  await page.keyboard.type(text);
  return { status: 'success', textLength: text.length };
}

async function wait(milliseconds = 1000) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
  return { status: 'success', milliseconds };
}

async function cleanup() {
  if (browser) {
    const browserToClose = browser;
    browser = null;
    context = null;
    activePage = null;
    await browserToClose.close();
    logger.info('Browser closed');
  }
}

process.on('exit', cleanup);

module.exports = {
  handleAutomationCommand,
  initBrowser,
  cleanup
};