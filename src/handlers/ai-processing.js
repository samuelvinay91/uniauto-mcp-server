const axios = require('axios');
const { logger } = require('../utils/logger');
const { handleAutomationCommand } = require('../core/automation');

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
    // Configure AI service based on modelName
    let apiEndpoint, headers, payload;
    
    if (modelName.toLowerCase().includes('claude')) {
      // Claude API configuration
      apiEndpoint = process.env.CLAUDE_API_ENDPOINT || 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      };
      
      payload = {
        model: process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
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
            ]
          }
        ]
      };
      
      // Add screenshot if available
      if (context.screenshot) {
        // Note: In a real implementation, you'd need to convert the image to base64
        // and add it as an image message. Simplified for this example.
        logger.info('Screenshot would be included in Claude message');
      }
    } else {
      // Generic OpenAI-compatible API configuration
      apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      };
      
      payload = {
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an automation assistant. Provide step-by-step instructions for web automation tasks.'
          },
          {
            role: 'user',
            content: `Task: ${context.task}\nCurrent URL: ${context.url || 'Unknown'}\nAdditional context: ${JSON.stringify(context.additionalContext)}`
          }
        ],
        max_tokens: 2000
      };
    }
    
    // Call AI API
    const response = await axios.post(apiEndpoint, payload, { headers });
    
    // Extract response text based on model type
    let responseText;
    if (modelName.toLowerCase().includes('claude')) {
      responseText = response.data.content[0].text;
    } else {
      responseText = response.data.choices[0].message.content;
    }
    
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

module.exports = {
  aiProcessing
};