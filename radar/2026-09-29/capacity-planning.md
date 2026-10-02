---
title: "Capacity planning"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Capacity planning estimates the resources needed to meet a workload's service objectives, then validates those estimates with measurements. It includes failure and recovery demand, not only average traffic.

## Why it matters for backend engineers

Requests per second alone cannot size a service. Payload sizes, concurrency, hot tenants and slow dependencies determine which resource saturates first.

## How it works

Describe request mix and peaks, calculate rough compute, memory, connection and storage demand, then measure a representative workload. Little's Law relates average concurrency to throughput and time under stable conditions. Model the bottleneck and required headroom; repeat after workload or architecture changes.

## Key concepts

Offered load differs from completed throughput. Tail latency rises near saturation before errors necessarily appear. Storage growth includes indexes and replication. N-minus-one capacity tests whether service objectives survive a failed component. Recovery backlogs add demand beyond new traffic.

## Production example

A rendering service receives 50 jobs per second with average processing time of two seconds, implying roughly 100 in-flight jobs before additional queueing. Large documents need more memory, so worker concurrency follows measured size distribution rather than the average alone. A node-loss test verifies remaining capacity and backlog drain time.

## Trade-offs

Headroom improves resilience but costs money. Precise forecasting is impossible; ranges and leading saturation indicators are more useful than false precision.

## Failure modes / pitfalls

Sizing from averages, counting successful throughput while rejected arrivals grow and assuming every dependency autoscales create false capacity claims.

## When to use it

Plan before significant growth, new workloads or failure-domain changes, and refresh with production evidence.

## When not to use it

Do not build a detailed forecast around an unvalidated workload assumption.

## What a Senior Engineer should know

Calculate throughput/concurrency/storage bounds and identify saturation from tests.

## What a Staff Engineer should understand

Allocate headroom across shared dependencies, failure scenarios and growth uncertainty.

Further reading: [Google SRE: Software engineering](https://sre.google/sre-book/software-engineering-in-sre/).
