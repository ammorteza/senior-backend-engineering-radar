---
title: "CQRS"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Command Query Responsibility Segregation (CQRS) separates the model used to change state from the model used to read it. The separation can be as small as different application interfaces over one database, or as large as an authoritative write store plus independently maintained query projections.

CQRS does not require event sourcing, microservices, a command bus, or separate databases. Those techniques can be combined with it, but the core idea is simply that write semantics and read semantics may deserve different models.

## Why it matters for backend engineers

A write model is often shaped by invariants and transactions, while a read model is shaped by user navigation, search, sorting, and aggregation. Forcing both through one object graph can produce awkward APIs or expensive queries.

The danger is adopting the full distributed version of CQRS before the mismatch actually exists. A second datastore introduces staleness, backfill, schema migration, reconciliation, and recovery. Those costs should solve a measured problem.

## How it works

Commands represent requested changes such as `ApproveClaim`. The write side authenticates and authorizes, loads the relevant authoritative state, validates invariants, and commits a transition. It returns the accepted result or operation state.

Queries read a representation optimized for access. In a simple code-level CQRS design, this may be SQL projections or read-only repository methods against the same database.

In a distributed design, committed changes publish durable events or CDC records that update one or more read models. Each projection has its own checkpoint and applies updates idempotently and with source-version awareness. The product defines acceptable lag and read-after-write behavior.

Projection rebuild is part of the design. A new schema can be built from authoritative source or history into a new table or index while the old query model continues serving. After catch-up and validation, readers switch.

## Key concepts

**Command versus event.** A command asks an owner to perform an action and can be rejected. An event reports an accepted fact.

**Write authority.** The query store is a projection, not a second source of truth. User edits should not be applied directly to it unless the architecture explicitly assigns authority.

**Projection lag.** “Eventually consistent” needs an objective and user behavior. Show pending state, route read-your-write to authoritative data, or wait for a checkpoint depending on the product.

**Rebuildability.** A projection should be reproducible from its authoritative inputs within an acceptable recovery time. If not, it has quietly become authoritative state.

**Schema independence.** Read-model schema can evolve independently from write normalization, but each change needs deployment and backfill compatibility.

## Production example

A claims system stores normalized claims, assessments, and decisions in PostgreSQL because writes need constraints and transactions. Investigators search across claimant name, provider, status, region, and free text—queries that become increasingly awkward and expensive on the write model.

The team builds a search-oriented case summary projection. Claim changes publish durable events through an outbox. A projector applies each claim revision to the search index using stable document identity and source version so duplicates and older events cannot regress state.

After an assessment change, the command response returns the new authoritative revision. The UI shows “search index updating” for workflows that immediately navigate to search, or fetches the individual claim directly from PostgreSQL until the projection reaches that revision.

To change the search mapping, the team creates a new index, backfills from authoritative data, catches up live changes, validates counts and representative queries, then switches an alias. Rebuilding projections never sends customer emails because external side effects are separate workflows.

A lag alert measures oldest unapplied source change, not only queue length. During recovery the projector drains at a rate that does not overwhelm the write database or search cluster.

## Trade-offs

Code-level separation can improve clarity with almost no distributed-systems cost. Separate read stores can improve query performance and independent scaling, but introduce staleness and duplicated data.

Several specialized projections make reads fast but increase maintenance and storage. One flexible read model is simpler but may not serve every workload efficiently.

## Failure modes / pitfalls

Treating the projection as authoritative creates two writers for one fact. Updating it synchronously from application code and also asynchronously from events can create conflicting paths.

No rebuild procedure means a corrupted projection becomes a production emergency. Replaying events through normal side-effect handlers can resend historical notifications.

Command buses and separate types for trivial CRUD can add ceremony without benefit. CQRS should clarify a real write/read mismatch, not satisfy an architecture checklist.

## When to use it

Use CQRS when write invariants and read shapes differ enough that separate models improve clarity, performance, or ownership.

Start with code-level separation; introduce separate storage only when measured query or scaling requirements justify the synchronization infrastructure.

## When not to use it

A straightforward service with modest CRUD queries usually benefits from one model and one transactional database.

Do not combine CQRS with event sourcing or microservices automatically; each pattern needs its own justification.

## What a Senior Engineer should know

A Senior Engineer should define write authority, command semantics, projection update identity, lag behavior, and rebuild procedure.

They should design the user experience for read-after-write and know how to diagnose whether bad query results come from source state, event transport, or projection logic.

## What a Staff Engineer should understand

A Staff Engineer should decide whether distributed read models are worth their lifecycle cost and establish projection ownership, freshness objectives, and recovery standards across teams.

They should prevent query stores from becoming undocumented sources of truth and guide teams toward simpler code-level CQRS where that provides most of the value.

Further reading: [Martin Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html).
