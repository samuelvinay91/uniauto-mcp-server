const { selfHeal } = require('../../src/core/self-healing');
const { ElementRepository } = require('../../src/core/element-repository');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

jest.mock('../../src/core/element-repository', () => ({
  ElementRepository: jest.fn().mockImplementation(() => ({
    findAlternativeSelector: jest.fn().mockResolvedValue('.alt-button'),
    captureElement: jest.fn().mockResolvedValue(true)
  }))
}));

// Mock OpenCV for visual matching
jest.mock('opencv4nodejs', () => ({
  imread: jest.fn(),
  matchTemplate: jest.fn().mockReturnValue({
    minMaxLoc: () => ({ maxLoc: { x: 100, y: 100 } })
  }),
  TM_CCOEFF_NORMED: 1
}));

describe('Self Healing Functionality', () => {
  let mockPage;

  beforeEach(() => {
    // Mock Playwright page
    mockPage = {
      $: jest.fn().mockResolvedValue(null), // Original selector not found
      $$: jest.fn().mockResolvedValue([{ click: jest.fn() }]),
      evaluate: jest.fn().mockImplementation((fn) => {
        if (typeof fn === 'function') {
          return Promise.resolve(['role=button[name="Submit"]', '.alt-button']);
        }
        return Promise.resolve(null);
      }),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('mock-screenshot'))
    };
  });

  test('should return alternative selector when original fails', async () => {
    const originalSelector = '#broken-button';
    const result = await selfHeal(originalSelector, mockPage);
    
    // Should return an alternative selector
    expect(result).toBeTruthy();
    expect(result).not.toEqual(originalSelector);
  });

  test('should try role-based selectors when CSS selector fails', async () => {
    const originalSelector = '.submit-btn';
    
    // Setup mock to return role-based selector
    mockPage.evaluate.mockResolvedValueOnce(['role=button[name="Submit"]']);
    
    const result = await selfHeal(originalSelector, mockPage);
    
    expect(result).toEqual('role=button[name="Submit"]');
  });

  test('should fall back to element repository when other methods fail', async () => {
    const originalSelector = '#broken-button';
    
    // Make other strategies fail
    mockPage.evaluate.mockResolvedValueOnce([]);
    
    // ElementRepository will return .alt-button as per the mock
    const result = await selfHeal(originalSelector, mockPage);
    
    expect(result).toEqual('.alt-button');
  });

  test('should return null when no alternative is found', async () => {
    const originalSelector = '#non-existent';
    
    // Make all strategies fail
    mockPage.evaluate.mockResolvedValueOnce([]);
    const elementRepo = new ElementRepository();
    elementRepo.findAlternativeSelector.mockResolvedValueOnce(null);
    
    const result = await selfHeal(originalSelector, mockPage);
    
    expect(result).toBeNull();
  });
});