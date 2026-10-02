---
title: "CQRS"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Command Query Responsibility Segregation separates the model used to change state from the model used to read it. It can be a code-level separation or distinct storage and asynchronous projections.

## Why it matters for backend engineers

A transaction model designed for integrity may be awkward for search or dashboards. CQRS makes this mismatch explicit without requiring event sourcing or microservices.

## How it works

Commands validate intent and update the authoritative write model. Queries read a representation optimized for their access patterns. When separate stores are used, committed changes update projections synchronously or through durable events/CDC. The design must define projection lag and how users observe their own recent commands.

## Key concepts

A command is a requested action, not an event reporting a fact. Projections need rebuild and schema migration procedures. Idempotent updates and source versions prevent replay from duplicating or regressing query state.

## Production example

A claims system keeps normalized claim and assessment tables for writes but builds a searchable case summary for investigators. After an assessment changes, the UI displays a pending refresh state until the projection catches up. Replay reconstructs summaries without resending customer emails.

## Trade-offs

Independent read models improve query flexibility and scaling. Separate stores introduce staleness and operational work; code-level separation is cheaper and often sufficient.

## Failure modes / pitfalls

Treating the query store as authoritative, lacking rebuilds and forcing every CRUD entity through a command bus add fragility or ceremony.

## When to use it

Use CQRS when write invariants and read shapes differ enough to justify separate models.

## When not to use it

A straightforward application with modest queries usually benefits from one model and one database.

## What a Senior Engineer should know

Define write authority, projection update semantics and read-after-write behavior.

## What a Staff Engineer should understand

Decide whether benefits justify synchronization infrastructure and manage projection ownership across teams.

Further reading: [Martin Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html).
