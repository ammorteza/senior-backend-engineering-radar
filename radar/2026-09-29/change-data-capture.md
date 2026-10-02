---
title: "Change Data Capture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Change Data Capture (CDC) propagates database changes to other systems, often by reading a database's transaction log rather than repeatedly querying application tables.

## Why it matters for backend engineers

CDC can populate search indexes and analytical stores without every writer implementing publication. It exposes storage changes, which may lack the business meaning consumers expect from domain events.

## How it works

A connector typically takes an initial snapshot and then streams log changes from a recorded position. It represents inserts, updates and deletes with source metadata. Restarting from saved offsets permits recovery but may repeat records. Snapshot-to-stream coordination must avoid gaps while concurrent writes continue.

## Key concepts

Log position, transaction boundaries, snapshot mode and schema changes shape correctness. PostgreSQL replication slots retain WAL for a consumer; stalled consumers can therefore threaten disk capacity. A row deletion and a business cancellation are not automatically equivalent events.

## Production example

A customer directory feeds a search index through CDC. The connector fails for hours; retained WAL grows. Recovery resumes from its offset and replays some updates, which the index applies using source versions to avoid overwriting newer documents. Operators alert on both source retention and destination freshness.

## Trade-offs

CDC covers changes from all database writers and avoids application dual writes. It couples consumers to storage schemas and requires connector, log and backfill operations.

## Failure modes / pitfalls

Lost source offsets, expired logs, schema drift and unsupported DDL behavior can require a resnapshot. Ignoring deletes leaves stale search documents.

## When to use it

Use CDC for replication into read models, warehouses or caches when database changes are the intended contract.

## When not to use it

Prefer domain-event publication when consumers need explicit business intent rather than table mutations.

## What a Senior Engineer should know

Explain snapshot continuity, duplicates, offsets and source-log retention; test deletion handling.

## What a Staff Engineer should understand

Separate storage integration from public event contracts and plan resnapshot cost and source protection.

Further reading: [Debezium documentation](https://debezium.io/documentation/reference/stable/).
