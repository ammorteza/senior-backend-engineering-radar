---
title: "Exactly-once assumptions"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

“Exactly once” is meaningful only with a stated boundary: delivery, processing state or an external business effect. Treating these as interchangeable is the caution in this blip.

## Why it matters for backend engineers

A duplicate message can become a duplicate charge. A broker feature that suppresses repeated delivery cannot atomically coordinate an unrelated payment provider and database.

## How it works

Draw the operation's commit points. If a worker commits a side effect and crashes before recording completion, restart cannot infer the outcome from local state alone. Solutions include provider idempotency keys, atomic deduplication with local writes, transactional read/write boundaries and reconciliation for ambiguous results.

## Key concepts

Duplicate identity must survive retries. Deduplication retention must cover replay windows. Kafka transactions and Pub/Sub exactly-once subscriptions provide specific guarantees whose scope excludes arbitrary external effects. Publisher duplicates can still carry distinct broker IDs.

## Production example

A payout worker times out after calling a provider. Repeating with a new key can pay twice; using the original business-operation key allows provider lookup or duplicate-safe retry. The local status remains “unknown” until confirmed, rather than falsely declaring failure because the response was lost.

## Trade-offs

End-to-end idempotency costs storage and protocol design. Strong transactional systems simplify some boundaries but limit participants and availability. Accepting occasional duplicates may suit telemetry, not money movement.

## Failure modes / pitfalls

Expiring deduplication too early, using attempt IDs as operation IDs and claiming broker guarantees cover a database are frequent mistakes.

## When to use it

Challenge exactly-once assumptions whenever correctness spans independent systems or replays.

## When not to use it

Do not discard a documented exactly-once feature as meaningless; use it for its actual boundary while protecting the others.

## What a Senior Engineer should know

Explain crash windows and demonstrate how duplicates and unknown outcomes are resolved.

## What a Staff Engineer should understand

State business guarantees precisely and own reconciliation where atomicity cannot extend.

Further reading: [Kafka delivery semantics](https://kafka.apache.org/documentation/#semantics), [Pub/Sub exactly-once](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery).
