---
title: "EXPLAIN / EXPLAIN ANALYZE"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

`EXPLAIN` shows the execution plan PostgreSQL chooses for a statement: the scans, joins, sorts and aggregates it expects to perform. `EXPLAIN ANALYZE` actually executes the statement and adds measurements. Comparing predictions with observations helps distinguish a poor estimate from an intrinsically expensive request.

A plan is evidence about one execution under particular data, parameters and conditions. It is not a universal performance rating for the SQL text, and its estimated costs are not milliseconds.

## Why it matters for backend engineers

A query may become slow without a traffic increase or a schema change. One tenant can grow, a status distribution can shift, or a prepared statement can select a plan unsuitable for a particular parameter. The service's CPU may remain quiet while the database does unexpectedly large work.

Plans help locate the mechanism. “Database is slow” becomes “an inner lookup repeated 80,000 times because the outer relation was underestimated.” That explanation suggests a much more specific intervention than adding an index to every filtered column.

## How it works

Start with the statement and representative parameters, then inspect the estimated plan. For a safe read on an appropriate dataset, collect measurements such as:

```sql
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, created_at
FROM tickets
WHERE workspace_id = 42 AND status = 'open'
ORDER BY created_at, id
LIMIT 100;
```

`TIMING OFF` avoids per-node timing collection overhead while retaining row counts and overall execution time. Use node timings when they are needed, understanding the extra instrumentation cost. For expensive queries, use a controlled environment or production procedure with suitable limits; EXPLAIN is not a workload sandbox.

Read the tree from the leaves toward the root. Ask what each child produces and how often its parent requests it. Compare estimated and actual rows near the earliest major divergence. A bad estimate low in the tree can change later join choices and memory needs.

Then inspect work: rows removed by filters, repeated loops, buffer accesses and temporary disk activity. An index condition narrows access through the index; a filter may discard rows only after they were retrieved. Check both the returned row count and the work needed to produce it.

## Key concepts

**Rows and loops.** Actual rows are reported per-loop averages for repeated nodes. An inner node producing one row with 80,000 loops represents roughly 80,000 output rows across its executions. A cheap individual probe can dominate through repetition.

**Inclusive timing.** Parent node times include child work, so adding every node's time double-counts. Parallel plans introduce additional interpretation issues; inspect worker details rather than forcing them into a single serial timeline.

**Buffers are not physical-disk counters.** A shared hit means a page was already in PostgreSQL's shared buffers. A shared read may be satisfied by the operating system cache. Counts describe buffer work, and repeated accesses can count the same block more than once.

**Spills reveal memory pressure within an operation.** A sort using an external disk method or a hash operation with multiple batches deserves attention. Raising a memory setting globally can multiply memory use across plan nodes and concurrent sessions.

**A sequential scan can be correct.** Reading most of a table can be cheaper than many index-directed heap visits. The goal is less relevant work, not an index-scan label at any cost.

## Production example

Imagine a support-ticket query whose outer scan is estimated at 10 rows but returns 80,000 for one large workspace. Its nested-loop join then performs an inner lookup for every ticket. A simplified observation is:

```text
outer scan: estimated rows=10, actual rows=80000, loops=1
inner lookup: actual rows=1, loops=80000
```

These are illustrative counts, not a copied benchmark. First confirm that the query really needs all 80,000 rows; a missing limit or inappropriate endpoint contract cannot be repaired by better estimates alone.

If the result size is intended, examine statistics freshness and the relationship between workspace and status. A workspace where nearly every ticket is open violates a simple independence assumption. Depending on predicates and distribution, multicolumn statistics may help the planner choose a better strategy. They do not create a new index or guarantee a particular join.

After a targeted change, capture the plan again for both the large workspace and ordinary workspaces. Compare estimation accuracy, buffers, temporary I/O and elapsed time. Also consider call frequency: saving a little work on a frequently executed statement can matter more than optimizing an occasional report.

## Trade-offs

Measured plans expose actual behavior, but measurement itself has overhead and may warm caches. Results from a small development database or one favorable parameter can mislead. Retain enough context—version, parameters, relevant settings and data scale—to interpret comparisons.

Production capture is often more representative but carries execution cost and possible sensitive values. Establish a safe collection process rather than encouraging ad hoc execution of the heaviest statements during an incident.

## Failure modes / pitfalls

`ANALYZE` executes writes as well as reads. Wrapping a statement in a transaction and rolling back can undo ordinary table changes, but not every consequence: sequences advance, locks affect other sessions, and functions may cause external effects. Use a suitable test environment for those cases.

Do not sum inclusive node times, mistake cost units for elapsed time or assume a cache read is a disk read. An apparently fast EXPLAIN run also may exclude application pool waiting and network transfer that dominate user latency. Correlate plans with the request path.

## When to use it

Use EXPLAIN to investigate a concrete hypothesis about scans, join repetition, sorting, estimation or resource use. It is particularly useful before and after an index, schema or query change.

Start with the slow statement's actual workload context. A correct plan interpretation requires knowing the expected result, parameter distribution and how often the statement runs.

## When not to use it

Do not use planner costs as benchmarks across unrelated machines or databases. Do not force scans or join algorithms simply because another plan looked faster on one test.

Avoid executing an expensive or effectful statement just to obtain a measurement when its operational consequences are unknown. Estimated plans, existing query statistics and controlled reproduction may be the safer first evidence.

## What a Senior Engineer should know

A Senior Engineer should read scans and common joins, identify the first important cardinality mismatch and interpret loops, buffers and spills. They should connect the plan to a falsifiable explanation and verify the change against representative parameters.

They should also distinguish query execution time from pool wait, lock wait and end-to-end response time, and collect plans without turning diagnosis into a larger incident.

## What a Staff Engineer should understand

A Staff Engineer should establish representative performance-regression datasets, safe production plan collection and review practices for high-impact queries. Tenant skew, data growth and prepared-plan behavior belong in that strategy.

They should identify when repeated tuning of individual statements is masking an architectural mismatch, such as operational databases serving unrestricted analytics or APIs requiring full-table work per request.

Further reading: [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html), [EXPLAIN reference](https://www.postgresql.org/docs/current/sql-explain.html), [Planner statistics](https://www.postgresql.org/docs/current/planner-stats.html).
