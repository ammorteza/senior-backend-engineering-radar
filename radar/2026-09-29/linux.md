---
title: "Linux"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Linux provides the process, filesystem, networking, scheduling, and resource primitives underlying many backend deployments. Backend engineers do not need to become kernel developers, but they should be able to move from a production symptom to the relevant process or host evidence safely.

Operational Linux literacy is hypothesis-driven: choose commands that answer a question instead of running a giant checklist and hoping one number looks unusual.

## Why it matters for backend engineers

A process can be unhealthy with low CPU because it is waiting on storage, a lock, DNS, or a socket. It can fail new connections because file descriptors are exhausted. A container can be throttled while the node appears idle.

During incidents, knowing how to inspect processes, sockets, descriptors, memory, and resource limits can distinguish application defects from host/runtime problems before engineers make risky changes.

## How it works

Linux represents running programs as processes containing threads, virtual memory, open file descriptors, signal state, credentials, and scheduling/resource attributes.

File descriptors reference files, sockets, pipes, event mechanisms, and other kernel objects. A process has limits on descriptors and other resources; exhausting them can break network and file operations.

Virtual memory maps address ranges to anonymous memory, files, shared libraries, stacks, and other mappings. RSS counts resident pages but is not equal to the language heap. The kernel page cache uses memory to speed file I/O and is reclaimable under pressure.

Sockets expose network endpoints and connection states. Tools such as `ss` can inspect listeners and established connections. `/proc` exposes process/kernel information; containers and namespaces can change which processes and interfaces are visible.

Signals such as `SIGTERM` request process actions. Well-behaved services use termination to stop admitting work, drain, and exit before orchestration deadlines rather than treating every termination as `SIGKILL`.

## Key concepts

**Load average.** Represents runnable and certain uninterruptible tasks over time; it is not “CPU percent.” Interpret with CPU count and wait reasons.

**RSS versus VSZ.** Virtual address space can be huge without equivalent resident memory. RSS includes more than managed heap and can include shared/file-backed pages.

**File descriptors.** Sockets count too. Track current usage relative to process/system limits.

**Page cache.** Linux uses free memory for caching; high “used” memory alone does not mean memory is leaking.

**Namespaces/cgroups.** Containers see constrained namespaces and resource accounting. A command inside a container may not represent the whole host.

**Signals.** `SIGTERM` is commonly used for graceful shutdown; `SIGKILL` cannot be handled and prevents cleanup.

## Production example

An API begins returning “too many open files” while CPU and heap remain normal. New outbound HTTP calls fail to create sockets.

The engineer checks the process descriptor limit and current descriptor count, then samples `/proc/<pid>/fd` or `lsof`/`ss` in an approved diagnostic environment. Most descriptors are outbound sockets in states consistent with connections not being released.

Code review finds an error path that returns before closing HTTP response bodies. Under one provider error rate, the leak steadily consumes descriptors.

The team fixes body cleanup, adds a regression test, and tracks open descriptors and active connections. Increasing `ulimit -n` alone would only delay recurrence.

During diagnosis they do not kill the process or delete files blindly. They collect enough evidence first, and they interpret descriptor counts from the same namespace/cgroup context as the failing service.

## Trade-offs

Host-level tools provide powerful evidence but can require elevated permissions and expose information from other workloads. Platform teams may prefer controlled debug containers or node agents to putting every diagnostic binary in production images.

Minimal images reduce attack surface and size while making ad hoc debugging harder. A documented debug path balances the two.

## Failure modes / pitfalls

Running destructive cleanup commands before understanding ownership can turn a recoverable incident into data loss. Killing a process before collecting evidence removes transient state that might explain the failure.

Host metrics can be misread for a cgroup-limited process. Page cache can be mistaken for a leak. A large VSZ can be mistaken for actual resident memory.

Dumping all of `/proc` or process environment can expose credentials; collect only the evidence required by the hypothesis.

## When to use it

Use Linux tools when symptoms suggest process, socket, descriptor, memory, scheduling, filesystem, or host constraints.

Start from the application's symptom and move one layer down, keeping commands read-only until the failure mechanism is understood.

## When not to use it

Do not tune kernel parameters or kill tasks merely because a generic troubleshooting checklist recommends it.

Do not assume the host is the correct scope in a containerized environment; inspect the relevant namespace and cgroup.

## What a Senior Engineer should know

A Senior Engineer should inspect processes, signals, descriptors, sockets, memory mappings, limits, and resource pressure with a small set of focused tools such as `ps`, `ss`, `top`, `vmstat`, `lsof`, and `/proc`.

They should understand what each metric does not prove and preserve evidence before mitigation.

## What a Staff Engineer should understand

A Staff Engineer should provide safe production diagnostic access, standardized resource limits, and node/container observability without requiring every service image to contain a full admin toolbox.

They should establish incident practices that balance evidence collection, permissions, and security across a containerized fleet.

Further reading: [Linux man-pages project](https://www.kernel.org/doc/man-pages/), [proc filesystem](https://docs.kernel.org/filesystems/proc.html).
