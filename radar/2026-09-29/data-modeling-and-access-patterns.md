---
title: "Data modeling and access patterns"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Data modeling defines how business information, relationships and invariants are represented in storage. Access-pattern-driven design starts from how data is read, written, filtered, joined, ordered and retained rather than modeling entities in isolation.

The best model depends on both business semantics and the storage engine.

## Why it matters for backend engineers

A poor model creates permanent friction: expensive queries, weak constraints, difficult migrations and scaling problems that application code cannot fully hide.

Backend engineers should be able to explain why a schema supports the workload rather than merely map structs to tables.

## How it works

The engineer identifies entities, ownership, invariants, cardinalities and lifecycle, then maps important read and write paths. In relational databases, normalization and constraints provide consistency and flexible querying. Selective denormalization can optimize known workloads.

In key-value or wide-column systems, partition and sort keys are often designed directly from access patterns because arbitrary joins are unavailable or expensive.

## Key concepts

### Invariant
A condition that must remain true, such as unique email or nonnegative inventory.

### Cardinality
Relationship sizes affect joins, indexes and partition design.

### Normalization
Normalization reduces duplication and update anomalies.

### Denormalization
Intentional duplication can improve read efficiency at the cost of synchronization.

### Ownership
Clear ownership determines which component may authoritatively change data.

### Lifecycle
Retention, deletion, archival and schema evolution are part of the model.

## Production example

A delivery system stores assignments and frequently queries active assignments by hub and status. Modeling only around assignment ID makes the critical access path expensive.

A relational design adds indexes aligned with hub/status/time access, while a high-scale key-value design might use a partition key derived from hub and a sortable key for active work. The model follows the workload while preserving assignment identity and invariants.

## Trade-offs

Highly normalized models reduce duplication but can require joins. Denormalized models reduce read work but increase write and consistency complexity.

Models optimized for one access pattern can make new product requirements expensive, so flexibility has value too.

## Failure modes / pitfalls

Common problems include storing unstructured JSON to avoid schema decisions, missing constraints, unbounded arrays, accidental many-to-many explosions, shard keys chosen from IDs with hotspots and copying data without defining synchronization ownership.

ORM convenience can also hide inefficient access patterns such as N+1 queries.

## When to use it

Deliberate data modeling is required for every persistent system. The amount of optimization should match workload scale and business criticality.

## When not to use it

Do not prematurely denormalize or adopt specialized databases before relational modeling and indexing have been evaluated.

## What a Senior Engineer should know

A Senior Engineer should translate business invariants and access patterns into schemas, constraints and indexes. They should understand normalization, denormalization, cardinality and lifecycle.

They should evaluate a database choice from required operations rather than popularity.

## What a Staff Engineer should understand

A Staff Engineer should reason about data ownership across domains, future access patterns, migration cost, regulatory lifecycle and scaling boundaries.

They should establish models that preserve organizational autonomy without creating uncontrolled duplication or shared-database coupling.
