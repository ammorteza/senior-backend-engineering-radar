---
title: "Memory management and garbage collection"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Memory management governs allocation, object lifetime and reclamation. Garbage collection reclaims unreachable objects; it does not remove objects that application structures still reference unnecessarily.

## Why it matters for backend engineers

An apparent leak may be a growing cache, retained buffers or non-heap memory. Raising a memory limit without identifying retention can make the next failure larger.

## How it works

Allocation creates objects in stack or heap storage under language/runtime rules. A tracing collector finds live objects from roots and reclaims unreachable ones. Concurrent collection reduces pauses but still consumes CPU and may involve application assistance. Native libraries, stacks and mapped files can consume memory outside the managed heap.

## Key concepts

Allocation rate differs from retained heap size. Reachable-but-unused objects are logical leaks. Fragmentation and allocator caching complicate RSS. Soft runtime memory targets are not identical to operating-system container limits.

## Production example

A service retains tiny slices from multi-megabyte upload buffers in a cache. The collector sees the backing arrays as reachable. Heap profiles point to upload allocation stacks; copying only the required bytes and bounding cache entries reduces retention. A soak test checks both heap and RSS.

## Trade-offs

Automatic reclamation simplifies coding but trades CPU and latency for memory. Lower memory targets may increase collection work; fewer allocations may improve throughput even without reducing retained state.

## Failure modes / pitfalls

Unbounded caches, hidden references, finalizer-dependent cleanup and confusing RSS with live heap lead to wrong fixes. File handles need explicit lifecycle management.

## When to use it

Use allocation and retention evidence when investigating memory growth or GC-heavy latency.

## When not to use it

Do not tune collector settings before identifying whether growth is intended live data, retained garbage or non-heap usage.

## What a Senior Engineer should know

Compare allocation and live-memory profiles; bound caches and release external resources explicitly.

## What a Staff Engineer should understand

Define service memory budgets including runtime, native and recovery overhead.

Further reading: [Go GC guide](https://go.dev/doc/gc-guide).
