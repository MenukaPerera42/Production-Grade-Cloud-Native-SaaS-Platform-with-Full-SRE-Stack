# TaskFlow SRE Sandbox

TaskFlow is a microservices-based SaaS platform built to serve as a sandbox for DevOps and Site Reliability Engineering (SRE) practices.

## Architecture

The system consists of:
- **Frontend**: A React single-page application (Vite)
- **API Server**: A Node.js (Express) backend that handles HTTP requests and pushes jobs to Redis.
- **Worker**: A Python application that consumes jobs from Redis and updates statuses in PostgreSQL.
- **Redis**: Acts as the message broker / queue.
- **PostgreSQL**: Stores tasks and their statuses.

## SRE Capabilities Included

- **Prometheus Metrics**: The Node.js and Python apps expose `/metrics` endpoints out of the box.
- **Simulated Failures**:
  - `GET /api/slow?delay=5000` - Delays the response by 5 seconds to simulate high latency.
  - `GET /api/leak` - Allocates memory without freeing it, simulating a memory leak leading to OOMKill.

## Local Development (Docker Compose)

Ensure you have Docker installed and running.

```bash
# Start all services
docker-compose up --build -d

# View logs for a specific service
docker-compose logs -f worker
```

Services will be available at:
- **Frontend**: http://localhost:8080
- **API Server**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

## Kubernetes Deployment

To deploy this locally using Minikube or Kind:

```bash
# Start Minikube
minikube start

# Apply the base manifests using Kustomize
kubectl apply -k infra/k8s/base

# Check the status of pods
kubectl get pods
```
