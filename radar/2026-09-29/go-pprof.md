---
title: "Go pprof"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

pprof is Go's profiling format and analysis tool for understanding where a program spends CPU time, allocates memory, retains heap objects, blocks on synchronization, or accumulates goroutines. Different profiles answer different questions; “take a profile” is incomplete unless the profile type matches the hypothesis.

A profile is statistical evidence. It samples stacks or runtime events over an interval, so short and rare behavior may be absent. The goal is to compare representative captures, not treat one flame graph as a complete execution history.

## Why it matters for backend engineers

Performance incidents are easy to misdiagnose from endpoint latency alone. High CPU can come from JSON encoding, cryptography, GC assistance, or an accidental loop. High RSS can come from retained heap, stacks, native memory, or allocator/page-cache effects.

pprof lets engineers attribute work to code paths before optimizing. It is especially valuable in Go because the runtime exposes standard CPU, heap, goroutine, block, mutex, and other profiles.

## How it works

A CPU profile samples the stacks of goroutines executing on CPU during a bounded interval. It highlights code consuming CPU, not time spent asleep or waiting on I/O.

Heap/alloc profiles sample allocation stacks. `inuse_space` or `inuse_objects` emphasize currently retained heap; `alloc_space` or `alloc_objects` emphasize cumulative allocation activity. A service can have high allocation churn without a leak, or a slowly growing live heap with modest allocation rate.

Goroutine profiles show current stack states and are useful for leaks or blocked goroutines. Mutex and block profiles expose contention, but require appropriate runtime sampling settings and add overhead.

`go tool pprof` can show top tables, call graphs, source/line views, and compare profiles. “Flat” cost belongs directly to a function; “cumulative” cost includes descendants.

Production HTTP pprof endpoints should be access-controlled. Exposing them publicly can reveal stack/function information and permit expensive diagnostic captures.

## Key concepts

**CPU versus wall time.** A CPU profile shows active CPU use. A slow request waiting on a socket can have little CPU representation.

**Allocation versus retention.** `alloc_space` answers “who allocated”; `inuse_space` answers “what sampled allocations remain live.”

**Flat versus cumulative.** Flat identifies where cost is spent directly; cumulative identifies call paths leading to that cost.

**Sample rate.** Profiles approximate reality. Small differences may be noise unless workload and duration are comparable.

**Diff/base profile.** Comparing before and after under the same workload can isolate regressions more reliably than staring at two separate top lists.

## Production example

A document-rendering API's CPU rises 70% after a feature release. Request volume is unchanged.

A 30-second CPU profile under representative load shows a large cumulative path through response generation and a high flat cost in JSON encoding. The heap profile does not show growing retained memory, but `alloc_space` shows large temporary buffer allocation in the same path.

The new feature serializes one immutable metadata structure repeatedly for every document page. The team changes the design to precompute the serialized metadata once per document and reuse it safely.

A benchmark verifies the local change. Then the same production-like load test is rerun and CPU/alloc profiles are captured for the same duration. CPU time in the encoder and allocation volume both fall, while output correctness tests pass.

The team does not conclude “all allocations are bad” or introduce a global object pool without evidence. The optimization targets one measured hot path.

## Trade-offs

pprof provides strong attribution with usually manageable overhead. CPU and heap sampling are far cheaper than recording every event, but they provide less chronological detail than the execution tracer.

Contention profiles can add overhead if sampling is aggressive. Longer profiles improve statistical confidence while increasing exposure and operational cost.

## Failure modes / pitfalls

Capturing an idle interval produces a profile of idle behavior. Comparing profiles from different workloads or binaries can create false conclusions.

Heap size is not the same as process RSS. A small heap profile does not rule out native memory, stacks, mappings, or kernel cache.

Optimizing the largest cumulative function without identifying its direct cost can target the wrong layer. Public debug endpoints and downloaded profiles also need security controls.

## When to use it

Use pprof when the unresolved question is where CPU, allocations, retained heap, goroutines, blocking, or mutex contention concentrate.

Collect the shortest representative interval that contains the symptom and preserve workload/version context.

## When not to use it

Do not expect pprof to reconstruct exact scheduler chronology or distributed request causality. Use `go tool trace` or distributed tracing for those questions.

Do not optimize from a profile collected under an irrelevant synthetic workload.

## What a Senior Engineer should know

A Senior Engineer should select the correct profile type, interpret flat/cumulative cost, compare allocation and retention, and validate changes under equivalent load.

They should collect profiles securely and account for sampling and runtime configuration.

## What a Staff Engineer should understand

A Staff Engineer should provide secure production profile collection, representative baselines, and shared performance-investigation practices.

They should ensure profiling is used to test hypotheses rather than institutionalize premature optimization.

Further reading: [Go diagnostics](https://go.dev/doc/diagnostics), [pprof](https://github.com/google/pprof).
