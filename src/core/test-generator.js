/**
 * Test Generator Module
 * 
 * Automatically generates test cases in various formats (BDD/TDD) and frameworks
 * based on application analysis and user requirements.
 */

const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const configManager = require('../utils/config');

// Supported test frameworks
const TEST_FRAMEWORKS = {
  JEST: 'jest',
  MOCHA: 'mocha',
  CYPRESS: 'cypress',
  PLAYWRIGHT: 'playwright',
  SELENIUM: 'selenium',
  WEBDRIVERIO: 'webdriverio',
  CUCUMBER: 'cucumber',
  TESTCAFE: 'testcafe',
  PUPPETEER: 'puppeteer',
  NIGHTWATCH: 'nightwatch'
};

// Supported test styles
const TEST_STYLES = {
  BDD: 'bdd',
  TDD: 'tdd',
  COMPONENT: 'component',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  API: 'api',
  VISUAL: 'visual',
  PERFORMANCE: 'performance'
};

// Output formats
const OUTPUT_FORMATS = {
  JS: 'javascript',
  TS: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  CSHARP: 'csharp',
  RUBY: 'ruby'
};

/**
 * Generate test cases based on application analysis
 * 
 * @param {Object} options - Test generation options
 * @param {string} options.url - URL of the application to analyze
 * @param {string} options.framework - Test framework to use
 * @param {string} options.style - Test style (BDD/TDD)
 * @param {string} options.format - Output code format
 * @param {string} options.prompt - User prompt describing test requirements
 * @param {string} options.outputPath - Path to save generated tests
 * @param {Object} options.additionalContext - Additional context for generation
 * @returns {Promise<Object>} Generated test details
 */
async function generateTests(options) {
  try {
    logger.info(`Generating tests for ${options.url} using ${options.framework} with ${options.style} style`);
    
    // Extract page information
    const pageInfo = await analyzeApplication(options.url);
    
    // Generate tests based on analysis
    const testCode = await generateTestCode({
      pageInfo,
      framework: options.framework || TEST_FRAMEWORKS.PLAYWRIGHT,
      style: options.style || TEST_STYLES.BDD,
      format: options.format || OUTPUT_FORMATS.JS,
      prompt: options.prompt,
      additionalContext: options.additionalContext || {}
    });
    
    // Save generated tests if output path provided
    if (options.outputPath) {
      await saveGeneratedTests(testCode, options.outputPath, options.format);
    }
    
    return {
      status: 'success',
      testCode,
      pageInfo: {
        title: pageInfo.title,
        url: pageInfo.url,
        elements: pageInfo.elements.length
      }
    };
  } catch (error) {
    logger.error(`Test generation error: ${error.message}`);
    throw new Error(`Failed to generate tests: ${error.message}`);
  }
}

/**
 * Analyze an application to gather information for test generation
 * 
 * @param {string} url - URL of the application to analyze
 * @returns {Promise<Object>} Application information
 */
async function analyzeApplication(url) {
  logger.info(`Analyzing application at ${url}`);
  
  const { chromium } = require('playwright');
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'UniAuto-TestGenerator/1.0'
    });
    
    // Create a new page and navigate to the URL
    page = await context.newPage();
    
    // Add helpers to extract information
    await page.addInitScript(() => {
      window._uniAutoExtractedData = {
        clickableElements: [],
        inputElements: [],
        selectElements: [],
        forms: [],
        textContent: [],
        links: []
      };
      
      window._uniAutoAnalyzeDOM = () => {
        // Extract clickable elements
        document.querySelectorAll('button, [role="button"], a, [onclick], [class*="btn"], [class*="button"]').forEach(el => {
          const rect = el.getBoundingClientRect();
          window._uniAutoExtractedData.clickableElements.push({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            text: el.textContent.trim(),
            selector: generateSelector(el),
            location: {
              x: Math.round(rect.x + rect.width / 2),
              y: Math.round(rect.y + rect.height / 2)
            },
            isVisible: isElementVisible(el)
          });
        });
        
        // Extract input elements
        document.querySelectorAll('input, textarea').forEach(el => {
          window._uniAutoExtractedData.inputElements.push({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            type: el.type,
            name: el.name,
            placeholder: el.placeholder,
            value: el.value,
            selector: generateSelector(el),
            isRequired: el.required,
            isDisabled: el.disabled,
            isVisible: isElementVisible(el),
            validation: {
              minLength: el.minLength > 0 ? el.minLength : null,
              maxLength: el.maxLength > 0 ? el.maxLength : null,
              pattern: el.pattern || null
            }
          });
        });
        
        // Extract select elements
        document.querySelectorAll('select').forEach(el => {
          const options = Array.from(el.options).map(opt => ({
            value: opt.value,
            text: opt.text,
            isSelected: opt.selected
          }));
          
          window._uniAutoExtractedData.selectElements.push({
            tagName: el.tagName,
            id: el.id,
            className: el.className,
            name: el.name,
            selector: generateSelector(el),
            options,
            isRequired: el.required,
            isDisabled: el.disabled,
            isVisible: isElementVisible(el)
          });
        });
        
        // Extract forms
        document.querySelectorAll('form').forEach(el => {
          const inputs = Array.from(el.querySelectorAll('input, textarea, select')).map(input => 
            generateSelector(input)
          );
          
          const submitBtn = el.querySelector('button[type="submit"], input[type="submit"]');
          
          window._uniAutoExtractedData.forms.push({
            id: el.id,
            className: el.className,
            selector: generateSelector(el),
            action: el.action,
            method: el.method,
            inputs,
            submitButton: submitBtn ? generateSelector(submitBtn) : null
          });
        });
        
        // Extract important text content
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, label, span').forEach(el => {
          const text = el.textContent.trim();
          if (text.length > 0) {
            window._uniAutoExtractedData.textContent.push({
              tagName: el.tagName,
              text,
              selector: generateSelector(el),
              isVisible: isElementVisible(el)
            });
          }
        });
        
        // Extract links
        document.querySelectorAll('a[href]').forEach(el => {
          const href = el.getAttribute('href');
          if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
            window._uniAutoExtractedData.links.push({
              text: el.textContent.trim(),
              href: href,
              selector: generateSelector(el),
              isVisible: isElementVisible(el)
            });
          }
        });
        
        // Helper to generate a unique selector for an element
        function generateSelector(el) {
          if (el.id) {
            return `#${el.id}`;
          }
          
          // Try data attributes
          for (const attr of el.attributes) {
            if (attr.name.startsWith('data-') && attr.value) {
              return `[${attr.name}="${attr.value}"]`;
            }
          }
          
          // Try with classes
          if (el.className) {
            const classes = el.className.split(' ').filter(c => c.trim().length > 0);
            if (classes.length > 0) {
              // Use the first class as a simple selector
              return `${el.tagName.toLowerCase()}.${classes[0]}`;
            }
          }
          
          // If all else fails, generate a path selector
          let path = '';
          let parent = el;
          
          while (parent) {
            if (parent.id) {
              return `#${parent.id} ${path}`.trim();
            }
            
            let selector = parent.tagName.toLowerCase();
            let sibling = parent.previousElementSibling;
            let siblingCount = 0;
            
            while (sibling) {
              if (sibling.tagName === parent.tagName) {
                siblingCount++;
              }
              sibling = sibling.previousElementSibling;
            }
            
            if (siblingCount > 0) {
              selector += `:nth-of-type(${siblingCount + 1})`;
            }
            
            path = path ? `${selector} > ${path}` : selector;
            parent = parent.parentElement;
          }
          
          return path;
        }
        
        // Helper to check if an element is visible
        function isElementVisible(el) {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0' &&
                 el.offsetWidth > 0 &&
                 el.offsetHeight > 0;
        }
        
        return window._uniAutoExtractedData;
      };
    });
    
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Get page title
    const title = await page.title();
    
    // Take screenshot for further analysis
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
    
    // Extract metadata from the page
    const metadata = await page.evaluate(() => {
      const meta = {};
      document.querySelectorAll('meta').forEach(el => {
        const name = el.getAttribute('name') || el.getAttribute('property');
        const content = el.getAttribute('content');
        if (name && content) {
          meta[name] = content;
        }
      });
      return meta;
    });
    
    // Extract route information
    const currentRoute = await page.evaluate(() => window.location.pathname);
    
    // Extract all detected APIs
    const apis = await page.evaluate(() => {
      const apis = [];
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource');
        resources.forEach(resource => {
          if (resource.name.includes('/api/') || resource.name.includes('/graphql')) {
            const url = new URL(resource.name);
            apis.push({
              endpoint: url.pathname,
              method: 'GET', // We can't know the actual method from this API
              url: resource.name
            });
          }
        });
      }
      return apis;
    });
    
    // Run the DOM analysis to extract elements
    const extractedData = await page.evaluate(() => {
      return window._uniAutoAnalyzeDOM();
    });
    
    // Create possible workflows from the extracted data
    const workflows = [];
    
    // If there are forms, create login/registration workflows
    if (extractedData.forms.length > 0) {
      const possibleLoginForm = extractedData.forms.find(form => 
        form.inputs.some(input => input.includes('user') || input.includes('email')) &&
        form.inputs.some(input => input.includes('pass'))
      );
      
      if (possibleLoginForm) {
        const usernameInput = extractedData.inputElements.find(i => 
          i.selector.includes('user') || i.selector.includes('email')
        );
        
        const passwordInput = extractedData.inputElements.find(i => 
          i.selector.includes('pass')
        );
        
        if (usernameInput && passwordInput) {
          workflows.push({
            name: 'login',
            steps: [
              { action: 'fill', selector: usernameInput.selector, value: 'testuser@example.com' },
              { action: 'fill', selector: passwordInput.selector, value: 'password123' },
              { action: 'click', selector: possibleLoginForm.submitButton }
            ]
          });
        }
      }
    }
    
    // Create workflow for clicking main navigation links
    const navLinks = extractedData.links.filter(link => link.isVisible);
    if (navLinks.length > 0) {
      workflows.push({
        name: 'navigation',
        steps: navLinks.slice(0, 5).map(link => ({
          action: 'click',
          selector: link.selector,
          expectedUrl: link.href
        }))
      });
    }
    
    // Find interactive elements for a basic interaction workflow
    const interactiveElements = [
      ...extractedData.clickableElements.filter(e => e.isVisible),
      ...extractedData.inputElements.filter(e => e.isVisible && !e.isDisabled)
    ].slice(0, 5);
    
    if (interactiveElements.length > 0) {
      workflows.push({
        name: 'basic_interaction',
        steps: interactiveElements.map(el => {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            return {
              action: 'fill',
              selector: el.selector,
              value: el.type === 'email' ? 'test@example.com' : 'test input'
            };
          } else {
            return {
              action: 'click',
              selector: el.selector
            };
          }
        })
      });
    }
    
    // Combine all the data into a comprehensive analysis
    const analysis = {
      url,
      title,
      description: metadata.description || `Analyzed page at ${url}`,
      elements: [
        ...extractedData.clickableElements.filter(e => e.isVisible).map(e => ({
          type: 'button',
          selector: e.selector,
          text: e.text,
          isInteractive: true,
          location: e.location
        })),
        ...extractedData.inputElements.filter(e => e.isVisible).map(e => ({
          type: 'input',
          selector: e.selector,
          placeholder: e.placeholder,
          isRequired: e.isRequired,
          validations: [
            e.validation.minLength ? `minLength: ${e.validation.minLength}` : null,
            e.validation.maxLength ? `maxLength: ${e.validation.maxLength}` : null,
            e.validation.pattern ? `pattern: ${e.validation.pattern}` : null
          ].filter(Boolean)
        })),
        ...extractedData.selectElements.filter(e => e.isVisible).map(e => ({
          type: 'select',
          selector: e.selector,
          options: e.options.map(o => o.text)
        })),
        ...extractedData.forms.map(f => ({
          type: 'form',
          selector: f.selector,
          inputs: f.inputs,
          submitButton: f.submitButton
        }))
      ],
      routes: [currentRoute, ...extractedData.links.map(l => {
        try {
          const url = new URL(l.href, window.location.origin);
          return url.pathname;
        } catch (e) {
          return l.href;
        }
      })],
      apis,
      workflows
    };
    
    return analysis;
  } catch (error) {
    logger.error(`Application analysis error: ${error.message}`);
    throw new Error(`Failed to analyze application: ${error.message}`);
  } finally {
    // Clean up resources
    if (page) await page.close().catch(e => logger.error(`Error closing page: ${e.message}`));
    if (context) await context.close().catch(e => logger.error(`Error closing context: ${e.message}`));
    if (browser) await browser.close().catch(e => logger.error(`Error closing browser: ${e.message}`));
  }
}

/**
 * Generate test code based on application analysis and user requirements
 * 
 * @param {Object} params - Test generation parameters
 * @returns {Promise<string>} Generated test code
 */
async function generateTestCode(params) {
  const { pageInfo, framework, style, format, prompt, additionalContext } = params;
  
  logger.info(`Generating test code using ${framework} framework with ${style} style`);
  
  try {
    // Prepare prompt for Claude
    const promptText = buildPrompt(pageInfo, framework, style, format, prompt, additionalContext);
    
    // Use our centralized AI service to interact with Claude
    const aiService = require('../utils/ai-service');
    const response = await aiService.processWithClaude({
      prompt: promptText,
      maxTokens: 4000
    });
    
    // Extract code from response
    const generatedCode = aiService.extractCodeFromResponse(response);
    return generatedCode;
  } catch (error) {
    logger.error(`Test code generation error: ${error.message}`);
    throw new Error(`Failed to generate test code: ${error.message}`);
  }
}

/**
 * Build a prompt for Claude to generate test code
 * 
 * @param {Object} pageInfo - Application information
 * @param {string} framework - Test framework
 * @param {string} style - Test style
 * @param {string} format - Output format
 * @param {string} prompt - User prompt
 * @param {Object} additionalContext - Additional context
 * @returns {string} Formatted prompt for Claude
 */
function buildPrompt(pageInfo, framework, style, format, prompt, additionalContext) {
  // Format elements for better readability
  const formattedElements = pageInfo.elements.map(element => {
    switch (element.type) {
      case 'button':
        return `${element.type.toUpperCase()}: "${element.text || 'No text'}" (selector: ${element.selector})`;
      case 'input':
        return `${element.type.toUpperCase()}: ${element.placeholder ? `"${element.placeholder}"` : 'No placeholder'} (selector: ${element.selector}, required: ${element.isRequired || false})`;
      case 'select':
        return `${element.type.toUpperCase()}: (selector: ${element.selector}, options: ${JSON.stringify(element.options)})`;
      case 'form':
        return `${element.type.toUpperCase()}: (selector: ${element.selector}, inputs: ${element.inputs.length}, submit: ${element.submitButton || 'none'})`;
      default:
        return `${element.type}: ${element.selector}`;
    }
  }).join('\n');

  // Format workflows for better readability
  const formattedWorkflows = pageInfo.workflows.map(workflow => {
    const steps = workflow.steps.map((step, index) => 
      `  ${index + 1}. ${step.action.toUpperCase()} ${step.selector} ${step.value ? `with value "${step.value}"` : ''}`
    ).join('\n');
    
    return `WORKFLOW: ${workflow.name}\n${steps}`;
  }).join('\n\n');

  // Format routes
  const routes = Array.from(new Set(pageInfo.routes)).filter(Boolean).join('\n- ');
  
  // Format APIs
  const apis = pageInfo.apis && pageInfo.apis.length > 0 
    ? pageInfo.apis.map(api => `- ${api.method} ${api.endpoint}`).join('\n')
    : 'No APIs detected';
  
  // Framework-specific guidance
  let frameworkSpecificGuidance = '';
  switch (framework.toLowerCase()) {
    case 'playwright':
      frameworkSpecificGuidance = `
PLAYWRIGHT SPECIFIC GUIDANCE:
- Use the Page Object Model pattern
- Implement fixtures for browser and page setup
- Use expect assertions from Playwright
- Implement proper waitFor methods
- Use locators instead of selectors when possible
- Structure tests with describe and test blocks
- Implement proper before/after hooks`;
      break;
    case 'cypress':
      frameworkSpecificGuidance = `
CYPRESS SPECIFIC GUIDANCE:
- Use cy.visit(), cy.get(), cy.click(), cy.type() commands
- Use proper chaining with .should() assertions
- Implement custom commands where appropriate
- Use fixtures for test data
- Implement proper before/beforeEach hooks
- Use cy.intercept() for API mocking if needed`;
      break;
    case 'jest':
      frameworkSpecificGuidance = `
JEST SPECIFIC GUIDANCE:
- Structure with describe and test blocks
- Use proper beforeAll/beforeEach hooks
- Use expect() with appropriate matchers
- Implement proper mocks and spies where needed
- Use async/await for asynchronous tests`;
      break;
  }

  // Style-specific guidance
  let styleGuidance = '';
  switch (style.toLowerCase()) {
    case 'bdd':
      styleGuidance = `
BDD STYLE GUIDANCE:
- Use descriptive test names that follow the "Given/When/Then" pattern
- Focus on behavior rather than implementation details
- Write tests from the user's perspective
- Group related tests with descriptive describe blocks`;
      break;
    case 'tdd':
      styleGuidance = `
TDD STYLE GUIDANCE:
- Organize tests by component or function
- Focus on testing specific functions and methods
- Use clear assertions to verify expected outcomes
- Follow the Arrange-Act-Assert pattern`;
      break;
  }

  // Build comprehensive prompt
  return `You are an expert test automation engineer specializing in ${framework} and ${style.toUpperCase()} testing.

TASK: Generate comprehensive ${style.toUpperCase()} test code for a web application using the ${framework.toUpperCase()} framework in ${format.toUpperCase()}.

USER REQUIREMENTS:
${prompt || "Generate standard test cases covering main user flows and validations"}

APPLICATION INFORMATION:
URL: ${pageInfo.url}
Title: ${pageInfo.title}
Description: ${pageInfo.description}

PAGE STRUCTURE:
The application contains the following elements:
${formattedElements}

ROUTES:
- ${routes}

API ENDPOINTS:
${apis}

${formattedWorkflows ? `DETECTED WORKFLOWS:\n${formattedWorkflows}\n` : ''}

${Object.keys(additionalContext).length > 0 ? `ADDITIONAL CONTEXT:\n${JSON.stringify(additionalContext, null, 2)}\n` : ''}

${frameworkSpecificGuidance}

${styleGuidance}

GENERAL INSTRUCTIONS:
1. Generate complete, executable test code following industry best practices
2. Structure the tests logically with appropriate test cases and suites
3. Write descriptive test names that clearly indicate what is being tested
4. Include comprehensive assertions to validate expected behavior
5. Implement proper error handling and recovery mechanisms
6. Include setup and teardown procedures
7. Make tests deterministic, isolated, and maintainable
8. Use the page elements and selectors provided above
9. Implement data parameterization where appropriate
10. Add detailed comments explaining the test strategy and approach

The final code should be production-ready, well-structured, and follow all best practices for ${framework} test automation. Include all necessary imports, configuration, and setup code.`;
}

// Removed redundant code extraction function - now using the centralized implementation from ai-service.js

/**
 * Save generated tests to a file
 * 
 * @param {string} testCode - Generated test code
 * @param {string} outputPath - Path to save the file
 * @param {string} format - Output format
 * @returns {Promise<string>} Path to the saved file
 */
async function saveGeneratedTests(testCode, outputPath, format) {
  try {
    // Ensure directory exists
    const directory = path.dirname(outputPath);
    await fs.mkdir(directory, { recursive: true });
    
    // Determine file extension
    let extension = '.js';
    switch (format) {
      case OUTPUT_FORMATS.TS:
        extension = '.ts';
        break;
      case OUTPUT_FORMATS.PYTHON:
        extension = '.py';
        break;
      case OUTPUT_FORMATS.JAVA:
        extension = '.java';
        break;
      case OUTPUT_FORMATS.CSHARP:
        extension = '.cs';
        break;
      case OUTPUT_FORMATS.RUBY:
        extension = '.rb';
        break;
    }
    
    // Ensure path has the correct extension
    const finalPath = outputPath.endsWith(extension) ? outputPath : `${outputPath}${extension}`;
    
    // Write file
    await fs.writeFile(finalPath, testCode);
    logger.info(`Tests saved to ${finalPath}`);
    
    return finalPath;
  } catch (error) {
    logger.error(`Error saving tests: ${error.message}`);
    throw new Error(`Failed to save generated tests: ${error.message}`);
  }
}

/**
 * Generate test skeletons for all major features of an application
 * 
 * @param {string} url - URL of the application
 * @param {Object} options - Test generation options
 * @returns {Promise<Object>} Generated test suites
 */
async function generateFullTestSuite(url, options) {
  logger.info(`Generating full test suite for ${url}`);
  
  try {
    // Analyze the application
    const pageInfo = await analyzeApplication(url);
    
    // Different test types to generate
    const testTypes = [
      { type: 'unit', style: TEST_STYLES.TDD },
      { type: 'integration', style: TEST_STYLES.TDD },
      { type: 'e2e', style: TEST_STYLES.BDD },
      { type: 'api', style: TEST_STYLES.BDD }
    ];
    
    // Generate each test type
    const results = {};
    
    for (const testType of testTypes) {
      results[testType.type] = await generateTests({
        url,
        framework: options.framework || TEST_FRAMEWORKS.PLAYWRIGHT,
        style: testType.style,
        format: options.format || OUTPUT_FORMATS.JS,
        prompt: `Generate ${testType.type} tests for the application`,
        outputPath: options.outputDir ? path.join(options.outputDir, `${testType.type}-tests`) : null,
        additionalContext: options.additionalContext || {}
      });
    }
    
    return {
      status: 'success',
      url,
      testSuites: results
    };
  } catch (error) {
    logger.error(`Full test suite generation error: ${error.message}`);
    throw new Error(`Failed to generate full test suite: ${error.message}`);
  }
}

/**
 * Scaffold a complete test project structure with configuration
 * 
 * @param {string} framework - Test framework to use
 * @param {string} outputDir - Directory to create the project
 * @returns {Promise<Object>} Project details
 */
async function scaffoldTestProject(framework, outputDir) {
  logger.info(`Scaffolding test project using ${framework} in ${outputDir}`);
  
  try {
    // Create project directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Determine framework-specific files to create
    const files = getFrameworkFiles(framework);
    
    // Create each file
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(outputDir, filePath);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Write file
      await fs.writeFile(fullPath, content);
    }
    
    // Create package.json if needed
    if (!files['package.json']) {
      const packageJson = generatePackageJson(framework);
      await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    }
    
    return {
      status: 'success',
      framework,
      outputDir,
      files: Object.keys(files)
    };
  } catch (error) {
    logger.error(`Project scaffolding error: ${error.message}`);
    throw new Error(`Failed to scaffold test project: ${error.message}`);
  }
}

/**
 * Get framework-specific files for project scaffolding
 * 
 * @param {string} framework - Test framework
 * @returns {Object} Map of file paths to content
 */
function getFrameworkFiles(framework) {
  // Framework-specific files
  switch (framework) {
    case TEST_FRAMEWORKS.JEST:
      return {
        'jest.config.js': `module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
};`,
        'tests/example.test.js': `describe('Example test', () => {
  test('should pass', () => {
    expect(true).toBe(true);
  });
});`
      };
      
    case TEST_FRAMEWORKS.PLAYWRIGHT:
      return {
        'playwright.config.js': `// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});`,
        'tests/example.spec.js': `const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const title = page.locator('.navbar__inner .navbar__title');
  await expect(title).toHaveText('Playwright');
});`
      };
      
    case TEST_FRAMEWORKS.CYPRESS:
      return {
        'cypress.json': `{
  "baseUrl": "http://localhost:3000",
  "viewportWidth": 1280,
  "viewportHeight": 720,
  "video": false
}`,
        'cypress/integration/example.spec.js': `describe('Example test', () => {
  it('Visits the homepage', () => {
    cy.visit('/');
    cy.contains('h1', 'Welcome');
  });
});`
      };
      
    case TEST_FRAMEWORKS.CUCUMBER:
      return {
        'features/example.feature': `Feature: Example feature

  Scenario: Basic example
    Given I am on the homepage
    When I click the login button
    Then I should see the login form`,
        'step-definitions/example-steps.js': `const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the homepage', function () {
  // Implementation
});

When('I click the login button', function () {
  // Implementation
});

Then('I should see the login form', function () {
  // Implementation
});`
      };
      
    default:
      return {
        'README.md': `# Test Project

This is a test automation project using the ${framework} framework.

## Getting Started

1. Install dependencies: \`npm install\`
2. Run tests: \`npm test\`

## Project Structure

- \`/tests\`: Test files
- \`/page-objects\`: Page Object Models
- \`/fixtures\`: Test data
- \`/reports\`: Test reports
`,
        'tests/example.js': `// Example test for ${framework}`
      };
  }
}

/**
 * Generate package.json for the test project
 * 
 * @param {string} framework - Test framework
 * @returns {Object} Package.json content
 */
function generatePackageJson(framework) {
  // Base package.json
  const packageJson = {
    "name": "test-automation-project",
    "version": "1.0.0",
    "description": "Automatically generated test automation project",
    "scripts": {
      "test": "echo \"Error: no test script specified\" && exit 1"
    },
    "keywords": [
      "testing",
      "automation",
      framework
    ],
    "dependencies": {},
    "devDependencies": {}
  };
  
  // Add framework-specific scripts and dependencies
  switch (framework) {
    case TEST_FRAMEWORKS.JEST:
      packageJson.scripts.test = "jest";
      packageJson.devDependencies = {
        "jest": "^29.0.0"
      };
      break;
      
    case TEST_FRAMEWORKS.PLAYWRIGHT:
      packageJson.scripts.test = "playwright test";
      packageJson.devDependencies = {
        "@playwright/test": "^1.40.0"
      };
      break;
      
    case TEST_FRAMEWORKS.CYPRESS:
      packageJson.scripts.test = "cypress run";
      packageJson.scripts.open = "cypress open";
      packageJson.devDependencies = {
        "cypress": "^13.0.0"
      };
      break;
      
    case TEST_FRAMEWORKS.CUCUMBER:
      packageJson.scripts.test = "cucumber-js";
      packageJson.devDependencies = {
        "@cucumber/cucumber": "^9.0.0"
      };
      break;
      
    case TEST_FRAMEWORKS.WEBDRIVERIO:
      packageJson.scripts.test = "wdio run wdio.conf.js";
      packageJson.devDependencies = {
        "@wdio/cli": "^8.0.0",
        "@wdio/local-runner": "^8.0.0",
        "@wdio/mocha-framework": "^8.0.0",
        "@wdio/spec-reporter": "^8.0.0"
      };
      break;
      
    default:
      packageJson.scripts.test = `echo "Running tests with ${framework}"`;
  }
  
  return packageJson;
}

module.exports = {
  generateTests,
  generateFullTestSuite,
  scaffoldTestProject,
  TEST_FRAMEWORKS,
  TEST_STYLES,
  OUTPUT_FORMATS
};