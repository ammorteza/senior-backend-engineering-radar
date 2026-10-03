---
title: "Database storage internals"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A storage engine turns logical records and indexes into memory structures, pages, logs and files. Its design determines how writes become durable, how reads locate values and how obsolete data is removed. B-tree and log-structured merge-tree (LSM) designs organize that work differently.

These are families of mechanisms, not complete product descriptions. PostgreSQL commonly combines heap storage with B-tree indexes; RocksDB uses an LSM design. A database can combine several structures, and its durability and concurrency guarantees depend on more than the index family.

## Why it matters for backend engineers

Application traffic does not directly describe storage traffic. Updating one small record can modify a data page, several indexes and a recovery log. Background checkpoints or compaction may perform substantial work even when request volume is steady.

Understanding those mechanisms helps interpret incidents. High disk utilization might reflect useful ingestion, repeated reads, log flush latency or maintenance falling behind. Each calls for a different response; a larger application pool does not increase the device's sustained bandwidth.

## How it works

A B-tree maintains ordered keys in a hierarchy of pages. Lookup descends toward a leaf; a range scan can traverse nearby key entries. Inserts modify pages and can split a full page. In a heap-based database, an index lookup may then visit a separate table page to obtain the row and check visibility.

An LSM engine commonly records writes in a log and an in-memory sorted structure called a memtable. It later flushes the memtable into immutable sorted files. Reads may consult memory and multiple files, using indexes and filters to avoid unnecessary work. Compaction merges files and can discard obsolete versions when retention and snapshot rules permit.

Write-ahead logging (WAL) separates recovery from the timing of data-page writes. The relevant log must reach durable storage before corresponding dirty pages are persisted in a way that depends on it. Commit acknowledgement depends on the engine and configured flush guarantees; data accepted into a process buffer is not automatically safe against power loss.

Checkpoints and compaction move work across time. They can improve the foreground path by deferring work, but the deferred work still needs capacity. Recovery must also account for uncheckpointed or unflushed state in the log.

## Key concepts

**Read amplification** is additional work needed to retrieve a logical value, such as probing several files or fetching a heap page after an index lookup. **Write amplification** compares physical writing with logical input. **Space amplification** describes storage beyond the live logical data. Tuning one often changes the others.

**Bloom filters** can tell an LSM reader that a key is definitely absent from a file, avoiding a lookup. A possible match can be a false positive and still requires checking. They do not answer arbitrary range queries or replace the stored values.

**Caches exist at multiple layers.** Database buffers and the operating system page cache can both serve reads. Warm-cache benchmarks may hide storage behavior that appears after restart or when the working set grows.

**Deletion is often deferred.** Tombstones or obsolete versions persist until cleanup can safely remove them. Long-lived snapshots can increase space requirements even when logical deletion succeeded.

**Durability has a boundary.** An fsync-like operation requests persistence through the storage stack. Device behavior, replication and acknowledgement configuration matter. Checksums detect certain corruption; they do not reconstruct missing data without another usable copy.

## Production example

A telemetry service writes to an LSM-backed store. Initial load tests run for ten minutes and show good ingestion throughput. A longer run shows increasing file counts, compaction backlog and read latency, followed by write stalls.

Suppose the workload logically ingests 20 MB/s and the measured aggregate device-write amplification is approximately six over a representative interval. That suggests about 120 MB/s of physical writing before additional headroom for other workloads. These illustrative numbers must be measured on the actual engine and compression settings; counting only incoming payload understates demand.

The engineer examines compaction throughput, pending work, device latency and free space together. Enlarging the memtable makes a short test look better but cannot fix a device that cannot sustain the long-run work. It can also increase the amount of data involved in flush and recovery transitions.

Possible changes include more suitable compaction settings, reducing unnecessary indexes or versions, increasing sustained storage capacity or reducing ingestion demand. Each is tested long enough to reach a maintenance steady state, with representative reads and retention enabled.

The acceptance criterion is not merely “writes were accepted.” Backlog must remain bounded, reads must meet their objective, and the system must recover after interruption without exhausting disk. This connects an internal mechanism to the actual service contract.

## Trade-offs

B-trees can provide efficient ordered access, but page updates, splits and heap fetches create their own I/O patterns. LSM designs batch writes efficiently while introducing compaction and potentially more read and space work. Neither is universally faster.

Compression reduces stored bytes and transfer at a CPU cost. Larger caches reduce reads until they displace other useful memory. Aggressive maintenance can reduce future amplification but contend with foreground traffic. Evaluate sustained workload and failure recovery, not a single peak-throughput number.

## Failure modes / pitfalls

Short benchmarks may end before compaction or checkpoints become relevant. Uniform keys can hide hot ranges and unrealistic payloads can distort compression. Tests with no overwrites or deletes omit version-reclamation cost.

Changing durability settings to improve throughput changes what an acknowledged write means. Treat that as a correctness decision, not an invisible tuning parameter. Also reserve space for maintenance: merging or rewriting data can temporarily require both old and new files.

## When to use it

Use storage-engine knowledge when interpreting I/O saturation, selecting a database for a measured workload or estimating recovery and maintenance capacity. It is especially useful when latency spikes do not correlate with foreground request volume.

Ask which work is immediate, which is deferred, and whether deferred work is keeping up. That question is often sufficient to expose an unsustainable design without knowing every page-format detail.

## When not to use it

Do not implement a custom storage engine merely to avoid learning an existing one. Crash recovery, concurrency and corruption handling create a substantial engineering commitment.

Do not choose a product from “B-tree versus LSM” alone. Query semantics, transactions, replication, operator capability and the concrete implementation may matter more than the broad structure.

## What a Senior Engineer should know

A Senior Engineer should connect logs, caches, pages and maintenance to observed latency and disk use. They should distinguish logical input from physical work and know which configuration changes weaken acknowledgement guarantees.

They should design representative tests with overwrites, deletions, cold starts and sufficient duration to include maintenance, then interpret the results in terms of service objectives.

## What a Staff Engineer should understand

A Staff Engineer should evaluate long-run storage economics and recovery under growth, failure and rebalancing. Headroom needs to cover temporary copies, backlog drain and degraded redundancy, not only normal live data.

They should ensure database selection and capacity planning account for operator expertise and future access patterns. A high-throughput engine with an unsustainable maintenance burden is not a successful platform choice.

Further reading: [PostgreSQL WAL introduction](https://www.postgresql.org/docs/current/wal-intro.html), [RocksDB overview](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview).
