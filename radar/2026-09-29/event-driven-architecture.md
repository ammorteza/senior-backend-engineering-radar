---
title: "Event-driven architecture"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Event-driven architecture (EDA) models important state changes as events and lets other components react asynchronously. An event is a fact such as `OrderPaid` or `RiderLocationUpdated`; it is not a disguised RPC command asking a particular consumer to do something.

## Why it matters for backend engineers

EDA can decouple producers from consumers and absorb bursts, but it moves complexity into ordering, duplicate delivery, schema evolution and observability. The producer no longer knows that every downstream consequence finished successfully.

## How it works

A producer commits a business change and publishes an event to a broker. The broker retains or forwards it to one or more subscriptions. Consumers independently acknowledge events after processing. Durable brokers allow consumers to recover after downtime; consumer groups or subscriptions determine how work is distributed.

The difficult boundary is between database state and event publication. If those are separate writes, a crash can leave one without the other; the transactional outbox is a common solution.

## Key concepts

### Events versus commands
Events describe facts that happened. Commands express intent and normally have an expected owner.

### Ordering
Most brokers provide ordering only within a partition, key or ordering key—not globally.

### Delivery semantics
At-least-once delivery is common, so consumers must tolerate duplicates. Redelivery after acknowledgement failure is normal behavior.

### Event contracts
Events become long-lived integration APIs. Fields, meaning, compatibility and ownership need governance.

### Eventual consistency
Downstream views update later than the source transaction. Product behavior must tolerate that window.

## Production example

An order service commits an order and emits `OrderConfirmed`. Fulfillment creates delivery work, analytics records the conversion, and notifications send a confirmation. A notification outage no longer blocks checkout. If fulfillment receives the event twice, an idempotency key based on order/event identity prevents duplicate work.

## Trade-offs

EDA improves decoupling, burst handling and independent consumption. It makes end-to-end tracing, debugging and consistency harder, and introduces broker operations plus schema governance.

## Failure modes / pitfalls

Publishing after a database commit without an outbox can lose events. Assuming global ordering can corrupt state. Consumers that acknowledge before durable processing can lose work; consumers that acknowledge afterward must handle duplicates. Large retry backlogs can replay stale events into newer state.

## When to use it

Use EDA when multiple independent consumers react to facts, producers should not wait for downstream work, or workloads benefit from buffering and replay.

## When not to use it

Prefer a synchronous call when the caller needs an immediate answer and there is one clear owner. Do not turn every internal function boundary into an event boundary.

## What a Senior Engineer should know

A Senior Engineer should understand partitions, ordering scope, acknowledgement/redelivery, idempotent consumers, dead-letter handling, outbox publication, schema evolution and how to trace one event across services.

## What a Staff Engineer should understand

A Staff Engineer should decide where asynchronous boundaries belong, define event ownership and governance, prevent event streams from becoming accidental shared databases, and account for replay, retention, privacy and organizational coupling.