---
title: "Apache Kafka"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Kafka stores ordered records in partitioned, replicated logs. Consumers track offsets, allowing independent applications to reread retained records without deleting them for other subscribers.

## Why it matters for backend engineers

Partitioning controls both parallelism and ordering. A fast cluster cannot compensate for every record targeting one hot partition or consumers committing offsets before their work is durable.

## How it works

Producers append to partition leaders; followers replicate the log. A consumer group assigns partitions among members, with each partition handled by one group member at a time under ordinary group consumption. Rebalances change ownership. Offsets record progress, while time/size retention or compaction governs storage independently of consumption.

## Key concepts

Keys select partitions; ordering is partition-local. `acks=all` and minimum in-sync replica settings affect write durability. Compaction retains latest keyed values but is asynchronous. Kafka transactions cover specific Kafka read/write boundaries, not arbitrary external calls.

## Production example

A clickstream consumer writes daily aggregates to PostgreSQL. It crashes after committing a batch but before committing offsets. The batch returns after restart; an event-ID deduplication record committed atomically with the aggregate, or an atomic progress/state update, prevents double counting. Consumer lag and partition skew reveal whether processing is catching up.

## Trade-offs

Replay and multiple subscribers make logs useful integration infrastructure. Brokers, partition sizing and consumer ownership add operational work; excess partitions also cost resources.

## Failure modes / pitfalls

Premature offset commits lose work. Long processing can trigger ownership changes. Increasing partitions can change key mapping, so old/new records need ordering review. Compaction is not immediate deletion.

## When to use it

Use Kafka for retained streams, independent consumer groups and workloads needing partitioned processing or replay.

## When not to use it

A simple background-task queue may need simpler infrastructure. Do not choose Kafka solely for a blanket exactly-once promise.

## What a Senior Engineer should know

Configure acknowledgements, batching, offset commits and rebalances; diagnose lag versus skew.

## What a Staff Engineer should understand

Define retention, partition ownership, schema governance and recovery capacity across producers and consumers.

Further reading: [Kafka documentation](https://kafka.apache.org/documentation/).
