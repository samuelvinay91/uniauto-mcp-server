const { logger } = require('../utils/logger');

class ElementRepository {
  constructor() {
    this.elements = new Map();
  }
  
  async captureElement(selector, page) {
    try {
      // Check if element exists
      const element = await page.$(selector);
      if (!element) return;
      
      // Generate alternative selectors
      const alternativeSelectors = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return [];
        
        const selectors = [];
        
        // ID-based selector
        if (el.id) selectors.push(`#${el.id}`);
        
        // Class-based selector
        if (el.className) {
          const classes = el.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            selectors.push(`.${classes.join('.')}`);
          }
        }
        
        // Attribute-based selectors
        if (el.getAttribute('name')) selectors.push(`[name="${el.getAttribute('name')}"]`);
        if (el.getAttribute('data-testid')) selectors.push(`[data-testid="${el.getAttribute('data-testid')}"]`);
        if (el.getAttribute('aria-label')) selectors.push(`[aria-label="${el.getAttribute('aria-label')}"]`);
        
        // Tag + attribute selector
        selectors.push(`${el.tagName.toLowerCase()}${selectors[0] || ''}`);
        
        // XPath
        const getXPath = function(element) {
          if (!element) return '';
          if (element.id) return `//*[@id="${element.id}"]`;
          
          const sameTagSiblings = Array.from(element.parentNode.children)
            .filter(e => e.tagName === element.tagName);
          
          const idx = sameTagSiblings.indexOf(element) + 1;
          
          return `${getXPath(element.parentNode)}/${element.tagName.toLowerCase()}[${idx}]`;
        };
        
        selectors.push(getXPath(el));
        
        return selectors;
      }, selector);
      
      // Take screenshot of the element
      const elementScreenshot = await element.screenshot({ type: 'jpeg', quality: 90 });
      const elementScreenshotBase64 = elementScreenshot.toString('base64');
      
      // Get nearby text for context
      const nearbyText = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return '';
        
        // Get element's own text
        let text = el.textContent ? el.textContent.trim() : '';
        
        // If no text, get text from parent or siblings
        if (!text) {
          // Check parent text
          if (el.parentNode) {
            text = el.parentNode.textContent ? el.parentNode.textContent.trim() : '';
          }
          
          // Check siblings
          if (!text && el.previousElementSibling) {
            text = el.previousElementSibling.textContent ? el.previousElementSibling.textContent.trim() : '';
          }
          
          if (!text && el.nextElementSibling) {
            text = el.nextElementSibling.textContent ? el.nextElementSibling.textContent.trim() : '';
          }
        }
        
        return text.substring(0, 100); // Limit length
      }, selector);
      
      // Get bounding box for visual matching
      const boundingBox = await element.boundingBox();
      
      // Store element data
      this.elements.set(selector, {
        alternativeSelectors,
        image: elementScreenshotBase64,
        boundingBox,
        nearbyText,
        timestamp: Date.now()
      });
      
      logger.debug(`Captured element: ${selector} with ${alternativeSelectors.length} alternatives`);
    } catch (error) {
      logger.error(`Failed to capture element: ${error.message}`);
    }
  }
  
  getAlternativeSelector(selector) {
    const elementData = this.elements.get(selector);
    if (!elementData || !elementData.alternativeSelectors || elementData.alternativeSelectors.length === 0) {
      return null;
    }
    
    return elementData.alternativeSelectors[0];
  }
  
  getElementSnapshot(selector) {
    const elementData = this.elements.get(selector);
    if (!elementData || !elementData.image) {
      return null;
    }
    
    return {
      image: elementData.image,
      boundingBox: elementData.boundingBox,
      timestamp: elementData.timestamp
    };
  }
  
  getElementData(selector) {
    return this.elements.get(selector) || null;
  }
  
  clearOldEntries(maxAgeMs = 1000 * 60 * 60) { // 1 hour default
    const now = Date.now();
    for (const [selector, data] of this.elements.entries()) {
      if (now - data.timestamp > maxAgeMs) {
        this.elements.delete(selector);
      }
    }
  }
}

module.exports = {
  ElementRepository
};