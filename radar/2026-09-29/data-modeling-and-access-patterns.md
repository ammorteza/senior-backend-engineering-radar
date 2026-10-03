---
title: "Data modeling and access patterns"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Data modeling defines how business facts, relationships and invariants are represented in storage. Access-pattern design asks how those facts will be created, retrieved, filtered, ordered, changed and eventually removed. A useful schema serves both the meaning of the data and the operations the product needs.

The model is not simply a serialized application struct. A field's identity, ownership and lifecycle can outlast several versions of application code. Storage choices should preserve that meaning while making important operations feasible.

## Why it matters for backend engineers

A weak model creates recurring costs: ambiguous ownership, duplicate facts that disagree, missing constraints and queries that scan far more than the caller needs. Adding a cache may temporarily hide the latency while preserving the underlying ambiguity.

Cardinality and growth matter early. A design that embeds five small child records can behave very differently when one customer has five million. Backend engineers should ask how relationship sizes, history and retention evolve, rather than assuming today's sample data defines the system.

## How it works

Start with business language and invariants. Identify entities with independent identity, value-like information, relationships and the component authorized to change each fact. Specify required uniqueness and the meaning of absence, deletion and historical changes.

List the critical operations with their predicates, ordering, result bounds and consistency needs. “Read customer” is insufficient if the actual operation is “list the latest 50 approved applications for one organization, continuing from a cursor.” Those details influence keys, indexes and possible partitioning.

In a relational design, normalize authoritative facts so one change has one intended location, and enforce suitable relationships with constraints. Add denormalized copies only for a demonstrated access need, naming their source, update mechanism and acceptable lag.

In a key-value or wide-column design, key choice often determines which queries can be served efficiently at all. A new query may need another maintained representation. Make that write and reconciliation cost explicit before selecting the store.

Finally, model lifecycle and migration. Decide which facts can be corrected, which need immutable history and how dependent copies are deleted or rebuilt. A schema is an evolving contract, not a one-time diagram.

## Key concepts

**Identity differs from a mutable attribute.** An email address or display name may change; using it as the only durable identity can complicate relationships and history. Stable identifiers do not replace business uniqueness constraints.

**Relationship cardinality.** One-to-many and many-to-many relationships affect joins and aggregation. Declare the expected and worst-case sizes so unbounded collections do not surprise the implementation.

**Normalization prevents update anomalies.** Storing a customer's current name in many authoritative rows creates several places to update. Historical documents may deliberately store the name as it was at issuance; that is a different fact, not necessarily a normalization error.

**Tenant scope.** Uniqueness may be global or per tenant. Composite keys and foreign keys can help ensure a child references a parent in the same tenant, where the schema requires it.

**Derived state needs ownership.** A search document, balance summary or latest-status column must have a defined source and repair path. Two services independently treating the same copy as authoritative creates conflict.

## Production example

A credit-application service needs to show current application status and retain a history of decisions. Storing only `status='approved'` cannot explain who made the decision or which inputs were used. Storing every change in an unbounded JSON array makes querying and concurrent updates awkward.

An illustrative relational model separates an `applications` row from `application_decisions` rows. Each decision has its own identity, application reference, actor, timestamp and decision metadata. The current application state is updated with the new decision in one transaction when that is the chosen authority model.

The team defines the exact rule for a “current” decision. It does not simply use the greatest timestamp, because clocks can tie and corrections may have distinct semantics. If a current-decision reference is stored, the write path and constraints must preserve its relationship to the application.

For the product list, an index supports organization, state and stable chronological ordering. For an audit view, decisions are fetched by application identity. Tests include concurrent decisions, corrected decisions, a large history and attempts to relate objects across organizations.

This example is a data-modeling exercise, not a prescription for a particular lending policy. The important lesson is to distinguish current operational state, immutable historical facts and derived views, then assign authority and update rules to each.

## Trade-offs

Normalization reduces accidental duplication and supports new joins, but some high-volume reads may require several relations. Denormalization can simplify those reads while introducing update lag, repair and extra write paths.

A specialized model can make one known query extremely efficient while making future requirements expensive. Relational flexibility therefore has value even when a narrowly optimized store wins one benchmark. Conversely, a universal JSON document can defer useful decisions until every reader implements its own interpretation.

## Failure modes / pitfalls

Missing constraints allow invalid states through scripts or concurrent writers. Unbounded arrays and partitions grow beyond the assumptions of ordinary requests. Many-to-many joins can multiply rows and distort aggregates.

ORM convenience may produce N+1 queries, but the deeper issue is failing to specify the required access pattern. Soft deletion can also conflict with uniqueness and references if its meaning is undefined. Treat history, correction and deletion as separate semantics instead of overloading one Boolean flag.

## When to use it

Model deliberately whenever persistent state is introduced, particularly when several workflows or teams depend on it. Start with a small set of important operations and invariants, then validate them with realistic relationship sizes.

Revisit the model when repeated query workarounds or duplicated synchronization logic indicate that the original boundaries no longer fit the product.

## When not to use it

Do not prematurely denormalize every relationship or shard by an arbitrary identifier before measuring the workload. Do not adopt a database solely because it conveniently stores the current application's object shape.

Avoid forcing unrelated domains into one global model when their meanings and ownership differ. Shared identifiers and explicit contracts may be more stable than a shared table that every team can modify.

## What a Senior Engineer should know

A Senior Engineer should translate product operations into schemas, constraints and bounded queries. They should explain the grain of stored facts, relationship sizes and the consistency mechanism for derived data.

They should also design migrations and deletion paths, identify N+1 access and test concurrency at the model's important invariants. A diagram without executable constraints and access paths is only part of the work.

## What a Staff Engineer should understand

A Staff Engineer should establish data ownership across domains and decide where duplication is intentional. Cross-team models need clear authority, compatibility and recovery rules so organizational independence does not become inconsistent data.

Evaluate future access requirements and migration cost without optimizing for speculative scale. The long-term goal is a model whose meaning remains understandable as products, teams and storage technologies change.

Further reading: [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [Table expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html).
