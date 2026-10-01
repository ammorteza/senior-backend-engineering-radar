---
title: "Delivery semantics"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Delivery semantics describe what a messaging system and application can guarantee about processing a message when failures occur. The familiar labels are at-most-once, at-least-once and exactly-once, but the useful question is always: exactly once **where**, and for which side effect?

## Why it matters for backend engineers

A worker can finish its database write and crash before acknowledging the message. The broker then redelivers it. That single failure explains why duplicate-safe processing matters more than marketing claims about exactly-once delivery.

## How it works

With at-most-once delivery, a message is considered consumed before or without a durable confirmation of processing; failures can lose work. With at-least-once, acknowledgement happens after processing, so ambiguous failures cause redelivery. Broker-level exactly-once mechanisms can atomically coordinate selected broker operations, but usually cannot atomically include an arbitrary HTTP API, email provider or unrelated database.

## Key concepts

### Acknowledgement
The point at which the broker may stop redelivering a message.

### Redelivery
A message is intentionally delivered again when processing success is uncertain.

### Idempotency
Consumers make repeated attempts produce one logical effect.

### Processing boundary
A guarantee is meaningful only when its transactional boundary is named.

### Poison messages
Messages that repeatedly fail need bounded retry and quarantine rather than infinite redelivery.

## Production example

A payment consumer writes `payment_status=charged` and crashes before acknowledging. The broker redelivers. If the consumer calls the payment provider again without an idempotency key, the customer can be charged twice. At-least-once delivery plus end-to-end idempotency is safer than pretending the broker alone can provide exactly-once charging.

## Trade-offs

At-most-once is simple but accepts loss. At-least-once protects against loss but moves duplicate handling to consumers. Stronger transactional mechanisms reduce some ambiguity while increasing coordination, coupling and operational constraints.

## Failure modes / pitfalls

The classic mistake is equating exactly-once message delivery with exactly-once business effects. Other failures include acknowledging too early, unbounded redelivery, non-idempotent external calls and deduplication records that are not committed atomically with state changes.

## When to use it

Choose semantics from business consequences. At-least-once is a strong default for durable business work when consumers can be idempotent.

## When not to use it

Do not pay for complex exactly-once mechanisms when duplicate-safe processing already provides the required business guarantee.

## What a Senior Engineer should know

A Senior Engineer should be able to draw the crash windows around processing and acknowledgement and explain what happens in each one. They should design idempotency, retries and DLQ behavior accordingly.

## What a Staff Engineer should understand

A Staff Engineer should define end-to-end business guarantees across brokers, databases and external systems, and challenge vague “exactly once” claims that omit their transactional boundary.