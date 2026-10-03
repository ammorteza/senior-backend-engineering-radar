---
title: "Caching strategies"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A cache stores a reusable copy of data or computation closer to where it is consumed so repeated requests avoid slower or more expensive work. Caches exist in-process, in distributed stores such as Redis, in HTTP clients and CDNs, and inside databases and operating systems.

Caching is not only a performance technique. It changes consistency, failure behavior, memory pressure, and the load seen by the authoritative source. Every cache needs an answer to four questions: what identifies an entry, how fresh may it be, how is it invalidated, and what happens when the cache is empty or unavailable?

## Why it matters for backend engineers

A cache can reduce database traffic by an order of magnitude, but it can also hide a capacity problem until one restart sends the full workload back to the source. A stale authorization cache can grant access too long; a hot key can overload one shard; a synchronized TTL can create a thundering herd.

The most dangerous cache incident is often not “the cache is down.” It is “the cache is down and the database was never sized for the miss path.”

## How it works

In **cache-aside**, the application checks the cache first. On a miss it reads the authoritative source and stores the result. Writes usually update the source and then invalidate or update the cached representation.

In **read-through/write-through** designs, a cache layer participates more directly in loading or writing data. These can centralize behavior but add coupling to the cache technology and its failure semantics.

Entries normally have a TTL that bounds reuse. TTL does not guarantee freshness: data can become stale immediately after being cached. Invalidation on writes reduces that window but must cover every writer and every derived key.

For hot values, request coalescing or single-flight behavior lets one request refill while peers wait. In a fleet, in-process single-flight only coordinates one process, so the authoritative store still needs enough protection for misses across many replicas.

Negative caching stores “not found” or another absence result. This can protect the source from repeated misses but must use shorter or deliberately chosen freshness because a newly created object may remain hidden until expiry.

## Key concepts

**Cache key.** It must include every dimension that changes the representation: tenant, locale, permissions, query version, or feature state as appropriate. An incomplete key can leak or mix data.

**TTL and jitter.** TTL bounds reuse; random jitter spreads expirations so many related keys do not miss simultaneously.

**Invalidation.** Delete or refresh affected entries when authoritative state changes. If invalidation can be lost, TTL becomes the final staleness bound.

**Stampede protection.** Coalescing, locks, or stale-while-revalidate reduce concurrent refill. The mechanism itself needs timeouts so a stuck loader does not block everyone indefinitely.

**Eviction.** Capacity eviction is different from TTL expiry. A memory-limited cache can remove popular data earlier than its TTL.

## Production example

A catalog service caches product details for five minutes. One product is extremely popular. At exactly 10:00 its cache entry expires on hundreds of application instances, which all query PostgreSQL at once. Database CPU spikes and request latency follows.

The team changes three things. First, it adds distributed or source-protecting refill control so only a bounded number of misses reach PostgreSQL. Second, it adds TTL jitter so different entries do not synchronize. Third, it allows a short stale-while-revalidate period for catalog data because displaying a slightly old description is acceptable.

Price and inventory are treated differently because their staleness requirements are stricter. The cache key includes tenant or market where those values differ.

A failure test flushes the entire cache during representative traffic. The database admission limits keep it within safe capacity and the service degrades rather than generating an uncontrolled refill storm. Metrics track hit rate, miss latency, source requests, stale responses, and refill errors.

## Trade-offs

Long TTLs improve hit rate and reduce source load but increase staleness. Short TTLs improve freshness while decreasing cache value and increasing miss pressure.

Distributed caches share entries across a fleet but introduce network and infrastructure failure. In-process caches are extremely fast but duplicate memory and invalidate independently.

Serving stale data can improve availability, but only where the product can tolerate the age. Security or entitlement decisions often require a much stricter policy than catalog metadata.

## Failure modes / pitfalls

Treating the cache as an accidental source of truth makes recovery impossible after eviction. Missing invalidation from one writer creates inconsistent behavior that persists until TTL.

Caching large objects can cause memory fragmentation or eviction churn. Hot keys can overload one cache shard even when total cluster utilization is low.

Caching errors indefinitely, caching tenant-sensitive responses under incomplete keys, or letting a cache outage dump unlimited traffic onto the database are common high-impact failures.

## When to use it

Use caching when access is repeated, the source is meaningfully slower or more expensive, and the product can define acceptable staleness and miss behavior.

Validate the full miss path before relying on a high hit rate for capacity.

## When not to use it

Do not add a cache simply because Redis is available. If the underlying query is cheap and correctness needs immediate visibility, the extra consistency state may cost more than it saves.

Do not use caching to avoid fixing an obviously inefficient data model or unbounded query without understanding whether the underlying problem remains.

## What a Senior Engineer should know

A Senior Engineer should design keys, TTLs, invalidation, negative caching, stampede protection, and eviction behavior. They should measure hit rate together with source load and test cold-cache recovery.

They should identify which data may be stale and for how long, rather than apply one cache policy to every endpoint.

## What a Staff Engineer should understand

A Staff Engineer should decide where caching belongs—client, edge, service, or data layer—and how fleet-wide cache loss affects capacity.

They should define organization-wide patterns for invalidation ownership, sensitive-data caching, and cold-start protection while challenging caches that merely hide unresolved source bottlenecks.

Further reading: [RFC 9111 HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111), [Redis eviction](https://redis.io/docs/latest/develop/reference/eviction/).
