---
title: "Replication and consistency models"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Replication keeps multiple copies of data so the system can survive failures, serve reads from more places, or place data near users. A consistency model describes what values clients are allowed to observe while those replicas receive updates at different times.

Replication is a mechanism; consistency is a contract. Two databases can both have three replicas yet provide very different behavior for reads after writes, failover, concurrent updates, and network partitions.

## Why it matters for backend engineers

Many production surprises are consistency surprises: a user updates a profile and immediately sees the old value, a promoted replica is missing acknowledged writes, or two regions accept conflicting changes.

If the product requires a guarantee such as “after this update succeeds, the same user must immediately observe it,” the architecture must map that requirement to concrete database and routing behavior. “Eventually consistent” or “three replicas” is not precise enough.

## How it works

In leader/follower replication, one leader accepts writes and propagates changes to followers. Synchronous acknowledgement waits for configured replica participation before success; asynchronous acknowledgement returns earlier and accepts a replication-lag and failover-loss window.

Multi-leader systems accept writes in more than one location and later reconcile concurrent histories. This improves write locality and availability for some workloads while forcing conflict semantics into the data model.

Leaderless systems can send operations to several replicas and use versions plus read/write response sets to reconcile. Simple quorum arithmetic such as `R + W > N` describes overlap under assumptions, but real systems may use sloppy quorums, hinted handoff, failures, or topology rules that complicate the guarantee.

Consistency models range from strong/linearizable behavior for selected operations to weaker guarantees such as eventual convergence, monotonic reads, and read-your-writes. A system can expose different consistency choices per operation.

## Key concepts

**Replication lag.** Followers can be behind because of network delay, disk pressure, replay conflicts, or large transactions. Lag is workload state, not only network latency.

**Read-your-writes.** A client expects to observe its own successful update. Routing the next read to an asynchronous follower can violate that even when replication is healthy.

**Monotonic reads.** After observing a newer value, the client should not later observe an older one. Randomly switching between replicas at different positions can violate this.

**Failover loss window.** In asynchronous replication, a write can be acknowledged on the old leader but absent from the promoted follower.

**Conflict resolution.** Last-write-wins selects a winner under an ordering rule but may discard legitimate concurrent intent. Domain-specific merge, CRDTs, or coordination may be more appropriate.

**Fencing.** During leader change, the old writer must be prevented from continuing to accept conflicting writes. Promotion alone does not stop a partitioned old primary.

## Production example

A user updates their delivery address. The write goes to the primary and succeeds. The application immediately redirects to a profile page whose reads are load-balanced across asynchronous replicas. One replica has not applied the change, so the user sees the old address and submits the update again.

The team first identifies the product requirement: the user must read their own newly committed profile update for a bounded period; unrelated users can tolerate replica freshness lag.

It introduces a read-after-write policy. The response carries or server session records an appropriate commit/version marker, and subsequent profile reads for that user route to the primary or to a replica known to have caught up to the required position. After the bounded consistency window, normal replica routing resumes.

Tests intentionally delay replica apply, then perform write-followed-by-read. A failover test commits writes close to primary loss and records the actual durability behavior under the configured synchronous/asynchronous policy.

For a different field such as collaborative notes written in two regions, the team does not reuse “last timestamp wins” without analysis. It defines whether concurrent edits should merge, conflict, or be coordinated.

## Trade-offs

Synchronous replication can reduce selected data-loss windows and simplify strong-read guarantees, but adds network/disk latency and can reduce write availability when required replicas are unavailable.

Asynchronous replication gives lower write latency and better tolerance of slow replicas while exposing stale reads and possible failover loss.

Multi-writer designs improve write locality but make conflict semantics unavoidable. Strong coordination simplifies product reasoning while spending latency and availability during some partitions.

## Failure modes / pitfalls

Assuming every replica is equally fresh leads to stale reads. Automatically promoting the most reachable node without checking replication position can increase data loss.

Using wall-clock timestamps as conflict truth can discard causal work when clocks skew. Reading from a stale follower after already observing a newer value violates monotonic expectations.

Replicas also do not replace backups: accidental deletion or corruption can replicate perfectly.

## When to use it

Use replication for availability, read scaling, disaster recovery, or geographic placement when those benefits justify the consistency and operations model.

Write the required client-visible guarantees before choosing routing and acknowledgement settings.

## When not to use it

Do not add replicas merely to avoid fixing expensive queries, poor indexing, or unbounded reads. They add cost and consistency complexity.

Do not introduce multi-leader writes for a workload that can accept one write authority without unacceptable latency or availability impact.

## What a Senior Engineer should know

A Senior Engineer should explain leader/follower, multi-leader, and leaderless replication; synchronous/asynchronous acknowledgement; lag; failover; quorums; and client guarantees such as read-your-writes.

They should test routing and failover against actual product invariants rather than infer behavior from topology diagrams.

## What a Staff Engineer should understand

A Staff Engineer should map business invariants to consistency models, define acceptable RPO/RTO and failover semantics, and choose where coordination is necessary across regions.

They should design fencing, repair, and observability so replication behavior remains understandable during partitions and recovery, not only steady state.

Further reading: [PostgreSQL high availability](https://www.postgresql.org/docs/current/high-availability.html), [Raft resources](https://raft.github.io/).
