---
title: "Stream processing"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Stream processing continuously transforms events into results, often maintaining keyed state and time windows. Unlike a batch job, it must decide what to do with data that arrives late or out of order.

## Why it matters for backend engineers

Fraud signals, usage aggregates and monitoring depend on timely results. Processing arrival order as if it were business-time order can quietly produce incorrect decisions.

## How it works

Operators consume events, partition them by key and update state. Windows group events by event time or processing time. Watermarks estimate event-time progress and guide when windows emit results; they are not proof that no older event will arrive. Checkpoints capture recoverable progress and state under the engine's documented guarantees.

## Key concepts

Tumbling windows do not overlap; sliding windows do. Allowed lateness controls revisions after initial output. State TTL bounds retention but can change correctness. Sink behavior determines whether checkpointed processing also provides duplicate-safe external results.

## Production example

A device sends readings after reconnecting from a ten-minute outage. A five-minute event-time aggregation must either update previous windows, route late records separately, or reject them under an explicit policy. The dashboard marks preliminary results, and downstream storage upserts by device/window rather than blindly appending revisions.

## Trade-offs

Low-latency computation requires continuously operated state and recovery infrastructure. Generous lateness improves completeness but retains more state and delays finality.

## Failure modes / pitfalls

Idle partitions can stall watermarks. Hot keys concentrate state and CPU. State expiry can discard information before late events arrive. Exactly-once engine state does not automatically cover a nontransactional sink.

## When to use it

Use streaming when incremental results have value before a periodic batch could finish.

## When not to use it

Prefer batch processing when deadlines tolerate it and replaying bounded input makes operations substantially simpler.

## What a Senior Engineer should know

Explain watermarks, windows, late-data policy, checkpoint recovery and sink idempotency.

## What a Staff Engineer should understand

Choose correctness/finality contracts and budget state, replay and schema migration across pipelines.

Further reading: [Flink event time](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/).
