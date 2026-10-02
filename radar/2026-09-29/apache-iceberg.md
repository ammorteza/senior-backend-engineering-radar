---
title: "Apache Iceberg"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Apache Iceberg is a table format for large analytical datasets stored in files. It supplies metadata and snapshot semantics; it is not itself a query engine or object store.

## Why it matters for backend engineers

A directory of Parquet files lacks a reliable transaction boundary. Concurrent writers, schema changes and partition redesign need metadata that readers can interpret consistently.

## How it works

A catalog identifies the current table metadata. Snapshots reference manifests describing data and delete files. Writers produce files and commit a new metadata pointer using the catalog's concurrency mechanism. Readers use a selected snapshot rather than discovering arbitrary files from a directory listing.

## Key concepts

Field IDs protect schema identity across supported renames. Hidden partitioning derives layout from logical columns. Partition evolution allows multiple layouts to coexist. Snapshot expiry, orphan-file cleanup and compaction are separate maintenance operations with safety requirements.

## Production example

An event lake changes from daily to hourly partitioning as volume grows. New files use the new specification while readers can still query old snapshots through metadata. Maintenance compacts small files and expires snapshots only after retention requirements and active-reader assumptions are addressed.

## Trade-offs

Snapshot consistency and evolution improve file-based analytics. Catalog availability, metadata growth and engine compatibility add operational work; format features are not supported uniformly by every engine.

## Failure modes / pitfalls

Deleting files manually, unsafe orphan cleanup, excessive tiny files and assuming format support means full feature compatibility can corrupt or stall workloads.

## When to use it

Use Iceberg for multi-engine analytical tables requiring controlled schema/layout evolution and snapshots.

## When not to use it

A small single-engine dataset may not need a lakehouse table layer; transactional application writes belong elsewhere.

## What a Senior Engineer should know

Understand catalogs, commits, manifests and safe maintenance.

## What a Staff Engineer should understand

Choose interoperable engines, ownership and retention policies across the data platform.

Further reading: [Iceberg specification](https://iceberg.apache.org/spec/), [Evolution](https://iceberg.apache.org/docs/latest/evolution/).
