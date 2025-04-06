/**
 * Test Claude Integration directly using the Anthropic SDK
 */
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function testClaude() {
  try {
    console.log('Testing Claude integration with Anthropic SDK...');
    
    // Create Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    
    // Log the API key (but only the first and last few characters)
    const apiKey = process.env.CLAUDE_API_KEY || 'not set';
    console.log(`API Key: ${apiKey.substring(0, 3)}...${apiKey.slice(-3)}`);
    
    // Log the model being used
    const model = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20240229';
    console.log(`Using model: ${model}`);
    
    // Create a simple message
    console.log('Sending request to Claude...');
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: 'Hello Claude, can you provide 3 quick steps for how you might automate filling out a simple web form?'
        }
      ]
    });
    
    // Output the response
    console.log('\nClaude Response:');
    console.log('----------------');
    console.log(response.content[0].text);
    console.log('----------------');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Claude integration:');
    console.error(error.message);
    
    if (error.status) {
      console.error(`Status: ${error.status}`);
    }
    
    if (error.response) {
      console.error(`Response: ${JSON.stringify(error.response)}`);
    }
  }
}

// Run the test
testClaude().catch(console.error);