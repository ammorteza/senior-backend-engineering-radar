---
title: "SQL"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

SQL is a language for defining and manipulating relational data. You describe the result you want—such as invoices with unpaid balances—rather than writing a loop that chooses which disk pages to visit. The database chooses a physical execution plan that preserves the query's meaning.

That separation is powerful, but it makes semantics important. SQL normally operates on bags of rows, so duplicates remain unless an operation removes them. Joining, grouping and handling missing values can change the answer even when every statement parses and runs successfully.

## Why it matters for backend engineers

A backend service can return incorrect financial totals or leak tenant data through perfectly valid SQL. Performance tuning cannot repair an aggregate computed over the wrong row set. Engineers need to establish the meaning and cardinality of intermediate results before discussing indexes.

SQL is also where many business guarantees become enforceable. A unique constraint protects against concurrent duplicate inserts in a way that an application-side “does it exist?” query cannot. Parameterized queries separate values from executable syntax, while carefully scoped predicates limit the rows a write may affect.

## How it works

Think through a query's logical stages: form rows using `FROM` and joins, filter them with `WHERE`, group and aggregate where requested, filter groups with `HAVING`, compute the selected output and apply ordering and limits. This is a reasoning model, not a promise about physical execution order. The optimizer may reorder joins or push down predicates when the result remains equivalent.

A join produces matching combinations. If an invoice has three line items and two payments, independently joining both child tables produces six rows for that invoice. Aggregating those rows can repeat each amount. Start by stating the grain of each input and desired output: one row per invoice, payment, customer or reporting period.

Writes also have semantics beyond their syntax. `UPDATE ... WHERE ... RETURNING ...` can combine a state check and transition. Constraints reject invalid results, and transaction boundaries determine which related changes commit together. A stored value's type matters too: exact decimal or integer minor units are different choices from floating-point arithmetic.

## Key concepts

**NULL uses three-valued logic.** Most comparisons with NULL produce unknown. `WHERE` retains only true results, so `amount = NULL` does not find missing amounts; use `IS NULL`. A `NOT IN` subquery containing NULL can make seemingly unrelated comparisons unknown. `NOT EXISTS` is often clearer for exclusion, but decide the intended treatment of null keys explicitly.

**Outer-join filters change meaning.** A left join preserves unmatched left rows with NULL right-side values. A subsequent `WHERE right.status = 'paid'` removes those rows. Put the condition in the join when unmatched left rows should remain.

**Grouping and windows differ.** `GROUP BY` collapses rows to a group result. Window functions compute over related rows while retaining each row. A running total needs an explicit ordering and appropriate frame when ties matter.

**Ordering must be deterministic.** `ORDER BY created_at` alone is ambiguous when timestamps tie. Add a unique tie-breaker and include both values in a keyset-pagination cursor. Even deterministic ordering does not create a stable snapshot across separate requests.

## Production example

Consider invoice 7 with line amounts 60 and 40, and three payments of 20 each. Its billed total is 100 and its paid total is 60. A raw join of lines and payments creates six rows: line amounts sum to 300 and payment amounts sum to 120.

Aggregate the independent children before joining them:

```sql
WITH line_totals AS (
  SELECT invoice_id, SUM(amount) AS billed
  FROM invoice_lines
  GROUP BY invoice_id
), payment_totals AS (
  SELECT invoice_id, SUM(amount) AS paid
  FROM payments
  WHERE status = 'settled'
  GROUP BY invoice_id
)
SELECT i.id,
       COALESCE(l.billed, 0) AS billed,
       COALESCE(p.paid, 0) AS paid
FROM invoices AS i
LEFT JOIN line_totals AS l ON l.invoice_id = i.id
LEFT JOIN payment_totals AS p ON p.invoice_id = i.id
WHERE i.tenant_id = $1;
```

Here each derived relation has at most one row per invoice. This assumes invoice IDs are globally unique; otherwise the tenant key must participate in grouping and joining. Also decide whether “no line items” really means zero or an invalid invoice—`COALESCE` encodes a business choice.

Validate an invoice with multiple children, one with no payments and one with no lines using hand-calculated answers. `SUM(DISTINCT amount)` would not fix the original problem: separate legitimate payments can have equal amounts. After correctness is established, inspect the plan and consider restricting child aggregation to the relevant invoices for a large multi-tenant dataset.

## Trade-offs

Set-based SQL reduces network round trips and allows the optimizer to choose efficient access. A single enormous statement can also obscure intent and become difficult to test. Named common table expressions can clarify intermediate grains; do not assume they always imply a particular materialization strategy across database versions.

Moving aggregation into application code can simplify some domain logic, but transferring thousands of rows to compute a small result may be costly. Place computation according to its semantics, data volume and need for external effects, rather than an absolute rule about “business logic in the database.”

## Failure modes / pitfalls

Implicit casts can change comparisons or prevent efficient access. Time-zone assumptions can place records in the wrong reporting day. `COUNT(*)` counts rows, while `COUNT(column)` excludes NULL values. None of these issues necessarily produces an error.

Unbounded reads, large OFFSET values and one query per child object create avoidable work. Parameter binding protects values, but it does not safely substitute table names or sort expressions; select such identifiers from an explicit supported set. For writes, verify affected-row counts against the intended operation rather than treating successful execution as proof of correct scope.

## When to use it

Use SQL when the task is naturally relational: filtering, joining, aggregation and coordinated changes to structured data. Keep selective work near the data when it avoids transferring large intermediate results.

For a new query, write down the output grain and a tiny fixture that exposes duplicates, missing values and boundary cases. This often reveals a semantic error faster than reading a complex production plan.

## When not to use it

Do not force remote API orchestration or large binary transformations into SQL merely because their inputs originate in a table. Those operations have different failure and resource-management needs.

Do not use clever syntax to hide unclear business semantics. If reviewers cannot agree what counts as a paid invoice, the problem must be resolved before choosing an aggregate or join.

## What a Senior Engineer should know

A Senior Engineer should explain how each join changes row counts, distinguish missing values from zero, and validate a query with adversarial small datasets. They should use bound parameters, appropriate types and constraints, and understand when a write needs a transaction or conditional predicate.

They should review correctness and execution cost separately. A query can be fast and wrong, or correct but inappropriate for a synchronous request.

## What a Staff Engineer should understand

A Staff Engineer should establish data-access conventions for tenant scope, expensive queries, reporting semantics and schema evolution. Shared definitions matter when several services independently calculate the same business metric.

They should recognize when growing analytical requirements justify a maintained read model or warehouse, with explicit freshness and reconciliation, rather than allowing reporting queries to compete indefinitely with operational transactions.

Further reading: [PostgreSQL SQL language](https://www.postgresql.org/docs/current/sql.html), [Table expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html).
