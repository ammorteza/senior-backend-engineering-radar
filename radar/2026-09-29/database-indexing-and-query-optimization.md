---
title: "Database indexing and query optimization"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Database query optimization is the process of shaping schemas, indexes, statistics and queries so the database can execute important workloads efficiently. An index is an auxiliary data structure that trades storage and write cost for faster access to selected data.

Optimization should be driven by execution evidence, not rules such as "every WHERE column needs an index."

## Why it matters for backend engineers

Database performance often determines backend latency and capacity. One query-plan regression can saturate CPU or I/O while application metrics appear normal.

Senior engineers need enough planner literacy to distinguish application scaling problems from data-access problems.

## How it works

A query planner estimates the cost of possible execution strategies using table statistics, cardinality estimates and available indexes. It chooses scans, joins, sorting and aggregation strategies.

B-tree indexes support many equality and range lookups. Composite index usefulness depends on column order and access patterns. Other index types serve specialized workloads.

EXPLAIN shows the plan; EXPLAIN ANALYZE executes the query and reports actual timing and row counts, allowing comparison with estimates.

## Key concepts

### Selectivity
An index is most useful when predicates narrow the search meaningfully.

### Cardinality estimation
Bad estimates can cause the planner to choose the wrong join or scan strategy.

### Composite index
Column order should reflect actual filtering, ordering and access patterns.

### Covering/index-only access
An index may contain enough information to avoid some heap access.

### Write amplification
Every useful index also adds storage and maintenance work to writes.

### Statistics
Planner decisions depend on statistics; correlated columns can require richer statistics than independent estimates provide.

## Production example

An order endpoint jumps from roughly tens of milliseconds to more than a second while service CPU remains normal. Database CPU rises sharply.

EXPLAIN ANALYZE shows the planner underestimates rows because hub_id and status are correlated, choosing an inefficient plan. Appropriate extended statistics improve the estimate and restore a better plan. The lesson is that an existing index alone does not guarantee the planner understands the data distribution.

## Trade-offs

Indexes speed selected reads but slow inserts and updates, consume memory/storage and require maintenance.

Denormalization or materialized views can improve reads further but introduce freshness and write complexity.

## Failure modes / pitfalls

Common mistakes include indexing every column, trusting estimated plans without actual execution when safe, ignoring parameter-dependent plans, functions that prevent index use, huge OFFSET pagination and optimizing synthetic queries unlike production workloads.

Another pitfall is focusing only on query duration rather than frequency: a moderately slow query executed millions of times may dominate cost.

## When to use it

Optimize queries when workload evidence shows meaningful latency, CPU, I/O or capacity impact. Design indexes from access patterns and validate them against realistic data.

## When not to use it

Do not prematurely create speculative indexes or micro-optimize queries that are irrelevant to system cost. Sometimes the correct fix is a different data model or request pattern.

## What a Senior Engineer should know

A Senior Engineer should read EXPLAIN ANALYZE, understand common scans and joins, index selectivity, composite indexes, statistics and write cost.

They should correlate query plans with production metrics rather than guessing.

## What a Staff Engineer should understand

A Staff Engineer should guide data-access architecture, recognize workload changes that invalidate previous indexing strategies and establish safe performance-testing and schema-review practices.

They should know when the problem has moved beyond one query into partitioning, caching, read models or workload isolation.
