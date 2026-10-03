---
title: "Distributed locking"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

A distributed lock coordinates ownership between processes that do not share memory. Most practical designs use a lease: ownership expires unless the holder renews it. The lease prevents indefinitely dead owners, but expiration creates a subtle problem—a previous holder can resume after losing ownership.

For correctness-sensitive work, “the coordination service currently shows one owner” is not enough. The protected resource must be able to reject actions from stale owners, commonly using a monotonically increasing fencing token or equivalent version.

## Why it matters for backend engineers

Processes pause. Garbage collection, VM suspension, network partitions, scheduler delays, and long I/O can stop a worker longer than its lease. When it resumes, it may still believe it owns the job.

Without fencing, two workers can perform conflicting external writes even if the lock service itself never had two valid leases at the same instant. This is why distributed locking is more than implementing `SETNX` plus a TTL.

## How it works

A client acquires a lease-backed ownership record from a coordination system. The returned ownership identity is used for safe conditional release so one client cannot accidentally delete another client's newer lock.

For best-effort exclusion, a random owner token may be enough to prove which lease record to release. For correctness, acquisition should also establish a monotonically increasing generation or fencing token. Every protected write includes that token; the resource remembers the newest accepted generation and rejects lower ones.

The resource-side check is what stops an old paused worker. Lease expiration only tells the coordinator it may grant ownership to somebody else.

Renewal runs before the lease expires and must tolerate temporary delays without assuming infinite safety. If renewal becomes uncertain, the worker should stop starting new protected work and treat later completion carefully.

Consensus-backed stores such as etcd provide strong coordination primitives and revisions. Use their supported lock/session recipes rather than composing ad hoc reads and writes whose race behavior is unclear.

## Key concepts

**Lease.** Temporary ownership with expiration. It improves recovery from crashed holders but introduces timing assumptions.

**Owner token.** Identifies the current acquisition for safe release. A random token prevents deleting somebody else's lock but does not order old and new owners.

**Fencing token.** Monotonically increases across ownership epochs. The protected resource rejects stale lower tokens.

**Renewal margin.** Renew well before expiry, accounting for network and scheduler delay. A five-second lease renewed at 4.9 seconds has almost no resilience.

**Resource enforcement.** If the destination cannot compare generations or condition writes, the lock may only reduce duplicates rather than prove exclusion.

## Production example

Two workers generate one monthly invoice PDF and write metadata into a database.

Worker A acquires lease generation 41 and begins rendering. Its VM is paused for 90 seconds. The lease expires, so worker B acquires generation 42, renders successfully, and stores metadata tagged 42.

A resumes. Its process memory still says “I hold the invoice lock.” If it writes unconditionally, it can overwrite B's valid result.

The metadata update instead requires a higher generation than the stored one. A's generation 41 cannot replace 42. Object publication also uses immutable attempt keys; the database chooses which object is active. Old orphaned attempt objects can be cleaned later.

Tests explicitly pause A past lease expiry, start B, then resume A. They also test renewal failure and safe release: A must not delete B's lock after B takes ownership.

If the external destination cannot enforce a generation or stable idempotency key, the team documents the lock as best-effort duplicate reduction rather than claiming strict mutual exclusion.

## Trade-offs

Distributed locks can be straightforward for rare administrative ownership but add coordinator availability, renewal traffic, and more failure states.

Long leases reduce false expiration but slow takeover after real failure. Short leases recover quickly but increase risk of expiry during pauses.

Partitioned ownership, unique constraints, conditional writes, or one durable queue consumer may eliminate the lock entirely and often produce simpler correctness.

## Failure modes / pitfalls

Check-then-set acquisition races. Unconditional unlock can delete a newer owner's lock. A random token is mistaken for a fencing token. The resource accepts writes without checking ownership generation.

Using client wall clocks to decide expiry can make skew part of the correctness model. A coordinator timeout leaves acquisition outcome uncertain; blindly requesting a second ownership record can complicate recovery.

Finally, locks can hide architecture problems. If every request needs one global distributed mutex, the workload is effectively serialized with extra network failure.

## When to use it

Use distributed leases for coordinated ownership when only one actor should perform a task and the protected resource can enforce the ownership epoch or duplicate-safe operation identity.

Prefer a maintained coordination service with documented guarantees.

## When not to use it

Do not add a distributed lock when a database unique constraint, atomic conditional update, partition owner, or transactional queue claim already enforces the invariant locally.

Do not claim correctness from a TTL lock when a stale actor can still mutate the resource.

## What a Senior Engineer should know

A Senior Engineer should distinguish lease, owner token, fencing token, and resource-side enforcement. They should test pause/resume, renewal uncertainty, stale release, and coordinator outage.

They should be able to say exactly which invariant the lock protects and what happens after the holder loses it.

## What a Staff Engineer should understand

A Staff Engineer should decide whether the workload needs strict consensus-backed coordination or only duplicate reduction, and should minimize lock scope through better ownership boundaries.

They should establish supported coordination primitives rather than let teams implement subtly different lock recipes in Redis, databases, and ad hoc caches.

Further reading: [etcd lock guide](https://etcd.io/docs/v3.6/tasks/developer/how-to-create-locks/), [etcd API guarantees](https://etcd.io/docs/v3.5/learning/api_guarantees/).
