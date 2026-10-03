---
title: "Concurrency control"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Concurrency control keeps shared state correct when multiple operations overlap in time. The problem is not parallelism by itself; the problem is that different interleavings of reads and writes can violate an invariant even though each operation is correct when run alone.

A useful design starts by naming the invariant—“one seat can be sold once,” “one worker owns this job version,” or “an account state transition follows the allowed sequence”—and then choosing the narrowest storage or coordination primitive that enforces it.

## Why it matters for backend engineers

Backend systems are naturally concurrent. Requests arrive simultaneously, consumers process messages in parallel, retries overlap with original attempts, and several service instances share one database.

The common bug pattern is check-then-act: read a state, decide an action is allowed, then write later. Another actor can change the state in between. Sequential tests pass while production occasionally produces duplicates, lost updates, or impossible state transitions.

## How it works

The strongest place to enforce a local invariant is often the storage operation itself.

**Atomic conditional writes** combine validation and mutation. For example, `UPDATE jobs SET owner=$1 WHERE id=$2 AND owner IS NULL` lets the database choose one winner without a separate read/check race.

**Optimistic concurrency control** reads a version, performs work, and updates only if the version is unchanged. If someone else committed first, the update affects zero rows or raises a conflict, and the caller reloads and retries the whole decision.

**Pessimistic locking** acquires a lock before conflicting work proceeds. Database row locks can protect known rows but increase blocking and create deadlock possibilities. Every writer must participate in the same locking protocol.

**Constraints** are concurrency control too. A unique constraint is stronger than “SELECT first, INSERT if absent” because all writers are forced through one atomic rule.

When an invariant spans several rows, the solution may require a transaction with appropriate isolation, a shared coordination row, or Serializable execution. When it spans independent systems, local database locks no longer provide one atomic boundary.

## Key concepts

**Lost update.** Two actors read one value and later write based on their old copies. One write overwrites the other.

**Compare-and-swap / version check.** A write succeeds only when the current version matches what the caller observed.

**Lock scope.** A lock protects the rows or resources it actually covers. Locking one row does not automatically protect an arbitrary predicate elsewhere.

**Deadlock.** Transactions hold resources and wait for each other cyclically. Consistent lock ordering reduces risk; databases can still abort a participant and applications must handle that retry.

**Retry boundary.** After a concurrency conflict, retry the complete decision that depended on old state, not only the final write.

**Distributed fencing.** A lease-based distributed lock can expire while the old holder is paused. Correctness-sensitive resources may need a monotonically increasing fencing token so stale owners are rejected.

## Production example

Two workers try to claim job 42. Both initially observe `status='ready'`. A naive implementation does a read followed by a separate update, so both workers can pass the check before either write commits.

The service changes the operation to one conditional update:

```sql
UPDATE jobs
SET status = 'running',
    owner_id = $1,
    version = version + 1
WHERE id = $2
  AND status = 'ready'
RETURNING version;
```

Exactly one worker receives a row. The other observes no result and treats the job as already claimed.

Now add a completion update. Worker A claims version 18 but pauses for a long time. The scheduler later creates a new attempt at version 19. When A resumes, it must not mark version 19 completed. Its update includes the attempt/version identity and affects a row only if the stored version still matches.

Tests synchronize two transactions deliberately instead of hoping a race occurs. They cover simultaneous claims, stale completion, deadlock retry where relevant, and process restart after a successful claim.

## Trade-offs

Pessimistic locking is easy to reason about for high-conflict local operations, but holds resources and can reduce throughput. Optimistic control avoids blocking when conflicts are rare, at the cost of rejected work and retries.

Serializable transactions can make complex invariants easier to reason about, but applications must handle serialization failures. Application-level mutexes are cheap within one process but do nothing against another pod or script.

## Failure modes / pitfalls

An in-process mutex gives false confidence in a multi-instance service. A preliminary “exists?” check without a unique constraint races. Long transactions retain connections and locks while waiting on remote systems.

Retry loops can repeat external side effects if the transaction body sends email or calls another service before a conflict is discovered. Distributed leases without fencing can let an expired owner continue writing.

Another pitfall is locking too much: a global mutex can make correctness simple by serializing the entire workload, but destroy scalability unnecessarily.

## When to use it

Use explicit concurrency control whenever overlapping actors can violate a business invariant. Prefer database constraints and atomic conditional writes when the invariant is local to one store.

Escalate to row locks, stronger isolation, partition ownership, or distributed coordination only when the simpler mechanisms do not cover the actual rule.

## When not to use it

Do not introduce distributed locks for a race that a unique constraint or conditional update already solves.

Do not add optimistic versions to immutable append-only data merely because “concurrency control” sounds safer; choose mechanisms from real conflicting mutations.

## What a Senior Engineer should know

A Senior Engineer should recognize lost updates, check-then-act races, stale writers, deadlocks, and cross-row invariants. They should choose constraints, atomic statements, optimistic checks, or locks deliberately and implement complete retry boundaries.

They should test concurrency using synchronized actors and failure points rather than relying only on stress tests that may or may not expose the race.

## What a Staff Engineer should understand

A Staff Engineer should shape ownership and data boundaries so expensive coordination is minimized. They should identify where a proposed global lock is compensating for a confused service boundary or overly shared state.

They should establish patterns for versioning, lock ordering, retries, and fencing across teams and ensure recovery or operator tools obey the same invariants as normal application writers.

Further reading: [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [etcd concurrency primitives](https://etcd.io/docs/v3.6/tasks/developer/how-to-create-locks/).
