---
title: "Concurrency control"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Concurrency control keeps shared state correct when multiple operations execute at the same time. The problem is not that code is parallel; it is that interleavings can violate an invariant even when every individual operation looks correct.

## Why it matters for backend engineers

Inventory, balances, job ownership and state transitions are routinely updated concurrently. A check-then-write sequence that is correct with one request can fail under two simultaneous requests.

## How it works

Pessimistic control prevents conflicting work with locks. Optimistic control allows work to proceed and rejects a write when the observed version has changed. Databases additionally provide atomic statements, isolation levels and constraints. Distributed systems may need leases, fencing tokens or consensus when ownership spans processes.

## Key concepts

### Race condition
Correctness depends on timing between concurrent operations.

### Optimistic concurrency control
A version, ETag or compare-and-swap detects that state changed before committing.

### Pessimistic locking
A lock prevents conflicting operations but can block, deadlock or reduce throughput.

### Atomic operation
Operations such as conditional UPDATE can enforce an invariant without a separate read/check race.

### Deadlock
Transactions acquire resources in incompatible order and wait for each other; databases detect and abort one participant.

## Production example

Two requests try to claim the same delivery. Both read `unassigned`. Instead of read-then-update, the service executes an atomic conditional update: change the row to assigned only where status is still unassigned. Exactly one request observes an affected row.

## Trade-offs

Locks make conflicts explicit but increase blocking. Optimistic approaches perform well when conflicts are rare but require retry. Stronger isolation can simplify application reasoning while increasing aborts or coordination.

## Failure modes / pitfalls

Application mutexes do not protect against other pods. Distributed locks without fencing can let an expired lock holder continue writing. Long database transactions hold resources and increase contention.

## When to use it

Use concurrency control wherever concurrent actors can violate a business invariant. Prefer the narrowest mechanism that lets the storage system enforce the invariant atomically.

## When not to use it

Do not introduce distributed locks when a database constraint, conditional write or partitioned ownership solves the problem locally.

## What a Senior Engineer should know

A Senior Engineer should recognize lost updates and check-then-act races, use locks and optimistic versions correctly, handle deadlocks/retries and place invariants in atomic storage operations.

## What a Staff Engineer should understand

A Staff Engineer should design ownership so coordination is minimized, choose between transactional, optimistic and distributed mechanisms, and identify when a proposed lock is hiding an architectural ownership problem.