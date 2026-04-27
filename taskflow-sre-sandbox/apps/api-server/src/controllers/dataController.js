const dataService = require('../services/dataService');

// Helper to simulate artificial delay or manual latency injection
const simulateDelay = (req, min = 100, max = 500) => {
  let delay;
  if (req.query.delay) {
    delay = parseInt(req.query.delay);
  } else {
    delay = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Helper to simulate occasional failures based on query params
const simulateFailure = (req) => {
  if (req.query.fail === 'true') {
    const error = new Error('Simulated internal server error');
    error.statusCode = 500;
    throw error;
  }
};

const getData = async (req, res, next) => {
  try {
    await simulateDelay(req);
    simulateFailure(req);

    const data = await dataService.getAllData();
    
    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

const createData = async (req, res, next) => {
  try {
    await simulateDelay(req, 200, 600); // POST might be slightly slower
    simulateFailure(req);

    const newItem = await dataService.addData(req.body);

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getData,
  createData
};
