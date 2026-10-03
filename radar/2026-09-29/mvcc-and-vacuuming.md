---
title: "MVCC and vacuuming"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Multi-Version Concurrency Control (MVCC) allows transactions to observe appropriate versions of rows while other transactions modify them. In PostgreSQL, an update normally creates a new row version rather than overwriting the only copy in place. Visibility rules determine which version a statement may see.

Those versions have a lifecycle. Once no relevant transaction needs an old version, maintenance can reclaim its space. Vacuum is PostgreSQL's mechanism for that cleanup and several related visibility and transaction-ID tasks. It is part of normal database operation, not an occasional repair command for a broken table.

## Why it matters for backend engineers

A table can have a stable number of live rows and still grow rapidly if it is updated often. Each update produces work that must eventually be cleaned up. Adding memory or deleting more rows may not address the reason cleanup cannot progress.

Application behavior matters directly. A transaction retaining an old snapshot can make versions remain necessary long after ordinary requests finish. Engineers who hold transactions open while streaming responses or waiting on external APIs are making a database-maintenance decision, whether they intended to or not.

## How it works

A row version carries transaction information that PostgreSQL evaluates against a snapshot. When another transaction updates the row, older readers may still need the prior version while newer readers see the committed replacement. MVCC reduces many reader/writer conflicts, but does not eliminate row locks between competing writers.

Vacuum visits tables and indexes, identifies versions that are safe to remove and makes their space reusable. Some pruning can also happen during ordinary access. The cleanup horizon depends on transactions and other consumers that require old visibility information; the presence of dead-looking tuples alone does not prove they are reclaimable now.

Vacuum also maintains visibility information and freezes sufficiently old transaction metadata to prevent transaction-ID wraparound problems. Autovacuum schedules this work automatically using configured thresholds and safety requirements. A large, frequently updated table may need per-table settings because defaults based on a fraction of table size can allow too much churn between visits.

Ordinary vacuum generally makes space reusable within the relation. It may truncate empty pages at the end when conditions allow, but is not a general file-compaction operation. `VACUUM FULL` rewrites the table to compact it and requires an exclusive lock, additional disk space and a planned operational window.

## Key concepts

**Snapshot lifetime.** A long Repeatable Read transaction holds a stable snapshot. An idle Read Committed session does not necessarily hold the same snapshot between statements, although open transactions can retain locks and transaction-ID horizons. Inspect actual state and horizons instead of blaming every old connection equally.

**HOT updates.** Heap-only tuple updates can avoid new entries in ordinary indexes when indexed values do not change and there is room on the page, subject to engine rules. Extra indexes on frequently modified fields can reduce this benefit. Page fillfactor trades initial packing density for room for future updates.

**Visibility map.** Pages marked all-visible can let index-only scans avoid heap visibility checks. Heavy updates clear relevant visibility information; having all selected columns in an index alone does not guarantee zero heap access.

**VACUUM versus ANALYZE.** Vacuum manages reclaimable versions and visibility. Analyze samples data to update planner statistics. Autovacuum can perform both, but they solve different problems.

**Retention mechanisms differ.** Replication slots can retain WAL; some slot horizons and standby feedback can also delay tuple cleanup. Diagnose retained logs separately from table bloat rather than calling every disk-growth problem “vacuum.”

## Production example

A worker-heartbeat table contains 100,000 live rows and updates them repeatedly. Its live row count barely changes, yet table size and scan time increase. At the same time, a reporting process has left a Repeatable Read transaction open for hours after its initial query.

The engineer compares table-size growth, estimated dead tuples, vacuum activity and the age of transactions retaining snapshots. They inspect the reporting session's purpose before cancelling it: ending a legitimate export without coordination may create another incident. The report is changed to use a bounded snapshot window or another suitable extraction strategy.

After the old snapshot ends, vacuum can reclaim eligible versions. The engineer checks cleanup progress and whether subsequent updates reuse space. The database file may not immediately shrink, so “file still large” is not evidence that the fix failed.

Next they examine write churn and maintenance cadence. A table-specific threshold may trigger cleanup sooner; adequate worker and I/O capacity must support that cadence. They also check whether indexing a rapidly changing heartbeat timestamp is necessary for the actual queries. Removing an unjustified index can reduce write work, but only after validating its consumers.

The improvement addresses both the blocker and the sustained production rate of obsolete versions. Repeated table rewrites without fixing either would only postpone recurrence.

## Trade-offs

MVCC allows readers to observe consistent data without blocking ordinary writers in many cases. It pays for that concurrency through version storage, visibility checks and cleanup. More aggressive cleanup consumes CPU and I/O that application queries also need.

Tuning therefore balances sustained maintenance with request objectives. Reducing autovacuum activity may improve one short measurement while accumulating more expensive future work. Capacity tests should include maintenance instead of benchmarking an unrealistically clean table.

## Failure modes / pitfalls

Disabling autovacuum to hide I/O can permit severe bloat and transaction-ID safety problems. Running `VACUUM FULL` during peak traffic can turn a space concern into a blocking outage. Increasing vacuum frequency cannot remove versions that an active snapshot still requires.

Statistics such as dead-tuple counts are estimates, not exact physical inventories. Investigate live-data growth, indexes, WAL retention and temporary files separately. A large DELETE also creates cleanup work; it does not instantly return all space to the operating system.

## When to use it

Use MVCC knowledge when diagnosing update-heavy tables, long transactions, index-only scan regressions or growing database files. Include transaction lifetime and vacuum progress in operational reviews for heavily modified data.

When introducing a long-running export, consider its snapshot requirements explicitly. Consistency over a long report has a storage and cleanup cost that should be measured and bounded.

## When not to use it

Do not rewrite a table merely because its allocated size exceeds its current live payload. Reusable space can be healthy for a table that will grow or update again.

Do not tune maintenance from one counter alone. Establish whether cleanup is blocked, under-provisioned or simply not yet scheduled before changing worker counts or thresholds.

## What a Senior Engineer should know

A Senior Engineer should explain why updates create obsolete versions, identify cleanup horizons and distinguish table reuse from physical shrinking. They should recognize the different roles of vacuum, analyze and table rewrites.

They should also review transaction scope in application code and verify maintenance under realistic update rates. Fixing the session or access pattern that creates the problem is often more valuable than issuing another maintenance command.

## What a Staff Engineer should understand

A Staff Engineer should budget maintenance capacity across workloads and establish transaction-lifetime expectations for services, reporting and replication consumers. New read replicas or CDC consumers can change retention behavior and need operational ownership.

Plan table growth, storage headroom and disruptive compaction procedures before capacity becomes urgent. The organization should be able to explain both its steady-state cleanup rate and how it recovers from a prolonged blocker.

Further reading: [Routine vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html), [HOT updates](https://www.postgresql.org/docs/current/storage-hot.html), [Monitoring statistics](https://www.postgresql.org/docs/current/monitoring-stats.html).
