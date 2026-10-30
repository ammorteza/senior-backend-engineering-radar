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

For policy-driven transformations, Collector components such as the transform and filter processors evaluate OpenTelemetry Transformation Language (OTTL) statements against incoming records. Each statement uses a function, a path into a particular signal (for example, `span.attributes`), and optionally a `where` condition. Statements run in configuration order; a filtering rule drops matching records rather than merely changing their attributes. OTTL is a processing language, not a replacement for the semantic conventions that define what telemetry fields mean.

SDK exporters should use bounded queues and timeouts. If the backend is unavailable, telemetry may be dropped after bounded retries rather than consuming application memory indefinitely.

## Key concepts

**Resource attributes.** Identify the service/workload producing data. Stable `service.name` and version/environment identity make cross-service analysis possible.

**Semantic conventions.** Standard names and meanings for HTTP, database, messaging, RPC, cloud, and other telemetry. Their stability status can differ by convention; upgrades need review. Treat a semantic-convention upgrade as a telemetry schema migration: attribute keys can change, values can be redefined, metric names and units can move, and span names or relationships can change even when both old and new attributes are emitted temporarily.

**Instrumentation library versus manual spans.** Auto-instrumentation covers common frameworks; manual instrumentation adds domain operations. Duplicating both around the same call can produce confusing nested spans.

**Sampling.** Head sampling decides near span creation. Tail sampling in a collector can retain traces based on later information such as errors or latency, at greater infrastructure cost.

**Collector pipeline.** Central processing helps standardize redaction and routing, but collectors need their own capacity, scaling, and failure monitoring.

**Versioned metrics.** Collector components can need migration paths when semantic-convention changes alter metric names, types, or attributes. OpenTelemetry Collector Contrib v0.160.0 introduced versioned process metrics in the hostmetrics receiver, allowing legacy and release-candidate definitions to coexist and be selected through feature gates instead of forcing every user to switch schemas immediately.

**OTTL v1 compatibility boundary.** As of Collector Contrib v0.164.0 (October 2026), OTTL syntax and its standard functions for traces, metrics, and logs have a backward-compatibility commitment through 1.x. This does *not* make the transform processor itself stable, nor does it cover experimental lambda functions, experimental functions behind `pkg.ottl.functions.enableExperimental`, or developing profiles support. Older Collector configurations still need an upgrade review: removed deprecated functions and retired feature gates can prevent startup.

## Production example

A Go API handles HTTP requests and publishes jobs to a queue. Auto-instrumentation already creates inbound HTTP spans and outbound database spans. The team adds one manual span around the domain operation rather than wrapping every library call again.

The API attaches resource attributes such as service name and version. Trace context is injected into message metadata. A worker creates a consumer span and, for delayed processing, uses the appropriate messaging relationship so queue wait and work time remain distinguishable.

A collector receives OTLP telemetry. A processor removes sensitive request attributes, batching reduces export overhead, and traffic is routed to the approved tracing/metrics backends.

The team deliberately blocks the tracing backend. Collector and SDK queues reach bounded limits; dropped telemetry is reported, but API request latency remains within objective. This verifies that observability failure does not become an application outage.

During a semantic-convention upgrade, the team checks current stability guidance and dashboard queries before switching attribute names. It does not assume every convention family changes in lockstep. For example, when previewing the OpenTelemetry Java agent 3.0 behavior, it compares database attributes such as `db.system` versus `db.system.name`, verifies connection-pool metric names and units, and inspects messaging traces because newer conventions can change span names and parent/link relationships.

The same discipline applies to Collector host metrics. When testing the v0.160.0 release-candidate process metrics, the team enables the versioned output in a non-production collector first, compares old and new metric names, types, attributes, and units, then validates dashboards, alerts, recording rules, and downstream transforms before changing fleet-wide defaults.

For a concrete Collector policy, suppose an older client accidentally emits `enduser.email` on spans. The team can remove that attribute before export using an OTTL transform statement such as `delete_key(span.attributes, "enduser.email")` in the trace pipeline. It tests the rule with representative spans and separately inspects logs and metric attributes: a span-only transform cannot sanitize other signals or fields. On upgrading to v0.164.0, the team validates the Collector configuration and any deprecated OTTL feature gates in staging, then checks actual exported telemetry. A stable language grammar does not guarantee that a policy is complete or that the processing pipeline is risk-free.

## Trade-offs

OTel reduces proprietary instrumentation and enables shared conventions. It introduces SDK/collector configuration, version management, and another operational pipeline.

Auto-instrumentation is quick to adopt but can produce too much low-value detail. Manual instrumentation gives domain context but requires consistent engineering effort.

Central collectors simplify policy and backend routing while adding a shared dependency for telemetry delivery. OTTL provides expressive centralized transformations, but complex statements consume CPU and can obscure where data was changed; prefer a few reviewable, tested rules over an opaque policy program.

## Failure modes / pitfalls

Double instrumentation creates duplicate spans and distorted latency. Missing propagation produces disconnected traces. High-cardinality metric attributes can overwhelm storage.

Sensitive HTTP headers, SQL values, or message payloads can leak through attributes. Sampling reduces cost but is not a privacy mechanism.

A subtler failure is upgrading instrumentation while treating telemetry as if only attribute names changed. Unit changes can invalidate alert thresholds, renamed metrics can make dashboards silently empty, and messaging-convention changes can alter trace topology. Versioned or dual-emission migration modes reduce rollout risk, but they still require explicit query and dashboard validation before the legacy shape is removed.

Unbounded exporter queues or synchronous export on request paths can turn telemetry outages into application memory or latency incidents. An OTTL transformation that changes an attribute used by an alert or routing rule can silently break monitoring; `error_mode: ignore` keeps the pipeline running on statement errors but is not a substitute for testing the output.

## When to use it

Use OTel when multiple services/languages need consistent telemetry and the organization wants flexibility in observability backends.

Adopt the smallest useful set first—service identity, critical traces/metrics, and bounded export—then expand based on diagnostic questions.

## When not to use it

Do not build a complicated multi-tier collector topology before understanding telemetry volume and failure requirements.

A small application already using one maintained instrumentation stack may not benefit immediately from a migration solely for vendor neutrality.

## What a Senior Engineer should know

A Senior Engineer should configure resources, propagation, semantic attributes, sampling, batching, and bounded exporters. They should inspect actual emitted telemetry rather than assume an instrumentation library produces the intended data, and they should validate semantic-convention upgrades against queries, units, span structure, and backend behavior before rollout.

They should understand where manual spans add domain value and how telemetry behaves when collectors/backends fail.

## What a Staff Engineer should understand

A Staff Engineer should own semantic-convention upgrades as cross-service schema migrations, plus collector topology, privacy/redaction, sampling strategy, and telemetry capacity across services.

They should make instrumentation interoperable without requiring every team to understand backend-specific export details, while preserving escape hatches for domain-specific signals.

Further reading: [OpenTelemetry concepts](https://opentelemetry.io/docs/concepts/), [Semantic conventions](https://opentelemetry.io/docs/specs/semconv/), [OpenTelemetry Java agent 3.0 preview](https://opentelemetry.io/blog/2026/java-agent-3.0-preview/), [Versioned metrics in hostmetrics](https://opentelemetry.io/blog/2026/hostmetrics-process-scraper-rc/), [OTTL v1 announcement](https://opentelemetry.io/blog/2026/ottl-v1/), [Collector transform processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/transformprocessor).
