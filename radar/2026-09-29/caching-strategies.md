---
title: "Caching strategies"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A cache stores data closer to where it is consumed so repeated access can avoid slower or more expensive computation or storage. Caches can exist in-process, in distributed stores, at HTTP/CDN layers or inside databases and operating systems.

Caching is fundamentally a consistency and lifecycle problem, not merely a speed optimization.

## Why it matters for backend engineers

Caches can dramatically reduce latency and database load, but stale data, hot keys and invalidation failures can create subtle correctness incidents.

Backend engineers need to know when caching changes the system's semantics and when a cache failure will unexpectedly overload the source of truth.

## How it works

In cache-aside, the application checks the cache, reads the authoritative store on a miss and populates the cache. Write-through updates the cache as part of the write path. Other designs refresh asynchronously or cache results at HTTP boundaries.

Entries need an identity, TTL and invalidation strategy. Capacity policies determine which entries are evicted.

Distributed caches introduce their own network, replication and availability behavior.

## Key concepts

### Cache-aside
The application owns read-through population and invalidation behavior.

### TTL
Time-to-live limits staleness and bounds how long abandoned data remains.

### Invalidation
Writes may delete or update cached values. Correct invalidation is often harder than population.

### Cache stampede
Many callers miss the same hot key simultaneously and overwhelm the source.

### Hot key
A small number of keys receive disproportionate traffic and can overload one cache shard.

### Negative caching
Caching "not found" responses can protect a backing store, but stale absence has semantics too.

## Production example

A product API caches catalog entries in Redis for five minutes. A popular key expires during peak traffic and thousands of requests simultaneously query PostgreSQL.

The service introduces request coalescing or single-flight behavior, adds TTL jitter so related keys do not expire together, and monitors cache hit rate and backing-store traffic. Critical updates explicitly invalidate relevant entries.

## Trade-offs

Caching lowers latency and source load at the cost of stale data, extra infrastructure and invalidation complexity.

Long TTLs improve hit rate but increase staleness. Short TTLs improve freshness but reduce cache value and can create synchronized misses.

## Failure modes / pitfalls

Common failures include treating cache as source of truth accidentally, stampedes, hot keys, oversized values, missing eviction policy, stale authorization data and cache outages that immediately overload the database.

Caching errors indefinitely is another dangerous pattern.

## When to use it

Use caching when reads are repeated, the source is meaningfully slower or more expensive, and the application can define acceptable staleness.

## When not to use it

Do not cache merely because Redis exists. If the underlying query is already cheap or data must be immediately consistent, caching may add more risk than value.

## What a Senior Engineer should know

A Senior Engineer should choose cache keys, TTLs, invalidation and eviction deliberately and understand cache-aside, stampede protection, hot keys and failure behavior.

They should monitor hit rate together with source load and latency.

## What a Staff Engineer should understand

A Staff Engineer should reason about caching as part of system consistency and capacity. They should design behavior when the cache disappears, establish ownership of invalidation and determine where caching belongs: client, edge, service or data layer.

They should challenge caches that compensate for unresolved data-model or query problems.
