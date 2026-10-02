---
title: "MVCC and vacuuming"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Multi-Version Concurrency Control (MVCC) lets a database retain multiple versions of a row so transactions can read consistent snapshots while other transactions write. PostgreSQL vacuum manages the obsolete versions this creates.

## Why it matters for backend engineers

An update-heavy table can grow and slow down even when its live row count is stable. Understanding snapshots explains why deleting rows does not immediately free disk and why an idle transaction can harm unrelated requests.

## How it works

An update generally creates a new tuple and marks the previous version obsolete. Snapshot visibility depends on transaction IDs and transaction status. VACUUM reclaims versions no active snapshot still needs and updates the visibility map; freezing prevents transaction-ID wraparound. Ordinary vacuum usually makes space reusable within the table, rather than shrinking the file.

## Key concepts

HOT updates can avoid new index entries when eligible columns and page space permit. The visibility map helps index-only scans skip heap checks. Autovacuum thresholds determine when workers visit a table; long transactions and some replication-slot situations delay cleanup. `VACUUM FULL` rewrites a table with stronger locking.

## Production example

A heartbeat table updates the same rows every few seconds. Live rows remain constant but disk usage grows because a reporting session holds a transaction open overnight. Inspect transaction age and dead-tuple estimates, end the stale transaction safely, and tune per-table vacuum behavior. Verify reuse over subsequent updates rather than expecting an immediate file-size reduction.

## Trade-offs

Snapshots reduce reader/writer blocking but cost storage and cleanup work. Aggressive vacuum consumes I/O; insufficient vacuum permits bloat and can threaten transaction-ID safety.

## Failure modes / pitfalls

Do not disable autovacuum to hide load. Watch idle-in-transaction sessions, old snapshots, slots retaining resources and repeated updates to indexed columns. Running `VACUUM FULL` as routine maintenance can introduce an avoidable outage.

## When to use it

Apply MVCC knowledge when tuning write-heavy tables, investigating bloat or designing transaction lifetimes.

## When not to use it

Do not use table rewrites as the first response to every size increase. Separate reusable free space, live data growth and truly excessive bloat.

## What a Senior Engineer should know

Read vacuum progress and statistics, identify cleanup blockers, and distinguish VACUUM, ANALYZE and VACUUM FULL.

## What a Staff Engineer should understand

Budget maintenance capacity and enforce transaction-lifetime practices across applications, reporting jobs and replication consumers.

Further reading: [Routine vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html).
