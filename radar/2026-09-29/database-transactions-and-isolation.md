---
title: "Database transactions and isolation"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A database transaction groups operations into a unit with defined atomicity and isolation guarantees. Transactions protect business invariants when multiple operations or concurrent clients interact with shared state.

Isolation determines which effects of concurrent transactions can be observed and which anomalies the database prevents.

## Why it matters for backend engineers

Many correctness bugs are concurrency bugs disguised as ordinary CRUD code: double booking, lost updates, negative inventory or duplicated state transitions.

Understanding transactions lets engineers place invariants in the database rather than relying on timing assumptions in application code.

## How it works

A transaction begins, reads and modifies state, then commits or rolls back. The database coordinates concurrent transactions using mechanisms such as MVCC and locks.

Isolation levels define permitted observations. In PostgreSQL, Read Committed provides a fresh statement snapshot, Repeatable Read provides a stable transaction snapshot with stronger anomaly prevention, and Serializable attempts to make committed transactions equivalent to some serial execution, potentially aborting transactions that must be retried.

## Key concepts

### Atomicity
A transaction's writes commit together or not at all.

### Isolation
Concurrent transactions are constrained so specified anomalies cannot occur.

### Lost update
Two actors read the same state and overwrite one another's changes.

### Locking
Locks coordinate conflicting access but can block and deadlock.

### MVCC
Multiple row versions let readers and writers coexist with less blocking.

### Transaction boundary
Remote API calls are generally outside the database transaction and create distributed consistency problems.

## Production example

Two workers attempt to reserve the final inventory item. Both first read quantity = 1.

A naive read-modify-write can allow both to succeed. A conditional UPDATE that decrements only when quantity > 0, or an appropriate locking/transaction strategy, moves the invariant into an atomic database operation.

## Trade-offs

Stronger isolation simplifies correctness but can increase coordination, retries and contention. Long transactions provide a larger logical scope but retain locks or old MVCC snapshots and consume connections.

Choosing isolation requires understanding the invariant, not simply selecting the strongest setting everywhere.

## Failure modes / pitfalls

Typical mistakes include external network calls inside transactions, ignoring serialization failures, transactions that remain open during user interaction, assuming Read Committed prevents all races, and relying on application checks without database constraints.

Deadlocks are normal possibilities in concurrent systems and should be handled rather than treated as impossible database bugs.

## When to use it

Use transactions to protect invariants across related database changes and whenever concurrent operations could create invalid state.

## When not to use it

Do not stretch a local database transaction across independent services. Use patterns such as outbox, saga or workflow orchestration when consistency spans distributed boundaries.

## What a Senior Engineer should know

A Senior Engineer should understand ACID, common isolation levels, MVCC, locks, deadlocks, optimistic concurrency and transaction scope. They should translate business invariants into constraints and atomic operations.

## What a Staff Engineer should understand

A Staff Engineer should reason about correctness across local and distributed transaction boundaries, select consistency models based on business consequences and establish patterns for concurrency control.

They should recognize when stronger database guarantees are cheaper and safer than elaborate application coordination.
