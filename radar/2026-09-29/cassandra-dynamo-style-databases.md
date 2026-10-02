---
title: "Cassandra / Dynamo-style databases"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Dynamo-style databases distribute key-oriented data across replicas and make consistency trade-offs explicit. Cassandra shares architectural ideas with Dynamo but is not interchangeable with Amazon DynamoDB or the original Dynamo design.

## Why it matters for backend engineers

Partition-key choice controls locality and load. A schema that distributes rows evenly can still create one oversized or heavily accessed partition.

## How it works

In Cassandra, partitioning maps keys to replica sets. Writes use a commit log and memtable before SSTable flush; compaction and repair maintain storage and replica convergence. Consistency levels choose how many replica responses an operation requires. Quorum overlap alone does not establish every desired linearizability property; concurrent writes and failure semantics matter.

## Key concepts

Model tables around queries, with bounded partitions and useful clustering order. Tombstones represent deletion until safely purged. Repair and compaction are required operations. Product-specific conditional-write guarantees and replication modes must be evaluated separately.

## Production example

A device-reading table uses device plus day as its partition key rather than one lifetime partition per device. This bounds growth while supporting time-range reads. A retention policy considers tombstone and compaction behavior; operators test hot devices and repairs, not only uniform ingestion.

## Trade-offs

Distributed writes and predictable keyed access scale well. Arbitrary joins and new access patterns may require new tables and duplicated writes.

## Failure modes / pitfalls

Unbounded partitions, insufficient repair, tombstone-heavy reads and treating last-write-wins as business conflict resolution cause problems.

## When to use it

Use these systems for large keyed workloads with known access patterns and justified availability/scale needs.

## When not to use it

Relational transactions and flexible queries may make PostgreSQL simpler for moderate operational workloads.

## What a Senior Engineer should know

Design partition/clustering keys and understand selected consistency, repair and compaction behavior.

## What a Staff Engineer should understand

Connect data-model duplication and replica guarantees to business invariants and operating capability.

Further reading: [Cassandra architecture](https://cassandra.apache.org/doc/latest/cassandra/architecture/), [Dynamo paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf).
