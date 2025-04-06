const { logger } = require('../utils/logger');
const { ElementRepository } = require('./element-repository');
const fs = require('fs').promises;
const path = require('path');

const elementRepo = new ElementRepository();

async function selfHeal(brokenSelector, page) {
  logger.info(`Attempting to self-heal selector: ${brokenSelector}`);
  
  try {
    // Strategy 1: Check alternative selectors from repository
    const alternativeSelector = elementRepo.getAlternativeSelector(brokenSelector);
    if (alternativeSelector) {
      const exists = await checkSelectorExists(alternativeSelector, page);
      if (exists) {
        logger.info(`Found alternative selector: ${alternativeSelector}`);
        return alternativeSelector;
      }
    }
    
    // Strategy 2: Try role-based selectors (Playwright specific)
    const roleSelector = await generateRoleSelectors(brokenSelector, page);
    if (roleSelector) {
      logger.info(`Found role-based selector: ${roleSelector}`);
      return roleSelector;
    }
    
    // Strategy 3: Try looser CSS selectors
    const looserSelector = generateLooserSelectors(brokenSelector);
    for (const selector of looserSelector) {
      const exists = await checkSelectorExists(selector, page);
      if (exists) {
        logger.info(`Generated looser selector: ${selector}`);
        return selector;
      }
    }
    
    // Strategy 4: Visual matching if we have snapshots
    const visualMatch = await findByVisualMatch(brokenSelector, page);
    if (visualMatch) {
      logger.info(`Found visual match: ${visualMatch}`);
      return visualMatch;
    }
    
    // Strategy 5: Find by nearest text if applicable
    const textMatch = await findByNearestText(brokenSelector, page);
    if (textMatch) {
      logger.info(`Found by nearest text: ${textMatch}`);
      return textMatch;
    }
    
    logger.warn(`Unable to heal selector: ${brokenSelector}`);
    return null;
  } catch (error) {
    logger.error(`Self-healing error: ${error.message}`);
    return null;
  }
}

async function checkSelectorExists(selector, page) {
  try {
    const element = await page.$(selector);
    return !!element;
  } catch (err) {
    return false;
  }
}

async function generateRoleSelectors(brokenSelector, page) {
  // Get element data from repository
  const elementData = elementRepo.getElementData(brokenSelector);
  if (!elementData || !elementData.nearbyText) return null;
  
  // Try to find element by role
  try {
    // Common UI roles
    const roles = ['button', 'link', 'textbox', 'checkbox', 'radiogroup', 'combobox', 'tab', 'tabpanel'];
    
    for (const role of roles) {
      // Try to find element by role and name (using nearby text)
      const nameMatches = await page.$$(`role=${role}[name="${elementData.nearbyText.trim()}"]`);
      if (nameMatches && nameMatches.length > 0) {
        return `role=${role}[name="${elementData.nearbyText.trim()}"]`;
      }
      
      // Try with partial name match
      if (elementData.nearbyText.length > 10) {
        const partialText = elementData.nearbyText.substring(0, 10);
        const partialMatches = await page.$$(`role=${role}[name*="${partialText}"]`);
        if (partialMatches && partialMatches.length > 0) {
          return `role=${role}[name*="${partialText}"]`;
        }
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Role-based selector generation error: ${error.message}`);
    return null;
  }
}

function generateLooserSelectors(selector) {
  const selectors = [];
  
  // Remove child selectors
  if (selector.includes('>')) {
    selectors.push(selector.split('>').pop().trim());
  }
  
  // Remove specific classes
  if (selector.includes('.')) {
    const parts = selector.split('.');
    const tag = parts[0];
    const mainClass = parts[1].split(/[^a-zA-Z0-9-_]/)[0];
    selectors.push(`${tag}.${mainClass}`);
  }
  
  // Remove IDs and use tag name
  if (selector.includes('#')) {
    const tag = selector.split('#')[0].trim();
    if (tag) selectors.push(tag);
  }
  
  // Try with partial attribute value matching
  if (selector.includes('[')) {
    const attributeMatch = selector.match(/\[([^\]]+)=['"]([^'"]+)/i);
    if (attributeMatch) {
      const [, attrName, attrValue] = attributeMatch;
      selectors.push(`[${attrName}*="${attrValue.substring(0, Math.floor(attrValue.length / 2))}"]`);
    }
  }
  
  return selectors;
}

async function findByVisualMatch(brokenSelector, page) {
  const elementSnapshot = elementRepo.getElementSnapshot(brokenSelector);
  if (!elementSnapshot) return null;
  
  try {
    // Create temporary directory for screenshots if needed
    const tempDir = path.join(__dirname, '../../temp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    // Save element snapshot to a temporary file
    const snapshotPath = path.join(tempDir, `element-snapshot-${Date.now()}.png`);
    await fs.writeFile(snapshotPath, Buffer.from(elementSnapshot.image, 'base64'));
    
    // Take full page screenshot
    const fullScreenshotPath = path.join(tempDir, `page-snapshot-${Date.now()}.png`);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });
    
    // Use Playwright's built-in visual matching capabilities
    // We'll use the DOM from the current page to find the best match
    const { width: elementWidth, height: elementHeight } = elementSnapshot;
    
    // Find elements that are similar in size to the snapshot
    const potentialElements = await page.evaluate((targetWidth, targetHeight) => {
      const elements = document.querySelectorAll('button, a, input, select, div, span, img');
      const results = [];
      
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // Allow for some size difference (20% tolerance)
        const widthDiff = Math.abs(rect.width - targetWidth) / targetWidth;
        const heightDiff = Math.abs(rect.height - targetHeight) / targetHeight;
        
        if (widthDiff < 0.2 && heightDiff < 0.2) {
          results.push({
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          });
        }
      }
      
      return results;
    }, elementWidth, elementHeight);
    
    // Try each potential element
    for (const point of potentialElements) {
      // Check if there's an element at this position
      const elementAtPoint = await page.evaluate((x, y) => {
        const element = document.elementFromPoint(x, y);
        return element ? true : false;
      }, point.x, point.y);
      
      if (elementAtPoint) {
        // Use Playwright's built-in locator for element at position
        return `internal:control=x:${point.x},y:${point.y}`;
      }
    }
    
    // Clean up temporary files
    try {
      await fs.unlink(snapshotPath);
      await fs.unlink(fullScreenshotPath);
    } catch (err) {
      // Ignore cleanup errors
    }
    
    return null;
  } catch (error) {
    logger.error(`Visual matching error: ${error.message}`);
    return null;
  }
}

async function findByNearestText(brokenSelector, page) {
  const elementData = elementRepo.getElementData(brokenSelector);
  if (!elementData || !elementData.nearbyText) return null;
  
  // Try to find element by nearby text
  try {
    // Playwright provides a has-text selector
    const hasTextSelector = `:has-text("${elementData.nearbyText.substring(0, 30)}")`;
    
    // Try common interactive elements with the text
    const interactiveElements = ['button', 'a', 'input', 'select', '[role="button"]'];
    
    for (const element of interactiveElements) {
      const selector = `${element}${hasTextSelector}`;
      const exists = await checkSelectorExists(selector, page);
      if (exists) {
        return selector;
      }
    }
    
    // Try to find the nearest clickable element to the text
    const nearbySelector = await page.evaluate((text) => {
      // Find all elements containing the text
      const textNodes = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() && node.textContent.includes(text)) {
          textNodes.push(node);
        }
      }
      
      if (textNodes.length > 0) {
        // Get parent element with nearest clickable
        const parent = textNodes[0].parentNode;
        
        // Look for clickable elements
        const clickable = parent.querySelector('button, a, input, select, [role="button"]');
        if (clickable) {
          if (clickable.id) return `#${clickable.id}`;
          if (clickable.className) return `.${clickable.className.split(' ')[0]}`;
          return null;
        }
      }
      
      return null;
    }, elementData.nearbyText);
    
    return nearbySelector;
  } catch (error) {
    logger.error(`Nearest text matching error: ${error.message}`);
    return null;
  }
}

module.exports = {
  selfHeal
};