---
title: "Content delivery networks"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

A CDN serves content from distributed edge locations and reduces work at the origin. Correctness depends on what identifies a cached representation and which responses may be shared.

## Why it matters for backend engineers

An incorrect cache key can disclose one user's response to another. Even a well-configured CDN can overwhelm an origin during cache misses or invalidation.

## How it works

An edge receives a request, selects a cache entry under its key and freshness rules, and fetches or revalidates against the origin when needed. HTTP cache directives, variants and CDN-specific policies govern reuse. Purges propagate under provider guarantees; they are not universal synchronous transactions.

## Key concepts

`Vary` and query/header policies distinguish representations. Private responses need deliberate exclusion or partitioning. TTL and stale-serving rules trade freshness against availability. Origin authentication prevents clients bypassing intended edge protections.

## Production example

A documentation site publishes assets with content-hashed names and long TTLs while HTML has shorter freshness. A new release points to new asset names, avoiding global purge dependency. A personalized account API is excluded from shared caching and tested with two identities.

## Trade-offs

Edges reduce latency and origin traffic. Cache invalidation, request normalization and provider-specific behavior add complexity; dynamic personalized requests may benefit less.

## Failure modes / pitfalls

Ignoring cookies or authorization in policy, inconsistent URL normalization, cache poisoning and simultaneous cold misses create security or capacity incidents.

## When to use it

Use CDNs for static assets and explicitly cacheable responses, with measured origin protection.

## When not to use it

Do not cache sensitive personalized data by default or assume all errors deserve the same TTL.

## What a Senior Engineer should know

Inspect cache headers, keys, hit/miss behavior and purge semantics.

## What a Staff Engineer should understand

Own edge/origin trust, cache correctness and capacity during regional misses or releases.

Further reading: [HTTP caching RFC 9111](https://www.rfc-editor.org/rfc/rfc9111).
