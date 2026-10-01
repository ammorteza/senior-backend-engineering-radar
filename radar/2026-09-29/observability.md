---
title: "Observability"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Observability is the ability to understand a system's internal behavior from the signals it emits. In backend systems those signals usually include metrics, logs and traces, but collecting all three does not automatically make a system observable.

## Why it matters for backend engineers

Production failures rarely reproduce exactly in development. Engineers need to answer concrete questions—Which endpoint is slow? Which dependency dominates latency? Is one tenant causing load? Did the new release increase errors?—without adding new instrumentation after the incident starts.

## How it works

Applications emit structured telemetry with consistent service identity and request context. Metrics aggregate numeric behavior, logs preserve discrete events, and traces connect work across service boundaries. Dashboards and alerts should begin from user-visible symptoms, then support drilling down into causes.

## Key concepts

### Metrics
Counters, gauges and histograms efficiently describe rates, saturation and latency distributions.

### Structured logs
Machine-queryable fields are more useful than free-form strings for high-volume systems.

### Distributed traces
Trace/span IDs connect one request across RPC, messaging and storage boundaries.

### Cardinality
Dimensions such as user ID can create enormous metric series and cost; high-cardinality context often belongs in traces or logs.

### RED and USE
Request rate/errors/duration and resource utilization/saturation/errors are useful starting frameworks, not mandatory dashboards.

## Production example

Order-service p95 rises from 80 ms to 1.5 s while pod CPU and memory remain normal. A trace shows most time in PostgreSQL. Database metrics show CPU saturation and increased connections; query telemetry identifies the changed endpoint. Observability narrows the fault domain before engineers start changing application replicas blindly.

## Trade-offs

More telemetry improves diagnostic power but costs CPU, network, storage and human attention. Sampling reduces trace cost but can hide rare failures. Logging every payload can create privacy and security problems.

## Failure modes / pitfalls

Dashboards without actionable questions, alerts on CPU rather than user impact, missing correlation IDs, unbounded label cardinality, secrets in logs and instrumentation that disappears on error paths are recurring problems.

## When to use it

Every production backend needs a baseline of metrics, structured logs and enough tracing/context to follow critical flows. Depth should match system criticality and complexity.

## When not to use it

Do not collect telemetry merely because a tool supports it. A signal without an operational question, owner or retention rationale is mostly cost.

## What a Senior Engineer should know

A Senior Engineer should instrument critical paths, choose useful metrics, preserve trace context, control cardinality and debug from symptoms through dependencies using telemetry rather than guesses.

## What a Staff Engineer should understand

A Staff Engineer should define organization-wide telemetry conventions, connect observability to SLOs and incident response, manage cost/privacy, and make cross-service diagnosis possible without forcing every team into identical dashboards.