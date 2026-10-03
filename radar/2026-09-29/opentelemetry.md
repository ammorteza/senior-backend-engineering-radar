---
title: "OpenTelemetry"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

OpenTelemetry (OTel) is a vendor-neutral observability framework providing APIs, SDKs, semantic conventions, context propagation, and the OpenTelemetry Collector for traces, metrics, and logs.

It separates application instrumentation from many backend-specific exporters. That does not make telemetry automatically portable in every detail: semantic conventions evolve, backend capabilities differ, and sampling/aggregation choices can change what data is available.

## Why it matters for backend engineers

Without shared instrumentation conventions, every service invents different names for the same operation and cross-service debugging becomes difficult. OTel provides a common vocabulary and propagation model across languages.

The framework also sits inside production processes. Misconfigured exporters, unbounded queues, duplicate instrumentation, or high-cardinality attributes can increase application memory and telemetry cost. Instrumentation must fail safely when the observability backend is unavailable.

## How it works

Instrumentation creates telemetry through OTel APIs and SDKs. A **Resource** describes the entity producing telemetry, such as service name, version, instance, Kubernetes workload, or cloud resource under the applicable semantic conventions.

For tracing, instrumentation creates spans and records attributes, events, status, and relationships. Context propagators inject/extract trace context across HTTP, RPC, or messaging boundaries.

For metrics, instruments such as counters and histograms produce measurements that SDK readers aggregate and export according to configuration.

Logs can carry trace/span correlation and structured attributes through OTel's logging data model where supported.

The **OpenTelemetry Collector** receives telemetry, processes it, and exports it to one or more backends. Receivers, processors, exporters, and connectors form pipelines. Processors can batch, sample, filter, redact, enrich, or transform data.

SDK exporters should use bounded queues and timeouts. If the backend is unavailable, telemetry may be dropped after bounded retries rather than consuming application memory indefinitely.

## Key concepts

**Resource attributes.** Identify the service/workload producing data. Stable `service.name` and version/environment identity make cross-service analysis possible.

**Semantic conventions.** Standard names and meanings for HTTP, database, messaging, RPC, cloud, and other telemetry. Their stability status can differ by convention; upgrades need review.

**Instrumentation library versus manual spans.** Auto-instrumentation covers common frameworks; manual instrumentation adds domain operations. Duplicating both around the same call can produce confusing nested spans.

**Sampling.** Head sampling decides near span creation. Tail sampling in a collector can retain traces based on later information such as errors or latency, at greater infrastructure cost.

**Collector pipeline.** Central processing helps standardize redaction and routing, but collectors need their own capacity, scaling, and failure monitoring.

## Production example

A Go API handles HTTP requests and publishes jobs to a queue. Auto-instrumentation already creates inbound HTTP spans and outbound database spans. The team adds one manual span around the domain operation rather than wrapping every library call again.

The API attaches resource attributes such as service name and version. Trace context is injected into message metadata. A worker creates a consumer span and, for delayed processing, uses the appropriate messaging relationship so queue wait and work time remain distinguishable.

A collector receives OTLP telemetry. A processor removes sensitive request attributes, batching reduces export overhead, and traffic is routed to the approved tracing/metrics backends.

The team deliberately blocks the tracing backend. Collector and SDK queues reach bounded limits; dropped telemetry is reported, but API request latency remains within objective. This verifies that observability failure does not become an application outage.

During a semantic-convention upgrade, the team checks current stability guidance and dashboard queries before switching attribute names. It does not assume every convention family changes in lockstep.

## Trade-offs

OTel reduces proprietary instrumentation and enables shared conventions. It introduces SDK/collector configuration, version management, and another operational pipeline.

Auto-instrumentation is quick to adopt but can produce too much low-value detail. Manual instrumentation gives domain context but requires consistent engineering effort.

Central collectors simplify policy and backend routing while adding a shared dependency for telemetry delivery.

## Failure modes / pitfalls

Double instrumentation creates duplicate spans and distorted latency. Missing propagation produces disconnected traces. High-cardinality metric attributes can overwhelm storage.

Sensitive HTTP headers, SQL values, or message payloads can leak through attributes. Sampling reduces cost but is not a privacy mechanism.

Unbounded exporter queues or synchronous export on request paths can turn telemetry outages into application memory or latency incidents.

## When to use it

Use OTel when multiple services/languages need consistent telemetry and the organization wants flexibility in observability backends.

Adopt the smallest useful set first—service identity, critical traces/metrics, and bounded export—then expand based on diagnostic questions.

## When not to use it

Do not build a complicated multi-tier collector topology before understanding telemetry volume and failure requirements.

A small application already using one maintained instrumentation stack may not benefit immediately from a migration solely for vendor neutrality.

## What a Senior Engineer should know

A Senior Engineer should configure resources, propagation, semantic attributes, sampling, batching, and bounded exporters. They should inspect actual emitted telemetry rather than assume an instrumentation library produces the intended data.

They should understand where manual spans add domain value and how telemetry behaves when collectors/backends fail.

## What a Staff Engineer should understand

A Staff Engineer should own semantic-convention upgrades, collector topology, privacy/redaction, sampling strategy, and telemetry capacity across services.

They should make instrumentation interoperable without requiring every team to understand backend-specific export details, while preserving escape hatches for domain-specific signals.

Further reading: [OpenTelemetry concepts](https://opentelemetry.io/docs/concepts/), [Semantic conventions](https://opentelemetry.io/docs/specs/semconv/).
