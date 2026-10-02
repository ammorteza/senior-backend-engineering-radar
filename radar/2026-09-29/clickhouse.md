---
title: "ClickHouse"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

ClickHouse is a column-oriented analytical database designed for fast scans and aggregations over large datasets. It is not a drop-in replacement for a transactional relational engine.

## Why it matters for backend engineers

Operational logs and telemetry often need aggregate queries over billions of records. Query shape and sorting layout determine whether the engine can skip most data or scan it all.

## How it works

MergeTree-family tables store sorted data parts and merge them in the background. Columnar layout supports compression and vectorized processing. Primary-index granules help skip ranges; the primary key is not a uniqueness constraint like a PostgreSQL primary key. Specialized table engines change deduplication and aggregation semantics.

## Key concepts

`ORDER BY` controls physical sorting. Partitioning supports lifecycle and pruning but should not create excessive tiny parts. Batch inserts reduce part creation. Mutations and versioned engines have asynchronous behavior requiring explicit query semantics.

## Production example

A telemetry service batches readings into a table sorted by tenant and time. Dashboards query recent periods for one tenant. Tiny per-event inserts initially overload merging; larger batches reduce part counts. A correction workflow accounts for engine-specific version selection instead of assuming immediate row replacement.

## Trade-offs

Fast compressed analytics suit append-heavy data. Frequent point updates, strict uniqueness and multi-row business transactions fit less naturally.

## Failure modes / pitfalls

Poor sorting keys, too many partitions, tiny inserts and assuming deduplication is immediate or universal can mislead results.

## When to use it

Use ClickHouse for analytical aggregations, observability and event datasets with suitable ingestion patterns.

## When not to use it

Avoid it as the default source of truth for account balances or transactional relationships.

## What a Senior Engineer should know

Design sorting keys, batches and query plans; inspect part and merge pressure.

## What a Staff Engineer should understand

Separate analytical and transactional responsibilities and plan freshness, corrections and tenancy isolation.

Further reading: [MergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree).
