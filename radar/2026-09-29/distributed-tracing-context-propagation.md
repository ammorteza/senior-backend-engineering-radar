---
title: "Distributed tracing context propagation"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Distributed tracing connects spans representing related operations. Context propagation carries identifiers and sampling information so downstream work can join or link to the originating trace.

## Why it matters for backend engineers

A slow request crossing five services is hard to diagnose from independent logs. Missing context at one HTTP or message boundary creates disconnected traces precisely where investigation needs continuity.

## How it works

A caller injects trace context into transport metadata; the receiver extracts it and creates an appropriate span. HTTP commonly uses W3C `traceparent` and `tracestate`. For delayed or batched messages, span links can express causal relationships better than pretending all work is one short synchronous call. Baggage carries extra cross-boundary values and needs stricter control.

## Key concepts

A trace ID correlates a journey, not authentication. Parentage represents execution relationships; links represent additional causality. Sampling may discard spans. Context must be propagated through goroutines and library calls deliberately.

## Production example

A document request queues work and returns immediately. The producer records the message ID and injects context; the worker starts a processing span linked to the producer context. A retry creates a new attempt span rather than overwriting the first. Operators can distinguish queue wait from rendering time.

## Trade-offs

Traces reveal per-operation timing and dependencies but cost storage and can be incomplete under sampling. Long-lived asynchronous traces need careful modeling.

## Failure modes / pitfalls

Trusting caller-provided baggage for authorization, copying secrets into context and failing to propagate across queues are hazards. Unsampled traces cannot prove an operation never happened.

## When to use it

Use propagation on instrumented remote boundaries and background tasks where causal diagnosis matters.

## When not to use it

Do not put arbitrary request bodies or high-cardinality customer data into baggage.

## What a Senior Engineer should know

Inspect headers and message metadata; distinguish server, client, producer and consumer relationships.

## What a Staff Engineer should understand

Set propagation, sampling and sensitive-data policies across independently owned services.

Further reading: [W3C Trace Context](https://www.w3.org/TR/trace-context/).
