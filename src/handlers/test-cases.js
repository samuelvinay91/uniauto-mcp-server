const TestCase = require('../models/test-case');
const { logger } = require('../utils/logger');

async function createTestCase(req, res) {
  try {
    const { name, description, steps } = req.body;
    
    if (!name || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Name and steps array are required' });
    }
    
    const testCase = new TestCase({
      name,
      description,
      steps,
      createdAt: new Date()
    });
    
    await testCase.save();
    logger.info(`Test case created: ${testCase._id}`);
    
    res.status(201).json(testCase);
  } catch (error) {
    logger.error(`Create test case error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

async function getAllTestCases(req, res) {
  try {
    const testCases = await TestCase.find().sort({ createdAt: -1 });
    res.json(testCases);
  } catch (error) {
    logger.error(`Get all test cases error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

async function getTestCaseById(req, res) {
  try {
    const testCase = await TestCase.findById(req.params.id);
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.json(testCase);
  } catch (error) {
    logger.error(`Get test case by ID error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

async function updateTestCase(req, res) {
  try {
    const { name, description, steps } = req.body;
    
    if (!name || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Name and steps array are required' });
    }
    
    const testCase = await TestCase.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        steps,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    logger.info(`Test case updated: ${testCase._id}`);
    res.json(testCase);
  } catch (error) {
    logger.error(`Update test case error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

async function deleteTestCase(req, res) {
  try {
    const testCase = await TestCase.findByIdAndDelete(req.params.id);
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    logger.info(`Test case deleted: ${req.params.id}`);
    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    logger.error(`Delete test case error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createTestCase,
  getAllTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase
};