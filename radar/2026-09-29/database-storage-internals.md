---
title: "Database storage internals"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Storage engines translate records and indexes into pages, logs and files. B-tree and LSM designs make different choices about organizing reads, absorbing writes and reclaiming obsolete data.

## Why it matters for backend engineers

A write accepted in memory is not necessarily durable, and a small logical change can cause substantial physical I/O. These details explain latency spikes that application-level request counts cannot explain.

## How it works

A B-tree maintains ordered pages and navigates from root to leaf; modifications may split pages. An LSM engine buffers writes in a memtable, flushes immutable sorted files and compacts them later. WAL records changes before the corresponding data pages must reach durable storage, allowing crash recovery. Checksums detect some corruption but do not replace redundancy or backups.

## Key concepts

Read amplification is extra work locating one value; write amplification is physical work per logical write; space amplification is extra stored data. Bloom filters reduce unnecessary file probes in many LSM engines. Checkpoint and compaction policy move work across time rather than eliminate it.

## Production example

A telemetry store sustains ingestion until compaction falls behind. File counts increase, reads probe more files and disk fills with obsolete versions. Operators compare compaction throughput with incoming write volume and provision sustained I/O capacity. Merely increasing the write buffer postpones the bottleneck and enlarges recovery work.

## Trade-offs

B-trees support predictable point/range access but random writes and page splits can be costly. LSM trees batch writes efficiently but require compaction and may increase read work. Engine implementations vary substantially.

## Failure modes / pitfalls

Benchmarking only warm-cache reads hides disk behavior. Ignoring fsync semantics risks durability; ignoring background maintenance understates required capacity. Larger buffers cannot fix insufficient sustained storage bandwidth.

## When to use it

Use storage mechanics when selecting a database, diagnosing I/O saturation or interpreting checkpoint and compaction metrics.

## When not to use it

Do not implement a storage engine merely to avoid learning an existing database. Most application decisions need an informed model, not page-format expertise.

## What a Senior Engineer should know

Relate WAL, caches, pages and maintenance to observed latency and recovery behavior.

## What a Staff Engineer should understand

Evaluate workload fit and storage headroom over growth, failure and recovery—not only steady-state throughput.

Further reading: [PostgreSQL WAL](https://www.postgresql.org/docs/current/wal.html), [RocksDB overview](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview).
