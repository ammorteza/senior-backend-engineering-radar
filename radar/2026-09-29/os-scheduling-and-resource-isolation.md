---
title: "OS scheduling and resource isolation"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Operating-system scheduling decides which runnable threads receive CPU time. Resource isolation controls how workloads share CPU, memory, and other host resources. On Linux, cgroups are a core mechanism behind container accounting and limits.

A service can therefore be slow while the host still shows spare capacity: its own cgroup may be throttled, or its runnable threads may compete under a different scheduling weight.

## Why it matters for backend engineers

Container requests and limits are not merely deployment metadata. They influence scheduling placement and runtime behavior. Tight CPU quotas can create tail latency for bursty workloads; memory limits can trigger reclaim and OOM termination even when language heap metrics look lower than the limit.

Understanding scheduling helps engineers avoid blaming application code for latency that is actually resource policy—or removing isolation when the real problem is unbounded concurrency.

## How it works

The scheduler chooses among runnable threads according to scheduling class, priorities, and fairness mechanisms. A thread that is blocked on network or a mutex is not competing for CPU until it becomes runnable again.

Linux cgroup v2 exposes CPU weight and bandwidth controls. CPU weight affects relative share under contention. A configured CPU maximum can enforce a quota over periods; once the cgroup exhausts the available budget, its tasks are throttled until more budget becomes available.

Memory cgroups account for memory and can enforce high/max thresholds. Before OOM, the kernel may reclaim file cache or other pages and create latency. The container memory picture includes more than a language's managed heap.

Container orchestration adds another layer. Kubernetes CPU/memory **requests** influence scheduling and reservation; **limits** govern runtime constraints where configured. Do not describe a request as if it were a hard CPU cap.

## Key concepts

**Running versus runnable.** A runnable thread is ready for CPU but may wait in the run queue. CPU profiles see running work, not all runnable delay.

**CPU throttling.** A quota-limited cgroup can be throttled even when another part of the host is idle, depending on configured bandwidth controls.

**CPU weight/share.** Relative priority matters mainly under contention; it is not the same as a fixed CPU maximum.

**Memory pressure.** Reclaim can increase latency before an OOM kill. Monitor pressure and container-level memory, not only heap.

**Noisy neighbor.** Another workload can compete for shared CPU, cache, disk, or network. Cgroups isolate some resources, not every shared hardware path.

## Production example

A PDF renderer is assigned a relatively small CPU limit. Most requests are light, but large documents start several parallel encoding goroutines.

During those bursts, node-wide CPU averages only 55%, yet renderer p99 latency spikes. cgroup counters show the process repeatedly exhausting its CPU budget and being throttled during each quota period.

The team compares three options under the same workload: raise the quota, reduce internal parallelism, or remove the CPU limit entirely. Removing all limits gives the best benchmark but lets one large render compete aggressively with neighboring services.

They choose a higher but still bounded quota and cap renderer parallelism so it uses the available budget efficiently. Requests and node packing are adjusted consistently. A load test verifies p99, throttled time, host contention, and cost.

A separate memory test confirms that heap plus stacks/native/runtime overhead remains below the container limit during peak parallelism.

## Trade-offs

Resource limits contain noisy neighbors and improve capacity predictability. Tight limits reduce burst flexibility and can create throttling or reclaim latency.

Loose limits improve burst performance but require effective admission control and host capacity planning. Overcommitting requests improves utilization while increasing contention risk.

## Failure modes / pitfalls

Treating Kubernetes CPU requests as hard caps leads to wrong diagnosis. Reading host CPU instead of cgroup counters can hide per-container throttling.

Increasing CPU limits cannot fix lock contention or downstream waiting. Removing memory limits because one OOM occurred can allow one service to destabilize the node.

Sizing a memory limit from managed heap alone ignores stacks, native allocations, buffers, and runtime overhead.

## When to use it

Use scheduling/resource-isolation knowledge when investigating tail latency, CPU throttling, OOM, noisy-neighbor behavior, and Kubernetes resource sizing.

Correlate cgroup/OS evidence with application workload before changing limits.

## When not to use it

Do not tune kernel scheduling policy as a first response to an application bottleneck you have not measured.

Do not remove isolation globally because one workload needs more burst headroom.

## What a Senior Engineer should know

A Senior Engineer should distinguish running, runnable, throttled, and blocked work; read relevant cgroup counters; and connect Kubernetes requests/limits to runtime behavior.

They should test resource changes under representative concurrency and host contention.

## What a Staff Engineer should understand

A Staff Engineer should define platform resource policies that balance latency, fairness, utilization, and failure isolation across workloads.

They should coordinate requests/limits with autoscaling, node sizing, and cost so teams do not optimize one service by creating fleet instability.

Further reading: [Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html), [Kubernetes resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).
