---
title: "Circuit breakers"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A circuit breaker is a resilience mechanism that temporarily stops calls to a dependency when recent failures indicate that continuing to send traffic is unlikely to succeed. The idea comes from electrical circuit breakers: isolate a failing path before it causes broader damage.

A circuit breaker is not a substitute for timeouts or retries. It coordinates repeated failure across requests so the application can fail quickly while a dependency recovers.

## Why it matters for backend engineers

A slow or failing dependency consumes connection slots, goroutines or threads and request budgets. If every caller continues waiting and retrying, failure can propagate upstream until healthy services also become saturated.

Circuit breakers help contain that failure and create room for recovery.

## How it works

A breaker normally moves through closed, open and half-open states. Closed means calls are allowed while failures are measured. When a threshold is exceeded, the breaker opens and rejects calls immediately for a period.

After that period, half-open mode permits a limited number of probe requests. Successful probes close the breaker; continued failures reopen it.

The failure signal should reflect the dependency's actual health. Counting client validation errors as dependency failures, for example, produces meaningless breaker behavior.

## Key concepts

### Closed
Normal traffic flows and outcomes contribute to health statistics.

### Open
Calls fail fast rather than consuming resources against an unhealthy dependency.

### Half-open
Limited probes determine whether normal traffic should resume.

### Failure threshold
Breakers may use consecutive failures, failure ratio, latency or other signals over a rolling window.

### Fallback
A caller may degrade functionality, use cached data or return a clear failure while the circuit is open.

## Production example

A notification worker calls an external push provider. The provider begins returning 503 responses and latency rises sharply. Without protection, workers accumulate requests and retry aggressively.

A client timeout bounds each attempt, retry policy handles occasional transient failures, a rate limiter controls throughput, and the circuit breaker opens when the provider is persistently unhealthy. Events remain in a durable queue and resume gradually after successful half-open probes.

## Trade-offs

Breakers reduce cascading failure and wasted work but can reject calls that might have succeeded. Poor thresholds create oscillation or hide recovery.

They also add state and another behavior engineers must observe during incidents.

## Failure modes / pitfalls

Common mistakes include global breakers for unrelated endpoints, counting all errors equally, opening on tiny sample sizes, aggressive half-open traffic, no metrics, and stacking independent breakers in multiple layers.

A breaker without a fallback or durable retry strategy may simply turn slow failures into fast failures.

## When to use it

Use circuit breakers around remote dependencies where persistent failure or high latency can consume enough resources to threaten the caller.

## When not to use it

Do not add breakers mechanically to every function call. Local operations and dependencies with naturally cheap, bounded failures often need only correct timeout handling.

## What a Senior Engineer should know

A Senior Engineer should understand breaker states, meaningful health signals, interaction with retries and timeouts, and how to expose breaker state in metrics.

They should design graceful behavior while the circuit is open.

## What a Staff Engineer should understand

A Staff Engineer should reason about breaker placement across a call graph, recovery traffic and system-wide failure propagation. They should prevent resilience layers from fighting each other and establish shared policies for retries, breakers, rate limiting and degradation.
