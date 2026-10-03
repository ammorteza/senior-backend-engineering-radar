---
title: "Observability"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Observability is the ability to answer questions about a running system from the signals it produces without first adding bespoke instrumentation for each incident. Metrics, logs, traces, profiles, and events are common signals; collecting them does not automatically make a system observable.

Useful observability starts from questions and relationships: which users are affected, where time is spent, which dependency is saturated, what changed, and whether a failure is localized or systemic.

## Why it matters for backend engineers

Production failures are contextual. A query is slow only for a large tenant, one retry path leaks connections, or one new release changes traffic shape. Average CPU graphs rarely identify these mechanisms.

Good telemetry shortens the path from symptom to hypothesis. It also gives engineers evidence during rollout, capacity planning, and incident recovery rather than relying on intuition.

## How it works

Instrument critical boundaries with a consistent service/resource identity and request/work identity.

**Metrics** summarize numeric behavior efficiently: rates, errors, distributions, queue age, pool utilization, and saturation. Their label dimensions must remain bounded.

**Logs** record discrete events and structured fields useful for search and explanation. They should include stable identifiers and error context without copying secrets or unnecessary personal data.

**Traces** represent one operation as related spans across services and asynchronous boundaries. They show where latency and errors occurred for individual sampled operations.

These signals should connect. A dashboard detects elevated error ratio; a link filters traces for the affected route/version; a trace identifies a slow database call; structured logs explain the query error. Deployment metadata tells engineers whether the symptom aligns with a release.

Instrumentation also needs failure behavior. Exporters use bounded buffers, sampling, and drop metrics so telemetry backend failure does not block the application.

## Key concepts

**RED.** Rate, errors, and duration are a useful starting view for request-driven services.

**USE.** Utilization, saturation, and errors help reason about resources such as CPU, memory, pools, disks, and queues.

**Cardinality.** A metric label such as user ID can create one series per user and overwhelm storage. High-cardinality investigation usually belongs in traces/logs, not every metric.

**Correlation.** Trace IDs, request IDs, job IDs, deployment versions, and service identity connect signals. Correlation identifiers are not authentication claims.

**Sampling.** Tracing every request can be expensive. Head and tail sampling make different trade-offs; sampled data cannot prove an unsampled event never occurred.

**Telemetry quality.** Missing instrumentation on errors, wrong units, and inconsistent names are correctness defects in the observability system.

## Production example

An order API's p95 latency rises from 80 ms to 1.5 seconds. Pod CPU and memory are normal, so scaling application replicas would be a guess.

The service dashboard shows database pool wait increasing. Traces for the slow route show most time in one PostgreSQL query. Database metrics show CPU saturation and a connection increase after a feature rollout. Query telemetry reveals that the new endpoint scans far more rows for large hubs.

The team rolls back the feature. They verify recovery in user-facing latency, pool wait, database CPU, and query duration. The incident timeline links the first symptom to the deployment annotation.

Afterward they add a tenant/hub-size dimension where it is bounded enough for metrics, keep raw tenant IDs in restricted traces/logs where necessary, and add a query regression fixture. Observability did not “solve” the query; it narrowed the fault domain and supplied evidence for a safe mitigation.

## Trade-offs

More telemetry increases diagnostic power and cost. High-resolution metrics, long log retention, and full traces consume CPU, network, and storage.

Sampling lowers cost but can miss rare failures. Logging every request body maximizes detail while creating privacy and security risk. Collect the least data that reliably answers operational questions.

## Failure modes / pitfalls

Dashboards containing every available metric create noise rather than understanding. Alerts on infrastructure symptoms without user impact generate fatigue.

Unbounded metric labels, secrets in logs, missing trace propagation, inconsistent service names, and telemetry that disappears exactly on error paths are common failures.

Another pitfall is relying on the observability backend as a critical dependency for request success. Export paths must fail safely and visibly.

## When to use it

Every production backend needs baseline telemetry for user impact, dependencies, resource saturation, and changes. Critical distributed workflows need enough context to trace one operation across boundaries.

Add instrumentation to answer concrete operational questions and validate it under failure.

## When not to use it

Do not collect a signal solely because a tool exposes it. Data with no owner, diagnostic use, security classification, or retention rationale is mostly cost.

Do not treat a dashboard as proof of reliability if the underlying signals do not represent the customer journey.

## What a Senior Engineer should know

A Senior Engineer should instrument critical paths, choose useful metrics, write structured logs, preserve trace context, control cardinality, and debug from symptom toward mechanism.

They should inspect the actual emitted telemetry and verify that errors, cancellations, retries, and async work remain observable.

## What a Staff Engineer should understand

A Staff Engineer should establish shared telemetry conventions, service identity, access controls, retention, and cost budgets while allowing teams to expose domain-specific signals.

They should connect observability to SLOs, incident response, rollout, and capacity planning so cross-service diagnosis works without forcing every team into identical dashboards.

Further reading: [OpenTelemetry observability primer](https://opentelemetry.io/docs/concepts/observability-primer/), [Google SRE: Monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/).
