# Self-Healing Capabilities in UniAuto MCP Server

## Overview

The self-healing feature in UniAuto MCP Server enables automation scripts to continue working even when the application's UI changes. This document explains how the self-healing system works and how to leverage it effectively.

## How Self-Healing Works

When a selector fails to locate an element, the self-healing system uses multiple strategies to find an alternative selector:

### 1. Alternative Selector Repository

The system maintains a repository of alternative selectors for each element encountered during automation. These alternatives include:

- ID-based selectors
- Class-based selectors
- Attribute-based selectors (name, data-testid, aria-label)
- XPath selectors

When a primary selector fails, the system tries these alternatives.

### 2. Looser CSS Selector Generation

If no alternative selectors work, the system generates looser versions of the original selector:

- Removing child selectors (from parent > child to just child)
- Using only the main class instead of multiple classes
- Using tag name instead of specific attributes
- Using partial attribute matching

### 3. Visual Element Matching

The system captures screenshots of elements when they're first encountered. When a selector fails, it performs image recognition using OpenCV to find visually similar elements on the page.

### 4. Nearby Text Matching

The system stores the text content near each element. When a selector fails, it searches for elements near the same text content.

## Example Healing Scenarios

### Example 1: Class Name Change

**Original Selector:** `.login-btn-primary`

**When the class changes to:** `.login-button-primary`

**Self-healing process:**
1. Repository check fails
2. Looser selector generation creates `.login-`
3. System finds `.login-button-primary` which contains the looser selector
4. Automation continues with the new selector

### Example 2: Element Structure Change

**Original Selector:** `div.container > button.submit`

**When the structure changes to:** `div.form-wrapper > div.container > button.submit`

**Self-healing process:**
1. Repository check fails
2. Looser selector generation extracts `button.submit`
3. System finds the button despite the parent structure change
4. Automation continues with the new selector

### Example 3: Attribute-Based Recovery

**Original Selector:** `#login-form`

**When the ID is removed but data-testid is added:**

**Self-healing process:**
1. Repository check identifies `[data-testid="login-form"]` as an alternative
2. System tries this alternative and succeeds
3. Automation continues with the new selector

### Example 4: Visual Matching

**When all selector-based approaches fail:**

**Self-healing process:**
1. System retrieves the element's visual snapshot
2. Performs template matching on the current page
3. Locates visually similar element
4. Generates a new selector for the visually matched element
5. Automation continues with the new selector

## Best Practices for Maximizing Self-Healing

### 1. Allow Initial Training

Run your automation scripts in "training mode" first, where the system can capture alternative selectors and visual snapshots.

```javascript
await axios.post('http://localhost:3000/api/execute', {
  command: 'click',
  params: { 
    selector: '#login-button',
    options: { 
      training: true,  // Captures more alternatives and snapshots
      captureVisual: true  // Ensures visual snapshots are taken
    } 
  }
});
```

### 2. Use Descriptive Selectors

Choose selectors that contain semantic information when possible:

- `#login-button` is better than `#btn1`
- `.user-profile-image` is better than `.img-3`

### 3. Add Data Attributes for Testing

Encourage your developers to add `data-testid` attributes to important elements:

```html
<button data-testid="submit-form-button" class="btn btn-primary">Submit</button>
```

These attributes are less likely to change during UI updates.

### 4. Leverage Nearby Text

When possible, interact with elements that have stable text nearby:

```javascript
// Click a button near specific text
await axios.post('http://localhost:3000/api/execute', {
  command: 'click',
  params: { 
    selector: 'button',
    options: { 
      nearText: 'Create Account'  // Helps with text-based self-healing
    } 
  }
});
```

## Monitoring Self-Healing Activity

The system logs all self-healing activities. To monitor which selectors are being healed:

1. Check the logs directory: `logs/combined.log`
2. Look for log entries with "Self-healing" in them
3. Track frequency of healings to identify fragile selectors

## Extending the Self-Healing System

The self-healing system can be extended with custom strategies:

1. Create a new module in `src/core/healing-strategies/`
2. Implement the strategy interface
3. Register your strategy in `src/core/self-healing.js`

Example extension for semantic understanding:

```javascript
// src/core/healing-strategies/semantic-matching.js
async function semanticMatch(brokenSelector, page) {
  // Implementation of semantic matching strategy
  // ...
  return newSelector;
}

module.exports = {
  semanticMatch
};
```

Then register in the self-healing module:

```javascript
const { semanticMatch } = require('./healing-strategies/semantic-matching');

// Add to the strategies in selfHeal function
const semanticSelector = await semanticMatch(brokenSelector, page);
if (semanticSelector) {
  logger.info(`Found semantic match: ${semanticSelector}`);
  return semanticSelector;
}
```

## Conclusion

The self-healing system significantly improves the reliability of your test automation. By capturing multiple representations of each element and using advanced matching techniques, it can adapt to changes in your application's UI without requiring constant maintenance of test scripts.

For questions or to report issues with the self-healing system, please contact the UniAuto support team.