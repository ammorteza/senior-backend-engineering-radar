---
title: "Domain-driven design"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Domain-Driven Design aligns software models and language with a complex business domain. Its strategic boundaries matter more than mechanically applying aggregates and repositories everywhere.

## Why it matters for backend engineers

The same word can mean different things to different teams. A “customer” in onboarding and one in collections may have different lifecycle and invariants; forcing one shared model creates coupling.

## How it works

Engineers and domain experts develop a ubiquitous language within a bounded context. Context maps describe relationships and translation between models. Tactical patterns such as entities, value objects and aggregates help represent identity and enforce local invariants. Aggregate boundaries define consistency scope, not necessarily service deployment units.

## Key concepts

A bounded context is a meaning boundary. An anti-corruption layer translates another system's concepts. Value objects encode immutable meaning without independent identity. Domain events report accepted business facts.

## Production example

A credit team models facility approval separately from repayment collection. Approval owns eligibility and limits; collections owns overdue obligations. An integration translates an approved facility into the collections model without sharing internal tables. Domain experts review the terms so “available credit” and “outstanding debt” remain distinct.

## Trade-offs

Good models improve communication and preserve ownership. Rich abstractions cost effort and may be unnecessary for simple administrative CRUD.

## Failure modes / pitfalls

Treating every noun as a service, huge aggregates, anemic wrapper classes and copying enterprise patterns without domain knowledge defeat the purpose.

## When to use it

Use DDD where business rules and terminology are complex enough to cause recurring modeling friction.

## When not to use it

Do not add tactical patterns to a straightforward script solely for architectural consistency.

## What a Senior Engineer should know

Discover invariants and model boundaries with domain experts; avoid leaking storage models across contexts.

## What a Staff Engineer should understand

Align context relationships with team ownership while allowing deployment boundaries to evolve independently.

Further reading: [Martin Fowler on bounded contexts](https://martinfowler.com/bliki/BoundedContext.html).
