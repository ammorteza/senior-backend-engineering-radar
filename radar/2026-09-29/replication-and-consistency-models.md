---
title: "Replication and consistency models"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Replication keeps copies of data on multiple nodes. A consistency model defines what clients are allowed to observe while those copies change. Replication gives redundancy and read capacity; it does not make all replicas instantaneously identical.

## Why it matters for backend engineers

Many production surprises—reading stale data after a write, losing acknowledged writes during failover, or seeing different values from different regions—come from misunderstanding replication guarantees.

## How it works

In leader/follower replication, writes go to a leader and are propagated to followers. Synchronous replication waits for selected replicas before acknowledging; asynchronous replication acknowledges earlier and allows lag. Leaderless systems may use read/write quorums and version reconciliation. Multi-leader systems accept writes in several locations and must resolve conflicts.

## Key concepts

### Replication lag
Followers apply changes after the leader. Lag can be milliseconds or much longer during overload or failure.

### Read-your-writes
A client often expects to see its own recent update; routing it immediately to an asynchronous follower can violate that expectation.

### Quorum
Overlapping read/write sets can improve consistency, but sloppy quorums and failures complicate the simple formula.

### Failover
Promoting a replica changes leadership; acknowledged writes not present on the promoted node may be lost in asynchronous designs.

### Conflict resolution
Multi-writer systems need deterministic semantics for concurrent updates; last-write-wins is simple but can discard valid changes.

## Production example

A user updates an address and is redirected to a page served from a read replica. Replication lag shows the old address, so the user retries the update. The system routes session reads to the leader for a bounded period after writes, preserving read-your-writes without sending all reads to the leader.

## Trade-offs

Synchronous replication improves durability/consistency but adds write latency and can reduce availability. Asynchronous replication improves latency and availability but exposes stale reads and a possible failover data-loss window.

## Failure modes / pitfalls

Assuming replicas are current, ignoring replica lag during batch jobs, automatic failover without fencing the old leader, and using timestamps as conflict resolution without trustworthy clock assumptions are common errors.

## When to use it

Use replication for availability, disaster recovery, read scaling or geographic copies, with guarantees chosen from business requirements.

## When not to use it

Do not add replicas as a substitute for fixing inefficient queries or a poor data model. Replicas add operational and consistency complexity.

## What a Senior Engineer should know

A Senior Engineer should understand leader/follower, multi-leader and leaderless replication; synchronous versus asynchronous acknowledgement; lag; read consistency; failover and quorums.

## What a Staff Engineer should understand

A Staff Engineer should connect consistency guarantees to product invariants, define acceptable RPO/RTO and failover semantics, and reason about replication across regions, network partitions and ownership boundaries.