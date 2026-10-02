---
title: "Go execution tracer"
ring: trial
segment: tools
tags: [backend]
---

## What it is

The Go execution tracer records runtime events over time: goroutine scheduling, blocking, network waits, garbage collection and user-defined regions. It exposes chronology that aggregate profiles hide.

## Why it matters for backend engineers

High latency with low CPU may come from runnable goroutines waiting for execution or workers blocked behind synchronization. A CPU flame graph alone will not show that waiting clearly.

## How it works

A trace records events during a bounded capture and is analyzed with `go tool trace`. Views show goroutine transitions, processors and runtime work. User tasks, regions and logs connect application operations to runtime activity without turning the trace into a complete distributed tracing system.

## Key concepts

Runnable differs from running. Blocking on a channel differs from network-poller waiting. GC assistance can charge allocation-related work to application goroutines. Trace size and runtime support vary by Go version, so collection should follow the deployed toolchain.

## Production example

A batch API's tail latency spikes while CPU averages remain moderate. A trace reveals a burst of runnable goroutines following a shared gate, competing for available processors. Bounding fan-out and spreading starts reduces the scheduling burst. Subsequent captures check runnable delay rather than only average CPU.

## Trade-offs

Detailed chronology is powerful but produces substantial data and needs a representative capture window. Profiles remain simpler for identifying sustained hotspots.

## Failure modes / pitfalls

Capturing only a quiet interval, omitting application regions and assuming every blocked goroutine is unhealthy can waste investigation time. Keep trace files access-controlled.

## When to use it

Use the tracer when scheduler behavior, GC interaction or blocking chronology is the unresolved question.

## When not to use it

Do not collect large traces continuously without a supported collection design and storage budget.

## What a Senior Engineer should know

Read scheduling states and correlate them with bounded application regions.

## What a Staff Engineer should understand

Make low-impact incident captures available and distinguish runtime traces from cross-service tracing strategy.

Further reading: [runtime/trace](https://pkg.go.dev/runtime/trace).
