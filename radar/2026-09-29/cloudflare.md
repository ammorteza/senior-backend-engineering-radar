---
title: "Cloudflare"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Cloudflare provides an edge platform spanning authoritative DNS, proxy/CDN, security controls and compute products. Each enabled product changes a different part of request handling.

## Why it matters for backend engineers

A proxied domain can behave differently from a DNS-only record. Teams need to know where TLS terminates, which caching rules apply and how the origin is protected.

## How it works

DNS directs traffic according to record configuration. Proxied requests pass through Cloudflare's edge, which applies selected routing, caching and security policy before contacting the origin. Workers can execute edge application logic under runtime constraints. Product-specific storage and compute guarantees should be assessed separately rather than generalized across the platform.

## Key concepts

Cache keys, origin authentication and trusted forwarding headers define correctness. WAF rules can block legitimate clients. Edge runtime limits and geographic data handling affect application design. Provider availability is not a replacement for a healthy origin.

## Production example

A public status site caches static assets at the edge but fetches incident data under a short freshness policy. The origin accepts intended traffic and validates forwarded identity assumptions. A WAF change is tested against synthetic legitimate clients before broader enforcement, avoiding an accidental API outage.

## Trade-offs

Integrated edge services simplify global delivery. Provider-specific configuration and APIs increase coupling; debugging spans both edge and origin telemetry.

## Failure modes / pitfalls

Caching private responses, exposing an unprotected origin, trusting spoofable headers and changing security rules without traffic tests cause failures.

## When to use it

Evaluate Cloudflare for concrete DNS, edge delivery, protection or compute needs.

## When not to use it

Do not move stateful workloads to edge compute without checking runtime, storage and residency constraints.

## What a Senior Engineer should know

Distinguish enabled products and trace a request through their policies.

## What a Staff Engineer should understand

Choose edge ownership, fallback and coupling strategy for critical public endpoints.

Further reading: [Cloudflare documentation](https://developers.cloudflare.com/).
