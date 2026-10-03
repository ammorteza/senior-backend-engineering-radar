---
title: "Capacity planning"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Capacity planning estimates how much compute, memory, storage, network, connection, and downstream capacity a workload needs to meet service objectives. It combines workload forecasts with measured resource behavior and includes failure/recovery scenarios, not only normal average traffic.

Capacity is multidimensional. A service can have spare CPU while its database connections, memory, disk IOPS, provider quota, or one hot partition is saturated.

## Why it matters for backend engineers

Autoscaling reacts only to resources that can actually scale. Adding API pods cannot create more database write throughput or increase an external provider quota.

Sizing from averages is also unsafe. Peak traffic, payload distribution, slow requests, tenant skew, deployments, node loss, and backlog recovery can dominate capacity even when daily averages look comfortable.

Senior engineers need to translate product demand into the resource that will saturate first and verify the estimate with representative load.

## How it works

Start with workload dimensions: requests/jobs per second, payload sizes, read/write mix, concurrency, tenant distribution, retention, and expected peak/launch patterns.

Build rough resource models. Little's Law relates average concurrency `L`, throughput `λ`, and average time `W` in a stable system: `L = λW`. For example, 50 jobs per second that each occupy a worker for two seconds imply about 100 jobs in service on average before extra queueing.

Then measure. Load testing identifies where latency starts rising sharply and which resource saturates. The goal is not a single “max RPS” number but a safe operating region under the real request mix.

Add headroom for node/zone loss, deployment surge, maintenance, and recovery backlog. If a cluster is safe only while every node is healthy, it has no failure capacity.

Storage models include live data, indexes, replicas, logs, temporary files, compaction/vacuum overhead, and backup/recovery copies. Network models include cross-zone/region and egress constraints where relevant.

## Key concepts

**Offered load versus completed throughput.** A service can report stable 1,000 rps completed while 500 rps is rejected or queued. Capacity decisions need arrival/admission metrics too.

**Saturation knee.** Tail latency often grows nonlinearly near a bottleneck before outright errors appear.

**N-minus-one capacity.** Can the service meet objectives after losing a node or required failure domain?

**Headroom.** Spare capacity absorbs variance and failures. It is not automatically waste; the required amount follows recovery and availability goals.

**Backlog drain.** After an outage, capacity must handle new arrivals plus extra throughput to reduce queued work. If service capacity equals new demand, recovery never finishes.

## Production example

A rendering service normally receives 50 jobs per second. Median render time is 1.2 seconds, but large documents take 8 seconds and use four times the memory.

A simple average suggests roughly 60 concurrent jobs. A representative load test with the real size distribution shows memory, not CPU, becomes limiting at 80 concurrent renders because several large jobs overlap.

The team sets worker concurrency from memory headroom rather than CPU count. It reserves enough capacity so loss of one node still serves interactive jobs within the objective. Batch work uses remaining capacity.

Now consider an outage that creates 30,000 queued jobs. If the recovered fleet can process 70 jobs per second while new traffic remains 50 per second, only 20 jobs per second drain the backlog; recovery takes about 25 minutes. That calculation shapes customer messaging and autoscaling bounds.

Tests include a node loss, deployment surge, cold cache, and database/provider constraints. Capacity alerts use leading saturation metrics—memory, queue age, pool wait, and downstream utilization—not CPU alone.

## Trade-offs

More headroom improves resilience and recovery but costs money. Higher utilization reduces cost per unit during steady state while making burst and failure behavior less forgiving.

Precise long-range forecasts are impossible; ranges, leading indicators, and frequent recalibration are more useful than false precision.

Specialized isolation for large jobs protects small requests but can leave capacity stranded if the scheduling policy is too rigid.

## Failure modes / pitfalls

Planning from average RPS ignores request cost distribution and peaks. Benchmarking with tiny uniform payloads overestimates production capacity.

Counting only successful throughput hides rejection and backlog growth. Assuming every managed dependency autoscales can expose fixed connection, quota, or storage limits later.

A common mistake is testing only steady state. Recovery, cache refill, resharding, or replica catch-up can consume more resources than normal traffic.

## When to use it

Perform capacity planning before launches, major traffic growth, topology changes, or adding workloads to shared dependencies. Revisit it when production measurements change.

Use a simple model first, then improve it where uncertainty materially affects risk or cost.

## When not to use it

Do not spend weeks producing a detailed forecast from unvalidated assumptions. Measure a representative workload as soon as possible.

Do not treat a one-time benchmark as a permanent capacity certificate; software and data distributions evolve.

## What a Senior Engineer should know

A Senior Engineer should estimate concurrency, storage growth, connection budgets, and backlog drain; identify bottlenecks from load tests; and design for failure-mode capacity.

They should distinguish offered, admitted, and completed work and recognize tail-latency growth as saturation evidence.

## What a Staff Engineer should understand

A Staff Engineer should allocate headroom across shared platforms, define growth assumptions with product teams, and decide which failure scenarios the organization pays to survive.

They should connect capacity to cost and recovery objectives, preventing local autoscaling policies from overloading constrained shared dependencies.

Further reading: [Google SRE: Production services best practices](https://sre.google/sre-book/service-best-practices/), [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/).
