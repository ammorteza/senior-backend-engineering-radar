---
title: "Docker"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Docker is a toolchain for building OCI-style images and running containers. Dockerfiles describe image construction as ordered instructions, while the runtime configures process, filesystem, environment, mounts, and networking.

For backend engineers the most important Docker work is artifact construction: producing a small, reproducible, non-secret-containing runtime image that behaves correctly under container lifecycle rules.

## Why it matters for backend engineers

A container image can work locally while being insecure or unreliable in production. Build context can accidentally include credentials, mutable base tags can change underneath the same source commit, and a shell-form entrypoint can interfere with signal delivery.

Images also become part of the software supply chain. The deployed artifact should be traceable to reviewed source and a known base/dependency set.

## How it works

Docker build sends a build context and executes Dockerfile instructions through the build engine. Each step can produce cacheable content and filesystem layers.

Multi-stage builds let compilation happen in one stage while the final stage receives only runtime artifacts. BuildKit supports secret and cache mounts so credentials or compiler caches do not have to become image-layer content.

`COPY` copies files from build context or another stage. `.dockerignore` reduces context size and the risk of accidentally sending irrelevant sensitive files.

Exec-form `ENTRYPOINT` or `CMD` launches the intended executable directly, making signal behavior more predictable than wrapping everything through a shell.

Runtime mounts, environment variables, networks, users, and resource controls are not “baked into” the immutable image in the same way as its filesystem.

## Key concepts

**Build context.** Every file available to the build may affect caching or be accidentally copied. Keep it small.

**Layer history.** Copying a secret and deleting it later can leave the bytes in an earlier layer. Use build-secret mechanisms instead.

**Multi-stage build.** Separates compilers and source from the final runtime image.

**Base-image pinning.** Tags are movable. Pin to reviewed versions or digests according to update policy while still applying security updates deliberately.

**Architecture.** Multi-platform images may contain separate manifests for amd64 and arm64. Test the architecture actually deployed.

## Production example

A Go service uses one Dockerfile stage containing the Go compiler, Git, source code, module cache, and final binary. The image is more than 1 GB and runs as root.

The build is changed to two stages. The builder downloads dependencies using a cache mount, compiles a static or appropriately linked binary, and runs tests. The final image contains only the binary, CA certificates, timezone data if required, and a non-root user.

A private dependency token is supplied through a build secret rather than an `ARG` or copied file, so it never becomes a layer.

CI builds for the target architecture, scans or records the image SBOM/provenance according to repository policy, runs the container, verifies TLS connectivity, and tests SIGTERM handling.

The team does not assume a “distroless” or scratch-like image is automatically correct: if the application requires CA roots or libc behavior, those runtime dependencies are explicit.

## Trade-offs

Small runtime images reduce transfer time and unnecessary tools. Extremely minimal images make emergency interactive debugging harder and can omit required certificates or libraries.

Build caching speeds CI but can hide dependency changes if inputs are underspecified. Reproducible builds require pinned inputs and controlled tooling, not merely cache reuse.

## Failure modes / pitfalls

Secrets in `ARG`, `ENV`, copied files, or layers can persist. Mutable base tags create silent changes.

Shell-form entrypoints can receive signals indirectly. Root users, writable root filesystems, unnecessary packages, and broad runtime mounts increase risk.

Building only on amd64 can hide architecture failures on arm64 production nodes.

## When to use it

Use Docker to build and locally exercise reviewed container artifacts for Kubernetes, managed container services, and development environments.

Treat the Dockerfile as production build code with tests and review.

## When not to use it

Do not mount the host Docker socket or run privileged containers purely for convenience without acknowledging the host-level trust this grants.

Do not wrap a deployment in Docker if the target platform already expects a simpler artifact and the container adds no value.

## What a Senior Engineer should know

A Senior Engineer should write multi-stage Dockerfiles, control context and secrets, inspect image layers, debug entrypoints and mounts, and test architecture and signal behavior.

They should distinguish build-time artifacts from runtime configuration and avoid making image size the only optimization target.

## What a Staff Engineer should understand

A Staff Engineer should define base-image lifecycle, image provenance, registry retention, vulnerability response, multi-architecture policy, and production diagnostic practices.

They should ensure common image templates improve defaults without preventing teams from understanding what actually ships.

Further reading: [Docker build best practices](https://docs.docker.com/build/building/best-practices/), [Build secrets](https://docs.docker.com/build/building/secrets/).
