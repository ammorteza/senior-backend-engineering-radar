---
title: "Microservices"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Microservices organize a system into independently deployed services with explicit capabilities and ownership. Independence depends on contracts and data boundaries, not simply running many small processes.

## Why it matters for backend engineers

A boundary can enable autonomous releases and targeted scaling, or it can turn one local operation into a fragile chain of remote dependencies.

## How it works

Each service owns its implementation and usually its authoritative data. APIs or events coordinate cross-service work under explicit failure and consistency semantics. Teams deploy services independently only when compatibility permits it. Shared libraries and databases can reintroduce coordination despite separate runtimes.

## Key concepts

Business capability is a better starting point than endpoint count. Independent deployment needs backward-compatible contracts. Remote calls add latency and ambiguous failure. Cross-service invariants may require redesign, sagas or reconciliation.

## Production example

A media platform separates CPU-heavy transcoding from account management because it needs different scaling and release cadence. Jobs carry stable IDs and durable status, so worker outages do not block account APIs. The team does not split each account-table operation into its own service.

## Trade-offs

Services offer targeted scaling and organizational autonomy. They add deployment pipelines, on-call surfaces, contract evolution and distributed correctness work.

## Failure modes / pitfalls

Chatty synchronous chains, shared database writes, coordinated “independent” releases and ownerless services indicate weak boundaries.

## When to use it

Use microservices when independent ownership, scaling or fault isolation has concrete value exceeding operational cost.

## When not to use it

A small cohesive product may be easier and safer as a modular monolith.

## What a Senior Engineer should know

Design contracts, ownership and failure paths; avoid treating network calls as local functions.

## What a Staff Engineer should understand

Choose service boundaries with organizational incentives, consistency and lifecycle cost in view.

Further reading: [Microservices](https://martinfowler.com/articles/microservices.html).
