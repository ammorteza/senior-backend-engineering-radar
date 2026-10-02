---
title: "Redis"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Redis is an in-memory data-structure server supporting strings, hashes, sets, sorted sets and other structures. Persistence and replication are configurable, so durability must be assessed for the selected deployment.

## Why it matters for backend engineers

Redis can make repeated access fast, but eviction, failover and hot keys affect application semantics. A cache disappearing must not automatically overwhelm the authoritative database.

## How it works

Clients send commands to the responsible server. Commands execute under Redis's documented atomicity model; scripts can combine operations but must remain bounded. RDB snapshots and AOF logging offer different recovery behavior. Replication is normally asynchronous. Cluster partitions keys across hash slots, constraining multi-key operations across slots.

## Key concepts

TTL expiration differs from capacity eviction. `maxmemory` and eviction policy determine what happens at the configured budget. Hash tags can colocate related keys but create hotspots. Persistence buffers and other overhead require memory headroom beyond stored values.

## Production example

A session cache grows beyond its budget and evicts active sessions under an unintended policy. The team isolates session storage from disposable catalog caching, sets deliberate limits and tests failover/session behavior. Catalog misses are coalesced and rate-controlled so a cold cache cannot overload PostgreSQL.

## Trade-offs

Low latency and useful structures simplify some workloads. Memory is costly, and asynchronous replication leaves data-loss windows. Redis is not automatically a durable source of truth.

## Failure modes / pitfalls

Large blocking operations, hot keys, unlimited TTLs, oversized values and mixed critical/disposable data cause failures.

## When to use it

Use Redis for bounded caches and data-structure workloads with explicit persistence and loss semantics.

## When not to use it

Do not depend on an evictable cache for authoritative financial state.

## What a Senior Engineer should know

Understand command complexity, TTLs, eviction, persistence and cluster slot behavior.

## What a Staff Engineer should understand

Define storage roles, failover guarantees and cold-cache capacity across consumers.

Further reading: [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), [Eviction](https://redis.io/docs/latest/develop/reference/eviction/).
