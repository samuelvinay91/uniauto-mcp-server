const { processWithAI, generateAutomationSteps } = require('../../src/handlers/ai-processing');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock Axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      choices: [{
        message: {
          content: JSON.stringify([
            { command: 'navigate', params: { url: 'https://example.com' } },
            { command: 'click', params: { selector: '#login-button' } },
            { command: 'type', params: { selector: '#username', text: 'testuser' } }
          ])
        }
      }]
    }
  })
}));

describe('AI Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should process task with AI and return automation steps', async () => {
    const task = 'Login to the website with username testuser';
    const url = 'https://example.com';
    const model = 'claude-3-sonnet';
    
    const result = await processWithAI(task, url, model);
    
    // Should return the generated steps
    expect(result).toHaveLength(3);
    expect(result[0].command).toBe('navigate');
    expect(result[1].command).toBe('click');
    expect(result[2].command).toBe('type');
  });
  
  test('should generate automation steps with default model if none specified', async () => {
    const task = 'Click the signup button';
    const url = 'https://example.com';
    
    await generateAutomationSteps(task, url);
    
    // Should use the default model
    const axios = require('axios');
    expect(axios.post).toHaveBeenCalled();
    expect(axios.post.mock.calls[0][1]).toHaveProperty('model');
  });
  
  test('should handle AI response parsing errors', async () => {
    const task = 'Click the signup button';
    const axios = require('axios');
    
    // Mock invalid response
    axios.post.mockResolvedValueOnce({
      data: {
        choices: [{
          message: {
            content: 'Invalid JSON'
          }
        }]
      }
    });
    
    // Should throw an error
    await expect(processWithAI(task)).rejects.toThrow();
  });
});