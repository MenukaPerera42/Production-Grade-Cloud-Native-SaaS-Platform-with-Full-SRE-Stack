const crypto = require('crypto');

const logger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  // Attach requestId to req for use in controllers/services
  req.requestId = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: requestId,
      level: res.statusCode >= 400 ? 'ERROR' : 'INFO',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      userAgent: req.headers['user-agent']
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
};

module.exports = logger;
