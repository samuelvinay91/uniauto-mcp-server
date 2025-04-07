const Anthropic = require('@anthropic-ai/sdk');
const { logger } = require('../utils/logger');
const { handleAutomationCommand } = require('../core/mock-automation');
const { generateTests, generateFullTestSuite } = require('../core/test-generator');

async function aiProcessing(req, res) {
  try {
    const { task, url, model, context } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task description is required' });
    }
    
    logger.info(`AI processing task: ${task.substring(0, 100)}...`);
    
    // Get screenshot of current page if available
    let screenshot;
    try {
      screenshot = await handleAutomationCommand('screenshot', {
        fileName: `ai-processing-${Date.now()}.png`
      });
    } catch (err) {
      logger.warn(`Failed to take screenshot: ${err.message}`);
    }
    
    // Prepare context for AI model
    const aiContext = {
      task,
      url: url || (await getCurrentPageUrl()),
      screenshot: screenshot ? screenshot.path : null,
      additionalContext: context || {}
    };
    
    // Process with AI model (Claude or other)
    const aiResponse = await processWithAI(aiContext, model);
    
    // Extract actionable steps from AI response
    const steps = parseAIResponseToSteps(aiResponse);
    
    res.json({
      task,
      steps,
      rawResponse: aiResponse
    });
  } catch (error) {
    logger.error(`AI processing error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

async function getCurrentPageUrl() {
  try {
    const result = await handleAutomationCommand('extract', {
      selector: 'html',
      attribute: 'baseURI'
    });
    return result.data;
  } catch (error) {
    logger.error(`Failed to get current URL: ${error.message}`);
    return null;
  }
}

async function processWithAI(context, modelName = 'claude') {
  try {
    // Create Anthropic client instance
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    
    // Prepare user message content
    let content = [
      {
        type: 'text',
        text: `You are an automation assistant. Your task is to help automate the following:

${context.task}

Current URL: ${context.url || 'Unknown'}

Additional context: ${JSON.stringify(context.additionalContext)}

Please provide step-by-step instructions for automating this task. For each step, include:
1. The command (navigate, click, type, etc.)
2. The parameters (selector, text, etc.)
3. A brief description of what the step does`
      }
    ];
    
    // Add screenshot if available
    if (context.screenshot) {
      try {
        const fs = require('fs');
        const path = require('path');
        const screenshotPath = path.resolve(context.screenshot);
        
        if (fs.existsSync(screenshotPath)) {
          const imageData = fs.readFileSync(screenshotPath);
          const base64Image = imageData.toString('base64');
          
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image
            }
          });
          
          logger.info('Screenshot added to Claude message');
        }
      } catch (err) {
        logger.warn(`Could not add screenshot to message: ${err.message}`);
      }
    }
    
    // Determine which model to use
    const model = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240229';
    logger.info(`Using AI model: ${model}`);
    
    // Create the message
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    });
    
    // Extract the response text
    const responseText = response.content[0].text;
    return responseText;
  } catch (error) {
    logger.error(`AI API error: ${error.message}`);
    throw new Error(`Failed to process with AI: ${error.message}`);
  }
}

function parseAIResponseToSteps(response) {
  try {
    // Basic parsing of AI response to extract actionable steps
    // In a real implementation, this would be more robust
    const lines = response.split('\n');
    const steps = [];
    
    let currentStep = null;
    
    for (const line of lines) {
      // Try to identify step markers like "1. " or "Step 1: "
      const stepMatch = line.match(/^\s*(\d+)\.\s+|^\s*Step\s+(\d+)\s*:\s+/i);
      
      if (stepMatch) {
        // Save previous step if exists
        if (currentStep) {
          steps.push(currentStep);
        }
        
        // Start new step
        currentStep = {
          description: line.replace(stepMatch[0], '').trim(),
          command: null,
          parameters: {}
        };
        
        // Try to extract command from description
        const commandMatches = [
          { regex: /navigate\s+to/i, command: 'navigate' },
          { regex: /click(?:\s+on)?/i, command: 'click' },
          { regex: /type(?:\s+in)?/i, command: 'type' },
          { regex: /select(?:\s+option)?/i, command: 'select' },
          { regex: /extract/i, command: 'extract' },
          { regex: /screenshot/i, command: 'screenshot' },
          { regex: /wait/i, command: 'wait' }
        ];
        
        for (const { regex, command } of commandMatches) {
          if (regex.test(currentStep.description)) {
            currentStep.command = command;
            break;
          }
        }
      } else if (currentStep) {
        // Try to extract parameters from the line
        const selectorMatch = line.match(/selector\s*:\s*['"]?([^'"]+)['"]?/i);
        const urlMatch = line.match(/(?:url|link)\s*:\s*['"]?([^'"]+)['"]?/i);
        const textMatch = line.match(/text\s*:\s*['"]?([^'"]+)['"]?/i);
        
        if (selectorMatch) {
          currentStep.parameters.selector = selectorMatch[1].trim();
        }
        
        if (urlMatch) {
          currentStep.parameters.url = urlMatch[1].trim();
        }
        
        if (textMatch) {
          currentStep.parameters.text = textMatch[1].trim();
        }
        
        // Time parameter for wait command
        const timeMatch = line.match(/(\d+)\s*(?:ms|milliseconds?|seconds?)/i);
        if (timeMatch && currentStep.command === 'wait') {
          const time = parseInt(timeMatch[1]);
          currentStep.parameters.milliseconds = timeMatch[0].includes('second') ? time * 1000 : time;
        }
      }
    }
    
    // Add the last step
    if (currentStep) {
      steps.push(currentStep);
    }
    
    return steps;
  } catch (error) {
    logger.error(`Parse AI response error: ${error.message}`);
    return [];
  }
}

/**
 * Process test generation with AI
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function aiTestGeneration(req, res) {
  try {
    const { url, description, framework, style, outputFormat } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    logger.info(`AI test generation for URL: ${url}`);
    
    // Get screenshot of the page if possible
    let screenshot = null;
    try {
      // Navigate to the URL first
      await handleAutomationCommand('navigate', { url });
      
      // Take a screenshot
      const screenshotResult = await handleAutomationCommand('screenshot', {
        fileName: `test-generation-${Date.now()}.png`
      });
      
      screenshot = screenshotResult.path;
    } catch (err) {
      logger.warn(`Failed to navigate or take screenshot: ${err.message}`);
      // Continue without screenshot
    }
    
    // Generate tests using the generator module
    const result = await generateTests({
      url,
      framework: framework || 'playwright',
      style: style || 'bdd',
      format: outputFormat || 'javascript',
      prompt: description || 'Generate comprehensive tests for this application',
      additionalContext: {
        hasScreenshot: !!screenshot,
        generatedWith: 'AI-assisted test generation'
      }
    });
    
    res.json({
      url,
      testCode: result.testCode,
      framework,
      style,
      generatedWith: 'AI-assisted test generation'
    });
  } catch (error) {
    logger.error(`AI test generation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  aiProcessing,
  aiTestGeneration
};