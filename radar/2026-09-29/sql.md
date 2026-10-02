---
title: "SQL"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

SQL describes operations over relations: selecting, joining, grouping and modifying data. It is declarative—the database chooses an execution plan—so equivalent-looking queries can perform very differently.

## Why it matters for backend engineers

Backend correctness often rests on SQL semantics. A join can multiply rows, a `NULL` comparison can silently exclude results, and an update without the intended predicate can affect an entire tenant.

## How it works

Logical processing derives rows through `FROM` and joins, filters them with `WHERE`, groups them, applies `HAVING`, and computes output and ordering. The optimizer can rearrange physical execution while preserving semantics. Constraints and transactions govern writes; indexes change available access paths rather than the meaning of a query.

## Key concepts

SQL uses three-valued logic: comparisons with `NULL` usually yield unknown. `COUNT(*)` counts rows; `COUNT(column)` excludes nulls. Window functions retain row identity while computing across partitions. Deterministic pagination requires a total ordering, including a tie-breaker.

## Production example

A billing report joins invoices to line items and payments, then sums both. Two one-to-many joins multiply combinations and overstate totals. Aggregate each child relation by invoice before joining, and compare a hand-calculated invoice with the result. Faster execution would not fix the original arithmetic error.

## Trade-offs

Set-based SQL can replace application loops and reduce round trips. Very elaborate queries become hard to review; views or clearly named intermediate expressions can expose intent. Denormalization reduces joins but introduces maintenance work.

## Failure modes / pitfalls

`NOT IN` behaves unexpectedly when its subquery contains nulls; `NOT EXISTS` often expresses exclusion more safely. Floating-point money, ambiguous time zones, implicit casts and missing ordering can create incorrect results even with excellent plans.

## When to use it

Use SQL for relational retrieval and transactional updates. Keep filtering and aggregation near the data when that avoids transferring large intermediate results.

## When not to use it

Do not force binary object processing or complex external orchestration into SQL simply because the data starts in a database.

## What a Senior Engineer should know

Explain join cardinality, grouping, windows, null semantics, parameter binding and transaction boundaries. Validate results as well as performance with representative data.

## What a Staff Engineer should understand

Define data-access conventions that preserve tenant boundaries and constrain expensive queries. Decide when a relational query should become a maintained read model or analytical workload.

Further reading: [PostgreSQL SQL language](https://www.postgresql.org/docs/current/sql.html).
