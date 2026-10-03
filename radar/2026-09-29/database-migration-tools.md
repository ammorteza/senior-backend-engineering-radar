---
title: "Database migration tools"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

A database migration tool applies a versioned sequence of schema or data changes and records which changes have been applied. It provides ordering, execution coordination and history. Depending on the tool, it may also track checksums, failed states and transaction boundaries.

It cannot make arbitrary SQL safe. A migration can be perfectly versioned and still block production writes, rewrite a huge table or break older application instances. The tool manages execution; engineers must design compatibility and operational behavior.

## Why it matters for backend engineers

Application deployment is rarely instantaneous. Old and new binaries overlap, background workers may update later, and rollback can restore an older reader. A schema change must account for those consumers rather than merely satisfy the newest version.

Schema work also competes with live traffic. Acquiring a strong lock can wait behind an old transaction and contribute to a queue of blocked requests. A “small DDL statement” can therefore have a large operational effect even before it changes any rows.

## How it works

The runner discovers migrations, compares them with its history and applies pending changes according to its ordering and locking rules. Learn how the selected tool handles concurrent runners, checksums, transactional DDL and a process dying halfway through. Those details determine whether retry is safe or requires investigation.

For incompatible representation changes, use an expand-and-contract sequence. First add structures that old code can tolerate. Deploy compatible readers and writers, migrate existing data in bounded resumable work, verify the new representation, switch authority or reads, and remove obsolete structures only after all consumers and rollback requirements are accounted for.

Separate long backfills from short schema changes where practical. A backfill needs checkpoints, a conflict policy with concurrent writes, progress metrics and a pause mechanism. Running it as one transaction can create large locks, WAL volume and rollback work.

Inspect each DDL statement's actual behavior for the engine version. PostgreSQL concurrent index creation, for example, cannot run inside a normal transaction block and has failure states that need checking. “Online” operations still consume resources and may wait for transactions.

## Key concepts

**Migration history is an execution record.** Editing an already-applied migration does not change a database that ran it. Use a new migration for corrections and investigate divergence between environments.

**Compatibility is a matrix.** Consider old code with expanded schema, new code during partial backfill and rolled-back code after cutover. A successful forward deployment does not establish that every rollback path remains safe.

**Lock acquisition versus execution.** A fast operation can spend a long time waiting for a lock. Bound acquisition with an appropriate lock timeout and separately consider statement duration; one setting does not answer both questions.

**Backfill conflict handling.** A snapshot of an old row may be stale by the time it is copied. Decide whether current writers win, whether versions are compared or whether writes must briefly pause.

**Rollback does not recreate deleted information.** A `down` migration can recreate a column definition but cannot automatically recover its lost contents or new writes made under the replacement schema.

## Production example

A service replaces a single phone column with a contact table. Dropping the column and deploying new code together would break old pods and make rollback hazardous.

The first migration creates the contact table and appropriate identity constraints. A compatible application release writes both representations in one local transaction. The team waits until all relevant writers—including jobs and scripts—use that protocol before starting the backfill. Otherwise an older writer could update only the old column after a row was copied.

The backfill reads bounded batches and inserts missing contact rows. An `ON CONFLICT DO NOTHING` approach can preserve rows already created by current writers when its assumptions fit the schema; more complex changes may require version-aware reconciliation. The team explicitly tests concurrent updates rather than assuming any upsert is safe.

Progress is checkpointed by a stable key. Metrics cover remaining rows, mismatches, batch latency, replication lag and database load. After verification, reads switch to the new representation while dual writes continue through the intended rollback window.

Only after consumers and rollback policy permit it does a later release remove old writes and eventually the old column. The stages are deliberately separate: compatibility, data movement and removal have different risks. This is an illustrative migration, not a universal recipe for every dual-write design.

## Trade-offs

Compatible multi-stage migrations require more releases and temporary complexity. They reduce the risk of coupling one destructive schema operation to an instantaneous application cutover that the deployment system cannot provide.

Some small or offline systems can accept a maintenance window, which may be simpler than a prolonged dual-write period. Choose based on availability needs and dataset size. A complex zero-downtime migration is not automatically the most efficient engineering choice.

## Failure modes / pitfalls

Running migrations from every application replica can create races or a startup stampede even when the tool serializes some work. A single controlled execution path is easier to observe and recover.

Unbounded backfills can overwhelm I/O or generate excessive replication lag. A waiting DDL operation can affect normal traffic through lock queues. An interrupted concurrent index build may leave an invalid index that still needs cleanup. Check the database state before blindly rerunning or marking a migration successful.

Automatically executing destructive down migrations after an application rollback can delete valid new data. Keep application rollback, schema compatibility and data recovery as separate decisions.

## When to use it

Use a migration runner for schema changes that must progress predictably across environments and releases. Keep migration files reviewed alongside the application behavior that depends on them.

Before production, rehearse relevant locking, failure and resume behavior with representative data volume. Small development tables can hide the exact risks that matter on a large live relation.

## When not to use it

Do not use the runner as a generic place for hours-long unobservable data processing. A dedicated resumable job may provide better control while the migration records the surrounding schema changes.

Do not demand reversible SQL syntax when the actual operation is not semantically reversible. Design a forward repair or restore strategy that reflects what information may be lost.

## What a Senior Engineer should know

A Senior Engineer should review lock strength, rewrite behavior, transaction support and compatibility with overlapping application versions. They should test failed runs and resumable backfills, including concurrent writes.

They should know the tool's actual history and dirty-state semantics and avoid repairing metadata until the database state is understood. A green migration command is only part of release validation.

## What a Staff Engineer should understand

A Staff Engineer should define schema ownership, cross-team consumer coordination and clear authority for production changes. Large shared datasets need migration capacity budgets and supported operational patterns.

Plan removal of temporary compatibility code and dual writes, with accountable completion criteria. An expand-and-contract migration left forever in its expanded state becomes another source of inconsistent authority and maintenance cost.

Further reading: [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), [CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html), [golang-migrate](https://github.com/golang-migrate/migrate).
