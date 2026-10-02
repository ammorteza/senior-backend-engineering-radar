---
title: "PostgreSQL"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

PostgreSQL is a relational database with transactions, constraints, extensible types and a cost-based query planner. Its usefulness comes from combining rich SQL with enforceable data invariants, not just storing rows.

## Why it matters for backend engineers

Application latency and correctness depend on how PostgreSQL plans queries, holds locks and manages row versions. Scaling application pods can worsen a database bottleneck by multiplying connections and competing queries.

## How it works

Backends execute statements against MVCC snapshots. Writes create row versions and generate write-ahead log (WAL); checkpoints coordinate persisted pages with recovery. The planner selects scans and joins from statistics. Autovacuum removes reclaimable dead tuples and maintains transaction-ID safety; it is part of normal operation.

## Key concepts

Constraints enforce uniqueness and referential integrity. `pg_stat_activity` exposes sessions and waits; `pg_stat_statements`, when enabled, summarizes query workloads. Index-only scans depend on visibility information as well as index contents. Physical replication transfers WAL; logical replication transfers selected data changes.

## Production example

An account-profile table develops high update latency despite a useful index. Investigation finds an idle transaction retaining an old snapshot, preventing cleanup while updates accumulate dead tuples. Terminating the offending session under an agreed procedure and fixing transaction scope lets vacuum make progress. Table growth, oldest transaction age and query latency are monitored together.

## Trade-offs

Rich transactions and flexible queries reduce application complexity. Connections, indexes and background maintenance consume finite resources. Extensions add capabilities while complicating upgrades and managed-service portability.

## Failure modes / pitfalls

Long transactions, stale statistics, excessive indexes, connection storms and blocked DDL are recurring problems. A read replica may be stale; asynchronous failover can lose recently acknowledged writes. Backups must include tested restoration.

## When to use it

Use PostgreSQL for relational operational data, integrity constraints and workloads requiring multi-row transactions and evolving query patterns.

## When not to use it

Do not treat one instance as an unlimited analytical warehouse or blob store. Isolate expensive scans and evaluate specialized storage when workload evidence warrants it.

## What a Senior Engineer should know

Read execution plans and lock waits, size connection pools, use safe migrations, and understand MVCC, WAL and restore procedures.

## What a Staff Engineer should understand

Plan upgrade, replication, recovery and workload-isolation strategy. Decide which invariants stay local and which scaling choices change application guarantees.

Further reading: [PostgreSQL documentation](https://www.postgresql.org/docs/current/).
