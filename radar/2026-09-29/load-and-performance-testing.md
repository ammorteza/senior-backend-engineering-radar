---
title: "Load and performance testing"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Performance testing evaluates how a system behaves under a defined workload and identifies where latency, errors, or saturation become unacceptable. Load tests exercise expected demand, stress tests push beyond intended capacity, spike tests change demand abruptly, and soak tests run long enough to expose accumulation such as leaks or maintenance backlog.

A useful result is never just “25k requests/second.” It includes request mix, data distribution, environment, arrival model, latency/error criteria, and the resource that saturated.

## Why it matters for backend engineers

Production performance depends on concurrency, payload size, tenant skew, caches, database state, and downstream limits. A benchmark with small uniform data can make an inefficient query look safe until one large tenant appears.

Performance tests also expose recovery behavior. A service can remain healthy during steady load but collapse when a cache is flushed or a failed node returns and a backlog drains.

## How it works

Define the workload before generating traffic: operations, proportions, payload distributions, authentication, think time, data size, and peak pattern.

Choose an **open arrival model** when arrivals should continue at a configured rate independent of response time. This exposes overload because slower responses do not automatically reduce incoming traffic. A **closed model** represents a fixed population of users that begin another iteration after completion; it is appropriate for some user workflows but can hide capacity limits.

Warm the system deliberately and state whether caches/connections are cold or warm. Run long enough for garbage collection, compaction, autoscaling, and other background processes to appear.

Measure offered load, completed throughput, errors, latency percentiles, queueing, and resource saturation. Increase one dimension until a limiting resource becomes clear. Then rerun the same workload after a change so comparisons are meaningful.

## Key concepts

**Tail latency.** p95/p99 reveal slow requests hidden by averages. They need enough observations and a stated interval.

**Coordinated omission.** A generator that waits for a slow response before issuing the next scheduled request can underreport latency during stalls.

**Generator saturation.** If the load generator cannot create the requested traffic, the test measures the generator, not the target.

**Dataset realism.** Cardinality, row distribution, object size, hot keys, and tenant skew can change execution plans and caching dramatically.

**Steady state.** Short tests may end before caches fill, GC changes, compaction starts, or rate limits take effect.

**Acceptance criteria.** Define maximum error rate, latency, saturation, and possibly queue age before the run.

## Production example

A search API is expected to sustain 1,000 requests per second with p95 under 300 ms. A first test on a small uniform dataset passes easily.

The team rebuilds the fixture with realistic tenant sizes and query distribution: most searches are selective, but 10% are broad and one tenant contains 30% of records. Under the same arrival rate, p95 crosses one second. PostgreSQL telemetry shows sort spills and one shard saturating.

The query is changed to use a more suitable access path and broad searches receive an explicit result/window bound. The exact same workload is rerun. Latency improves, but a two-hour soak test shows memory gradually growing because result buffers are retained.

The team fixes that retention and finally tests a cache flush and loss of one instance while load continues. Capacity claims are based on the complete scenario, not the best short benchmark.

## Trade-offs

Highly realistic environments cost more and are harder to reproduce. Small isolated benchmarks are excellent for comparing one mechanism, but their claims must remain narrow.

Running near production scale gives better evidence while increasing the risk and expense of the test. Synthetic tests should complement, not replace, production telemetry.

## Failure modes / pitfalls

Happy-path payloads, tiny datasets, average latency only, ignored errors, and an overloaded generator produce false confidence. Testing with an empty queue or fully warm cache can miss recovery behavior.

Changing workload and implementation simultaneously invalidates comparisons. Running uncontrolled stress against shared production infrastructure can cause a real incident.

## When to use it

Use performance testing before major launches, large capacity changes, expensive query changes, and to reproduce a measurable latency or throughput regression.

Retain representative workloads so the same scenario can become a regression test.

## When not to use it

Do not extrapolate full-system capacity from one microbenchmark or one endpoint. Do not run enormous load merely to obtain an impressive number without a product requirement.

## What a Senior Engineer should know

A Senior Engineer should choose the correct arrival model, design representative data and traffic, define acceptance criteria, and correlate latency with the actual saturated resource.

They should verify the generator, include error/queue behavior, and rerun comparable workloads after changes.

## What a Staff Engineer should understand

A Staff Engineer should establish representative performance environments and datasets, capacity-test standards, and evidence required before large architectural changes.

They should include failure-mode and recovery capacity, preventing teams from optimizing only steady-state throughput.

Further reading: [Google SRE: Testing for reliability](https://sre.google/sre-book/testing-reliability/).
