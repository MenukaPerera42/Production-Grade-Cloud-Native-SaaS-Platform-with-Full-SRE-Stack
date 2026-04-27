const getHealth = (req, res) => {
  // In a real scenario, you might check DB/Redis connectivity here
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

module.exports = {
  getHealth
};
