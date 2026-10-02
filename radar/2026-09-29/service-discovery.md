---
title: "Service discovery"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Service discovery maps a logical service identity to its currently available endpoints. It bridges stable names and changing process locations.

## Why it matters for backend engineers

Pods and hosts are replaced routinely. Hard-coded IPs or stale endpoint caches can strand clients on removed instances even while the service has healthy replacements.

## How it works

Servers or controllers register endpoints; clients query DNS or a registry, or connect through a stable proxy. Health information determines eligible destinations. Client-side discovery distributes endpoint selection to callers; server-side discovery centralizes it in a routing layer. Existing connections may persist after discovery data changes.

## Key concepts

Registration differs from readiness. TTLs and watch updates determine freshness. Endpoint removal should align with graceful termination. Discovery failure requires a policy for using cached endpoints versus failing closed.

## Production example

A headless Kubernetes Service returns pod addresses. A client resolves once at startup and keeps calling a deleted pod. The team adopts supported re-resolution and connection draining, or routes through a stable Service endpoint. Rollout tests verify new requests leave terminating instances.

## Trade-offs

Client-side routing can expose topology and reduce proxy hops. It spreads refresh and balancing logic across libraries. Proxies centralize policy but become another operated layer.

## Failure modes / pitfalls

Stale caches, healthy-but-unready registration and assuming DNS changes existing sockets cause outages.

## When to use it

Use discovery for dynamically scheduled services and managed endpoints whose physical location changes.

## When not to use it

Do not build a bespoke registry when platform naming and routing already meet requirements.

## What a Senior Engineer should know

Trace name resolution, endpoint health, refresh behavior and connection reuse separately.

## What a Staff Engineer should understand

Define stable identities, topology policy and discovery failure behavior across clients.

Further reading: [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/).
