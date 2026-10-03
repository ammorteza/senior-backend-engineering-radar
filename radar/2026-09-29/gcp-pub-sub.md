---
title: "GCP Pub/Sub"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Google Cloud Pub/Sub is managed asynchronous messaging organized around topics and subscriptions. Publishers send to topics. Each subscription maintains its own delivery state, and multiple subscribers attached to that subscription share its work.

The service manages broker infrastructure, but the application still owns durable processing, duplicate handling and downstream limits. Successful publication means the service accepted a message under its contract; it does not mean every subscriber completed its business effect.

## Why it matters for backend engineers

Pub/Sub makes it relatively easy to scale receipt faster than a database or external provider can sustain processing. Without flow control, a larger worker fleet can create more timeouts, redelivery and cost while reducing useful throughput.

Acknowledgement behavior also defines recovery. Acknowledging when a request reaches memory can lose unfinished work after a crash. Waiting until an effect is durable preserves recovery but requires a protocol for duplicates and uncertain external results.

## How it works

Pull and streaming-pull subscribers receive messages under acknowledgement deadlines. Client libraries can manage lease extensions while processing, within supported settings. If acknowledgement does not complete in time, the message can become eligible for redelivery; extending a deadline is not a durable business lock.

Push subscriptions invoke an HTTP endpoint and interpret documented response codes as acknowledgement or failure. The endpoint must decide when its success response is safe. Enqueuing work only in local memory and returning success transfers responsibility away from Pub/Sub without creating durable recovery.

Default delivery is at least once without an ordering guarantee. Optional ordering applies per ordering key with the required subscription and regional publishing conditions. Different keys can progress independently; one slow or repeatedly failing key can delay its own ordered sequence.

Exactly-once delivery is available for supported pull subscriptions under documented regional conditions. Applications must use acknowledgement success information correctly; an expired or invalid acknowledgement is not confirmed completion. The feature does not deduplicate two separate publishes carrying the same business operation or atomically include a remote API call.

## Key concepts

**Subscription ownership.** Two services that each need every event require independent subscriptions. Two replicas sharing one subscription distribute its work rather than each receiving a full copy.

**Flow control.** Bound outstanding message count and bytes, then also bound active downstream calls. Limiting one client's buffer does not enforce a fleet-wide provider quota.

**Retry and dead lettering.** Backoff controls retry timing; a dead-letter topic isolates repeated failures. Required service-agent permissions and a receiving subscription must be configured. Delivery-attempt thresholds are approximate, so they are unsuitable as an exact business-attempt counter.

**Message identity.** A broker message ID identifies a publish accepted by the service. A separate business ID is needed when clients may publish one intended operation more than once.

**Retention and replay.** Recovery options depend on topic/subscription retention and seek or snapshot configuration. Verify these before assuming an arbitrary historical point is available.

## Production example

A payroll-data integration receives employee-update events and applies them to an external provider. The provider allows an illustrative 100 requests per second for the account. A burst causes workers to buffer thousands of updates and launch calls concurrently, leading to throttling and acknowledgement expiry.

The team bounds outstanding messages and bytes, limits active calls and coordinates the account-wide rate across replicas. If 50 replicas each permit 100 requests per second, local limits alone would still exceed the shared quota. Autoscaling follows useful throughput and backlog age rather than assuming more workers always help.

Each update has a durable operation identity. The worker records confirmed provider outcomes before acknowledging and handles a lost response using the provider's actual duplicate-safe or lookup protocol. A Pub/Sub lease extension cannot establish whether the provider applied an update.

Invalid employee records enter a dead-letter workflow after the configured retry behavior. The team verifies IAM and the subscription that receives those records, then exercises repair and replay. Unchanged retries retain operation identity. A correction that changes the provider request uses a new, linked operation only after the earlier outcome is resolved; changing a key while an earlier action remains unknown could duplicate the effect.

Acceptance checks provider throttling, oldest unacknowledged age, acknowledgement failures and unresolved business operations. Healthy message-receipt throughput alone would conceal the original overload problem.

## Trade-offs

Managed infrastructure reduces broker administration and supports independent subscriptions. The trade includes service-specific delivery behavior, quotas, cost and cloud coupling that must be evaluated for the workload.

Ordering simplifies some entity-level processing but can serialize work behind a slow message. Stronger delivery guarantees can reduce a class of duplicates while leaving publisher duplication and external effects to application protocols.

## Failure modes / pitfalls

Acknowledging on receipt loses work held only in memory. Unlimited in-flight calls can turn transient provider latency into repeated deliveries. Increasing acknowledgement deadlines without fixing capacity can hide the problem for longer.

Misconfigured dead-letter permissions can prevent expected forwarding. Deploying exactly-once subscribers across regions without preserving the documented regional scope can invalidate assumptions. Treat acknowledgement errors as real processing state, not logging noise.

## When to use it

Use Pub/Sub for asynchronous distribution and workers when managed messaging fits the deployment and operational model. Give each independent consumer an owned subscription and define its processing and recovery contract.

Exercise deadlines, provider throttling, duplicate publication and dead-letter replay before relying on autoscaling to handle bursts.

## When not to use it

Do not assume Kafka-style partition assignment or unlimited replay simply because both products transport events. Compare the actual ordering, retention and consumption model needed.

Avoid routing an immediate request/response decision through a queue when the product has no meaningful pending state or recovery behavior.

## What a Senior Engineer should know

A Senior Engineer should configure flow control, lease handling and acknowledgement timing around durable work. They should distinguish publisher duplicates from broker redelivery and know the chosen subscription's delivery scope.

They should test dead-letter routing end to end and diagnose whether backlog is caused by intake, downstream capacity, poison data or acknowledgement failures.

## What a Staff Engineer should understand

A Staff Engineer should establish subscription ownership, regional assumptions and shared downstream budgets. Messaging capacity must align with the slowest protected dependency and its recovery limits.

Define business reconciliation separately from broker metrics. A drained subscription should not be accepted as proof that all externally consequential operations reached a known outcome.

Further reading: [Exactly-once delivery](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery), [Message ordering](https://docs.cloud.google.com/pubsub/docs/ordering), [Dead-letter topics](https://docs.cloud.google.com/pubsub/docs/dead-letter-topics).
