---
title: "Memory management and garbage collection"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Memory management covers allocation, object lifetime, reuse, and release of memory and other resources. Garbage collection (GC) automatically reclaims objects that are no longer reachable according to the language/runtime's model.

GC does not fix every memory problem. An object kept in a cache or referenced from a global data structure is still live even if the application no longer needs it. Process RSS also includes stacks, runtime metadata, native allocations, memory mappings, and pages retained by the allocator or operating system.

## Why it matters for backend engineers

Memory pressure causes latency, increased GC CPU, swapping or reclaim, and eventually container or host out-of-memory termination. Raising a memory limit can postpone failure while making the next incident larger.

Engineers need to separate high allocation rate from high retained memory. A service can allocate gigabytes per second while keeping only a small live heap, or slowly retain objects with a low allocation rate.

## How it works

Managed runtimes allocate objects on stack or heap according to escape/lifetime analysis and implementation rules. A tracing collector begins from roots—globals, stacks, runtime references—and discovers reachable heap objects. Objects not reachable can eventually be reclaimed.

Modern collectors try to perform much of their work concurrently with application execution. Collection still consumes CPU, memory bandwidth, and sometimes application-assist work. The runtime usually targets a balance between additional heap growth and GC frequency.

Allocation is not the same as RSS. Freed heap pages may remain reserved by the runtime/allocator for reuse or may be returned to the OS later. Native libraries can allocate memory outside the managed heap, so a heap profile alone does not explain every RSS increase.

Resources such as file descriptors and sockets also require explicit lifecycle; GC finalizers are not a reliable primary close mechanism.

## Key concepts

**Allocation rate.** Bytes or objects allocated per unit time. High rate increases collector work even if live memory remains stable.

**Live/retained heap.** Reachable objects after collection. Growth over a representative workload often indicates intentional state growth or retention.

**Logical leak.** Objects remain reachable through a cache, slice, map, goroutine, or callback even though the product no longer needs them.

**Fragmentation/caching.** Allocators reserve memory in size classes and arenas; RSS can exceed live object bytes.

**Memory limit.** Container/cgroup limits apply to process/container accounting, not just language heap. Leave room for stacks, native memory, and runtime overhead.

## Production example

An upload service receives 8 MB request buffers. To cache a small file signature, it stores a 32-byte slice referencing part of each original buffer. In the language's slice representation, the small view can keep the entire backing allocation reachable.

Heap retention grows with every upload even though the cache appears to contain only tiny entries.

A heap profile grouped by allocation stack shows large retained upload buffers. The team changes the cache to copy only the 32 required bytes into a right-sized allocation and bounds the number of entries.

A soak test runs the same upload distribution for hours. It compares live heap after GC, allocation rate, process RSS, GC CPU, and container memory. Live heap stabilizes and RSS reaches a steady range instead of growing without bound.

The team also checks goroutine profiles and native memory assumptions so it does not declare every RSS difference “the Go heap.”

## Trade-offs

Automatic GC simplifies ownership and prevents many manual-memory errors, but trades CPU and memory headroom for that convenience.

Lowering a runtime memory target can reduce peak heap while increasing GC work. Reducing allocation may improve CPU even when live memory stays the same. Object pooling can help specific hot allocations but can also retain too much memory and complicate ownership.

## Failure modes / pitfalls

Unbounded caches and maps are the most common logical leaks. Goroutines waiting forever can retain entire request graphs.

Confusing RSS with live heap leads to ineffective GC tuning. Relying on finalizers to close files or sockets can exhaust external resources before the collector runs.

Tuning GC aggressiveness before identifying whether growth is live, transient, or native makes diagnosis harder.

## When to use it

Use memory/GC analysis when heap, RSS, allocation rate, GC CPU, or OOM behavior affects service objectives.

Collect profiles and runtime metrics under representative workload before changing collector settings.

## When not to use it

Do not micro-optimize allocations on cold paths without evidence. Do not treat every large RSS as a leak.

If the dominant memory is a deliberate in-memory dataset, capacity/data-model changes may matter more than runtime tuning.

## What a Senior Engineer should know

A Senior Engineer should distinguish allocations from live heap and RSS, read heap profiles, bound caches/goroutines, and release external resources explicitly.

They should validate memory changes with soak tests and container-level metrics, not only a short benchmark.

## What a Staff Engineer should understand

A Staff Engineer should define service memory budgets that include heap, stacks, native/runtime overhead, recovery bursts, and workload skew.

They should establish fleet practices for profiling, limits, and safe tuning so teams do not solve memory incidents by repeatedly increasing limits.

Further reading: [Go GC guide](https://go.dev/doc/gc-guide/), [Go diagnostics](https://go.dev/doc/diagnostics).
