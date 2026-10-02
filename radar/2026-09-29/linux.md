---
title: "Linux"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Linux provides the process, filesystem, networking and resource machinery underlying many backend deployments. Operational literacy means forming a hypothesis before collecting commands and output.

## Why it matters for backend engineers

Low CPU does not mean a process is healthy. It may be waiting on storage, a lock or a socket; the host can also be constrained by file descriptors or memory pressure.

## How it works

Processes execute threads, access files through descriptors and communicate through sockets. The kernel schedules runnable tasks, caches file data and enforces permissions and resource limits. Signals request actions such as termination. Containers expose restricted views of the same underlying kernel mechanisms.

## Key concepts

RSS differs from virtual address space and includes more than the language heap. Load average is not simply CPU utilization. File descriptors include sockets. Page cache is reclaimable memory, not automatically a leak. Process namespaces alter which PIDs tools can see.

## Production example

An API fails to open connections despite idle CPU. Inspecting descriptor counts and limits reveals response-body leaks exhausting the process limit. Closing responses correctly fixes the leak; increasing the limit alone would only delay failure. Metrics track descriptors relative to the configured cap.

## Trade-offs

Kernel tools offer broad visibility but may require privileges and context. Minimal images reduce local tooling, so approved debug containers or node-level collection may be needed.

## Failure modes / pitfalls

Killing processes before collecting evidence, interpreting host metrics as container limits and dumping sensitive `/proc` data can harm diagnosis or security.

## When to use it

Use Linux knowledge when distinguishing application, process and host constraints during incidents.

## When not to use it

Do not issue destructive cleanup or tuning commands without understanding their target namespace and effect.

## What a Senior Engineer should know

Navigate processes, signals, descriptors, sockets and resource pressure with focused tools.

## What a Staff Engineer should understand

Provide safe production access, resource defaults and diagnostic paths across containerized environments.

Further reading: [Linux man-pages](https://www.kernel.org/doc/man-pages/).
