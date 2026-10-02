---
title: "Distributed locking"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

A distributed lock coordinates actors in different processes, usually granting temporary ownership through a lease. Correctness requires protecting the resource from a previous holder that resumes after losing its lease.

## Why it matters for backend engineers

A paused process can outlive its lease and continue executing. “Only one valid lock” does not imply only one process can still write.

## How it works

An actor acquires ownership through a coordination service, renews before expiry and releases conditionally using its ownership token. For correctness-sensitive writes, acquisition can issue a monotonically increasing fencing token. The protected resource rejects requests with tokens older than the latest accepted owner. Without that enforcement, expiry alone cannot stop stale actors.

## Key concepts

Lease duration trades recovery speed against false expiry. Safe release must not delete another owner's lock. Clock assumptions and coordinator guarantees matter. Fencing tokens differ from random ownership tokens used only to authorize release.

## Production example

Two export workers share a lease. Worker A pauses for a minute; B takes over. When A resumes, object metadata storage rejects A's older fencing generation. A random Redis lock token alone would prevent unsafe deletion of B's lock but would not stop A overwriting B's output.

## Trade-offs

Locks simplify exclusion but add coordinator availability and renewal work. Storage constraints or partitioned ownership can eliminate the need for distributed locking.

## Failure modes / pitfalls

Check-then-set acquisition, unconditional unlock, assuming a short pause is impossible and using locks without resource-side fencing can violate invariants.

## When to use it

Use leases for coordinated ownership when their failure semantics are explicit and the protected operation can enforce them.

## When not to use it

Do not add a distributed lock where a unique constraint, atomic update or single partition owner solves the race.

## What a Senior Engineer should know

Distinguish lease validity, ownership tokens and fencing; test pause/resume and renewal failure.

## What a Staff Engineer should understand

Determine whether correctness needs consensus-backed coordination or merely best-effort duplicate reduction.

Further reading: [etcd concurrency API](https://pkg.go.dev/go.etcd.io/etcd/client/v3/concurrency).
