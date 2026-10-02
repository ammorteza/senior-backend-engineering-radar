---
title: "Event sourcing"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Event sourcing stores a sequence of domain events as the authoritative history. Current state is derived by applying that history, rather than being the sole persisted truth.

## Why it matters for backend engineers

Historical decisions can matter in audit-heavy domains. But recording events as truth changes correction, privacy and schema evolution responsibilities for the lifetime of the system.

## How it works

An aggregate loads its event stream, reconstructs state and validates a command. It appends new events using an expected stream version to reject conflicting writes. Projections derive read models. Snapshots shorten rehydration but must remain replaceable from the underlying history under the chosen retention policy.

## Key concepts

Events represent accepted facts, not arbitrary database diffs. Corrections usually append compensating facts. Replay must isolate state reconstruction from irreversible external effects. Old event schemas require upcasters or compatible readers.

## Production example

A policy administration system records coverage additions, exclusions and cancellations. A new projection calculates historical coverage at an incident date. Replaying these facts rebuilds the projection; it must not resend cancellation letters, which belong to a separately tracked delivery workflow.

## Trade-offs

Explicit history supports temporal queries and new projections. It adds event design, evolution and replay complexity; an ordinary audit table may satisfy simpler needs.

## Failure modes / pitfalls

Persisting implementation details as permanent events, replaying side effects and assuming immutable history solves privacy requirements can create costly problems. Append concurrency must be protected.

## When to use it

Use it when reconstructable domain history is central enough to justify the architectural commitment.

## When not to use it

Avoid it for routine CRUD merely to have a change log. Evaluate audit tables and temporal records first.

## What a Senior Engineer should know

Implement expected-version appends, snapshots and side-effect-free replay.

## What a Staff Engineer should understand

Own event semantics, retention/privacy strategy, projection recovery and long-term migration cost.

Further reading: [Martin Fowler on event sourcing](https://martinfowler.com/eaaDev/EventSourcing.html).
