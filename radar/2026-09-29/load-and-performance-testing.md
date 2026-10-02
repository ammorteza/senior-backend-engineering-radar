---
title: "Load and performance testing"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Performance testing evaluates a system under a defined workload. Load, stress, spike and soak tests explore normal demand, capacity limits, sudden changes and long-duration behavior respectively.

## Why it matters for backend engineers

A throughput number without request mix, data shape and latency criteria is not a useful capacity statement. Tail behavior often matters more than average response time.

## How it works

Model arrivals, operations and datasets, then generate controlled demand while measuring errors, latency and resource saturation. Open arrival models keep arrivals independent of completion; closed models represent a bounded population of users. Increase demand until an identified constraint appears, then test recovery as load falls.

## Key concepts

Percentiles need enough observations and a stated window. Coordinated omission can hide latency when the generator stops issuing work during stalls. Warmup, cache state and connection reuse affect comparisons. Queue wait belongs in end-to-end latency.

## Production example

A search API performs well on a small uniform dataset. A realistic test includes common broad searches and large tenants, revealing a sort spill and a hot shard. A soak test then checks memory growth. The team changes the query and reruns the same workload rather than lowering the offered rate.

## Trade-offs

Realistic tests cost environment capacity and preparation. Simplified tests isolate mechanisms but may miss production skew; both have a place if claims remain scoped.

## Failure modes / pitfalls

Generator saturation, unrealistic think time, empty databases and averages without errors can produce false confidence. Stop conditions protect shared infrastructure.

## When to use it

Test before major capacity changes and when investigating a reproducible performance regression.

## When not to use it

Do not benchmark an irrelevant micro-operation and infer full-service capacity from it.

## What a Senior Engineer should know

Define workload and acceptance criteria; identify the bottleneck from correlated metrics.

## What a Staff Engineer should understand

Maintain representative datasets and capacity evidence, including degraded-mode and recovery behavior.

Further reading: [Google SRE: Testing for reliability](https://sre.google/sre-book/testing-reliability/).
