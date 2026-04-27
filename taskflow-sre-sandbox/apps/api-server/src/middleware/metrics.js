const client = require('prom-client');

// Initialize default metrics (CPU, Memory, etc.)
client.collectDefaultMetrics();

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationSeconds = duration[0] + duration[1] / 1e9;
    
    // Use req.route.path if available, otherwise fallback to base path
    const route = req.route ? req.route.path : new URL(req.originalUrl, `http://${req.headers.host}`).pathname;

    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status: res.statusCode
    });

    httpRequestDurationMicroseconds.observe({
      method: req.method,
      route: route,
      status: res.statusCode
    }, durationSeconds);
  });

  next();
};

const getMetrics = async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};

module.exports = {
  metricsMiddleware,
  getMetrics
};
