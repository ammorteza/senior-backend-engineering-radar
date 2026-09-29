---
title: "Rate limiting and backpressure"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Rate limiting controls how much work a caller or system may introduce over time. Backpressure is the broader mechanism by which downstream capacity constrains upstream production.

Both exist to keep systems inside safe operating limits instead of accepting more work than they can process.

## Why it matters for backend engineers

Overload is inevitable. Traffic spikes, slow dependencies, hot tenants and recovery after outages can all make incoming work exceed capacity.

Without backpressure, queues and memory grow, latency explodes and eventually healthy components fail. A well-designed system rejects or slows work before reaching that point.

## How it works

Rate limiters implement policies such as token bucket, leaky bucket or fixed/sliding windows. Limits may apply globally, per tenant, per user, per endpoint or against a downstream dependency.

Backpressure can appear as bounded queues, concurrency limits, flow-control signals, broker consumer limits or explicit rejection. The essential idea is that the producer must eventually feel the consumer's capacity constraint.

## Key concepts

### Token bucket
Tokens accumulate at a configured rate up to a burst capacity. Each operation consumes a token.

### Concurrency limit
Instead of limiting requests per second, the system bounds simultaneous work, which often maps more directly to scarce resources.

### Bounded queue
A finite queue forces an explicit decision when capacity is exhausted.

### Load shedding
Noncritical or excess work is rejected so the system can continue serving higher-value traffic.

### Fairness
Per-tenant or weighted limits prevent one workload from consuming all shared capacity.

## Production example

An API accepts jobs that are processed by workers calling an external provider limited to 500 requests per second. Increasing workers cannot increase provider capacity.

The system applies a provider-aware limiter, bounds queued jobs, exposes queue age and rejects or delays low-priority work before memory grows without limit. Higher-priority traffic receives reserved capacity.

## Trade-offs

Strict limits protect reliability but may reject legitimate bursts. Large burst allowances improve responsiveness but can overload dependencies.

Queueing can smooth short spikes but increases latency and hides overload if queue depth is treated as unlimited capacity.

## Failure modes / pitfalls

Typical mistakes include unbounded queues, limits that exist independently on every replica, no tenant fairness, retrying rate-limit responses immediately, and measuring only queue length rather than queue age.

Another pitfall is scaling consumers against a downstream system whose capacity cannot scale.

## When to use it

Use rate limiting at public boundaries, expensive operations, shared dependencies and any place demand can exceed a known capacity.

Use backpressure throughout asynchronous pipelines and bounded worker systems.

## When not to use it

Do not use arbitrary rate limits to conceal a capacity problem without understanding the bottleneck. Some workloads are better governed by concurrency or resource budgets than requests per second.

## What a Senior Engineer should know

A Senior Engineer should understand token-bucket style limiting, bounded queues, concurrency controls, 429 semantics, Retry-After behavior and how to monitor saturation.

They should design overload behavior explicitly.

## What a Staff Engineer should understand

A Staff Engineer should allocate capacity across tenants and priorities, model overload across complete pipelines and design admission control at the correct boundary.

They should establish how systems degrade when total demand exceeds business capacity instead of assuming autoscaling will always solve overload.
