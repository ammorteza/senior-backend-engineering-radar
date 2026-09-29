---
title: "API design and evolution"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

API design defines the contract through which components communicate: operations, data models, errors, compatibility rules and behavioral expectations. API evolution is the discipline of changing that contract without unnecessarily breaking consumers.

A good API is not only syntactically clean; it makes business invariants and operational behavior predictable.

## Why it matters for backend engineers

APIs create coupling that often outlives the implementation behind them. A poorly designed internal API can slow dozens of teams just as a public API can frustrate external users.

Senior engineers need to think about retries, pagination, idempotency, error semantics and deprecation before those concerns become production incidents.

## How it works

An API exposes resources or operations using a protocol such as HTTP or gRPC. Its schema defines inputs and outputs, while behavioral semantics define what calls mean under concurrency, failure and repetition.

Evolution should favor additive compatible changes. Breaking changes require migration strategies, versioning or coordinated rollout. Producers and consumers often need an overlap period where both old and new representations work.

## Key concepts

### Contract
The contract includes behavior and semantics, not only fields.

### Backward compatibility
Existing consumers should continue working after a producer change where possible.

### Idempotency
Retryable commands need explicit duplicate semantics.

### Pagination
Large collections need stable pagination that remains meaningful as data changes.

### Error model
Errors should distinguish validation, authentication, authorization, conflict, transient failure and overload.

### Deprecation
Removing behavior requires ownership, observability and a migration timeline.

## Production example

A service exposes GET /orders with offset pagination. As new orders arrive, consumers processing pages see duplicates and miss rows because offsets shift.

The API migrates to cursor-based pagination using a stable ordering key. The old contract remains available during migration, usage is measured, and consumers receive a deprecation deadline.

## Trade-offs

Highly generic APIs can reduce endpoint count but weaken semantics. Very specialized APIs are easier for one consumer but increase surface area.

Strict compatibility slows some cleanup but protects independent deployment and organizational autonomy.

## Failure modes / pitfalls

Common problems include exposing database models directly, inconsistent errors, breaking enum changes, unbounded list endpoints, ambiguous nullability, server-generated side effects on GET, and versioning every small change instead of designing compatibility.

Another pitfall is treating internal APIs as safe to break because consumers are "inside the company."

## When to use it

Apply deliberate API design whenever a contract crosses a component, team or trust boundary. The longer-lived and more independent the consumers, the more important compatibility becomes.

## When not to use it

Do not create remote APIs between modules that belong in the same deployable unit merely to imitate microservices.

## What a Senior Engineer should know

A Senior Engineer should design clear resources or RPC operations, pagination, errors, idempotency, compatibility and deprecation. They should use OpenAPI or Protobuf where machine-readable contracts add value.

They should understand how client retries and timeouts interact with API semantics.

## What a Staff Engineer should understand

A Staff Engineer should establish API governance without creating bureaucracy, identify ownership boundaries, guide large migrations and minimize organization-wide coupling.

They should reason about contracts as long-lived architecture and choose standards that allow teams to evolve independently.
