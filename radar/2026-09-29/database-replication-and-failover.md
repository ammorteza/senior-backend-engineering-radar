---
title: "Database replication and failover"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Database replication maintains copies of database state; failover transfers the write-serving role when the primary cannot continue. Copying data and safely selecting a new primary are separate engineering problems.

## Why it matters for backend engineers

A replica can be healthy enough to answer reads yet too far behind to preserve recent writes. A reconnecting client can also reach an old primary unless leadership and routing are coordinated.

## How it works

PostgreSQL physical standbys replay WAL from the primary and share its storage-level representation. Logical replication decodes changes for selected relations and has different schema-management constraints. A failover controller must detect failure, prevent the old leader from accepting writes, promote a suitable standby and redirect clients. PostgreSQL replication alone does not provide a complete automatic failover system.

## Key concepts

Distinguish receive, flush and replay positions; lag is more than a single seconds counter. Synchronous acknowledgement modes change when a commit returns. Replication slots protect retained logs but can consume disk if a consumer stalls. Promotion requires a plan for the former primary's rejoin.

## Production example

A primary loses network connectivity while an asynchronous standby is thirty seconds behind. Promoting it restores availability but may discard acknowledged writes. The team checks replay position against the stated RPO, fences the isolated primary and reconciles missing business operations after recovery. Applications reconnect and retry only operations with known duplicate semantics.

## Trade-offs

Synchronous replication reduces selected data-loss windows but adds latency and can block commits when required standbys disappear. Asynchronous replicas favor write availability at the cost of lag.

## Failure modes / pitfalls

Split brain, stale DNS, retained WAL filling disk and replica reads after writes are common hazards. An HA standby is not automatically a usable read replica, and a replica is not protection against accidental deletes.

## When to use it

Use replication for HA, read scaling and recovery copies, with a documented promotion and fencing procedure.

## When not to use it

Do not claim zero data loss from an asynchronous topology or substitute replication for backups.

## What a Senior Engineer should know

Inspect replication positions, slot retention and standby conflicts; explain what happens to open transactions and pooled connections during promotion.

## What a Staff Engineer should understand

Design failover authority, failure domains, RPO/RTO and drills that include application reconciliation and old-primary recovery.

Further reading: [PostgreSQL high availability](https://www.postgresql.org/docs/current/high-availability.html).
