---
title: "Horizontal partitioning and sharding"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Horizontal partitioning divides rows into subsets. Database-native table partitioning may keep all subsets on one database server, while sharding places subsets on independently serving database nodes. Both involve a placement key, but they solve different capacity and operational problems.

Partitioning a PostgreSQL table by month can simplify retention and prune queries without adding another write-serving node. Sharding can distribute storage and write load, but introduces routing and changes the scope of transactions, joins and constraints.

## Why it matters for backend engineers

A single database eventually has limits, but splitting it is not a free scaling switch. Operations that were local can become cross-node coordination or fan-out. An organization-wide report, global uniqueness check or transfer between customers may become the most difficult part of the system.

Shard choice also affects isolation between tenants. Evenly distributed row counts do not guarantee evenly distributed work: one tenant can generate most writes or one key can receive nearly every read. The workload distribution matters more than the visual balance of a diagram.

## How it works

A routing function or directory maps an ownership key to a shard. Hash placement can spread many keys, while range placement preserves useful locality. A directory can move a tenant without changing its identifier, at the cost of keeping routing information correct and available.

Virtual partitions separate logical placement units from physical servers. Many logical units can be assigned to each server and moved during rebalancing. They do not split a single hot key automatically. If all requests for one tenant use the same placement key, adding virtual partitions alone still leaves that tenant as one indivisible unit.

Queries with the full placement key can target one shard. Queries without it need another index, a maintained read model or scatter-gather across shards. Global ordering, pagination and partial failures then need explicit semantics.

Moving ownership safely requires more than copying rows. A migration typically copies a consistent base, captures ongoing changes, catches up, fences the old write owner and changes routing. A bounded write pause at cutover may simplify correctness. Designs claiming uninterrupted writes need a stronger protocol for concurrent updates, duplicates and stale routers.

## Key concepts

**Co-location.** Place data that must transact together on the same shard when possible. This makes the shard key a business-boundary decision, not merely a hashing choice.

**Local versus global uniqueness.** A unique index protects one shard. A globally unique business identifier needs a placement-compatible rule, global authority or another explicit mechanism; random IDs solve a different problem from unique email or reference numbers.

**Hot tenant versus hot key.** A large tenant may be split using a secondary ownership key if operations permit it. One heavily contended record may instead need a different data or concurrency model.

**Fan-out cost.** A request reaching every shard consumes more aggregate work and is exposed to more slow or unavailable components. Partial results must not silently masquerade as a complete answer.

**Routing epochs and fencing.** Stale clients must not continue writing to an old owner after cutover. A new directory entry alone cannot stop a client with cached placement information.

## Production example

A multi-tenant document service initially places every tenant's documents on one shard using a tenant-to-shard directory. Most reads and writes stay local, and tenant export is straightforward.

One enterprise tenant grows to dominate a shard. Moving other tenants away gives it more room but does not increase its own single-shard write capacity. The team investigates whether documents can be placed by `(tenant_id, workspace_id)` because most transactions are confined to a workspace.

That change permits separate workspaces to move independently, but organization-wide listing now needs a maintained index or fan-out. Cross-workspace operations also lose their previous local transaction boundary. The team evaluates those consequences before changing the routing key. If one workspace is itself hot, this key still does not solve that hotspot.

For an initial migration, the team copies one workspace while recording subsequent changes. After catch-up and verification, it briefly pauses writes for that workspace, applies the final changes, fences the old owner and switches routing. Stale routes receive a controlled redirect or rejection under the implemented protocol. The old copy is retained for a defined verification period without remaining an independent writer.

Checks include row counts, relevant checksums or business invariants, updates during copying and a client using an old route after cutover. Rollback after new writes begin is a data-movement problem, not just changing the directory back.

## Trade-offs

Sharding distributes capacity and can limit some failures to a subset of tenants. It multiplies operational units, schema rollouts, backups and recovery coordination. Replication may still be required within each shard; sharding and replication are not alternatives for the same guarantee.

Range placement supports locality but can concentrate new writes at one edge. Hashing spreads many keys but can make range queries expensive. Directory placement offers flexible moves while making directory correctness and availability part of the request path.

## Failure modes / pitfalls

Sequential keys can create hot ranges. Uniform test tenants can conceal production skew. Rebalancing can overload source and destination through copy traffic while ordinary requests continue.

Global constraints may silently become local after a split. Fan-out implementations can return incomplete results as if they were complete. Changing routing before fencing can accept writes on both copies, while deleting the old copy before validation can remove the easiest recovery evidence.

Native partitioning also needs maintenance: future partitions, indexes and retention operations must be planned. It does not automatically distribute PostgreSQL writes across machines.

## When to use it

Shard when evidence shows a capacity or isolation boundary that cannot reasonably be met through better queries, appropriate indexes, workload isolation, archiving or vertical capacity. Evaluate placement keys against the most important transactions and queries.

Use native partitioning when its pruning or lifecycle benefits fit the workload even if a single database remains sufficient. Keep that decision distinct from operating many independent database nodes.

## When not to use it

Do not shard preemptively because row counts sound large. Measure working set, write rate, query cost and practical capacity first.

Avoid a key that distributes rows well but forces the main business workflow across shards. If most important operations require global coordination, another boundary or storage architecture may be more suitable.

## What a Senior Engineer should know

A Senior Engineer should evaluate placement, skew, local guarantees and fan-out behavior. They should explain what happens when one shard fails and implement routing that respects ownership changes.

They should test migration with concurrent updates and stale clients, and recognize when a hot key cannot be fixed by simply adding more partitions.

## What a Staff Engineer should understand

A Staff Engineer should identify the actual scaling boundary and align shard ownership with business invariants and team operations. The design must include future resharding, large tenants, schema rollout and recovery, not only the first split.

Compare the long-term cost of global coordination and fleet operations with alternatives. A sharded architecture is successful when its hardest ordinary workflows and failure scenarios remain understandable and supportable.

Further reading: [PostgreSQL table partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html), [Spanner schema and primary-key guidance](https://cloud.google.com/spanner/docs/schema-design).
