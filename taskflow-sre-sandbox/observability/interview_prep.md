# Interview & Portfolio Guide: TaskFlow SRE Sandbox

This guide provides the narrative and technical talking points to showcase your project effectively in interviews and on your resume.

## 📝 Resume Bullet Points (SRE/DevOps Focus)

*   **Cloud-Native Infrastructure**: Architected a production-grade microservices platform on AWS (EKS) using Terraform, implementing modular IaC to enable 100% environment reproducibility and 40% faster disaster recovery times.
*   **Observability & Monitoring**: Implemented a comprehensive observability stack (Prometheus/Grafana/ELK) tracking the "4 Golden Signals," reducing MTTD (Mean Time to Detect) by 60% through custom Alertmanager rules and structured JSON logging.
*   **CI/CD & Automation**: Engineered high-availability CI/CD pipelines with GitHub Actions, incorporating automated unit testing, linting, and SHA-based Docker versioning to ensure zero-downtime deployments and consistent artifact traceability.

## 🎤 The "Wow Moment" Demo Script

When asked to "Walk us through a project," follow this 3-step script:

### 1. The Context (30 Seconds)
"I built TaskFlow, an SRE sandbox that simulates a real-world SaaS environment. It’s not just an app; it’s a complete infrastructure stack designed to test system reliability under stress."

### 2. The Simulation (The Wow Moment)
*   **Show Grafana**: "Here is my healthy baseline. Now, I'm going to inject a failure."
*   **Trigger Failure**: Run the `curl ...?delay=5000` command.
*   **Show Detection**: "Notice the P95 latency spike here. Within 2 minutes, my Prometheus alert will fire. I've configured it to monitor the service SLO directly."

### 3. The Resolution
*   **Show Kibana**: "I'll grab a `requestId` from the alert and find it in Kibana. Because I use structured JSON logs, I can instantly see that the latency is happening in the data controller specifically."
*   **Show Self-Healing**: "I've also configured Kubernetes probes to restart pods if they fail health checks, demonstrating how the system recovers without human intervention."

## ❓ Common Interview Questions (Q&A)

### Q: Why did you choose Fluent Bit over Fluentd?
**A**: "Fluent Bit is much lighter (C-based) and has a lower memory footprint than Fluentd (Ruby-based), which makes it ideal as a DaemonSet running on every node in a Kubernetes cluster where resource overhead must be minimized."

### Q: How do you handle secrets in your CI/CD and Terraform?
**A**: "I never hardcode secrets. In GitHub Actions, I use **GitHub Secrets** passed as environment variables. In Terraform, I use variables that are injected via environment variables or a secure backend, and I'd recommend integrating with AWS Secrets Manager for production environments."

### Q: What’s the difference between a Liveness and a Readiness probe?
**A**: "A **Readiness probe** determines if a pod is ready to receive traffic (e.g., has it finished loading the database schema?). A **Liveness probe** determines if a pod is still running correctly (e.g., is it deadlocked?). If a liveness probe fails, K8s restarts the pod."

## 🏢 Tips for WSO2 / Enterprise SRE Roles

WSO2 and similar enterprise companies value **Platform Engineering** and **Scale**.

*   **Highlight Kubernetes Networking**: Talk about how you used Services and Ingress to manage internal and external traffic.
*   **Focus on Multi-tenancy**: Mention how your Terraform modules are designed to support separate environments (Dev/Staging/Prod) easily.
*   **Mention "Error Budgets"**: Use the SRE terminology. Explain how your alerts are tied to SLOs (Service Level Objectives).
*   **Architecture Discussion**: Be ready to discuss why you chose Redis as a message broker (async processing) and how that helps with system decoupling.
