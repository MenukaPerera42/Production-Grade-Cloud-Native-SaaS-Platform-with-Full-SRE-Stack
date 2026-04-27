# API Server (SRE-Focused)

This is a Node.js (Express) backend service structured with SRE best practices.

## Features

- **Health Checks**: `/health` endpoint to verify service uptime.
- **Metrics**: `/metrics` exposes Prometheus-compatible metrics (request duration, counts, etc.).
- **Structured Logging**: Request logs with duration and status codes.
- **Graceful Error Handling**: Standardized JSON error responses.
- **Simulated Real-World Behavior**:
  - Artificial delay (100-500ms) on API routes.
  - Failure mode via `?fail=true` query parameter.

## Folder Structure

- `src/config/`: Environment variable configuration
- `src/middleware/`: Custom middlewares (logging, metrics, error handling)
- `src/controllers/`: Route handlers and business logic orchestration
- `src/services/`: Core business logic and data access
- `src/routes/`: Express router definitions

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   Or for development mode:
   ```bash
   npm run dev
   ```

3. Test endpoints:
   - Health: `curl http://localhost:3000/health`
   - Metrics: `curl http://localhost:3000/metrics`
   - Get Data: `curl http://localhost:3000/api/data`
   - Create Data: `curl -X POST http://localhost:3000/api/data -H "Content-Type: application/json" -d '{"name": "New Task"}'`
   - Trigger Failure: `curl http://localhost:3000/api/data?fail=true`
