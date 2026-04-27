# SRE Concepts: Incident Management

This document explains how SRE teams handle production outages and how we measure success in recovery.

## 1. What is an Incident?

An **incident** is an unplanned interruption to or reduction in the quality of a service. In our TaskFlow system, an incident is triggered when an SLO (defined in our Prometheus rules) is violated.

## 2. Key Metrics for Incidents

SREs track these time-based metrics to measure the effectiveness of their response:

*   **MTTD (Mean Time to Detect)**: How long it takes from the moment a failure starts until the system triggers an alert. 
    *   *Goal*: Reduce through better observability and sensitive alerting.
*   **MTTR (Mean Time to Recovery)**: How long it takes from the moment an incident is detected until the service is back to its normal state.
    *   *Goal*: Reduce through automation, playbooks, and self-healing systems.

## 3. Incident Lifecycle

A standard production incident follows these phases:

1.  **Detection**: An alert fires in Alertmanager (e.g., `APIHighErrorRate`).
2.  **Triage**: SREs check Grafana and Kibana to see the scope of the impact.
3.  **Mitigation**: Take action to stop the bleeding (e.g., rollback a deployment, restart pods).
4.  **Resolution**: The root cause is fixed, and the system is stable.
5.  **Post-Mortem**: A blameless review of the incident to identify how to prevent it from happening again.

## 4. Error Budgets

An **Error Budget** is the amount of downtime or error rate your service is allowed to have within a certain window (e.g., 99.9% uptime gives you a ~43-minute budget per month). If an incident consumes your entire budget, the SRE team may halt new feature releases to focus entirely on stability.
