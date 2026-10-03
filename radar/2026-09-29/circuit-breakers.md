---
title: "Circuit breakers"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A circuit breaker is a client-side resilience mechanism that stops sending ordinary requests to a dependency after recent evidence indicates that calls are unlikely to succeed. It changes slow repeated failure into fast rejection for a period, preserving the caller's resources while the dependency recovers.

A circuit breaker complements deadlines, retries, and rate limiting. It does not replace them and cannot make an unavailable dependency available.

## Why it matters for backend engineers

A failing remote dependency consumes more than its own resources. Slow calls occupy the caller's connection pool, goroutines or threads, request deadlines, and queue capacity. If every upstream service continues sending traffic, one degraded dependency can create a cascading failure.

A breaker gives the caller a shared memory of recent dependency health so each new request does not rediscover the same failure at full cost.

## How it works

In the **closed** state, requests flow normally and outcomes feed a rolling health window. The breaker opens when a configured signal crosses a threshold, such as a failure ratio over a minimum sample size or sustained latency beyond a useful deadline.

In the **open** state, ordinary calls fail immediately or use a defined fallback. After a cooldown or recovery condition, the breaker moves to **half-open** and allows a small number of probe requests.

If probes demonstrate recovery, the breaker closes gradually or immediately according to the implementation. If they fail, it opens again.

The breaker should usually be scoped to a meaningful dependency boundary. One provider endpoint failing should not necessarily block unrelated provider operations. Conversely, creating one breaker per request instance gives no shared protection.

## Key concepts

**Failure classification.** Validation errors or caller cancellations do not prove the dependency is unhealthy. Count only outcomes relevant to dependency health.

**Minimum sample size.** Opening on one failure from one request makes the breaker unstable. Ratios need enough observations to be meaningful.

**Half-open concurrency.** A recovering service should receive a bounded number of probes, not the full waiting fleet at once.

**Fallback.** Cached/stale data or reduced functionality may be valid for some calls. Other calls should fail explicitly; a fallback must not silently violate correctness.

**Breaker state versus service health.** The breaker is one client's recent observation, not a globally authoritative health oracle.

## Production example

A notification worker calls an external push provider. The provider begins returning 503 responses while latency rises from 100 ms to several seconds.

Without a breaker, each worker waits for a timeout and then retries. Queue age increases and worker connections are consumed by calls that rarely succeed.

The client already has a per-attempt deadline and a shared account-wide rate limit. A breaker opens after a meaningful rolling failure ratio with a minimum sample size. While open, the worker does not call the provider; durable jobs remain queued with next-attempt times.

Half-open mode allows a small number of probes. Recovery is gradual: the breaker closes only after successful probes and worker concurrency ramps within the provider rate limit, avoiding a backlog stampede.

Metrics expose breaker state, open transitions, probe results, provider latency, and queue age. Tests also verify that a 400 validation error does not open the breaker and that an outage on one provider does not disable a separate provider.

## Trade-offs

A breaker reduces wasted work and cascading failures, but can reject requests that would have succeeded. Thresholds tuned too aggressively create oscillation; tuned too conservatively they provide little protection.

Shared breaker state improves coordination inside a process or client pool but can create synchronized behavior. Fleet-wide central breakers are powerful but add coordination and blast radius.

## Failure modes / pitfalls

Counting all non-2xx results as dependency failure causes false opens. Opening on tiny sample sizes makes behavior noisy. Sending too many half-open probes can immediately overload a recovering dependency.

Stacking breakers independently in SDKs, sidecars, and application code makes incidents hard to reason about. A breaker without a durable retry/fallback strategy simply converts slow failure into fast failure.

Another pitfall is keeping the breaker closed because health checks succeed while real requests fail; use signals representative of the actual operation.

## When to use it

Use circuit breakers around remote dependencies where persistent failure or high latency can consume enough caller resources to threaten unrelated work.

They are particularly useful when the product has a sensible degraded or deferred behavior while the dependency is unavailable.

## When not to use it

Do not add breakers mechanically around local function calls or cheap failures. Do not use a breaker as a substitute for fixing missing timeouts or unbounded concurrency.

If every request is independent and failures are already cheap, the extra state may add complexity without protection.

## What a Senior Engineer should know

A Senior Engineer should choose breaker scope, health signals, sample windows, half-open behavior, and fallback deliberately and understand how the breaker interacts with retries and rate limits.

They should exercise open/recovery behavior and make breaker state observable during incidents.

## What a Staff Engineer should understand

A Staff Engineer should decide where breakers belong across the call graph and prevent resilience layers from fighting one another.

They should establish shared patterns for timeouts, retries, breakers, rate limits, and degradation and verify that recovery traffic stays within downstream capacity.

Further reading: [Microsoft circuit breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker), [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/).
