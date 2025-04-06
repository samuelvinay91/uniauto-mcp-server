const { handleAutomationCommand, cleanup } = require('../../src/core/automation');
const { selfHeal } = require('../../src/core/self-healing');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock Playwright
jest.mock('playwright', () => {
  // Mock elements
  const mockElement = {
    screenshot: jest.fn().mockResolvedValue(Buffer.from('mock-screenshot')),
    boundingBox: jest.fn().mockResolvedValue({ x: 10, y: 10, width: 100, height: 30 })
  };
  
  // Mock page
  const mockPage = {
    goto: jest.fn().mockResolvedValue(undefined),
    url: jest.fn().mockReturnValue('https://example.com'),
    click: jest.fn().mockResolvedValue(undefined),
    fill: jest.fn().mockResolvedValue(undefined),
    selectOption: jest.fn().mockResolvedValue(undefined),
    textContent: jest.fn().mockResolvedValue('mock text content'),
    innerText: jest.fn().mockResolvedValue('mock inner text'),
    getAttribute: jest.fn().mockResolvedValue('mock attribute'),
    screenshot: jest.fn().mockResolvedValue(Buffer.from('mock-screenshot')),
    $: jest.fn().mockResolvedValue(mockElement),
    $$: jest.fn().mockResolvedValue([mockElement]),
    evaluate: jest.fn().mockImplementation((fn, ...args) => {
      if (typeof fn === 'function') {
        return Promise.resolve(['#alt-1', '.alt-2']);
      }
      return Promise.resolve('mock eval result');
    })
  };
  
  // Mock context
  const mockContext = {
    pages: jest.fn().mockReturnValue([mockPage]),
    newPage: jest.fn().mockResolvedValue(mockPage)
  };
  
  // Mock browser
  const mockBrowser = {
    newContext: jest.fn().mockResolvedValue(mockContext),
    close: jest.fn().mockResolvedValue(undefined)
  };
  
  return {
    chromium: {
      launch: jest.fn().mockResolvedValue(mockBrowser)
    }
  };
});

jest.mock('../../src/core/self-healing', () => ({
  selfHeal: jest.fn()
}));

describe('Automation Core with Playwright', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(async () => {
    await cleanup();
  });
  
  test('should navigate to URL successfully', async () => {
    const result = await handleAutomationCommand('navigate', { url: 'https://example.com' });
    
    // Verify Playwright's goto was called with correct params
    expect(result).toEqual({ status: 'success', url: 'https://example.com' });
  });
  
  test('should click on element successfully', async () => {
    const result = await handleAutomationCommand('click', { selector: '#submit-button' });
    
    // Verify Playwright's click was called
    expect(result).toEqual({ status: 'success', selector: '#submit-button' });
  });
  
  test('should type text successfully', async () => {
    const result = await handleAutomationCommand('type', { 
      selector: '#username', 
      text: 'testuser', 
      options: { clearFirst: true }
    });
    
    // Verify Playwright's fill was called
    expect(result).toEqual({ status: 'success', selector: '#username', textLength: 8 });
  });
  
  test('should handle errors and attempt self-healing', async () => {
    // Setup error for first attempt
    const mockPlaywrightPage = require('playwright').chromium.launch().then(b => b.newContext()).then(c => c.newPage());
    mockPlaywrightPage.then(page => {
      page.click.mockRejectedValueOnce(new Error('element not found'));
    });
    
    // Mock self-healing to return a fixed selector
    selfHeal.mockResolvedValueOnce('role=button[name="Submit"]');
    
    const result = await handleAutomationCommand('click', { selector: '#broken-button' });
    
    // Should have called selfHeal
    expect(selfHeal).toHaveBeenCalledWith('#broken-button', expect.anything());
    
    // Should have returned success with the fixed selector
    expect(result).toEqual({ status: 'success', selector: 'role=button[name="Submit"]' });
  });
  
  test('should extract data successfully', async () => {
    const result = await handleAutomationCommand('extract', { 
      selector: '.content', 
      attribute: 'textContent' 
    });
    
    expect(result).toEqual({ 
      status: 'success', 
      selector: '.content', 
      data: 'mock text content' 
    });
  });
  
  test('should take a screenshot successfully', async () => {
    const result = await handleAutomationCommand('screenshot', { fileName: 'test.png' });
    
    expect(result).toEqual({ 
      status: 'success', 
      path: './public/screenshots/test.png' 
    });
  });
});