---
title: "Containers"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Containers package a process and its userspace while using operating-system isolation mechanisms such as namespaces and cgroups. Unlike a virtual machine, a normal Linux container shares the host kernel.

The image describes the filesystem and metadata used to start the workload; the running container adds writable state, process state, mounts, network interfaces, and resource controls.

## Why it matters for backend engineers

Container behavior explains many production surprises: an application loses files after replacement, receives SIGTERM but does not stop, is OOM-killed even though its language heap looks smaller than the limit, or cannot write a mounted volume because of UID mismatch.

A container is also not automatically a security sandbox for hostile code. Shared-kernel isolation, capabilities, mounts, and host interfaces determine the actual boundary.

## How it works

An OCI-compatible runtime unpacks image layers and starts a process using configured namespaces, cgroups, capabilities, filesystem mounts, environment, user IDs, and networking.

Namespaces isolate views such as process IDs, mount points, user IDs, and network interfaces. Cgroups account for and constrain CPU and memory. Linux capabilities split some root privileges into narrower units, although a privileged container can bypass much of the intended isolation.

Images are content-addressed layer graphs. A writable container layer sits above them but is normally ephemeral. Durable state belongs in external stores or explicitly managed persistent volumes.

PID 1 inside the container has special signal and child-process responsibilities. If the application or entrypoint does not forward signals and reap children correctly, graceful shutdown can fail.

## Key concepts

**Image versus container.** An image is immutable packaged content; a container is a running process environment created from it.

**Namespaces.** Isolate resource views; they are not a complete authorization model.

**Cgroups.** Account for and limit resources such as CPU and memory.

**Capabilities.** Reduce the need for full root privilege. Drop capabilities not required by the workload.

**Ephemeral filesystem.** Container replacement discards the writable layer unless external persistence is explicitly mounted.

**User identity.** Running as non-root reduces impact, but host-mounted files still depend on numeric UID or mapping behavior.

## Production example

A report worker writes generated PDFs under `/app/output` and then updates the database to “ready.” During a node drain the container disappears and the filesystem is lost, leaving database rows that point to nonexistent reports.

The design changes so the worker writes the PDF to object storage first, verifies upload completion, and only then marks the database row ready. Local disk is used only for bounded temporary files.

The container runs as a non-root user, with a read-only root filesystem and one writable temp mount. Resource requests and limits match measured workload needs.

On SIGTERM the worker stops claiming new jobs, waits for current work within the platform grace period, and leaves unfinished jobs recoverable by the queue or job store.

A deployment test replaces containers while jobs run and verifies no durable output depends on the writable layer.

## Trade-offs

Containers improve packaging consistency, density, and orchestration integration. They introduce image supply-chain work, shared-kernel security assumptions, and runtime networking/resource complexity.

Minimal images reduce attack surface and transfer size but remove interactive debugging tools; organizations need a supported diagnostic path rather than installing tools ad hoc in production containers.

## Failure modes / pitfalls

Running as root or privileged, mounting the host Docker socket, and broad hostPath mounts weaken isolation dramatically.

Ignoring memory limits leads to OOM termination; sizing only from language heap misses stacks, native memory, and page cache accounting.

Writing durable state to the container layer, using mutable image tags, and failing to handle termination signals produce operational failures.

## When to use it

Use containers when reproducible process packaging, isolation, and orchestration are useful for the workload.

Keep durable state and identity outside the ephemeral runtime unless the storage contract explicitly persists it.

## When not to use it

Do not treat an ordinary container as a strong hostile-code sandbox. Do not containerize solely for fashion when the target runtime already provides a simpler deployment unit.

Do not move stateful software into containers without understanding storage, identity, and failover semantics.

## What a Senior Engineer should know

A Senior Engineer should understand images, layers, namespaces, cgroups, users and capabilities, mounts, PID 1, signals, and ephemeral storage.

They should diagnose container-specific resource and permission failures without confusing them with application bugs.

## What a Staff Engineer should understand

A Staff Engineer should define image governance, isolation strength, runtime security defaults, resource policy, persistent-storage patterns, and production diagnostic access across the platform.

They should choose when containers are the right unit and when stronger isolation such as VMs or sandboxed runtimes is required.

Further reading: [OCI Runtime Specification](https://github.com/opencontainers/runtime-spec), [Linux namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html).
