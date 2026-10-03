---
title: "Redis"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Redis is a server for in-memory data structures such as strings, hashes, sets and sorted sets. Applications use it for caches, counters, rankings and other operations that benefit from low-latency access to a bounded working set. It also offers persistence and replication, whose configured behavior must match the role of the data.

“Stored in Redis” does not establish whether information is disposable, durable or protected from eviction. A catalog cache and a session-revocation record may both be keys, but losing them has very different consequences. Define that role before selecting settings.

## Why it matters for backend engineers

Redis can remove substantial work from a database, but it can also become a hidden correctness dependency. Expiry, capacity eviction, restart and failover are distinct ways a key can disappear or revert to older state.

Backend engineers also control the cost of commands. An in-memory server is not immune to large scans, huge values or a hot key receiving most traffic. One expensive operation can affect unrelated callers sharing the execution and memory resources.

## How it works

Clients issue commands against keys and data structures. Individual operations have documented atomicity and complexity. A read followed by a separate write is not one atomic decision merely because both target Redis. Scripts or functions can combine supported operations without interleaving, but must be bounded and designed for their error semantics; they are not general database transactions with automatic rollback of prior effects.

Persistence can use snapshots and append-only logging. Snapshot frequency and log flush policy affect recovery after a crash. Background persistence and log rewriting also consume resources. Replication commonly acknowledges primary writes before every replica has durably applied them, so failover can have a loss window depending on deployment and policy.

Redis Cluster distributes keys among hash slots. Multi-key operations generally require compatible key placement under the operation's rules. Hash tags can place related keys in one slot, but co-locating everything for a large tenant can concentrate load. Sharding spreads different keys; it does not make one hot key infinitely scalable.

Expiration removes keys according to their time limit. Capacity eviction chooses keys to remove when the configured memory policy requires it. A no-eviction policy instead causes relevant writes to fail when capacity is exhausted; it does not make capacity planning optional.

## Key concepts

**TTL is a lifecycle rule.** A key can expire while still popular. Add jitter where coordinated expiry would create a burst, and distinguish stale-but-usable data from information that must immediately become invalid.

**Eviction is a capacity decision.** Policies differ in which keys are eligible and how candidates are selected. Mixing critical state with disposable cache entries under one eviction budget can remove the wrong information.

**Memory overhead matters.** Keys, data-structure metadata, allocator behavior and persistence or replication buffers consume memory beyond the application payload. Leave host or container headroom rather than setting the dataset budget equal to its memory limit.

**Pipelining is not atomicity.** Sending several commands together reduces round trips but does not automatically create an indivisible application operation. `MULTI/EXEC` and WATCH have their own semantics and limitations.

**Hot keys and large values are different problems.** A hot key concentrates request rate; a large value consumes network and processing resources per access. Measure both distribution and size, not only total keys.

## Production example

A service stores catalog cache entries and login sessions in the same Redis deployment. During a catalog import, cache volume grows and the configured eviction policy removes active sessions. Users are logged out even though the authentication service itself has no errors.

The engineer correlates eviction counts, memory use and session misses with the import. Adding a TTL to catalog entries may help bound growth, but it does not establish the right capacity isolation or session semantics. Separate numbered logical databases in one instance would still share important resource limits.

The team places disposable caching and session state under appropriately separate capacity and failure policies. It explicitly defines what a missing session means and what guarantees the chosen session store must provide. If security-sensitive revocation must survive failover, that requirement cannot be inferred from ordinary cache replication alone.

For catalog reads, the team tests a cold cache. Request coalescing reduces duplicate fetches, but an in-process coalescer only coordinates callers within one process. Database admission limits and controlled refill protect the source across the whole fleet. The test watches source query load as well as cache hit rate.

Finally, a restart and failover exercise verifies actual persistence and application behavior. The design is accepted because the two data roles have understood loss and recovery semantics, not simply because Redis responds quickly during normal traffic.

## Trade-offs

In-memory structures and atomic operations can make bounded workloads simple and fast. RAM, replicas and persistence overhead can be expensive compared with disk-oriented storage. A cache may also reduce average latency while adding a severe cold-start failure mode.

Stronger persistence settings increase some durability at additional cost, but must be evaluated together with replication and promotion behavior. A durable local log and a safely chosen failover target are separate concerns.

## Failure modes / pitfalls

Unbounded key growth, commands that scan large datasets, oversized values and scripts with excessive work can cause latency or memory incidents. `KEYS` over a large production keyspace is not equivalent to a harmless indexed lookup; use an appropriate bounded operational approach.

Blind retries of increments or other non-idempotent commands can duplicate effects after an ambiguous network result. TTLs can also be accidentally reset or removed by application updates. Monitor actual key lifecycle behavior instead of assuming every writer preserves it.

A cache outage that immediately sends all traffic to an already busy database is an architecture failure, not merely a Redis availability problem.

## When to use it

Use Redis when a bounded working set or specific data-structure operation provides a measured benefit and the application has explicit expiry, eviction and recovery behavior. Caches should have an authoritative source and a safe miss path.

For non-cache state, document durability, failover and duplicate-operation requirements first, then verify that the selected Redis deployment and client protocol satisfy them.

## When not to use it

Do not place authoritative financial or other loss-intolerant state in an evictable cache. Do not introduce Redis to hide a cheap query without considering invalidation and outage behavior.

Avoid using a distributed cache as an unlimited bag of arbitrary objects. If data must grow indefinitely, be queried flexibly or participate in relational invariants, another storage model may fit better.

## What a Senior Engineer should know

A Senior Engineer should understand command complexity, atomicity, TTLs, eviction and persistence. They should inspect hot keys, value sizes and client behavior under timeouts, and recognize when a retry can repeat an effect.

They should design a cold-cache test and explain how cluster key placement constrains multi-key work. A good cache integration remains safe when the cache is empty or unreachable.

## What a Staff Engineer should understand

A Staff Engineer should define the permitted roles of Redis across services, separating disposable acceleration from consequential state. Capacity, security and recovery policies should follow those roles.

Evaluate shared-instance blast radius, cold-cache database demand and failover guarantees at fleet scale. Standard defaults help only when teams understand which assumptions they encode.

Further reading: [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), [Key eviction](https://redis.io/docs/latest/develop/reference/eviction/), [Redis Cluster specification](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/).
