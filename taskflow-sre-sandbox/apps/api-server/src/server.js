const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`[INFO] Server is running on port ${config.port}`);
  console.log(`[INFO] Health check: http://localhost:${config.port}/health`);
  console.log(`[INFO] Metrics: http://localhost:${config.port}/metrics`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[INFO] SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('[INFO] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[INFO] SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('[INFO] HTTP server closed');
    process.exit(0);
  });
});
