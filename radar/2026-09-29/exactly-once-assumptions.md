---
title: "Exactly-once assumptions"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

This caution concerns an assumption: that an “exactly-once” infrastructure feature makes an entire business workflow execute once. The phrase is useful only when its participants, identity, failure model and durable outcome are named.

A system may execute a transformation several times while making one committed result visible. Another may suppress broker redelivery after a confirmed acknowledgement. Neither definition inherently means that an arbitrary external action occurred once. Read the actual contract before translating a feature name into a product promise.

## Why it matters for backend engineers

Many defects appear at the edge of a guarantee, not inside it. A broker can behave exactly as documented while a worker issues two refunds, because the refund API never participated in the broker's transaction.

The opposite mistake also wastes effort: dismissing all exactly-once features as impossible. Transactional stream processing and confirmed delivery protocols can simplify supported workflows substantially. Senior engineers should preserve their benefits while identifying what remains unprotected.

## How it works

Start by drawing durable state transitions: input accepted, effect requested, effect committed, local result recorded and message acknowledged. For each adjacent pair, ask what a restarted worker knows if the process or network fails between them.

If effect and progress can commit atomically in one system, recovery can distinguish committed work from work to repeat. Kafka transactions support an appropriate boundary involving Kafka output records and consumed offsets; consumers must use the intended isolation mode and applications must handle transaction failures correctly. A separate SQL commit is not automatically included.

Pub/Sub's exactly-once feature has a different scope: supported pull subscriptions can confirm acknowledgements and avoid subsequent redelivery after successful acknowledgement within the documented regional conditions. Valid redelivery can still occur before successful acknowledgement, such as after an acknowledgement deadline expires. Repeated publishing of one business event can also create multiple message identities.

Where no common transaction exists, preserve a stable business-operation ID and use the destination's idempotency or conditional-write contract. If the destination supplies neither safe repetition nor outcome lookup, a timeout leaves real uncertainty. Recovery must explicitly reconcile evidence or accept a documented loss/duplication trade-off; renaming the local state “failed” does not remove the uncertainty.

## Key concepts

**Physical execution versus committed effect.** A transformation can run again after failure without exposing its aborted output. Counting function calls and counting committed business results are different measures.

**Transport identity versus business identity.** Two broker message IDs may describe one intended payout. Deduplicating only by transport ID does not merge publisher retries that became distinct messages.

**Guarantee lifetime.** Expired deduplication records, retained-message replay and rebuilt databases can change the evidence available. Safety during a short retry window does not imply safety during a historical backfill.

**Atomic participants.** List the systems enrolled in the protocol. Shared infrastructure branding, a common cloud account or one source-code function does not establish atomicity.

**Evidence of completion.** A provider operation ID or durable ledger entry can resolve an uncertain result. A timeout counter cannot tell whether the action happened.

## Production example

A royalty service processes a payout instruction from a subscription configured for exactly-once delivery. The worker calls a payment provider, which accepts the payout. Before the worker records the provider result or successfully acknowledges the message, its host fails.

A later attempt is legitimate under the subscription's contract. Calling the provider with a newly generated key risks a second payout. The broker feature did not fail; it had no confirmed acknowledgement and did not control the provider's ledger.

The repaired workflow persists one payout identity before attempting the call. Every attempt uses the provider's supported key for that operation and the same meaningful input. Recovery queries or safely repeats under the provider contract, records the confirmed result, and only then acknowledges processing completion.

The team also tests two independently published copies carrying different broker IDs but the same payout identity. Both must resolve to one payout. Finally, it tests a manual replay after the provider's key window expires. That path requires retained business evidence and reconciliation before deciding whether another provider call is safe.

These are illustrative failure tests, not a claim that every provider offers the same recovery features. If the necessary contract is missing, the architecture must acknowledge that limitation and choose a different integration or operational policy.

## Trade-offs

Atomic infrastructure boundaries reduce custom recovery logic within their scope, but may constrain participants, throughput or availability. Application-level identities add storage and protocol work while allowing independent systems to cooperate safely under retries.

Some approximate telemetry can tolerate duplicate samples or later correction. A money-moving workflow needs a different standard. Choose guarantees from consequences rather than applying the strongest-sounding label everywhere.

## Failure modes / pitfalls

Generating a new operation key after every timeout defeats duplicate safety. An “already processed” marker stored separately from the effect can be wrong in either direction. Replaying old events after deleting deduplication state can reactivate completed actions.

A high success percentage does not test the relevant guarantee: the rare crash between two commits is exactly the case to exercise. Test concurrent attempts too, because sequential duplicate tests can miss a race that produces two effects.

## When to use it

Challenge exactly-once assumptions whenever a design spans a broker, database and external API, or when a team introduces replay and recovery tools. Write the guarantee as a sentence naming the effect and boundary.

A useful review result is a concrete crash table and recovery protocol, including which uncertain cases require an operator.

## When not to use it

Do not reject a documented transactional feature merely because it cannot cover every system. Use it where it reduces uncertainty and add protection at the remaining boundaries.

Do not promise a stronger business result than the available participants can establish. An explicit unresolved state is more useful than a misleading success or failure flag.

## What a Senior Engineer should know

A Senior Engineer should distinguish valid redelivery, publisher duplication and repeated business execution. They should explain what evidence survives each crash and demonstrate safe concurrent recovery.

They should verify retention and replay behavior alongside the normal processing path, rather than treating exactly-once as a one-time configuration task.

## What a Staff Engineer should understand

A Staff Engineer should own end-to-end guarantees where teams' local contracts meet. Identify who resolves unknown outcomes, who can replay work and which business identifiers survive migrations and disaster recovery.

Require architecture claims to name their scope and assumptions. This makes procurement, incident response and future platform changes easier to evaluate without either overtrusting or dismissing infrastructure guarantees.

Further reading: [Kafka transaction design](https://kafka.apache.org/41/design/design/), [Pub/Sub exactly-once scope](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery).
