---
title: "Database transactions and isolation"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A transaction groups database operations into a unit that commits or aborts together. Isolation controls how that unit interacts with concurrent transactions: which data it can observe and which combinations of outcomes the database will reject.

The purpose is to preserve an invariant, such as “a seat can have only one active reservation,” not merely to wrap several statements in `BEGIN` and `COMMIT`. A transaction at an unsuitable isolation level can still permit the application to make a decision from stale or incomplete information.

## Why it matters for backend engineers

Concurrency bugs often pass ordinary tests because sequential execution is correct. Two requests can both observe availability, both decide they are allowed to proceed and then commit an invalid combined result. Adding a transaction does not automatically serialize those decisions.

Engineers need to identify the shared state and choose an enforcement mechanism: a constraint, conditional update, explicit lock or stronger isolation. That is usually simpler and safer than depending on request timing or an in-process mutex that other service instances do not share.

## How it works

A transaction reads data under the selected visibility rules, acquires locks as needed and makes writes durable on commit under the configured durability policy. Other transactions may wait, see another snapshot or be forced to retry. MVCC reduces many reader/writer conflicts but does not make all concurrent decisions compatible.

In PostgreSQL, Read Committed uses a fresh snapshot for each statement. Repeatable Read uses a stable transaction snapshot, preventing several read anomalies but still allowing some cross-row serialization anomalies. Serializable rejects executions that cannot be reconciled with a serial order; applications must handle those rejections.

Choose the narrowest mechanism that protects the actual invariant. A unique constraint handles duplicate identity. A conditional update can atomically claim a known row. A multi-row rule may require locking a shared coordination row, locking the relevant rows in a consistent order, or Serializable transactions. A row lock on an existing row does not automatically protect an arbitrary absence predicate such as “no matching row exists.”

Keep retryable work inside a well-defined boundary. After a serialization failure or deadlock, retry the whole decision-making transaction with bounded attempts and backoff, not just its final statement. External effects must not be repeated blindly when the transaction restarts.

## Key concepts

**Atomicity has a scope.** Ordinary transactional table changes commit together. A remote payment call, emitted email or sequence increment does not acquire the same rollback semantics merely because it occurs between BEGIN and COMMIT.

**Lost update versus conditional transition.** Reading `value=10` and later writing `value=11` can overwrite another caller's work. `SET value = value + 1` or a version-checked update expresses different concurrency behavior.

**Write skew.** Two transactions can read overlapping facts and update different rows, violating a shared rule without competing for the same row lock. A stable snapshot alone does not prevent this.

**Deadlock.** Transactions holding different locks may wait on one another. Consistent acquisition order reduces risk; the database can still abort a participant, which the application must handle.

**Unknown commit outcome.** A lost connection during COMMIT does not establish whether the transaction committed. An operation identifier and a way to query its outcome can be necessary before retrying.

## Production example

Consider a seat inventory row with one remaining place. Two callers first read `remaining=1`. If both later assign `remaining=0` and create reservations, both can believe they obtained the last seat.

A conditional transition combines the check and decrement:

```sql
UPDATE seat_inventory
SET remaining = remaining - 1
WHERE event_id = $1 AND remaining > 0
RETURNING remaining;
```

At PostgreSQL Read Committed, a concurrent update to that same row causes the competing updater to wait and recheck the predicate against the updated version. Exactly one caller can decrement from one to zero. The application must treat no returned row as failure to reserve, not proceed anyway. If reservation insertion is a separate statement, both operations belong in one transaction, and failure of either must abort the unit. A nonnegative CHECK constraint provides additional enforcement.

Now consider a different rule: a workspace must retain at least one active approver. Two transactions each see two approvers and deactivate different people. The single-row technique above does not protect that cross-row invariant. The team must coordinate on shared state or use an appropriate isolation strategy and retry handling.

Test these behaviors with synchronized concurrent sessions, not only repeated sequential calls. Include a dropped connection around commit and a repeated request ID so recovery does not create a second reservation after an ambiguous successful commit. These scenarios are illustrative and require application-specific schema and retry design.

## Trade-offs

Stronger isolation can reduce the complexity of reasoning about concurrent business rules, at the cost of additional aborts or coordination. Explicit locks can be predictable for narrow invariants but increase blocking and require all writers to obey the protocol.

Large transactions make more changes atomic but retain resources longer and make retries more expensive. Break bulk work into smaller units only when the business semantics permit partial progress. Transaction size is a correctness and recovery decision as well as a performance choice.

## Failure modes / pitfalls

A pre-check without a constraint can race. A `SELECT FOR UPDATE` that locks only the row being changed may not protect a rule spanning other rows. Retrying only the failed statement can reuse decisions made from an obsolete snapshot.

External network calls inside a transaction extend lock and connection lifetimes and can leave irreversible effects after rollback. Idle transactions can retain locks or visibility horizons. Treat serialization failures and deadlocks as expected categories with bounded handling, while distinguishing them from non-retryable validation or constraint errors.

## When to use it

Use transactions whenever related writes must commit together or concurrent operations can violate an invariant. First express the invariant precisely, then test the smallest database mechanism that enforces it.

Prefer constraints for rules they can naturally express. They protect all writers, including scripts and future services that may not reuse today's application checks.

## When not to use it

Do not stretch a local transaction across independently committed services and assume it creates distributed atomicity. Use explicit workflow, outbox or compensation designs when effects cross that boundary.

Do not raise every transaction to the strongest isolation setting without adding correct retry behavior and observing contention. Conversely, do not reject stronger isolation when it provides a simpler reliable solution to a real cross-row rule.

## What a Senior Engineer should know

A Senior Engineer should translate an invariant into a constraint or concurrency protocol and demonstrate it with competing sessions. They should explain the database-specific isolation semantics, lock scope and complete retry boundary.

They should also handle ambiguous commits and keep external effects out of unsafe retry paths. A successful happy-path transaction is not enough evidence that the workflow is correct under failure.

## What a Staff Engineer should understand

A Staff Engineer should decide which invariants belong within one database boundary and what changes when data is split across services or shards. Sometimes retaining a local transaction is less costly than building distributed coordination.

Establish shared conventions for retries, lock ordering, operation identity and transaction lifetime. Ensure every writer participates in the chosen protocol, including maintenance tools and asynchronous consumers.

Further reading: [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html).
