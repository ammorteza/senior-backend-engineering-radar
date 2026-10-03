---
title: "Transactional Outbox"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A transactional outbox records a business change and the intent to publish a message in one local database transaction. A separate relay later delivers committed messages. This makes publication recoverable without requiring the database and broker to commit together.

The guarantee is deliberately narrower than “exactly-once messaging.” An outbox prevents a committed change from losing its recorded notification intent under the database's durability assumptions. It does not ensure immediate delivery, eliminate duplicates or make downstream effects atomic.

## Why it matters for backend engineers

Code that commits a row and then publishes has a crash window: the row exists, but no durable evidence remains that publication is still required. Publishing first creates the inverse problem—a consumer may act on a change that subsequently rolls back.

The outbox turns this ambiguity into observable backlog. Database availability and downstream publication availability become separate concerns. Engineers still need to decide how long the product may operate while downstream consumers are behind and how to recover without overwhelming them.

## How it works

The application transaction changes the authoritative business state and inserts an outbox row containing a stable event ID, event type, entity identity and payload or immutable payload reference. If the transaction aborts, neither the change nor its event is committed. A relay only publishes committed records.

A polling relay selects eligible rows and coordinates ownership among workers. One implementation claims rows using database locking and durable lease state, commits the claim, publishes outside the transaction, and then records success. Claim expiry permits recovery after a worker dies. A slow original worker may still publish after another takes over, so ownership claims reduce overlap without removing the need for duplicate-safe consumers.

A CDC relay instead reads the committed outbox inserts through the database's change stream. That changes how progress and retention are managed, not the fundamental need to handle repeated publication. Connector checkpoints, source-log retention and broker acknowledgements become part of the recovery chain.

In either design, mark completion only after the configured publication acknowledgement. A crash after broker acceptance but before progress is durable causes another attempt. Keep the event identity stable across attempts so consumers can recognize that repetition.

## Key concepts

**Recorded intent versus delivery.** A committed outbox row is evidence that work must be published, not evidence that a subscriber completed it. Track those milestones separately.

**Payload stability.** Reconstructing an old event by reading the current business row can silently publish newer values under an older event identity. Store the intended event content or a reference whose version cannot change.

**Entity ordering.** A sequence number is useful only with a protocol that respects it. Concurrent transactions and parallel relays can publish out of order unless entity serialization, partition ownership or consumer version handling addresses that explicitly.

**Backlog age.** Row count measures volume; oldest pending age measures how long an obligation has been delayed. A low-volume but stuck message can be critical.

**Cleanup contract.** Published rows may be retained for investigation or replay, but deleting unpublished rows discards an obligation. Define retention independently from the worker's claim timeout.

## Production example

An insurance service approves a policy and records `PolicyApproved` with the policy revision and document inputs in the same transaction. A document service must eventually create a corresponding policy document.

The broker is unavailable for ten minutes. Approvals remain committed, pending age increases and the product exposes that document generation is delayed. Operators can distinguish this from failed approval because the two states have separate evidence.

When connectivity returns, relays drain with bounded concurrency. They preserve event IDs across retries. One worker publishes and dies before recording success, so the event is published again. The document service uses the policy revision as part of its durable document identity and handles concurrent requests without producing two active documents for that revision.

The team then tests two approvals or amendments for the same policy close together. If rendering revision 6 after revision 7 would regress the active document, the consumer's version rule prevents that regression. A broker key alone cannot correct events that the relay emitted in the wrong order.

Finally, a malformed payload enters an owned repair state. Operators preserve the original record and failure reason, then decide whether later policy work must pause. An unchanged retry retains its event ID; a semantic correction is a new, linked event rather than different data silently published under the old identity. Quietly deleting the row would make the backlog graph look better while leaving the business obligation unresolved.

## Trade-offs

The pattern avoids a distributed commit protocol and allows the local service to continue through some broker outages. It adds database writes, storage, relay maintenance and a period during which downstream state is behind.

Polling can be easier to inspect and deploy; CDC can avoid repeated table scans but brings connector and source-log operations. Select from workload and operational capability, not an assumption that one universally removes more complexity.

## Failure modes / pitfalls

A relay that publishes while holding long database locks can make a broker slowdown consume transaction and connection capacity. A relay that releases claims too early can multiply concurrent attempts. Both need bounded behavior.

A timestamp or increasing database ID does not automatically equal business commit order under concurrency. Reconstructing payloads from mutable rows can lose the historical meaning of events. Monitoring only successful sends hides permanently stuck obligations.

## When to use it

Use an outbox when a local transactional change must reliably initiate asynchronous work across a database/broker boundary. Define event identity and consumer behavior at the same time as the table.

Exercise crashes before publication, after publication and before recording progress. Also test backlog recovery with realistic downstream capacity.

## When not to use it

Do not add an outbox to a purely local operation with no publication obligation. Do not use it to claim atomicity across several unrelated databases.

If an immediate cross-service result is essential, an outbox can durably schedule work but cannot erase the asynchronous product state. Reconsider the workflow or ownership boundary instead of hiding that delay.

## What a Senior Engineer should know

A Senior Engineer should implement the local atomic write, safe relay claims, stable payloads and crash recovery. They should explain why duplicate publication remains possible and how consumers protect their effects.

They should diagnose pending age, retry concentration and entity ordering separately, and know how to repair one bad event without losing the rest of the backlog.

## What a Staff Engineer should understand

A Staff Engineer should define publication ownership and the product's tolerance for downstream delay across services. Standardize the parts that benefit from reuse while keeping event meaning with the domain owner.

Plan database capacity, relay recovery throughput and long-lived event contracts together. A shared outbox library does not replace ownership of the business obligations it transports.

Further reading: [Debezium outbox event router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html), [Transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html).
