---
title: "Transactional Outbox"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A transactional outbox stores a business change and a message-to-publish in the same local database transaction. It closes the gap between committing data and reliably recording the intent to notify another system.

## Why it matters for backend engineers

Committing first and publishing second can lose an event if the process crashes. Publishing first can announce a change that never commits. Neither ordering makes two independent systems atomic.

## How it works

The application inserts the business row and outbox row together. A relay polls committed outbox records or observes them through CDC, publishes each message and records progress. A crash after publication but before marking completion causes a duplicate. Consumers therefore still need durable idempotency; the outbox guarantees recorded intent, not unique external effects.

## Key concepts

An event needs a stable ID and an aggregate identifier. Parallel relays need safe row claiming or partition ownership. Ordering must be defined per aggregate if consumers depend on it. Retention, retry age and poison-message handling determine whether the outbox stays operable.

## Production example

An insurance service approves a policy and inserts `PolicyApproved` in one transaction. The broker is unavailable for ten minutes; approved policies remain committed and outbox age rises. When the broker recovers, the relay drains at a controlled rate. A downstream document generator deduplicates the event ID before creating the policy document.

## Trade-offs

The pattern avoids distributed commit protocols but adds relay operations, table writes and eventual publication. Polling is straightforward; CDC reduces polling work while introducing log and connector management.

## Failure modes / pitfalls

Deleting unpublished rows, acknowledging publication prematurely, lacking consumer deduplication and allowing retries to reorder an aggregate can break guarantees. A permanently failing message needs an owned resolution path.

## When to use it

Use it when a local transaction must reliably trigger asynchronous work across a database/broker boundary.

## When not to use it

A purely local change with no external notification does not need an outbox. Do not assume an outbox coordinates atomic writes across multiple independent databases.

## What a Senior Engineer should know

Draw both crash windows around relay publication and demonstrate duplicate-safe consumption. Monitor oldest unpublished age, not just row count.

## What a Staff Engineer should understand

Choose event ownership, sequencing and relay infrastructure that scale across teams without obscuring the local transaction boundary.

Further reading: [Debezium outbox event router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html).
