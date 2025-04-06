/**
 * UniAuto MCP Server - Reference Implementation for Client Integration
 * 
 * This file demonstrates how to interact with the UniAuto MCP Server
 * programmatically from JavaScript applications.
 */

// Configuration
const UNIAUTO_SERVER_URL = 'http://localhost:3000';
const MANIFEST_ENDPOINT = '/api/mcp/manifest';
const INVOKE_ENDPOINT = '/api/mcp/invoke';

/**
 * Fetch the MCP manifest to understand available actions and parameters
 * @returns {Promise<Object>} The MCP manifest
 */
async function getManifest() {
  try {
    const response = await fetch(`${UNIAUTO_SERVER_URL}${MANIFEST_ENDPOINT}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching MCP manifest:', error);
    throw error;
  }
}

/**
 * Invoke an action on the UniAuto MCP Server
 * @param {string} action - The action name to invoke
 * @param {Object} parameters - Parameters for the action
 * @returns {Promise<Object>} The result of the action
 */
async function invokeAction(action, parameters = {}) {
  try {
    const response = await fetch(`${UNIAUTO_SERVER_URL}${INVOKE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        parameters
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to invoke action: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error invoking action ${action}:`, error);
    throw error;
  }
}

/**
 * Higher-level wrapper for common automation tasks
 */
class UniAutoClient {
  /**
   * Navigate to a URL
   * @param {string} url - The URL to navigate to
   */
  async navigateTo(url) {
    return await invokeAction('navigate', { url });
  }
  
  /**
   * Click on an element
   * @param {string} selector - CSS selector of the element to click
   * @param {Object} options - Additional click options
   */
  async click(selector, options = {}) {
    return await invokeAction('click', { 
      selector,
      options
    });
  }
  
  /**
   * Type text into an element
   * @param {string} selector - CSS selector of the element
   * @param {string} text - Text to type
   * @param {Object} options - Additional options like clearFirst
   */
  async type(selector, text, options = {}) {
    return await invokeAction('type', {
      selector,
      text,
      ...options
    });
  }
  
  /**
   * Select an option from a dropdown
   * @param {string} selector - CSS selector of the select element
   * @param {string|Array} value - Value(s) to select
   */
  async select(selector, value) {
    return await invokeAction('select', {
      selector,
      value
    });
  }
  
  /**
   * Extract data from an element
   * @param {string} selector - CSS selector of the element
   * @param {string} attribute - Attribute to extract (default: textContent)
   */
  async extract(selector, attribute = 'textContent') {
    return await invokeAction('extract', {
      selector,
      attribute
    });
  }
  
  /**
   * Take a screenshot
   * @param {string} fileName - Optional filename for the screenshot
   */
  async screenshot(fileName) {
    return await invokeAction('screenshot', {
      fileName
    });
  }
  
  /**
   * Wait for a specified time
   * @param {number} milliseconds - Time to wait in milliseconds
   */
  async wait(milliseconds = 1000) {
    return await invokeAction('wait', {
      milliseconds
    });
  }
  
  /**
   * Use AI to process a task and generate automation steps
   * @param {string} task - Description of the task to automate
   * @param {string} url - Optional URL context
   * @param {string} model - Optional AI model to use
   */
  async processWithAI(task, url, model) {
    return await invokeAction('ai_process', {
      task,
      url,
      model
    });
  }
  
  /**
   * Desktop automation: Click at specific coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  async desktopClick(x, y) {
    return await invokeAction('desktop_click', { x, y });
  }
  
  /**
   * Desktop automation: Type text
   * @param {string} text - Text to type
   */
  async desktopType(text) {
    return await invokeAction('desktop_type', { text });
  }
}

// Example usage
async function runExample() {
  const client = new UniAutoClient();
  
  try {
    // Get the manifest to understand capabilities
    const manifest = await getManifest();
    console.log('Available actions:', manifest.actions.map(a => a.name));
    
    // Run a simple automation sequence
    await client.navigateTo('https://example.com');
    await client.wait(1000);
    await client.click('a[href="/login"]');
    await client.type('#username', 'testuser');
    await client.type('#password', 'password123');
    await client.click('#login-button');
    
    // Extract some data after login
    const welcomeText = await client.extract('.welcome-message');
    console.log('Welcome text:', welcomeText.data);
    
    // Take a screenshot of the result
    await client.screenshot('login-result.png');
    
  } catch (error) {
    console.error('Automation error:', error);
  }
}

// Export for use in other modules
module.exports = {
  getManifest,
  invokeAction,
  UniAutoClient
};

// If running as a script
if (require.main === module) {
  runExample().catch(console.error);
}