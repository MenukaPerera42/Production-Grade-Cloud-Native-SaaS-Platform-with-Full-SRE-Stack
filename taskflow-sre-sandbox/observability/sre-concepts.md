# SRE Concepts: Observability & Monitoring

This document provides a high-level explanation of core Site Reliability Engineering (SRE) concepts for the TaskFlow platform.

## 1. Monitoring vs. Observability

*   **Monitoring**: The act of observing the state of a system over time. It answers the question: **"Is the system healthy?"** (e.g., CPU is at 80%, Request Rate is 100 RPS).
*   **Observability**: A property of the system that describes how well you can understand its internal state from its external outputs (metrics, logs, traces). It answers the question: **"Why is the system unhealthy?"** (e.g., "Why is latency high for the `/data` endpoint specifically when the database is under load?").

> [!TIP]
> Monitoring is about knowing *when* something is wrong; Observability is about having enough data to figure out *what* and *where* it is wrong.

## 2. SLIs, SLOs, and SLAs

These three acronyms are the foundation of SRE-driven decision making.

| Concept | Definition | Analogy | Example |
| :--- | :--- | :--- | :--- |
| **SLI** (Service Level Indicator) | A quantitative measure of some aspect of the level of service provided. | The speedometer in your car. | HTTP 200 response rate (%). |
| **SLO** (Service Level Objective) | A target value or range of values for a service level that is measured by an SLI. | "I want to stay under 65 mph." | 99.9% of requests should return HTTP 200. |
| **SLA** (Service Level Agreement) | A legal contract with your users that defines the consequences if an SLO is missed. | "If I go over 65 mph and get caught, I pay a fine." | "If uptime is below 99%, we refund 10% of your bill." |

## 3. The 4 Golden Signals

Google's SRE book defines four key metrics to monitor for any user-facing system:

1.  **Latency**: The time it takes to service a request.
2.  **Traffic**: The demand being placed on your system (e.g., HTTP requests per second).
3.  **Errors**: The rate of requests that fail (e.g., 500 internal server errors).
4.  **Saturation**: How "full" your service is (e.g., CPU, Memory, or queue depth).

These are all captured in the **TaskFlow API Performance** dashboard I've created.
