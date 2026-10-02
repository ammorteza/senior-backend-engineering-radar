---
title: "GCP Pub/Sub"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Google Cloud Pub/Sub is managed messaging organized into topics and subscriptions. Each subscription gets its own delivery stream; subscribers on that subscription share the work.

## Why it matters for backend engineers

The service removes broker operations, but acknowledgement behavior, quotas and downstream capacity still determine whether business work completes safely.

## How it works

Publishers submit messages to a topic. Pull or streaming-pull subscribers receive messages and acknowledge after processing; expired acknowledgement deadlines permit redelivery. Push subscriptions send HTTP requests to an endpoint. Default delivery is at least once without ordering. Optional ordering applies within an ordering key under documented publishing constraints.

## Key concepts

Flow control bounds outstanding messages and bytes. Retry policy and dead-letter topics provide recovery paths, with required IAM configuration. Exactly-once delivery is a pull-subscription feature with a documented regional scope, not exactly-once business processing; publish-side duplicates remain possible.

## Production example

A payroll integration acknowledges only after persisting an update result. Slow provider calls exceed processing capacity, so outstanding-message limits stop unlimited in-memory accumulation. Oldest unacknowledged age alerts before retention becomes a risk. Duplicate delivery uses a durable event identifier; dead-lettered updates are reviewed and replayed deliberately.

## Trade-offs

Managed scaling reduces infrastructure work but introduces service quotas, cloud coupling and per-operation cost. Ordered keys can limit throughput and make a slow message hold up subsequent work.

## Failure modes / pitfalls

Acking on receipt loses unfinished work. Excess parallelism can overload a provider. Missing dead-letter IAM can undermine the intended recovery path. A broker acknowledgement does not prove an external side effect happened once.

## When to use it

Use Pub/Sub for decoupled GCP event distribution and asynchronous workers with explicitly designed duplicate handling.

## When not to use it

Do not assume it provides Kafka-style partition ownership or unlimited retention and replay.

## What a Senior Engineer should know

Set flow control, ack behavior and retry policies; distinguish message age from subscription throughput.

## What a Staff Engineer should understand

Choose subscription ownership, regional assumptions, retention and business reconciliation guarantees.

Further reading: [Subscription overview](https://docs.cloud.google.com/pubsub/docs/subscription-overview), [Exactly-once delivery](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery).
