---
title: "Database indexing and query optimization"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Query optimization reduces the work required to answer important database requests. It includes query shape, schema, statistics and access patterns as well as indexes. An index is an additional structure that lets the engine locate or order selected rows without examining the whole table.

It is a trade: the index must be stored, cached and maintained when data changes. A useful index accelerates an actual workload enough to justify those costs. Indexing every column is not a substitute for understanding which rows the application asks for.

## Why it matters for backend engineers

One high-frequency query can dominate database CPU or I/O even when each call seems moderately fast. Conversely, an infrequent long report may have little effect until it overlaps with peak traffic. Optimization should consider aggregate work, latency objectives and contention, not only the slowest observed duration.

An index also interacts with correctness and product behavior. Pagination, tenant filters and required ordering shape the access path. Optimizing a query that accidentally returns far more data than the caller needs can preserve the underlying problem.

## How it works

Begin with the statement, parameter distribution, result size and frequency. Use query statistics to identify expensive workload families, then a representative measured plan to see where time and reads go. Determine whether the problem is scanning too many rows, repeating joins, sorting, waiting for locks or choosing a plan from poor estimates.

Design a candidate access path. A B-tree orders keys and commonly supports equality, ranges and ordered traversal. A composite index can align a tenant equality with a time range and stable ordering. Column order matters, but rules such as “most selective column first” are incomplete: equality constraints, range boundaries, ordering and other queries using the same index all matter.

Check statistics before assuming the access path is missing. The planner can reject an available index for good reasons, or because its row estimates are wrong. Refreshing statistics or modeling selected correlations may change its decision; this does not reduce the real number of rows requested.

Validate both read improvement and write cost. Build the index through an appropriate production procedure, observe its use over representative traffic and retain a plan for removal if it adds little value.

## Key concepts

**Selectivity and locality.** Finding a few rows usually favors an index; retrieving much of a table can favor sequential access. Heap-page locality and cache state influence the actual crossover.

**Partial indexes.** Indexing only a stable subset, such as rows where `status = 'open'`, can reduce size and maintenance. The planner must be able to establish that the query implies the index predicate. Parameterized conditions and generic plans can complicate that proof.

**Included columns.** Non-key payload columns can make index-only access possible, but PostgreSQL still needs visibility information to avoid heap checks. Wider indexes consume more space and write bandwidth; “cover everything” is not free.

**Specialized indexes.** GIN can serve suitable containment or text-search operators; BRIN summarizes block ranges and can suit large physically correlated datasets. Choose an index method from the operators and data layout, not from its name.

**Statistics describe distributions.** A single-column histogram cannot capture every relationship between columns. Extended statistics offer specific forms of multicolumn information, with applicability limits; they are not a universal fix for joins or arbitrary expressions.

## Production example

A support API lists a workspace's newest tickets. Its query is:

```sql
SELECT id, created_at, subject
FROM tickets
WHERE workspace_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

An illustrative candidate is:

```sql
CREATE INDEX CONCURRENTLY tickets_workspace_recent_idx
ON tickets (workspace_id, created_at DESC, id DESC);
```

The workspace equality selects a contiguous key range, and the remaining key order lets the engine find the newest entries without sorting every ticket in that workspace. The unique ID breaks timestamp ties. This assumes the identifier and timestamp are non-null and match the API's ordering contract.

For subsequent pages, a cursor can add `(created_at, id) < ($2, $3)` while retaining the same descending order. This avoids repeatedly walking and discarding an ever-growing OFFSET. It does not freeze the dataset across requests; the API must define behavior when tickets are added or removed during pagination.

Check plans for a small workspace and a large one, then compare rows visited, buffers and latency. Measure insert/update overhead and index size too. Do not add `subject` as an included column automatically: large text can make the index expensive, and only 50 heap fetches may already be acceptable.

Concurrent creation reduces disruption to ordinary writes, but consumes resources, has waiting phases and can leave an invalid index after failure. Inspect completion and validity before declaring the rollout successful.

## Trade-offs

Additional indexes speed selected reads while increasing storage, WAL generation and write maintenance. Similar indexes can overlap, but removal requires checking constraints and infrequent operational queries as well as recent usage counters.

Denormalized read models or precomputed aggregates can eliminate repeated joins, at the cost of freshness and synchronization. Use them when measured query work justifies the additional data-maintenance path, not because every join is inherently slow.

## Failure modes / pitfalls

Functions or casts on indexed values can prevent the desired access unless a matching supported expression index exists. Unbounded result sets can remain expensive even with perfect lookup. Stale or unrepresentative statistics can mislead the planner.

Speculative indexes accumulate unnoticed, particularly after counters reset or short observation windows hide seasonal queries. Increasing memory or disabling sequential scans may improve one experiment while harming the wider workload. Keep changes tied to evidence and verify concurrency, not just a solitary warm-cache run.

## When to use it

Optimize when query work materially affects latency, throughput, cost or capacity. Also review access paths when adding a new high-volume endpoint or changing a query's filtering and ordering contract.

A practical sequence is: verify the result, identify the dominant work, change one relevant factor and compare under realistic data and concurrency. This preserves a causal explanation for the improvement.

## When not to use it

Do not add indexes simply because a column appears in `WHERE`, or optimize a rarely used statement without considering its total impact. Avoid creating a new read model when a bounded query and suitable index meet the requirement.

If a workload fundamentally needs broad historical scans, assess workload isolation or analytical storage rather than endlessly adding transactional indexes.

## What a Senior Engineer should know

A Senior Engineer should design indexes from predicates and ordering, read measured plans and explain the maintenance cost. They should recognize estimation problems, skewed tenants, pagination inefficiency and query amplification from application loops.

They should also roll out and remove indexes safely, verify invalid-build states and communicate the evidence showing that the change helped the important workload.

## What a Staff Engineer should understand

A Staff Engineer should connect data-access growth to capacity, ownership and product contracts. Repeated per-query emergencies can indicate that APIs permit unbounded work or that analytics and operational traffic need separation.

Establish review and regression practices that include representative distributions, concurrent writes and lifecycle maintenance. The target is sustainable workload efficiency, not an ever-growing collection of indexes.

Further reading: [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html), [Planner statistics](https://www.postgresql.org/docs/current/planner-stats.html), [Concurrent index creation](https://www.postgresql.org/docs/current/sql-createindex.html).
