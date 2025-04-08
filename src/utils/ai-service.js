/**
 * AI Service Utility
 * 
 * Provides a unified interface for AI model interactions including:
 * - Claude API
 * - Generic AI APIs (OpenAI compatible)
 * - Centralized error handling and retries
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
const configManager = require('./config');

class AIService {
  constructor() {
    this.initAnthropicClient();
  }
  
  /**
   * Initialize the Anthropic API client
   */
  initAnthropicClient() {
    const apiKey = configManager.get('claudeApiKey');
    
    if (!apiKey) {
      logger.warn('Claude API key not found, some AI features may not work properly');
      this.anthropicClient = null;
      return;
    }
    
    try {
      this.anthropicClient = new Anthropic({ apiKey });
      logger.info('Claude API client initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Claude API client: ${error.message}`);
      this.anthropicClient = null;
    }
  }
  
  /**
   * Process a request with Claude AI
   * 
   * @param {Object} options - Processing options
   * @param {string} options.prompt - The text prompt to send to Claude
   * @param {Array<Object>} options.images - Optional array of image objects to include
   * @param {string} options.model - The Claude model to use (defaults to config value)
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @returns {Promise<string>} The generated text response
   */
  async processWithClaude(options) {
    const { prompt, images = [], model = null, maxTokens = 4000 } = options;
    
    if (!this.anthropicClient) {
      this.initAnthropicClient();
      
      if (!this.anthropicClient) {
        throw new Error('Claude API client is not available');
      }
    }
    
    try {
      // Prepare message content array
      const content = [
        {
          type: 'text',
          text: prompt
        }
      ];
      
      // Add images if provided
      for (const image of images) {
        if (image.path) {
          try {
            const imagePath = path.resolve(image.path);
            if (fs.existsSync(imagePath)) {
              const imageData = fs.readFileSync(imagePath);
              const base64Image = imageData.toString('base64');
              
              content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: getMediaType(imagePath),
                  data: base64Image
                }
              });
              
              logger.info(`Image added to Claude message: ${image.path}`);
            }
          } catch (err) {
            logger.warn(`Could not add image to message: ${err.message}`);
          }
        } else if (image.base64) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: image.mediaType || 'image/png',
              data: image.base64
            }
          });
          
          logger.info('Base64 image added to Claude message');
        }
      }
      
      // Use model from config if not specified
      const selectedModel = model || configManager.get('claudeModel');
      logger.info(`Using Claude model: ${selectedModel}`);
      
      // Send the request to Claude
      const response = await this.anthropicClient.messages.create({
        model: selectedModel,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: content
          }
        ]
      });
      
      // Extract and return the response text
      const responseText = response.content[0].text;
      return responseText;
    } catch (error) {
      logger.error(`Claude API error: ${error.message}`);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }
  
  /**
   * Extract code blocks from an AI response
   * 
   * @param {string} response - The AI response text
   * @returns {string} Extracted code
   */
  extractCodeFromResponse(response) {
    // Look for code blocks in markdown format
    const codeBlockRegex = /```(?:javascript|typescript|js|ts|python|java|csharp|ruby)?\s*([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      // Join all code blocks with newlines
      return matches.map(match => match[1]).join('\n\n');
    } else {
      // If no code blocks found, try to extract code without markdown markers
      logger.warn('No code blocks found in response, returning raw text');
      return response;
    }
  }
}

/**
 * Helper to determine media type from file path
 * 
 * @param {string} filePath - Path to the image file
 * @returns {string} Media type (MIME type)
 */
function getMediaType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/png'; // Default to PNG
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;