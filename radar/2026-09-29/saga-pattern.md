---
title: "Saga pattern"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A saga coordinates a business operation through multiple local transactions and explicit compensating actions. It manages partial completion without pretending that independent services share one database transaction.

## Why it matters for backend engineers

Reservations, contracts and external payments cannot always commit together. The application needs a defined business outcome when some steps succeed and later steps fail.

## How it works

An orchestrator persists each step and its outcome, or services choreograph progress through events. After failure, completed steps are compensated where possible. Compensation is a new business action, not a byte-for-byte rollback; it can fail and require retries or manual resolution. Steps and compensations need stable operation identities.

## Key concepts

Pivot steps may make cancellation impossible; subsequent work must then move forward toward completion. Timeouts indicate unknown outcomes, not necessarily failed steps. Isolation is weaker than a single transaction, so intermediate states need product semantics.

## Production example

A travel booking reserves a hotel and flight, then payment fails. The saga cancels both reservations. Flight cancellation succeeds, but the hotel service is unavailable; the persisted saga remains compensating and retries later. Customer support sees the unresolved reservation rather than a misleading fully-cancelled status.

## Trade-offs

Sagas enable independent service ownership but expose intermediate states and complex compensation. Orchestration centralizes visibility; choreography reduces one controller but can obscure the process.

## Failure modes / pitfalls

Missing compensation, double execution, circular event chains and treating refunds as perfect rollback are common failures.

## When to use it

Use a saga for multi-owner workflows where local transactions and explicit recovery match business semantics.

## When not to use it

Keep tightly coupled updates in one transaction when one owner and database can handle them.

## What a Senior Engineer should know

Model each failure and ambiguous-outcome path, including compensation failures.

## What a Staff Engineer should understand

Define cross-team process ownership, customer-visible states and escalation for irreversibility.

Further reading: [Saga pattern](https://microservices.io/patterns/data/saga.html).
