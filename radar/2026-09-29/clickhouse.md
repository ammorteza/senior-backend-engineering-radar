---
title: "ClickHouse"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

ClickHouse is a column-oriented analytical database designed to scan and aggregate large datasets efficiently. Rather than optimizing primarily for short transactions that update a few related rows, it emphasizes compressed storage, batch processing and access paths that skip irrelevant ranges.

Its SQL syntax can look familiar while its table semantics differ from a transactional relational database. In particular, a MergeTree primary key is not a PostgreSQL-style uniqueness constraint. The selected table engine and query strategy determine how versions, duplicates and corrections are interpreted.

## Why it matters for backend engineers

Telemetry, usage analysis and event reporting often need aggregate answers over millions or billions of records. Moving that work away from an operational database can protect request-serving traffic and support richer analysis.

However, a fast aggregation over duplicated or incorrectly versioned data is still wrong. Backend engineers must design ingestion identity, sorting and correction behavior together with the queries. Storage throughput alone does not establish the meaning of the result.

## How it works

MergeTree-family tables store data in immutable parts sorted by the table's ordering key. Columnar layout supports compression and reading only required columns. Sparse indexing and related metadata let the engine skip ranges when query predicates align with the data's arrangement.

Inserts create parts that are merged in the background. Many tiny inserts can create more part-management and merging work than the system can sustain. Batching or appropriately configured asynchronous insertion can reduce that pressure, but acknowledgement and error handling must match the chosen mode.

Partitioning organizes larger groups of parts and supports lifecycle operations. It should not be confused with a transactional lookup index or used to create an enormous number of tiny partitions. Sorting within partitions is often crucial to query efficiency.

Specialized engines add behavior. ReplacingMergeTree can reconcile rows with the same sorting key during merges, optionally using a version column. Background merging is not an immediate uniqueness guarantee. Queries that require the resolved view need an appropriate strategy, such as supported FINAL semantics or explicit version-aware aggregation, with its measured cost.

## Key concepts

**ORDER BY is physical design.** A key beginning with tenant and time can help common tenant/time queries skip data. A different workload may need another ordering, projection or representation. One layout cannot optimize every filter equally.

**Primary key is sparse navigation.** It helps locate granules rather than enforcing a single row per business identity. Inserting the same ID twice does not become a uniqueness error merely because the ID is in the key.

**Part count is operational state.** Sustained tiny writes can overwhelm metadata and merges even when total data volume is modest. Observe parts, merge backlog and ingestion errors alongside bytes per second.

**Replacement identity must be stable.** In ReplacingMergeTree, changing a field included in the sorting key changes which rows are considered equivalent. Including mutable status in that key can prevent two versions of one entity from replacing each other.

**Corrections need explicit semantics.** Append-only events, latest-state records and pre-aggregated values are different data models. Select an engine and query contract that matches which one is authoritative.

## Production example

An observability platform ingests measurements from many tenants and serves recent aggregate charts. The team chooses a time-based partitioning scheme and a sorting key aligned with tenant, metric and time for the dominant queries. It validates how much data queries skip instead of assuming the presence of a primary key makes them selective.

Initially every event is inserted separately. Part counts rise and merging falls behind. The team introduces bounded ingestion batches or a supported asynchronous insert configuration, then verifies when acknowledgements occur and where failures are surfaced. It tests sustained ingestion long enough for merges to reach a steady state.

A separate dashboard needs current ticket status from a change stream. That table uses a stable ticket identity and source version in a replacement design. The team sends an older version after a newer one and confirms that the query still returns the intended latest state. It also tests before background merges occur, because immediate results cannot depend on a future merge happening at a convenient time.

The two tables deliberately have different semantics: immutable measurements versus changing entities. The service documents deduplication and correction behavior for each rather than applying one generic “events table” pattern to both.

## Trade-offs

Columnar scans and compression can provide excellent analytical performance. Frequent small updates, foreign-key-style integrity and multi-row operational transactions are a less natural fit and may need another authoritative store.

More query-time reconciliation can improve correctness before background merges but adds read work. More ingestion batching reduces part pressure but can increase freshness delay. These are product-visible trade-offs that need measured objectives.

## Failure modes / pitfalls

A poor sorting key can make every dashboard scan large portions of the data. Excessive partitions and tiny inserts create operational pressure. Assuming primary keys enforce uniqueness or that replacement happens immediately can overcount results.

Engine-specific deduplication of retries should not be generalized into unlimited application-level exactly-once behavior. Retried data outside the supported identity or deduplication conditions can still duplicate. Schema changes and correction mechanisms also require validation under concurrent ingestion, not only on a static sample.

## When to use it

Use ClickHouse for substantial analytical scans and aggregations, including observability and usage datasets, when ingestion and query patterns fit. Establish event identity, correction rules and lifecycle alongside the physical layout.

Test representative filters, tenant skew, sustained ingestion and query concurrency. Maintenance backlog must remain bounded while the workload meets its freshness and latency goals.

## When not to use it

Do not use it as the default authoritative store for account balances or relational workflows requiring ordinary transactional constraints. A JSON-like or tabular record format does not determine the right database.

Avoid choosing it solely from a scan benchmark that excludes corrections, retries and ongoing ingestion. Those paths can determine whether the application's results remain trustworthy.

## What a Senior Engineer should know

A Senior Engineer should design sorting and partitioning from real queries, interpret part and merge pressure and understand the chosen engine's result semantics. They should test old versions, duplicates and pre-merge reads.

They should also choose ingestion batching and acknowledgement behavior deliberately, balancing throughput with freshness and error visibility.

## What a Staff Engineer should understand

A Staff Engineer should separate analytical projections from transactional authority and define how data is corrected or rebuilt. Shared analytical infrastructure needs tenant isolation and workload budgets so one expensive query does not dominate the platform.

Evaluate lifecycle, reprocessing and recovery costs alongside scan performance. The organization should be able to explain the meaning of a reported total even when ingestion retries or late corrections occur.

Further reading: [MergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree), [ReplacingMergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree), [Asynchronous inserts](https://clickhouse.com/docs/optimize/asynchronous-inserts).
