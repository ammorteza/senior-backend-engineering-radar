---
title: "eBPF observability tools"
ring: assess
segment: tools
tags: [backend]
---

## What it is

eBPF observability tools use Linux BPF programs to observe selected kernel and user-space events. They are commonly used to investigate networking, scheduling, file I/O, and system-call behavior without adding instrumentation to every application.

They complement application metrics and traces. A trace may show that a request waited 400 ms inside one service; an eBPF-based view can help determine whether the process was waiting for CPU, storage, or network progress.

## Why it matters for backend engineers

Some latency and reliability problems happen below the language runtime. Packet retransmission on one node, CPU run-queue delay, or slow filesystem operations may not be visible in ordinary application logs.

This visibility is valuable only when used with a precise question. eBPF does not understand the business meaning of a request, and production collection still needs controlled overhead, kernel compatibility, and clear operational ownership.

## How it works

A BPF program is loaded through Linux kernel interfaces. Before it runs, the kernel verifier checks the program against safety and execution constraints.

Programs can attach to supported observation points such as tracepoints and other kernel or user-space hooks. Different hook types have different stability guarantees; a stable tracepoint is generally less coupled to kernel internals than a probe on an internal function.

The program can aggregate observations in BPF maps or pass events to a user-space collector. Aggregating close to the source reduces the volume that must be exported.

Modern tooling can use BTF type information and CO-RE techniques to improve portability across compatible kernels, but the actual supported kernels and container environment should still be tested.

## Key concepts

**Verifier.** Validates program behavior before loading. A verified program can still measure the wrong thing, so interpretation remains an engineering task.

**Tracepoints and hooks.** Observation points expose different levels of stability and detail.

**BPF maps.** Shared data structures used for counters, histograms, and state exchanged with user space.

**Event loss.** High-volume event streams can exceed buffers. Collection tools should expose dropped-event information.

**Container attribution.** Host processes must be mapped correctly to cgroups or namespaces so observations are attributed to the intended workload.

**Zero-code application telemetry.** OpenTelemetry eBPF Instrumentation (OBI), which reached v1.0.0 on October 30, 2026, combines eBPF with runtime-specific hooks to emit HTTP, RPC, database, and messaging telemetry without source changes. This is distinct from observing kernel counters: protocol coverage, trace-context propagation, route extraction, and runtime support are explicit capabilities with gaps. OBI 1.0 stabilizes its Config v2 and documented deployment interfaces, not every emitted metric or semantic convention. Its published telemetry schemas and migration guidance are needed when upgrading dashboards and alerts.

## Production example

A Go API shows p99 latency spikes only on a subset of Kubernetes nodes. Application traces show additional time around outbound network calls, while the downstream service itself remains fast.

The team compares affected and healthy nodes with a short, focused eBPF network observation. Retransmission counts are consistently higher on the affected nodes. Scheduler observations show no corresponding CPU-run-queue problem.

The finding is cross-checked with normal node network counters. After the underlying node-network issue is fixed, both retransmission evidence and application p99 return to normal.

The investigation is intentionally bounded: it observes the network behavior required by the hypothesis rather than enabling a broad, permanent event stream across the fleet.

A separate adoption experiment evaluates OBI on a supported Linux canary. The team compares its generated request latency, route labels, and trace relationships against existing application spans, especially for multiplexed HTTP/2 and asynchronous work. It verifies that route templates do not explode metric cardinality, and that missing business spans remain covered by application instrumentation. Before upgrading OBI, it validates Config v2 with `obi config validate` and compares telemetry schemas; Config v1 remains supported but frozen.

## Trade-offs

eBPF offers cross-language, low-level visibility without rebuilding every service. It also introduces kernel-version support, collector operation, and careful overhead management.

Detailed event capture gives richer evidence but produces more data. Aggregated counters and histograms are cheaper for continuous monitoring but cannot reconstruct every individual event.

## Failure modes / pitfalls

Kernel upgrades can change unsupported observation points. Buffer loss can make an apparently quiet capture incomplete. Excessive event volume can affect the system being measured.

Incorrect cgroup or namespace mapping can blame the wrong workload. One low-level symptom should be correlated with application and host telemetry before drawing a causal conclusion.

Automatic application tracing can also be incomplete or duplicated: unsupported protocols may have no spans, encrypted traffic and runtime-specific behavior can limit extraction, and overlapping SDK instrumentation may create redundant telemetry. OBI runtime metrics are still experimental as of its 1.0 release; do not equate the product version with stability of every signal.

## When to use it

Use eBPF observability when a concrete kernel, network, scheduling, or I/O question remains after application-level telemetry.

Prefer short, hypothesis-driven captures first, then decide whether a signal deserves continuous collection.

## When not to use it

Do not replace domain metrics, structured logs, or distributed tracing with kernel telemetry alone. Those signals answer different questions.

Do not roll out a complex fleet-wide collector before verifying kernel compatibility and overhead on representative hosts.

## What a Senior Engineer should know

A Senior Engineer should choose an observation point appropriate to the hypothesis, check for collection loss, and correlate the result with service and node telemetry.

They should understand the difference between an observed kernel event and proof of an application-level cause.

## What a Staff Engineer should understand

A Staff Engineer should define supported kernels, safe rollout practices, data-retention policy, and operational ownership for fleet-wide eBPF tooling.

They should decide which low-level signals belong in the standard platform and which are better kept as specialist incident tools.

Further reading: [Linux BPF documentation](https://docs.kernel.org/bpf/), [eBPF verifier](https://docs.kernel.org/bpf/verifier.html), [OpenTelemetry eBPF Instrumentation 1.0 release](https://opentelemetry.io/blog/2026/obi-v1-release/).
