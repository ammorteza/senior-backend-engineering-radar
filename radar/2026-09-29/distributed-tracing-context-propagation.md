---
title: "Distributed tracing context propagation"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Distributed tracing represents one unit of work as spans connected into a trace. Context propagation carries the identifiers and sampling state needed for downstream work to join that trace or link to it.

Propagation is a protocol boundary. If HTTP middleware injects context but a queue publisher drops it, the trace breaks exactly where synchronous work becomes asynchronous.

## Why it matters for backend engineers

A request that crosses several services, queues, and workers cannot be understood reliably from independent timestamps alone. Trace context makes it possible to separate queue wait from processing time and locate which hop consumes the latency budget.

The propagated context must also be treated as untrusted input at external boundaries. A trace ID is for correlation, not identity or authorization.

## How it works

For HTTP, W3C Trace Context defines the `traceparent` header carrying trace ID, parent span ID, trace flags, and version, with optional `tracestate` for vendor-specific state. A client injects context; the server extracts it and creates a server span with the appropriate relationship.

Inside an application, context must follow asynchronous execution. In Go, passing `context.Context` through calls is the normal mechanism; storing it globally or reusing a request context after cancellation is unsafe.

Messaging relationships need more care. A message produced by one operation and consumed later can use producer/consumer spans and, in cases such as batch processing or multiple causal inputs, **span links** rather than pretending every delayed job is one deeply nested synchronous stack.

**Baggage** carries arbitrary key/value context across process boundaries. It is separate from trace identity, can propagate widely, and must not contain secrets or authorization facts merely because it is convenient.

Sampling decisions can be propagated, but a service should not infer “no sampled trace” means “the operation did not happen.” Tracing is diagnostic evidence, not a business ledger.

## Key concepts

**Trace ID.** Correlates spans belonging to one trace. It is not a user or request authorization credential.

**Parent-child relation.** Represents a direct execution relationship where one span's work caused another in the trace structure.

**Span link.** Connects a span to one or more related span contexts without making them its direct parent. Useful for queues, retries, and batching.

**Baggage.** Propagated application metadata. It has privacy, size, and trust implications.

**Sampling.** Head sampling decides early; tail sampling can use later information in a collector/backend. Both can create incomplete views.

**Propagation boundary.** HTTP, gRPC, message headers, scheduled jobs, and process handoff each need explicit inject/extract behavior.

## Production example

A document API accepts a render request, writes a durable job, publishes a message, and returns 202. Rendering may begin minutes later and can be retried.

The request span ends after acceptance. The published message carries trace context plus a stable job ID. The worker starts a consumer/process span linked to the producer context rather than keeping one server request span open for minutes.

If the first render attempt times out, a later attempt creates a new span with its own attempt attributes and links to the job's causal context. Operators can distinguish queue wait, attempt 1 processing, backoff, and attempt 2.

A batch worker later combines ten documents into one archive. The archive span links to the ten relevant job contexts rather than choosing one arbitrary document as the sole parent.

Security tests send external `traceparent` and baggage values. They may be accepted for correlation under policy, but baggage such as `role=admin` is never used for authorization. Sensitive tenant details are not propagated broadly.

## Trade-offs

Distributed tracing provides request-level causal timing that aggregate metrics cannot. It costs instrumentation, propagation, processing, and storage.

Long-running async workflows can produce huge traces if modeled as one nested tree. Links and domain workflow IDs often create a more useful model.

Sampling controls cost but reduces completeness. Tail-based sampling can retain interesting failures while requiring more collector infrastructure.

## Failure modes / pitfalls

Dropping context at one boundary fragments traces. Reusing one context for unrelated background work makes traces falsely connected.

Putting secrets or high-cardinality user data in baggage spreads it to every downstream system. Trusting incoming trace/baggage fields for security decisions creates spoofing risk.

Creating a new trace for every retry without preserving any relation makes recovery hard to follow; forcing all retries into one mutable span hides the attempt history.

## When to use it

Propagate trace context across remote calls and important asynchronous workflows where causal diagnosis matters.

Use links and stable business/workflow IDs when work becomes delayed, batched, or many-to-many.

## When not to use it

Do not propagate entire request bodies or arbitrary customer metadata in baggage. Do not use trace IDs as idempotency keys or security identities.

A simple monolith with local calls may get more value first from metrics and structured logs than an elaborate distributed tracing deployment.

## What a Senior Engineer should know

A Senior Engineer should inspect `traceparent`/message metadata, understand parent-child versus links, preserve context through async code, and model retries as distinct attempts.

They should verify propagation using real requests and know how sampling changes what can be concluded.

## What a Staff Engineer should understand

A Staff Engineer should define propagation formats, trust boundaries, baggage policy, sampling, and semantic conventions across independently owned services.

They should make traces interoperable across languages without turning tracing context into an uncontrolled data-distribution channel.

Further reading: [W3C Trace Context](https://www.w3.org/TR/trace-context/), [OpenTelemetry trace semantic conventions](https://opentelemetry.io/docs/specs/semconv/general/trace/).
