---
title: "EXPLAIN / EXPLAIN ANALYZE"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

`EXPLAIN` displays PostgreSQL's chosen query plan. `EXPLAIN ANALYZE` executes the statement and adds measured row counts, loops and timing, exposing the gap between the planner's assumptions and actual work.

## Why it matters for backend engineers

A query can become slow without a traffic increase or missing index. Skewed values, stale statistics and changed join cardinalities can make a previously good plan disastrous.

## How it works

Read the tree from child operations toward their parents. Estimated costs are planner units, not milliseconds. Actual row counts are per-loop averages when a node repeats; multiply by loops to appreciate total work. `BUFFERS` reports cache hits and reads, while sort and hash details reveal spills. Parent times include child work, so summing them double-counts execution.

## Key concepts

A sequential scan may be optimal for a large fraction of a table. Nested loops become expensive when an inner operation repeats far more than expected. Index conditions differ from post-scan filters. Extended statistics can describe correlations that independent column estimates miss.

## Production example

An illustrative query filters tickets by workspace and status. The planner expects ten rows but finds eighty thousand, repeatedly probing another table through a nested loop. Compare estimates with actuals, refresh statistics and evaluate dependency statistics for the correlated columns. Recheck the resulting join and buffers with representative parameter values.

## Trade-offs

Measured plans reveal execution behavior but add profiling overhead. Warm caches and selected parameters influence results; one captured plan is not the entire workload.

## Failure modes / pitfalls

`ANALYZE` really executes writes and expensive reads. A transaction rollback does not necessarily undo sequence advancement or external effects from functions. Use an appropriate staging dataset or controlled production procedure; add timeouts where needed.

## When to use it

Use plans to test a concrete explanation for slow queries, spills, excessive reads or estimation errors.

## When not to use it

Do not compare planner costs as wall-clock benchmarks across different environments or force index scans without understanding why the planner avoided them.

## What a Senior Engineer should know

Explain scans, join algorithms, estimates, loops, buffers and sorting. Connect a plan to query frequency and system load.

## What a Staff Engineer should understand

Establish safe plan collection and performance-regression practices, including skewed parameters and data distributions.

Further reading: [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html), [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).
