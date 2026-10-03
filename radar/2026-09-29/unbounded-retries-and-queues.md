---
title: "Unbounded retries and queues"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

Unbounded retries and queues are a reliability anti-pattern in which the system promises “eventual progress” without limiting attempts, elapsed time, backlog, or resource consumption.

The intent is usually resilience: never lose a job and keep trying until the dependency comes back. During sustained failure, however, the mechanism creates work faster than the recovering system can finish and turns one outage into a backlog, cost, and recovery incident.

## Why it matters for backend engineers

Retries consume the same downstream capacity as new requests, often more because they concentrate during incidents. A persistent queue consumes memory, disk, broker retention, and operator attention.

Old work can also become invalid. A notification scheduled for yesterday, a stale inventory refresh, or an obsolete webhook may no longer deserve resources simply because it was once accepted.

Reliable systems distinguish durable obligation from infinite resource commitment.

## How it works

Suppose the normal arrival rate is 1,000 jobs per second and the downstream is unavailable. An unbounded retry loop keeps those 1,000 new jobs and repeatedly re-enqueues prior failures. Attempt traffic can become many times the original demand.

A safer design puts explicit bounds at several levels:

- total attempts or total retry age;
- exponential backoff with jitter;
- maximum queued items/bytes or acceptance window;
- per-destination or per-tenant concurrency;
- job expiry when the result is no longer valuable;
- a terminal unresolved/dead-letter state with clear ownership.

When service recovers, catch-up traffic is rate-limited so the backlog drains without starving new work or immediately overloading the dependency again.

A dead-letter queue is not “finished.” It is an operational queue of unresolved obligations. It needs retention, access, alerts, repair tooling, and an owner.

## Key concepts

**Retry amplification.** One logical operation produces multiple attempts. Nested retries multiply further.

**Age budget.** Limits how long the system keeps attempting an operation, even if attempt count remains small.

**Dead-letter state.** Isolates work that cannot progress under the normal policy. It is not automatic business resolution.

**Replay identity.** Replaying should preserve the original business identity for unchanged work so duplicate-safe destinations still recognize it.

**Recovery budget.** Backlog drain shares capacity with new traffic. “Use all capacity to catch up” can violate current customer objectives.

## Production example

A webhook platform sends to thousands of customer destinations. One customer's endpoint is down for six hours.

The first implementation retries every failed delivery every second forever. Workers spend a large fraction of capacity on that one destination, and healthy customers' webhooks are delayed. The database also accumulates millions of retry rows.

The system changes to per-destination concurrency and exponential backoff with jitter. Each delivery has a maximum attempt/age policy based on webhook semantics. A temporary 503 is retried; a permanent configuration error enters an unresolved state earlier.

Expired or exhausted deliveries move to an owned dead-letter store. The dashboard tells the customer which deliveries failed and allows a controlled replay after the endpoint is repaired. Replaying an unchanged delivery retains its event identity.

During recovery, the destination gets a bounded share of worker capacity. Queue age and completion rate show whether it is catching up. New healthy destinations are not starved by six hours of historical work.

## Trade-offs

Bounds surface failure to callers/operators sooner. That creates explicit product and support work but prevents infrastructure from pretending it can promise infinite recovery.

Long retry windows are appropriate for some durable workflows; the key is that storage, attempt rate, and escalation remain bounded and intentional.

## Failure modes / pitfalls

Resetting attempt counters during replay defeats limits. Retrying permanent validation/authentication failures wastes capacity. A dead-letter queue with no owner becomes a data graveyard.

Large broker retention can be mistaken for processing capacity. Immediate retry after throttling ignores the dependency's signal. Deleting old work solely to reduce queue size can violate a durable business promise if expiry semantics were never defined.

## When to use it

Use this caution whenever reviewing client retry loops, worker queues, message retention, scheduled jobs, or recovery procedures.

Replace “retry forever” with explicit budgets, durable state, and ownership.

## When not to use it

Do not interpret this as a ban on long-lived durable workflows. Some obligations may need days of retry. They still need bounded concurrency, storage, visibility, and escalation.

Do not expire work whose product or regulatory contract requires resolution merely because it is old; move it into a controlled unresolved process.

## What a Senior Engineer should know

A Senior Engineer should quantify retry amplification, backlog growth, expiry, and drain capacity. They should distinguish transient, permanent, and unknown outcomes.

They should design replay so it does not reset duplicate protection or release the entire backlog at once.

## What a Staff Engineer should understand

A Staff Engineer should decide which work remains valuable during prolonged outages, which must escalate to humans, and how capacity is shared during recovery.

They should establish platform defaults that make unbounded behavior difficult and ensure dead-letter/unresolved work has accountable ownership across teams.

Further reading: [AWS Builders' Library: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/).
