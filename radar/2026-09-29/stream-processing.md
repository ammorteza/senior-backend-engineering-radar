---
title: "Stream processing"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Stream processing continuously consumes events and incrementally produces derived results, often while maintaining keyed state and time windows.

Its hardest correctness problem is usually time: events can arrive late, out of order, or be replayed. A stream processor must decide whether results are based on processing time or event time, when an event-time window is considered ready, and what to do when older events arrive afterward.

## Why it matters for backend engineers

Fraud detection, usage aggregation, monitoring, inventory views, and real-time personalization need updates before a daily batch completes.

Naively processing arrival order can make those results wrong. A mobile device can reconnect after ten minutes and send events with business timestamps earlier than data already processed.

Stream engines also checkpoint their own state, but exactly-once state recovery does not automatically make an external API or database side effect exactly once.

## How it works

Events enter one or more operators. Keying partitions records so all events for the same key reach the same logical state owner.

Operators transform, filter, aggregate, join, or enrich events. Stateful operations maintain local or remote state tied to keys and windows.

**Processing time** uses the processor's local clock when data is handled. **Event time** uses timestamps carried by the events.

Watermarks are estimates of event-time progress. When a watermark passes a window boundary, an engine can emit a result according to its configured lateness behavior. A watermark does not prove that no older event can ever arrive.

Checkpoints persist operator state and source positions. On failure, the engine restores a consistent checkpoint and reprocesses from the corresponding source position. Sink integration determines whether reprocessing causes duplicate external results.

## Key concepts

**Tumbling window.** Fixed non-overlapping windows, for example each five-minute interval.

**Sliding window.** Overlapping windows evaluated at a smaller slide interval.

**Watermark.** Engine signal that event time has likely advanced; generated from source observations and idle-partition rules.

**Allowed lateness.** Policy for events arriving after initial window completion: revise results, route separately, or discard.

**State TTL.** Bounds retained state. Expiring state too early changes correctness.

**Checkpoint versus sink semantics.** Engine state may restore exactly while a nontransactional sink receives a repeated write.

## Production example

A logistics system computes five-minute average device temperature by warehouse.

One device loses connectivity for ten minutes. When it reconnects, it sends readings whose event times belong to two already emitted windows.

The product decides that warehouse dashboards may be revised for up to 15 minutes. The stream processor therefore uses event-time windows with a lateness policy and outputs records keyed by `warehouse_id + window_start` with a monotonically increasing revision.

The analytical sink performs idempotent upsert by that key rather than blindly appending every revision. The UI marks windows provisional until the finality period passes.

A separate side output records events arriving later than the allowed lateness for audit and possible backfill.

Testing covers idle partitions, replay after checkpoint recovery, a hot warehouse key, and sink failure between processing and commit.

## Trade-offs

Streaming reduces result latency while introducing always-on state, checkpoint storage, schema evolution, and operational complexity.

Longer lateness improves completeness but delays finality and retains more state. Shorter lateness reduces state while increasing corrections or discarded events.

Exactly-once-compatible sinks simplify derived-state correctness but may restrict technology choices or reduce throughput.

## Failure modes / pitfalls

Hot keys overload one partition. Idle source partitions can stall watermark progress if the engine is not configured to mark them idle.

State TTL can delete information still needed for late joins. Processing-time windows can look correct in tests while failing when sources delay data.

External side effects such as email or payments should not be assumed exactly once simply because the stream engine checkpoints state exactly once.

## When to use it

Use stream processing when incremental low-latency results provide business value and event-time or keyed-state semantics justify dedicated infrastructure.

Design replay and lateness behavior before production.

## When not to use it

Prefer batch when hourly or daily results are sufficient and replaying bounded data is materially simpler.

A plain message consumer may be enough for independent per-event work that needs no windows, joins, or stateful aggregation.

## What a Senior Engineer should know

A Senior Engineer should explain event time versus processing time, key partitioning, windows, watermarks, late data, checkpoint recovery, and sink idempotency.

They should test out-of-order and replay scenarios, not only ordered streams.

## What a Staff Engineer should understand

A Staff Engineer should define product finality and correction contracts, state and retention budgets, schema evolution, replay strategy, and the platform's recovery guarantees across pipelines.

They should choose streaming only where its latency benefit is worth continuous stateful operations.

Further reading: [Apache Flink event time](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/).
