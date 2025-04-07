/**
 * Advanced Testing Module
 * 
 * Extends the MCP server with advanced Playwright-based testing capabilities
 * without requiring additional dependencies.
 */

const { chromium } = require('playwright');
const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Perform visual comparison between a baseline and current state
 * 
 * @param {Object} options - Visual comparison options
 * @param {string} options.url - URL to navigate to
 * @param {string} options.selector - Optional selector to compare (if not provided, full page is compared)
 * @param {string} options.baselineName - Name for the baseline image
 * @param {boolean} options.updateBaseline - Whether to update the baseline
 * @returns {Promise<Object>} Comparison results
 */
async function visualCompare(options) {
  const { url, selector, baselineName, updateBaseline } = options;
  
  logger.info(`Performing visual comparison for ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Ensure directories exist
    const baselineDir = path.join(process.cwd(), 'baseline-images');
    const diffDir = path.join(process.cwd(), 'diff-images');
    await fs.mkdir(baselineDir, { recursive: true });
    await fs.mkdir(diffDir, { recursive: true });
    
    // Generate file names
    const safeName = baselineName || url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const baselinePath = path.join(baselineDir, `${safeName}.png`);
    const currentPath = path.join(diffDir, `${safeName}_current.png`);
    const diffPath = path.join(diffDir, `${safeName}_diff.png`);
    
    // Take screenshot of current state
    if (selector) {
      await page.locator(selector).screenshot({ path: currentPath });
    } else {
      await page.screenshot({ path: currentPath, fullPage: true });
    }
    
    // Check if baseline exists
    let baselineExists = false;
    try {
      await fs.access(baselinePath);
      baselineExists = true;
    } catch (err) {
      // Baseline doesn't exist
    }
    
    // Update baseline if requested or doesn't exist
    if (updateBaseline || !baselineExists) {
      await fs.copyFile(currentPath, baselinePath);
      logger.info(`Baseline ${baselinePath} ${baselineExists ? 'updated' : 'created'}`);
      
      return {
        status: 'success',
        message: `Baseline ${baselineExists ? 'updated' : 'created'}`,
        baselinePath,
        baselineUpdated: true
      };
    }
    
    // Perform comparison using Playwright's built-in functionality
    const currentImage = await page.screenshot(selector ? 
      { path: currentPath, fullPage: !selector } : 
      { path: currentPath, fullPage: true }
    );
    
    // Read baseline image
    const baselineImage = await fs.readFile(baselinePath);
    
    // Compare using Playwright's image comparison
    const comparison = await page.evaluate(async (baseline64, current64) => {
      // This is a simple pixel-by-pixel comparison
      // In a real implementation, you'd use a more sophisticated algorithm
      const img1 = new Image();
      const img2 = new Image();
      
      await new Promise((resolve) => {
        img1.onload = resolve;
        img1.src = `data:image/png;base64,${baseline64}`;
      });
      
      await new Promise((resolve) => {
        img2.onload = resolve;
        img2.src = `data:image/png;base64,${current64}`;
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = Math.max(img1.width, img2.width);
      canvas.height = Math.max(img1.height, img2.height);
      
      // Draw the difference
      ctx.drawImage(img1, 0, 0);
      ctx.globalCompositeOperation = 'difference';
      ctx.drawImage(img2, 0, 0);
      
      // Analyze pixels to determine difference percentage
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let diffPixels = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 10 || data[i+1] > 10 || data[i+2] > 10) {
          diffPixels++;
        }
      }
      
      const totalPixels = canvas.width * canvas.height;
      const diffPercentage = (diffPixels / totalPixels) * 100;
      
      // Add highlighting for differences
      ctx.globalCompositeOperation = 'source-over';
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (data[i] > 10 || data[i+1] > 10 || data[i+2] > 10) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      
      return {
        diffPercentage,
        diffImageData: canvas.toDataURL('image/png').split(',')[1] // base64 data
      };
    }, baselineImage.toString('base64'), currentImage.toString('base64'));
    
    // Write diff image
    if (comparison.diffImageData) {
      await fs.writeFile(diffPath, Buffer.from(comparison.diffImageData, 'base64'));
    }
    
    // Determine if test passed based on threshold
    const threshold = options.threshold || 0.1; // Default 0.1% difference threshold
    const passed = comparison.diffPercentage <= threshold;
    
    return {
      status: passed ? 'success' : 'failed',
      diffPercentage: comparison.diffPercentage,
      threshold,
      passed,
      baselinePath,
      currentPath,
      diffPath
    };
  } finally {
    await browser.close();
  }
}

/**
 * Perform accessibility testing on a page
 * 
 * @param {Object} options - Accessibility testing options
 * @param {string} options.url - URL to test
 * @param {string} options.standard - Accessibility standard (wcag2a, wcag2aa, wcag21aa)
 * @returns {Promise<Object>} Accessibility test results
 */
async function accessibilityTest(options) {
  const { url, standard = 'wcag21aa' } = options;
  
  logger.info(`Performing accessibility testing on ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Playwright's built-in accessibility snapshot
    const accessibilitySnapshot = await page.accessibility.snapshot();
    
    // Basic accessibility checks based on HTML attributes
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for images without alt text
      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('alt')) {
          issues.push({
            type: 'missing-alt',
            element: 'img',
            impact: 'serious',
            message: 'Image has no alt text',
            selector: getSelector(img)
          });
        }
      });
      
      // Check for form controls without labels
      document.querySelectorAll('input, select, textarea').forEach(control => {
        if (!control.hasAttribute('aria-label') && 
            !control.hasAttribute('aria-labelledby') && 
            !document.querySelector(`label[for="${control.id}"]`)) {
          issues.push({
            type: 'missing-label',
            element: control.tagName.toLowerCase(),
            impact: 'serious',
            message: 'Form control has no associated label',
            selector: getSelector(control)
          });
        }
      });
      
      // Check for proper heading structure
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let previousLevel = 0;
      headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName.substring(1));
        if (previousLevel > 0 && currentLevel > previousLevel + 1) {
          issues.push({
            type: 'heading-order',
            element: heading.tagName.toLowerCase(),
            impact: 'moderate',
            message: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
            selector: getSelector(heading)
          });
        }
        previousLevel = currentLevel;
      });
      
      // Check for color contrast (basic check)
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        const backgroundColor = style.backgroundColor;
        const color = style.color;
        
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          return; // Skip elements with transparent background
        }
        
        // Very basic contrast check (would use more sophisticated algorithm in production)
        if (backgroundColor === color) {
          issues.push({
            type: 'color-contrast',
            element: el.tagName.toLowerCase(),
            impact: 'serious',
            message: 'Element has same foreground and background color',
            selector: getSelector(el)
          });
        }
      });
      
      // Helper function to get selector
      function getSelector(el) {
        if (el.id) return `#${el.id}`;
        if (el.className) {
          const classes = Array.from(el.classList).join('.');
          return `${el.tagName.toLowerCase()}.${classes}`;
        }
        return el.tagName.toLowerCase();
      }
      
      return issues;
    });
    
    // Take a screenshot for reference
    const screenshotPath = path.join(process.cwd(), 'accessibility-reports', `${url.replace(/[^a-z0-9]/gi, '_')}.png`);
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Generate a summary report
    const summary = {
      url,
      timestamp: new Date().toISOString(),
      standard,
      issuesCount: accessibilityIssues.length,
      snapshot: accessibilitySnapshot,
      issues: accessibilityIssues,
      screenshotPath
    };
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'accessibility-reports', `${url.replace(/[^a-z0-9]/gi, '_')}.json`);
    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2));
    
    return {
      status: accessibilityIssues.length === 0 ? 'success' : 'failed',
      issuesCount: accessibilityIssues.length,
      issues: accessibilityIssues,
      reportPath,
      screenshotPath
    };
  } finally {
    await browser.close();
  }
}

/**
 * Perform performance testing on a page
 * 
 * @param {Object} options - Performance testing options
 * @param {string} options.url - URL to test
 * @param {number} options.iterations - Number of test iterations
 * @returns {Promise<Object>} Performance test results
 */
async function performanceTest(options) {
  const { url, iterations = 3 } = options;
  
  logger.info(`Performing performance testing on ${url} (${iterations} iterations)`);
  
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    logger.info(`Performance test iteration ${i + 1}/${iterations}`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    
    try {
      const page = await context.newPage();
      
      // Set up performance metrics collection
      const performanceMetrics = {};
      
      // Measure navigation timing
      const startTime = Date.now();
      await page.goto(url, { waitUntil: 'networkidle' });
      performanceMetrics.navigationTime = Date.now() - startTime;
      
      // Collect more detailed metrics using JavaScript
      const metrics = await page.evaluate(() => {
        const navigation = window.performance.timing;
        const paint = window.performance.getEntriesByType('paint');
        const resources = window.performance.getEntriesByType('resource');
        
        // Calculate key metrics
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        const domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        const timeToFirstByte = navigation.responseStart - navigation.requestStart;
        
        // Get paint metrics
        const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime;
        const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime;
        
        // Resource statistics
        const totalResources = resources.length;
        const totalResourceSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
        
        // Get largest contentful paint if available
        let largestContentfulPaint = null;
        if (window.LargestContentfulPaint) {
          const lcpObserver = new PerformanceObserver(() => {});
          const lcpEntries = lcpObserver.takeRecords();
          largestContentfulPaint = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null;
        }
        
        return {
          loadTime,
          domContentLoadedTime,
          timeToFirstByte,
          firstPaint,
          firstContentfulPaint,
          largestContentfulPaint,
          totalResources,
          totalResourceSize
        };
      });
      
      // Combine metrics
      Object.assign(performanceMetrics, metrics);
      
      // Measure memory usage
      const jsHeapSizeLimit = await page.evaluate(() => 
        window.performance?.memory?.jsHeapSizeLimit || null
      );
      
      const usedJSHeapSize = await page.evaluate(() => 
        window.performance?.memory?.usedJSHeapSize || null
      );
      
      if (jsHeapSizeLimit && usedJSHeapSize) {
        performanceMetrics.memory = {
          jsHeapSizeLimit,
          usedJSHeapSize,
          usedPercentage: (usedJSHeapSize / jsHeapSizeLimit) * 100
        };
      }
      
      results.push(performanceMetrics);
    } finally {
      await browser.close();
    }
  }
  
  // Calculate aggregated metrics
  const aggregatedResults = {
    url,
    iterations,
    timestamp: new Date().toISOString(),
    averages: {},
    iterations: results
  };
  
  // Calculate averages
  const keys = Object.keys(results[0]);
  for (const key of keys) {
    if (key !== 'memory') {
      const values = results.map(result => result[key]);
      const sum = values.reduce((acc, value) => acc + value, 0);
      aggregatedResults.averages[key] = sum / results.length;
    }
  }
  
  // Handle memory metrics separately
  if (results[0].memory) {
    const memoryUsage = results.map(result => result.memory.usedPercentage);
    const sum = memoryUsage.reduce((acc, value) => acc + value, 0);
    aggregatedResults.averages.memoryUsage = sum / results.length;
  }
  
  // Save results to file
  const reportDir = path.join(process.cwd(), 'performance-reports');
  await fs.mkdir(reportDir, { recursive: true });
  
  const reportPath = path.join(reportDir, `${url.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify(aggregatedResults, null, 2));
  
  return {
    status: 'success',
    url,
    averages: aggregatedResults.averages,
    reportPath
  };
}

/**
 * Trace network activity for API testing and analysis
 * 
 * @param {Object} options - Network tracing options
 * @param {string} options.url - URL to test
 * @param {Array<string>} options.apiEndpoints - Optional API endpoints to specifically monitor
 * @returns {Promise<Object>} Network trace results
 */
async function networkTrace(options) {
  const { url, apiEndpoints = [] } = options;
  
  logger.info(`Tracing network activity for ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  
  try {
    const page = await context.newPage();
    
    // Set up request/response logging
    const requests = [];
    const endpoints = apiEndpoints.map(endpoint => new RegExp(endpoint.replace(/\*/g, '.*')));
    
    // Track network requests
    await page.route('**/*', async (route, request) => {
      const url = request.url();
      const method = request.method();
      const resourceType = request.resourceType();
      const postData = request.postData();
      
      const isApiEndpoint = endpoints.length === 0 || 
        endpoints.some(pattern => pattern.test(url));
      
      if (isApiEndpoint) {
        const requestData = {
          url,
          method,
          resourceType,
          postData,
          headers: request.headers(),
          timestamp: Date.now()
        };
        
        requests.push(requestData);
      }
      
      // Continue with the request
      await route.continue();
    });
    
    // Track responses
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      
      const isApiEndpoint = endpoints.length === 0 || 
        endpoints.some(pattern => pattern.test(url));
      
      if (isApiEndpoint) {
        const request = requests.find(req => req.url === url);
        if (request) {
          // Try to get response body, but don't fail if it's not available
          let body = null;
          try {
            const contentType = headers['content-type'] || '';
            if (contentType.includes('application/json')) {
              body = await response.json();
            } else if (contentType.includes('text/')) {
              body = await response.text();
            }
          } catch (err) {
            // Ignore body parsing errors
            logger.warn(`Could not parse response body for ${url}: ${err.message}`);
          }
          
          request.response = {
            status,
            headers,
            body,
            timestamp: Date.now(),
            duration: Date.now() - request.timestamp
          };
        }
      }
    });
    
    // Navigate to the URL and wait for network idle
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Allow some time for API requests to complete
    await page.waitForTimeout(2000);
    
    // Filter to API requests only and add timing
    const apiRequests = requests.filter(request => 
      request.resourceType === 'fetch' || 
      request.resourceType === 'xhr' ||
      request.url.includes('/api/') || 
      request.url.includes('graphql')
    );
    
    // Add more context by capturing the page's HTML
    const html = await page.content();
    
    // Take a screenshot
    const screenshotDir = path.join(process.cwd(), 'network-traces');
    await fs.mkdir(screenshotDir, { recursive: true });
    const screenshotPath = path.join(screenshotDir, `${url.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Save trace results
    const traceData = {
      url,
      timestamp: new Date().toISOString(),
      requests: apiRequests,
      screenshotPath
    };
    
    const tracePath = path.join(screenshotDir, `${url.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`);
    await fs.writeFile(tracePath, JSON.stringify(traceData, null, 2));
    
    return {
      status: 'success',
      url,
      requestCount: apiRequests.length,
      tracePath,
      screenshotPath,
      requests: apiRequests.map(req => ({
        url: req.url,
        method: req.method,
        status: req.response?.status,
        duration: req.response?.duration || null
      }))
    };
  } finally {
    await browser.close();
  }
}

/**
 * Run extensive test suite with multithreaded browser instances
 * 
 * @param {Object} options - Test suite options
 * @param {string} options.url - URL to test
 * @param {boolean} options.visual - Whether to run visual tests
 * @param {boolean} options.accessibility - Whether to run accessibility tests
 * @param {boolean} options.performance - Whether to run performance tests
 * @param {boolean} options.network - Whether to run network tests
 * @returns {Promise<Object>} Combined test results
 */
async function runTestSuite(options) {
  const { url, visual = true, accessibility = true, performance = true, network = true } = options;
  
  logger.info(`Running comprehensive test suite for ${url}`);
  
  const startTime = Date.now();
  const results = {};
  
  // Run tests in parallel
  const testPromises = [];
  
  if (visual) {
    testPromises.push(
      visualCompare({ url, baselineName: url.replace(/[^a-z0-9]/gi, '_') })
        .then(result => { results.visual = result; })
        .catch(err => { 
          logger.error(`Visual test error: ${err.message}`);
          results.visual = { status: 'error', error: err.message }; 
        })
    );
  }
  
  if (accessibility) {
    testPromises.push(
      accessibilityTest({ url })
        .then(result => { results.accessibility = result; })
        .catch(err => { 
          logger.error(`Accessibility test error: ${err.message}`);
          results.accessibility = { status: 'error', error: err.message }; 
        })
    );
  }
  
  if (performance) {
    testPromises.push(
      performanceTest({ url, iterations: 1 })
        .then(result => { results.performance = result; })
        .catch(err => { 
          logger.error(`Performance test error: ${err.message}`);
          results.performance = { status: 'error', error: err.message }; 
        })
    );
  }
  
  if (network) {
    testPromises.push(
      networkTrace({ url })
        .then(result => { results.network = result; })
        .catch(err => { 
          logger.error(`Network test error: ${err.message}`);
          results.network = { status: 'error', error: err.message }; 
        })
    );
  }
  
  // Wait for all tests to complete
  await Promise.all(testPromises);
  
  // Generate combined report
  const totalTime = Date.now() - startTime;
  
  // Calculate overall status
  const statuses = Object.values(results).map(result => result.status);
  const overallStatus = statuses.includes('error') ? 'error' : 
                        statuses.includes('failed') ? 'failed' : 'success';
  
  // Save combined report
  const reportDir = path.join(process.cwd(), 'test-reports');
  await fs.mkdir(reportDir, { recursive: true });
  
  const report = {
    url,
    timestamp: new Date().toISOString(),
    duration: totalTime,
    overallStatus,
    tests: Object.keys(results).length,
    results
  };
  
  const reportPath = path.join(reportDir, `${url.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  return {
    status: overallStatus,
    url,
    duration: totalTime,
    reportPath,
    summary: {
      visual: results.visual?.status,
      accessibility: results.accessibility?.status,
      performance: results.performance?.status,
      network: results.network?.status
    }
  };
}

module.exports = {
  visualCompare,
  accessibilityTest,
  performanceTest,
  networkTrace,
  runTestSuite
};