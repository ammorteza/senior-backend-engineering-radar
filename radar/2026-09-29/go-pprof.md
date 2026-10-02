---
title: "Go pprof"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

pprof captures statistical profiles of Go programs and helps locate where CPU time, allocations, blocking or retained memory concentrate. Different profiles answer different questions.

## Why it matters for backend engineers

Guessing from slow endpoints often leads to optimizing the wrong function. A heap profile can distinguish retained objects from an allocation-heavy path that merely makes the collector work harder.

## How it works

CPU profiling samples active stacks over an interval. Heap profiles report sampled allocation stacks; `inuse_space` emphasizes retained bytes, while `alloc_space` emphasizes cumulative allocation. Goroutine profiles show current stacks. Mutex and block profiles require appropriate sampling configuration and help investigate contention rather than CPU execution alone.

## Key concepts

Flat cost belongs directly to a function; cumulative cost includes descendants. Sampling creates uncertainty for short or rare paths. Comparisons need similar workloads and collection settings. Symbols and the correct binary improve attribution.

## Production example

A document-rendering service consumes high CPU. A representative CPU profile points to repeated JSON encoding; allocation profiles show temporary buffers rather than a growing retained heap. Reusing already-serialized immutable input reduces work. A benchmark and production comparison verify the reduction without assuming every allocation is a leak.

## Trade-offs

Profiles provide actionable attribution with generally manageable overhead. Aggressive contention sampling or long captures can still affect the service; isolated profiles lack full request chronology.

## Failure modes / pitfalls

Public debug endpoints can disclose sensitive runtime information. Idle captures, mismatched binaries and optimizing one profile without checking workload differences produce misleading conclusions.

## When to use it

Use pprof for CPU, allocation, retention, goroutine and lock investigations with a reproducible symptom.

## When not to use it

For exact scheduling sequences or request causality, complement profiles with traces rather than expecting samples to reconstruct every event.

## What a Senior Engineer should know

Choose the profile matching the hypothesis, read flat/cumulative views and validate changes under equivalent load.

## What a Staff Engineer should understand

Provide secure collection paths, representative baselines and a fleet-wide performance investigation practice.

Further reading: [Go diagnostics](https://go.dev/doc/diagnostics), [pprof](https://github.com/google/pprof).
