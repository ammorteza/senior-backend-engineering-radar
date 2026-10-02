---
title: "OS scheduling and resource isolation"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

OS scheduling allocates CPU time among runnable tasks; resource isolation limits and accounts for workloads. On Linux, cgroups are central to container CPU and memory behavior.

## Why it matters for backend engineers

A service can have latency spikes despite apparently spare host CPU because its own quota is exhausted or it competes with neighboring workloads.

## How it works

The scheduler selects runnable threads, considering policy and fairness. Cgroup CPU bandwidth controls limit execution over configured periods; exhausting the quota causes throttling until budget returns. Memory accounting and limits govern reclaim and OOM behavior. Scheduling requests and runtime limits are related but distinct platform concepts.

## Key concepts

Runnable delay differs from CPU execution. CPU shares/weights influence competition, while quotas cap bandwidth. Memory pressure can cause reclaim before OOM. Host-level utilization can hide a constrained cgroup.

## Production example

A PDF renderer gets a small CPU quota but briefly needs parallel work. It exhausts the budget early in each period, producing tail latency while the node is not fully used. Engineers correlate throttle counters and runnable delay, then adjust concurrency and resource policy using representative load.

## Trade-offs

Limits contain noisy neighbors and provide cost predictability. Tight quotas can hurt bursty latency-sensitive workloads; looser limits require credible admission and tenancy controls.

## Failure modes / pitfalls

Assuming requested CPU equals a hard cap, treating throttling as application blocking and sizing memory from heap alone cause misdiagnosis.

## When to use it

Use scheduling knowledge to tune container resources and investigate latency or noisy-neighbor effects.

## When not to use it

Do not remove all controls merely because one quota was too restrictive; consider isolation and shared capacity.

## What a Senior Engineer should know

Read cgroup counters, process scheduling states and workload-specific resource demand.

## What a Staff Engineer should understand

Choose cluster isolation and resource policies that balance fairness, latency and utilization.

Further reading: [Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html), [Kubernetes resources](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).
