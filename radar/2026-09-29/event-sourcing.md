---
title: "Event sourcing"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Event sourcing stores accepted domain events as authoritative state history. Current state is reconstructed by applying that history under defined rules. This differs from an ordinary mutable table accompanied by an audit log: in event sourcing, losing the authoritative event stream loses the basis from which state is derived.

It also differs from publishing events to other services. A CRUD system can emit integration events without using event sourcing, and an event-sourced system can keep most of its internal history private. The decision concerns authority and reconstruction, not merely whether messages exist.

## Why it matters for backend engineers

Some domains need to explain how a state arose, reconstruct what was known at an earlier point, or build new views of accepted decisions. Explicit event history can make these capabilities natural.

The commitment is long-lived. Event meaning, corrections, schema evolution and retention become part of the database model. A poorly designed event can remain relevant for years, so storing implementation details or incomplete facts can make future reconstruction expensive or impossible.

## How it works

A command handler loads an entity or aggregate's event stream, optionally starting from a snapshot, and applies events to reconstruct current state. It validates the requested transition and attempts to append new events with an expected stream version. A competing append causes a conflict; the handler must reload and reconsider the command rather than blindly append a decision based on old state.

The event store must provide the required atomic append and durability contract. An expected version protects the chosen stream, not every stream in the system. Cross-aggregate invariants require another coordination mechanism or an ownership model that places the invariant within one boundary.

Read projections consume committed events and build query-oriented representations. They track progress and handle repeated delivery. A projection can be rebuilt if its input history and interpretation remain available, but rebuild time and serving behavior need an operational plan.

Snapshots cache reconstructed state at a stream position. They reduce replay work but require versioning and validation. Deleting the underlying history changes the recovery contract: a snapshot is no longer merely disposable acceleration if it becomes the only surviving source for old state.

## Key concepts

**Command versus fact.** A request to cancel coverage can be rejected. A cancellation event records an accepted transition. Persisting an unvalidated request as if it were an accepted fact obscures authority.

**Deterministic reconstruction.** Applying historical events should not depend on today's clock, current exchange rates or mutable external API responses unless those inputs are explicitly part of the historical model.

**Effective versus recorded time.** A correction can be recorded today but apply to an earlier business date. Supporting “what was effective then” and “what did we know then” requires an intentional temporal model, not just one event timestamp.

**Projection versus side effect.** Rebuilding a view is different from resending a letter or charging a provider. Side-effect workflows need separately tracked execution identity and replay policy.

**Event evolution.** Compatible readers or upcasters can interpret old representations. They cannot invent domain facts that were never captured.

## Production example

A policy administration service records coverage additions, exclusions and cancellations in a policy stream. A command to add an exclusion validates against the reconstructed policy and appends at the expected version. If another command changed the policy first, validation runs again on the new state.

The service needs a view of coverage at an incident date. The team distinguishes the effective date of coverage changes from the date the system recorded them. A later correction may change the best current interpretation of past coverage while the original recorded history remains available for explaining the earlier decision.

A new projection reads the event history into a separate table. It uses deterministic rules and the event's captured facts, not today's policy configuration. The team compares sample policies against known transition sequences, including corrections and conflicting command attempts.

Replaying cancellation events must not resend cancellation letters. Letter delivery is a separate workflow with its own durable operation identities and completion records. The replay process builds state; it does not invoke all production handlers indiscriminately.

Before switching readers, the new projection catches up with live appends and passes invariant and sample checks. Operators measure full rebuild time and define whether the old view remains available during recovery. These steps make the claimed rebuild capability operational rather than theoretical.

## Trade-offs

Authoritative history supports explanation, temporal views and new projections. It increases the importance of event design and long-term interpretation. Ordinary audit tables or temporal records may satisfy a narrower history requirement with less architectural commitment.

Snapshots and projections make access efficient but add derived state to maintain. An event log does not make storage free or query latency automatically predictable; long streams and complex projection rebuilds consume real resources.

## Failure modes / pitfalls

Calling external services while applying historical events can make replay non-deterministic or repeat irreversible actions. Changing the meaning of an old event type can silently alter reconstructed history.

Expected-version checks on one stream do not protect cross-stream invariants. An event archive that contains unnecessary sensitive data can make retention and deletion difficult; immutability is not an exemption from lifecycle requirements. Design what must be retained and how references or protected data are handled before committing to permanent payloads.

## When to use it

Use event sourcing when reconstructable domain history and explicit transitions are central requirements worth the additional design and operating cost. Prototype corrections, schema evolution and projection rebuilds, not only append and read performance.

Choose the stream boundary from the invariants it must enforce and the contention it can support.

## When not to use it

Do not use it for routine CRUD solely to obtain a change log. A maintained audit trail may provide the needed accountability without making every read depend on historical event interpretation.

Avoid assuming that event sourcing provides a global transaction, a complete legal audit solution or effortless recovery. Those guarantees require additional design and evidence.

## What a Senior Engineer should know

A Senior Engineer should implement expected-version appends, deterministic state application and duplicate-safe projections. They should separate command validation from event application and external execution.

They should explain what happens after a conflict, how snapshots are invalidated and how a new projection is built while live writes continue.

## What a Staff Engineer should understand

A Staff Engineer should decide whether the domain's historical requirements justify making events authoritative. Establish ownership of semantics, temporal interpretation, lifecycle and migrations over the system's lifetime.

Budget for projection recovery and historical compatibility. The benefit of preserving decisions is realized only if future teams can still interpret and operate that history correctly.

Further reading: [Martin Fowler on event sourcing](https://martinfowler.com/eaaDev/EventSourcing.html), [Event sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing).
