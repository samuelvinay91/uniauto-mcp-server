const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  steps: [
    {
      command: {
        type: String,
        required: true,
        enum: ['navigate', 'click', 'type', 'select', 'extract', 'screenshot', 'wait', 'desktop_click', 'desktop_type']
      },
      description: {
        type: String,
        trim: true
      },
      parameters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
      },
      timeout: {
        type: Number,
        default: 10000
      },
      retryOnFailure: {
        type: Boolean,
        default: true
      },
      skipIfFailed: {
        type: Boolean,
        default: false
      }
    }
  ],
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  executionHistory: [
    {
      executedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['success', 'failure', 'partial'],
        required: true
      },
      duration: {
        type: Number // in milliseconds
      },
      stepResults: [
        {
          stepIndex: {
            type: Number,
            required: true
          },
          status: {
            type: String,
            enum: ['success', 'failure', 'skipped'],
            required: true
          },
          originalSelector: {
            type: String
          },
          healedSelector: {
            type: String
          },
          error: {
            type: String
          },
          screenshotPath: {
            type: String
          },
          duration: {
            type: Number // in milliseconds
          }
        }
      ]
    }
  ]
});

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase;