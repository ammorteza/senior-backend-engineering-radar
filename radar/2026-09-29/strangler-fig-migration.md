---
title: "Strangler Fig migration"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A Strangler Fig migration replaces a legacy system incrementally by putting a routing or integration seam around it and moving one capability at a time to a new implementation.

The pattern reduces the risk of a big-bang rewrite, but only if ownership, data synchronization, and retirement are explicit. Running old and new systems in parallel can create more complexity than either system alone if the migration has no clear end state.

## Why it matters for backend engineers

Legacy systems often cannot be replaced in one release because they serve active customers, have hidden consumers, or contain years of data and operational behavior.

Incremental replacement allows engineers to validate assumptions with production traffic and roll back a small capability. It also exposes mixed-version problems early: which system owns writes, how historical data is copied, and what happens when one path succeeds while another fails.

## How it works

First identify a seam that can route or translate traffic without rewriting the whole legacy system. Common seams include an API gateway, facade, event stream, database change feed, file import boundary, or user segment.

Choose one capability with manageable dependencies. Define which system is authoritative before, during, and after migration.

For reads, the new system may initially read copied/backfilled data while the legacy system still owns writes. For writes, avoid uncontrolled dual writes. Prefer one write authority and a durable replication or outbox mechanism that can reconcile differences.

Route a small population to the new path, compare outcomes, and expand gradually. Instrument both paths so engineers know which one handled each request and whether they disagree.

Retirement is a first-class phase: remove old consumers, jobs, database access, dashboards, and fallback routes only after evidence shows they are no longer needed.

## Key concepts

**Strangling seam.** Boundary through which traffic can be redirected incrementally.

**Authority.** At any stage, one system should be clearly authoritative for each piece of state.

**Backfill.** Historical data migration. It must be restartable, observable, and compatible with concurrent live changes.

**Shadow comparison.** Execute or read both paths without letting both own side effects, then compare results to find semantic differences.

**Rollback window.** Reverting routing is easy only while the old system still has the state required to serve correctly.

**Retirement criteria.** Traffic, data, batch jobs, integrations, and operator workflows all need evidence before deletion.

## Production example

A legacy customer portal stores uploaded documents in a local filesystem and serves downloads through a monolithic API. The new design stores documents in object storage with a dedicated metadata service.

The team starts with downloads. A facade already fronts the old endpoint, so requests for migrated documents can be routed to the new service while non-migrated IDs continue to the legacy application.

A backfill copies files to immutable object keys and records checksums. It is restartable and idempotent. While old uploads remain authoritative, a CDC or outbox path copies newly uploaded documents into the new store.

For an initial 1% of accounts, the facade serves downloads from the new system. Metrics compare HTTP outcome, checksum, latency, and missing-object errors. A shadow check verifies that the legacy and new metadata agree without generating duplicate user-visible side effects.

Once uploads migrate, the new system becomes authoritative for new documents. At that point rollback requires the legacy system to receive or understand new-only data; the team narrows rollback expectations accordingly.

After all traffic moves, old filesystem jobs and support scripts are inventoried and removed. The migration is not considered complete merely because API traffic reached 100% on the new path.

## Trade-offs

Incremental migration reduces blast radius and gives real feedback. It temporarily increases infrastructure, data synchronization, and operational complexity.

A facade simplifies routing but can become a permanent business-logic layer if migration rules accumulate there. Backfills and shadow reads cost extra capacity.

## Failure modes / pitfalls

Unreconciled dual writes create divergence. Identity mismatches between systems can route one entity to the wrong record.

A “temporary” synchronization pipeline can become permanent and ownerless. Teams may also keep the legacy system indefinitely because no retirement criteria were funded.

Rollback assumptions become invalid after the new system starts creating state the old one cannot represent.

## When to use it

Use a strangler migration when a legacy system must remain available, a practical seam exists, and capabilities can move incrementally.

It is especially useful when the old behavior is not fully understood and production comparison will teach the team.

## When not to use it

A small disposable system may be cheaper to replace directly. If the core invariant cannot be split safely, choose a migration boundary around a larger cohesive unit.

Do not introduce a facade and replication machinery for a migration that can be completed safely in one controlled cutover.

## What a Senior Engineer should know

A Senior Engineer should design one migration slice end to end: authority, routing, backfill, live synchronization, observability, reconciliation, rollback, and retirement.

They should test mixed-version states explicitly rather than only old-only and new-only behavior.

## What a Staff Engineer should understand

A Staff Engineer should sequence capabilities so risk decreases over time, define the point at which rollback changes, and fund deletion of migration infrastructure.

They should keep data ownership and team ownership aligned through the transition rather than allowing a permanent hybrid architecture by accident.

Further reading: [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html).
