---
title: "Apache Kafka"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Apache Kafka is a distributed event-streaming platform built around partitioned, replicated logs. Producers append records; independent consumers track positions called offsets. Reading a record does not ordinarily remove it, so several applications can process the same retained history at different rates.

This log model differs from a queue that deletes work as soon as one worker acknowledges it. Kafka is especially useful when retention, replay and independent processing are central requirements. Its guarantees depend on producer, broker, topic and consumer configuration together.

## Why it matters for backend engineers

Partitioning determines locality, ordering and much of the available processing parallelism. A cluster can have ample aggregate capacity while one key overloads a single partition. Adding consumer instances cannot divide that partition under ordinary consumer-group assignment.

Offsets are also application correctness state. Committing a position before the corresponding effect is durable can skip work after restart; committing afterward can repeat work. Engineers must deliberately connect broker progress to their destination's transaction or idempotency protocol.

## How it works

A producer chooses a partition according to its configured partitioner and key. The partition leader accepts appends and replicas follow. With `acks=all`, acknowledgements involve the current in-sync replica set; `min.insync.replicas` constrains when such writes can proceed. Replication factor alone does not mean every acknowledged record always has that many current copies.

In an ordinary consumer group, a partition is assigned to one member at a time. Different groups read independently. Membership changes cause reassignment, so applications must handle revocation, outstanding work and restart positions. This description concerns normal consumer groups; other Kafka consumption modes have their own contracts.

A committed offset represents the next position the group should resume from. Advancing it past unfinished records can lose their application effects even if the broker retained them. Processing in parallel therefore requires tracking which earlier records are safely complete, not merely committing the largest offset a worker has seen.

Retention controls how long records remain independent of consumption. Time/size retention removes old log segments under configured rules. Compaction eventually removes superseded keyed values while preserving the retained key history needed by its contract; it is neither immediate deduplication nor an unlimited audit log. Kafka transactions can atomically publish Kafka records and input-offset progress for supported workflows, but do not automatically include external stores.

## Key concepts

**Partition-local order.** Kafka orders appended records within one partition. Multiple producers, business causality and downstream parallel execution still need application reasoning.

**Key distribution.** A partition key balances locality against load. One celebrity account or enterprise tenant can dominate a partition even when average distribution looks even.

**Producer idempotence.** Supported producer sequencing can suppress duplicates caused by producer retries. It does not identify arbitrary new publish calls as the same business operation.

**Lag and age.** Offset lag counts positions behind the log; event age describes delayed business data. A large cheap backlog and a small stuck critical backlog need different responses.

**Rebalance ownership.** A revoked worker may still have an external request in flight. Broker assignment alone does not cancel or fence that external side effect.

## Production example

A usage-processing group consumes 12 partitions and writes daily totals to PostgreSQL. Increasing from six to 12 ordinary consumers can add assignment parallelism if processing is the bottleneck; increasing to 20 leaves some consumers without partitions. These are topology limits, not a throughput prediction.

One partition contains most traffic because a large tenant uses one key. Adding consumers does not split it. The team examines whether the workload can be distributed by tenant and resource while preserving the ordering actually required. A key change needs a migration plan, because old and new records can coexist under different mappings.

A worker commits a database batch and crashes before committing Kafka offsets. After reassignment, the records return. The database transaction includes a durable event-identity check with each aggregate contribution, so replay does not count it twice. If using stored per-partition progress instead, that progress must be atomic with output state and protected against overlapping owners; a bare maximum-offset row is insufficient.

Tests delay one record while later records complete, revoke a partition during a write, and restart after the database commit. They verify totals and resume positions, not only that lag decreases. Catch-up is rate-limited so recovery traffic does not saturate PostgreSQL and make the backlog worse.

## Trade-offs

Retained logs support independent consumers and reprocessing. The cost includes brokers, storage, partitions, replication traffic and recovery capacity. Large partition counts increase coordination and operational overhead even when record volume is modest.

Batching and compression improve efficiency but can add latency. More replication improves failure tolerance under the configured protocol while increasing resource use and potentially limiting writes when too few replicas are eligible.

## Failure modes / pitfalls

Premature offset commits lose application work. Long or blocked processing can trigger ownership changes under the selected group protocol and configuration. A hot key can remain the bottleneck after adding machines.

Increasing partition count can change key placement for future records, so partition-local order no longer implies one uninterrupted history for that key. Compaction and tombstone retention also require care when rebuilding a state store after a long absence.

## When to use it

Use Kafka for retained event streams, independent consumer groups and substantial partitioned processing or replay. Define keys, retention and destination correctness before benchmarking throughput.

Test broker failure and consumer reassignment alongside ordinary load. Recovery capacity should exceed incoming demand long enough to drain supported backlogs safely.

## When not to use it

A small background-job workflow may not need a retained distributed log. Choose simpler messaging when delayed-task features or straightforward work distribution matter more than independent replay.

Do not select Kafka solely for an exactly-once label or assume a managed service removes responsibility for keys, offsets and consumer correctness.

## What a Senior Engineer should know

A Senior Engineer should reason about acknowledgement settings, in-sync replicas, assignment and offset progress. They should diagnose partition skew separately from fleet-wide resource limits.

They should demonstrate duplicate-safe destination writes and safe progress during parallel processing, crashes and ownership changes.

## What a Staff Engineer should understand

A Staff Engineer should govern stream ownership, retention, schemas and recovery budgets across consumers. A topic's retention change can break another team's ability to recover even if producers remain healthy.

Choose shared-platform boundaries that isolate noisy workloads and make partition/key migrations reviewable. Treat reprocessing as production traffic with explicit capacity and effect policies.

Further reading: [Kafka design and delivery semantics](https://kafka.apache.org/41/design/design/), [Kafka configuration documentation](https://kafka.apache.org/41/configuration/).
