# SRE Concepts: Centralized Logging

This document explains the role of logging in the TaskFlow platform and how it differs from monitoring.

## 1. Logs vs. Metrics

While both are essential for observability, they serve different purposes:

| Feature | Metrics (Prometheus) | Logs (ELK Stack) |
| :--- | :--- | :--- |
| **Data Format** | Numerical (time-series). | Text/Structured JSON (events). |
| **Purpose** | Monitoring health and trends. | Debugging specific incidents. |
| **Cardinality** | Low (pre-defined labels). | High (unique request IDs, IPs). |
| **Cost** | Cheap to store/query. | Expensive to store (high volume). |
| **Question** | "Is it slow?" | "Why is it slow for this specific user?" |

## 2. Debugging with Structured Logs

In our updated `api-server`, we use **JSON logging** with a `requestId`. This enables "Distributed Tracing Light":

1.  **Search by Request ID**: When a user reports an error, you can grab the `requestId` from their headers (or your logs) and search for it in Kibana. This shows every log entry across all services related to that specific event.
2.  **Filter by Status**: Instantly see all `level: ERROR` logs across your entire cluster.
3.  **Real-time Tail**: Kibana's "Discover" tab allows you to stream logs in real-time as they arrive in Elasticsearch.

## 3. The Logging Flow

The system I've implemented follows this flow:
1.  **App**: Generates a JSON log entry to `stdout`.
2.  **Node**: Kubernetes (Docker/Containerd) captures `stdout` and writes it to a file on the host.
3.  **Fluent Bit**: A DaemonSet running on every node "tails" these files, parses the JSON, adds Kubernetes metadata (pod name, namespace), and ships it to Elasticsearch.
4.  **Elasticsearch**: Indexes the data so it's searchable.
5.  **Kibana**: Provides a web UI to query Elasticsearch.
