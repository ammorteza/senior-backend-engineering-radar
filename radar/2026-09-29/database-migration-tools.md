---
title: "Database migration tools"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Migration tools apply an ordered, versioned history of schema changes and record which versions a database has reached. They coordinate execution; they cannot make an unsafe DDL statement safe.

## Why it matters for backend engineers

Application releases overlap during rolling deployment. A schema accepted by the newest binary may still break the older pods serving traffic, or hold a lock that blocks ordinary requests.

## How it works

A runner discovers migration files, checks its history table and applies pending changes under its locking and transaction rules. Tools differ on checksums, dirty states and transactional support. Expand-contract evolution first adds compatible structures, then changes readers and writers, backfills data, and finally removes the old representation after all consumers migrate.

## Key concepts

DDL lock strength, lock acquisition time and table-rewrite behavior determine operational risk. A backfill is a resumable data job, not necessarily a single migration statement. PostgreSQL concurrent index creation has restrictions, including running outside a transaction block.

## Production example

A team replaces a nullable phone column with a normalized contact table. The first release adds the table and writes both representations. A checkpointed batch backfill fills existing contacts; reads switch after verification. Only a later release removes the column. Rolling back the application during the overlap period remains possible.

## Trade-offs

Versioned migrations create an audit trail and repeatability. They add coordination and need policies for hotfixes, failed runs and drift. Reversible syntax does not make lost data recoverable.

## Failure modes / pitfalls

Unbounded backfills, editing an already-applied migration, short-lived lock assumptions and running migrations from every replica can cause outages. `down` migrations may delete newly written data.

## When to use it

Use a migration runner whenever schema changes must progress consistently across environments and deployments.

## When not to use it

Do not automatically run destructive rollback migrations as an application rollback strategy. Prefer forward fixes and compatible schemas where practical.

## What a Senior Engineer should know

Review DDL locking, tool transactions and old/new application compatibility. Test backfill resume and failure handling.

## What a Staff Engineer should understand

Define cross-team schema ownership, migration sequencing and recovery policies for large datasets.

Further reading: [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), [golang-migrate](https://github.com/golang-migrate/migrate).
