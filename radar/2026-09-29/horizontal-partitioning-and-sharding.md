---
title: "Horizontal partitioning and sharding"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Sharding splits a logical dataset horizontally so different rows or keys live on different database nodes. A shard key determines placement—for example `customer_id`, `tenant_id` or a hash of an identifier.

## Why it matters for backend engineers

Sharding can move a system beyond the storage, write throughput or working-set limits of one database. It also removes many conveniences of a single database: global transactions, joins, uniqueness and simple queries.

## How it works

A routing layer maps each shard key to a shard. Hash-based sharding distributes keys relatively evenly; range sharding preserves locality but can create hot ranges. Consistent hashing or virtual shards reduce data movement during rebalancing. Resharding requires moving ownership while reads and writes continue, which is usually harder than the initial partitioning.

## Key concepts

### Shard key
The key should align with access patterns and distribute load, not merely rows.

### Hot shards
One celebrity user, large tenant or time range can dominate traffic despite an even row count.

### Scatter-gather
Queries without a shard key may fan out to every shard, increasing latency and cost.

### Resharding
Capacity growth eventually requires moving partitions safely while serving traffic.

### Global invariants
Cross-shard uniqueness, transactions and foreign keys require different designs or explicit coordination.

## Production example

A multi-tenant platform shards by `tenant_id`. Most requests stay on one shard and tenant data is easy to move. One enterprise tenant grows to 30% of traffic and becomes a hot shard. The team introduces virtual partitions for large tenants rather than assuming the original key will scale forever.

## Trade-offs

Sharding increases write/storage capacity and fault isolation, but complicates queries, migrations, operations and correctness. Replication scales copies of the same data; sharding divides the data itself. They solve different bottlenecks and are often combined.

## Failure modes / pitfalls

Poor shard keys create hotspots. Sequential ranges can overload the newest shard. Cross-shard queries become hidden fan-out. Rebalancing without versioned ownership can produce double writes or missed writes.

## When to use it

Shard when measurements show a single database is approaching a hard capacity boundary that cannot reasonably be solved with indexing, query design, vertical scaling, replicas or archiving.

## When not to use it

Do not shard preemptively. A well-operated relational database can carry substantial workloads, and premature sharding permanently raises application complexity.

## What a Senior Engineer should know

A Senior Engineer should evaluate shard keys, hotspots, routing, fan-out, rebalancing and cross-shard operations and understand how the application behaves when one shard fails.

## What a Staff Engineer should understand

A Staff Engineer should identify the actual scaling boundary, choose ownership and migration strategy, design for large tenants and future resharding, and account for the organizational cost of operating many databases.