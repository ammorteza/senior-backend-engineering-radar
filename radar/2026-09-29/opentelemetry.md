---
title: "OpenTelemetry"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

OpenTelemetry defines vendor-neutral APIs, SDKs and collection components for traces, metrics and logs. It separates application instrumentation from many backend-specific export choices.

## Why it matters for backend engineers

Backend teams need consistent request context and telemetry names across languages. Otherwise cross-service investigation depends on hand-built adapters and inconsistent tags.

## How it works

Instrumentation creates spans and measurements, SDKs batch and export them, and collectors receive, process and route telemetry. Context propagation connects operations across boundaries. Sampling can happen near creation or later in a collector pipeline; the choices have different information and resource costs.

## Key concepts

Resources identify a service instance; span attributes describe an operation. Semantic conventions provide shared meanings and evolve over time. Collector processors may redact, batch or filter data. Export queues and retries need limits so telemetry failures do not exhaust application memory.

## Production example

A Go API instruments inbound HTTP and outbound database calls. Trace context reaches a worker through message metadata, with a link where the asynchronous relationship is appropriate. A collector removes sensitive attributes and exports to a tracing backend. During exporter failure, bounded queues drop telemetry visibly instead of blocking application requests.

## Trade-offs

Portability and shared conventions improve consistency. SDK and collector configuration add overhead, compatibility decisions and another operational pipeline.

## Failure modes / pitfalls

Double instrumentation, missing propagation, high-cardinality metrics and sensitive payload attributes are common mistakes. Sampling does not automatically make data safe.

## When to use it

Use OpenTelemetry when consistent instrumentation and backend flexibility justify a common telemetry pipeline.

## When not to use it

Do not deploy a complex collector topology before understanding traffic volume and failure behavior.

## What a Senior Engineer should know

Configure resources, propagation, sampling and bounded exporters; inspect emitted telemetry.

## What a Staff Engineer should understand

Own convention upgrades, privacy controls and pipeline capacity across services.

Further reading: [OpenTelemetry concepts](https://opentelemetry.io/docs/concepts/).
