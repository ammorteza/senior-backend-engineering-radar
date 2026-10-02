---
title: "Docker"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Docker provides tooling to build images and run containers. Dockerfiles describe layered builds; the runtime exposes process, filesystem and network configuration.

## Why it matters for backend engineers

A working image can still be unnecessarily large, leak credentials or behave differently across architectures. Build design affects both deployment speed and artifact security.

## How it works

Build instructions consume a context and create reusable layers. Multi-stage builds separate compilation tools from runtime files. The final image declares its command and metadata; runtime mounts and networks provide environment-specific resources. Build caching accelerates unchanged steps but is not proof of reproducibility.

## Key concepts

Pin base images and dependency inputs deliberately. `.dockerignore` narrows the context. Build secrets should use supported secret mounts rather than copying credentials into layers. Exec-form entrypoints simplify signal delivery.

## Production example

A Go image originally ships the compiler, source and package cache. A multi-stage build copies only the compiled binary and required certificates into a maintained runtime image. CI checks architecture, startup and TLS connectivity; it does not assume a minimal image automatically contains the trust store the application needs.

## Trade-offs

Small images reduce transfer and attack surface, but removing shells and diagnostics changes incident tooling. Caching improves speed while stale or uncontrolled inputs can hide drift.

## Failure modes / pitfalls

Secrets in layers, mutable base tags, incorrect build context, shell-form signal handling and architecture mismatch cause failures. Deleting a secret in a later layer does not erase the earlier layer.

## When to use it

Use Docker to create and exercise reviewed container artifacts locally and in CI.

## When not to use it

Do not run privileged containers or mount the host Docker socket simply for convenience without an appropriate trust boundary.

## What a Senior Engineer should know

Write multi-stage builds, inspect layers and debug mounts, networks and entrypoints.

## What a Staff Engineer should understand

Set base-image lifecycle, artifact provenance and production diagnostic practices.

Further reading: [Docker build best practices](https://docs.docker.com/build/building/best-practices/).
