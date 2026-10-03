---
title: "Go execution tracer"
ring: trial
segment: tools
tags: [backend]
---

## What it is

The Go execution tracer records a time-ordered stream of runtime events such as goroutine creation, scheduling, blocking, system calls, garbage collection, heap changes, and processor activity. `go tool trace` visualizes that chronology.

This is different from pprof. A CPU profile answers “where CPU samples accumulated”; the execution tracer answers “what was happening over time and why was this goroutine not running?”

## Why it matters for backend engineers

Tail latency can be high while average CPU looks moderate. Thousands of goroutines may become runnable at once and wait for processor time, or one synchronization point may release a burst that overloads the scheduler.

A CPU flame graph may show little about that waiting. The execution tracer makes runnable, running, blocked, syscall, and GC relationships visible.

## How it works

A program records runtime events for a bounded interval using `runtime/trace`, `go test -trace`, or the supported HTTP trace endpoint when enabled. The trace contains timestamps and stacks for many runtime events.

`go tool trace` provides timeline and analysis views. Engineers can inspect processor utilization, goroutine state transitions, network/syscall blocking, and GC work.

Application code can add tasks and regions to mark meaningful operations. These annotations help connect runtime activity to a batch, request stage, or worker loop. They are local-runtime annotations, not a replacement for cross-service distributed tracing.

Trace formats and tooling evolve with Go versions. Capture and analyze using a compatible Go toolchain and follow the documentation for the deployed version.

## Key concepts

**Runnable versus running.** A goroutine can be ready but waiting for a processor. Large runnable delay indicates scheduler contention even if no lock is held.

**Blocked.** Channel, synchronization, network, and syscall waiting have different causes and need separate interpretation.

**GC assist.** Application goroutines may perform garbage-collection work related to allocation pressure, appearing as latency on the allocating path.

**User tasks/regions.** Add semantic boundaries so a trace can answer which runtime activity belongs to the operation being investigated.

**Capture window.** Trace files become large. A short window containing the symptom is usually more useful than an indiscriminate long capture.

## Production example

A batch endpoint fans out 20,000 small goroutines at once. Average CPU is only 55%, but p99 latency spikes whenever a batch starts.

A trace captured across one spike shows a sudden growth in runnable goroutines and long scheduling delays. There is no single hot CPU function in pprof and no dominant mutex profile.

The team changes the implementation to a bounded worker pool and spreads work admission over time. A second trace under the same batch size shows fewer simultaneous runnable goroutines and much shorter scheduling delay. p99 latency also improves.

The trace therefore answers a chronology question—scheduler pressure caused by bursty fan-out—that aggregate CPU could not explain.

## Trade-offs

Execution traces provide detailed chronology but generate substantial data and are more intrusive than ordinary metrics. They are excellent for targeted diagnosis, poor as an always-on full-fidelity telemetry stream.

Adding user regions improves interpretation but requires instrumentation effort. pprof remains simpler for sustained CPU/allocation hotspots.

## Failure modes / pitfalls

Capturing a quiet period leads to the wrong conclusion. Treating every blocked goroutine as unhealthy ignores normal network and channel waits.

Very long traces are difficult to analyze and can add overhead. Missing application regions can make runtime behavior hard to map back to the product operation.

Trace files can contain function names and runtime information and should follow the same secure diagnostic-access practices as profiles.

## When to use it

Use the execution tracer when scheduler delay, goroutine blocking, GC interaction, or runtime chronology remains the unresolved performance question.

Pair it with metrics or pprof to decide whether the problem is CPU cost or waiting/scheduling.

## When not to use it

Do not run large continuous execution traces in production without a deliberate supported collection design.

Do not use it to follow work across service boundaries; distributed tracing is designed for that scope.

## What a Senior Engineer should know

A Senior Engineer should interpret runnable, running, blocked, syscall, and GC states and add bounded task/region annotations to important workflows.

They should capture representative windows and compare before/after traces under the same workload.

## What a Staff Engineer should understand

A Staff Engineer should make safe runtime-trace collection available for incidents, document toolchain compatibility, and distinguish execution tracing from service-level distributed tracing.

They should help teams choose the least intrusive diagnostic tool capable of answering the question.

Further reading: [runtime/trace](https://pkg.go.dev/runtime/trace), [Go diagnostics](https://go.dev/doc/diagnostics).
