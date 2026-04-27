const express = require('express');
const logger = require('./middleware/logger');
const { metricsMiddleware, getMetrics } = require('./middleware/metrics');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(logger);
app.use(metricsMiddleware);

// Prometheus Metrics Endpoint
app.get('/metrics', getMetrics);

// Routes
app.use('/health', healthRoutes);
app.use('/api/data', dataRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
