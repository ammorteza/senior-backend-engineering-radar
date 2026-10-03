---
title: "Cassandra / Dynamo-style databases"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Dynamo-style databases distribute key-oriented data across replicas and make placement, availability and conflict handling explicit. Apache Cassandra draws on ideas from Dynamo and other distributed-storage designs, but it is not interchangeable with Amazon DynamoDB or the original Dynamo system.

This article uses Cassandra for concrete mechanics. Product names in this family do not imply identical transaction, replication or consistency guarantees. Evaluate the actual system and mode rather than transferring a statement about one product to another.

## Why it matters for backend engineers

These databases can support large volumes of predictable keyed reads and writes. The price is that data modeling becomes closely tied to access patterns. An operation that is an ordinary indexed SQL query elsewhere may require a separate maintained table here.

Partition choices determine locality and hotspots. A cluster can have ample total capacity while one partition overwhelms a replica set. Retention and deletion also create storage work through tombstones and compaction, so steady ingestion alone is not a complete workload model.

## How it works

In Cassandra, the partition key determines a token and replica placement under the configured strategy. A coordinator routes requests to the relevant replicas. Within a partition, clustering columns define row identity and ordering, making selected range reads efficient when they match the schema.

Writes are recorded through the commit log and memtable, then flushed into immutable SSTables. Reads reconcile relevant versions across in-memory and on-disk structures. Compaction merges files and reclaims eligible obsolete data; repair addresses replica divergence. These processes need sustained capacity and operational ownership.

A consistency level determines the required replica responses for an operation. A read and write quorum can overlap for a replica set, but overlap alone is not a general proof of linearizable application behavior or multi-row serializability. Concurrent writes, timestamps, failed operations and topology all affect the reasoning.

Ordinary conflict resolution often uses timestamps to select a value. If the business needs a conditional state transition, examine Cassandra's lightweight transaction mechanism and its configured consistency semantics rather than assuming an ordinary read followed by a write is atomic.

## Key concepts

**Partition size and partition heat.** A bounded number of rows prevents unbounded growth, but even a small partition can be hot if nearly every request targets it. Measure both dimensions.

**Tables follow queries.** A table keyed for device history may not efficiently answer “all devices with an alert in this region.” Another representation creates synchronization and repair obligations.

**Tombstones are deletion information.** Removing them too early relative to replica repair and outage assumptions can allow old data to reappear. Coordinate repair, deletion policy and node recovery instead of treating tombstone retention as an isolated tuning knob.

**Timestamp ordering is not business ordering.** Clock mistakes or supplied timestamps can influence conflict winners. A later timestamp does not prove that the corresponding state transition was valid.

**Replication factor and consistency level differ.** One specifies how many copies are maintained in the intended topology; the other selects response requirements. Neither automatically supplies global transactions.

## Production example

A telemetry service stores readings for each device. Its main query requests a device's recent measurements in time order. A lifetime partition keyed only by device ID grows without bound.

The team evaluates time-bucketed keys such as `(device_id, hour_bucket)` with timestamp and a tie-breaking event ID as clustering columns. At ten readings per second, one hour contains 36,000 readings. At an illustrative 200-byte payload, that is about 7.2 MB of payload before storage overhead and compression. This is sizing arithmetic, not a universal recommended partition limit.

A device producing a thousand readings per second changes the calculation by two orders of magnitude. Shorter buckets or a secondary distribution key may be necessary, but splitting one device's data also adds read fan-out. The team tests the hottest realistic device, not only average traffic spread evenly across keys.

Retention uses the selected TTL and compaction strategy, with repair and outage procedures that preserve deletion semantics. A long-range query combines the necessary buckets and imposes a result or time-range limit. Late data and duplicate event identifiers are tested explicitly.

The schema succeeds when the required reads are bounded, hot devices remain supportable and maintenance keeps up. A balanced total row count is not sufficient evidence.

## Trade-offs

Predictable partition-local operations can scale well and avoid a central write leader for the whole dataset. The trade is reduced flexibility for arbitrary joins, evolving filters and cross-record invariants.

Lower response requirements can improve availability under some failures while allowing older results or weaker confirmation. Higher requirements can increase latency or reject operations when replicas are unavailable. Conditional operations add coordination and should be evaluated under their real contention pattern.

Duplicating data into query-specific tables makes reads efficient but shifts complexity into writes, reconciliation and schema evolution.

## Failure modes / pitfalls

Unbounded partitions, hot keys and unrestricted filtering can create severe tail latency. Tombstone-heavy reads may scan substantial deletion metadata to return few live rows. Compaction or repair that falls behind can degrade the cluster even when foreground request counts appear stable.

Do not treat last-write-wins as a general business conflict-resolution rule. Do not assume a successful write at one consistency level implies immediate visibility under every other read configuration. Topology changes and node outages need tested procedures that preserve the intended repair and retention assumptions.

## When to use it

Use Cassandra-style storage when large keyed workloads have understood access patterns and the availability or scale requirement justifies its modeling and operational costs. Time-series-like ingestion can fit when partitions and retention are bounded deliberately.

Prove the important queries and maintenance behavior with representative skew, deletions and failure recovery before committing the service to the model.

## When not to use it

Do not choose this family solely because the dataset may become large. Flexible relational queries, ordinary uniqueness and multi-row business transactions may be simpler in PostgreSQL at the required scale.

Avoid a design whose main operations need unrestricted cross-partition filtering or coordination. Adding an access-path table for every new requirement can become a signal that the storage model no longer fits.

## What a Senior Engineer should know

A Senior Engineer should design partition and clustering keys from concrete queries, estimate worst-case partition growth and explain the chosen read/write consistency. They should understand how tombstones, compaction and repair affect latency and correctness.

They should distinguish ordinary writes from conditional operations and test hot keys, clock assumptions and replica outages rather than relying only on uniform throughput benchmarks.

## What a Staff Engineer should understand

A Staff Engineer should connect storage guarantees to business invariants and the organization's ability to operate repair, rebalancing and recovery. Query-specific duplication needs clear authoritative ownership and reconciliation.

Compare the system's long-term model flexibility and operating cost with its scaling benefit. Keep product-specific guarantees explicit, especially when teams use Cassandra, DynamoDB and other distributed stores side by side.

Further reading: [Cassandra architecture](https://cassandra.apache.org/doc/latest/cassandra/architecture/), [Cassandra Dynamo architecture](https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html), [Original Dynamo paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf).
