---
title: "Containers"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Containers isolate processes using operating-system mechanisms while packaging their userspace in images. They share a host kernel rather than behaving like complete virtual machines.

## Why it matters for backend engineers

Container CPU, memory, filesystems and networking differ from a developer shell. These differences explain OOM kills, permission errors and signal-handling problems in otherwise healthy code.

## How it works

A runtime unpacks image layers and launches a process with namespaces and cgroup controls. Namespaces isolate selected views such as process IDs and networking; cgroups account for and limit resources. Writable layers are usually ephemeral. Image registries distribute manifests and content-addressed layers.

## Key concepts

PID 1 has special signal and child-reaping behavior. User IDs govern mounted-file access. A read-only root filesystem reduces mutation but still needs designated writable paths. Image architecture must match the runtime platform.

## Production example

A worker writes generated reports into its container filesystem and loses them when the pod is replaced. It moves durable output to object storage and uses a bounded temporary directory for intermediate files. The process handles termination, stops accepting jobs and records incomplete work before exit.

## Trade-offs

Packaging improves portability and deployment repeatability. Shared-kernel isolation is weaker than a separate VM boundary, and images still need patching and provenance control.

## Failure modes / pitfalls

Running as root, mounting host paths or sockets, ignoring memory limits and storing durable state in writable layers undermine the intended model.

## When to use it

Use containers for reproducible process packaging and supported runtime isolation.

## When not to use it

Do not treat an ordinary container as an automatic sandbox for hostile code or a substitute for durable storage.

## What a Senior Engineer should know

Understand images, mounts, users, signals, namespaces and cgroups.

## What a Staff Engineer should understand

Choose isolation strength, image governance and resource policy appropriate to tenancy and risk.

Further reading: [OCI runtime specification](https://github.com/opencontainers/runtime-spec), [Linux namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html).
