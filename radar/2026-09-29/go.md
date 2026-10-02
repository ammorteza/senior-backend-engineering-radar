---
title: "Go"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Go is a compiled, statically typed language with garbage collection and lightweight goroutines. Its small language surface and standard networking library suit services whose complexity lies in concurrent I/O rather than elaborate language abstractions.

## Why it matters for backend engineers

A service's behavior depends on goroutine lifetimes, allocation rate and resource ownership. Code that looks straightforward can leak goroutines or retain gigabytes through a small slice referencing a large backing array.

## How it works

The runtime schedules goroutines over operating-system threads using logical processors controlled by `GOMAXPROCS`. Blocking network I/O integrates with a poller; not every blocked goroutine occupies a thread. Channels exchange values and synchronize access, while mutexes protect shared state. Escape analysis decides which values require heap allocation; the collector reclaims unreachable heap objects.

## Key concepts

Interfaces express behavior and can contain a typed nil even when the interface itself is non-nil. Slices contain a pointer, length and capacity: copying a slice does not copy its elements. Contexts carry cancellation and deadlines; cancellation is cooperative. Ownership of channels and goroutines must be explicit.

## Production example

A file-processing API starts a goroutine per upload. Cancelled clients leave workers blocked sending results to an unread channel. The fix selects between result delivery and `ctx.Done()`, bounds worker concurrency, and closes files on every path. Goroutine profiles confirm workers disappear after cancellation; a load test checks memory reaches a plateau.

## Trade-offs

Garbage collection simplifies ownership but adds CPU and memory overhead. Goroutines simplify concurrent I/O but do not bound concurrency. Go's explicit error handling favors clarity while requiring discipline to preserve useful error context.

## Failure modes / pitfalls

Watch for concurrent map writes, copying locks, unbounded goroutine creation, deferred cleanup inside long loops, and assuming `append` always allocates. A race-free program can still have logical concurrency bugs.

## When to use it

Choose Go for network services, infrastructure tools and concurrent workers when deployment simplicity and a mature standard library fit the team's needs.

## When not to use it

Reconsider it for workloads dominated by specialized numerical ecosystems or strict hard-real-time guarantees. A familiar language can be a better choice than rewriting a healthy service.

## What a Senior Engineer should know

Understand slice aliasing, interfaces, cancellation, synchronization and allocation. Use race detection, benchmarks, pprof and escape-analysis output to test performance explanations.

## What a Staff Engineer should understand

Establish runtime upgrade, dependency and profiling practices. Judge whether service conventions bound concurrency and make ownership visible across team boundaries.

Further reading: [Effective Go](https://go.dev/doc/effective_go), [Go memory model](https://go.dev/ref/mem), [GC guide](https://go.dev/doc/gc-guide).
