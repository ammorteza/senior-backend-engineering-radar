---
title: "Consensus and Raft"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Consensus lets replicas agree on an ordered sequence of decisions despite some node failures. Raft organizes this through leader election, replicated logs and explicit membership rules.

## Why it matters for backend engineers

Coordination stores often underpin scheduling and configuration. Their behavior during a partition explains why a healthy minority cannot safely continue accepting writes.

## How it works

A candidate increments its term and requests votes. A majority elects a leader, which appends entries and replicates them to followers. Entries become committed under Raft's commit rules; the current-term requirement prevents unsafe conclusions about older entries. Followers apply committed entries to a deterministic state machine. Election timeouts detect missing leaders without proving they are dead.

## Key concepts

Terms distinguish leadership epochs. Quorum intersection protects committed history. Log matching and election restrictions preserve safety. Membership changes require a safe protocol, not arbitrary replacement of a majority. Snapshots compact applied history.

## Production example

A five-node configuration cluster splits into groups of three and two. The majority can elect a leader and commit updates; the minority cannot. Clients reaching the minority see unavailability rather than conflicting configuration histories. Recovery rejoins the logs before serving consistent state.

## Trade-offs

Consensus simplifies agreement but adds replication latency and loses write availability without a quorum. It does not make all reads linearizable unless the read protocol establishes the required freshness.

## Failure modes / pitfalls

Correlated node placement, slow durable writes, unsafe membership changes and reading stale followers can undermine expectations. Consensus cannot coordinate an external side effect merely because a decision is logged.

## When to use it

Use a proven consensus implementation for coordination state requiring consistent ownership or ordering.

## When not to use it

Do not implement Raft casually or route high-volume independent application data through one coordination log.

## What a Senior Engineer should know

Explain majority failure tolerance, leader changes and linearizable versus stale reads.

## What a Staff Engineer should understand

Design failure-domain placement, membership operations and recovery without sacrificing quorum safety.

Further reading: [Raft paper](https://raft.github.io/raft.pdf).
