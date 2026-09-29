---
title: "Timeouts, retries and jitter"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Timeouts bound how long a caller waits for work. Retries make another attempt after selected failures. Backoff spaces attempts over time, and jitter adds randomness so many clients do not retry simultaneously.

Together they are fundamental resilience mechanisms, but badly configured retries can turn a small incident into a large outage.

## Why it matters for backend engineers

Every remote call can hang, slow down or fail. Without deadlines, resources accumulate. Without carefully selected retries, transient failures unnecessarily reach users. With excessive retries, an unhealthy dependency receives even more traffic.

Senior backend engineers must treat these settings as part of system capacity, not client-library decoration.

## How it works

A caller establishes a deadline based on its own latency budget. Individual downstream operations receive timeouts that fit inside that deadline.

Only failures likely to be transient and safe to repeat are retried. Attempts use exponential or another bounded backoff, usually with jitter. A maximum attempt count or total retry budget prevents infinite work.

Retries must also respect idempotency. Retrying a non-idempotent command can duplicate effects.

## Key concepts

### Deadline versus timeout
A deadline represents remaining end-to-end time; a timeout often bounds one operation or phase.

### Exponential backoff
Increasing delay gives a recovering dependency time to regain capacity.

### Jitter
Randomization prevents synchronized retry waves.

### Retry budget
The system limits how much additional traffic retries may create.

### Retryable failure
Not every 4xx/5xx or transport error should be retried. Semantics matter.

## Production example

A service receives requests with a 500 ms user-facing SLO and calls two dependencies. One client has a 2-second timeout and three immediate retries.

When that dependency slows, request goroutines accumulate beyond the user-visible deadline and retry traffic multiplies load.

The service instead propagates a deadline, assigns a bounded downstream budget, retries only selected transient failures once or twice with jitter, and records attempt counts. The system fails faster and recovers without a retry storm.

## Trade-offs

Longer timeouts may allow slow success but hold resources and worsen tail latency. Short timeouts release capacity but can abandon work that would have completed.

Retries improve success probability for transient failures but consume capacity and increase latency. The optimal policy depends on operation semantics and downstream behavior.

## Failure modes / pitfalls

Common failures include retrying non-idempotent operations, retries at multiple layers, no jitter, retrying overload responses immediately, retrying permanent validation errors, ignoring request cancellation and setting identical timeouts for every dependency.

A major pitfall is allowing each layer to retry three times: several nested layers can multiply one request into dozens of attempts.

## When to use it

Use explicit timeouts on remote operations and bounded retries where failures are transient and operations are safe to repeat.

## When not to use it

Do not retry deterministic failures or overload without appropriate backoff. Do not use retries to conceal persistent dependency problems.

## What a Senior Engineer should know

A Senior Engineer should set deadlines from end-to-end latency budgets, classify retryable failures, use backoff with jitter, propagate cancellation and connect retry behavior to idempotency.

They should instrument attempts separately from logical requests.

## What a Staff Engineer should understand

A Staff Engineer should reason about retries across the entire call graph and define retry budgets and platform defaults. They should model how retries affect capacity during partial outages and coordinate timeout hierarchies across services.

They should recognize when queues, circuit breakers or graceful degradation are more appropriate than another retry.
