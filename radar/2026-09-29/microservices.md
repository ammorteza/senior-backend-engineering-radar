---
title: "Microservices"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Microservices structure a system as independently deployed services that own explicit business capabilities and communicate through network contracts. The important word is **independently**: multiple small processes that require coordinated releases and shared-table changes are not achieving the main architectural benefit.

A service boundary is also a failure and consistency boundary. Replacing an in-process call with HTTP or messaging introduces latency, partial failure, compatibility, observability, and operational ownership.

## Why it matters for backend engineers

Microservices can enable separate team ownership, targeted scaling, and fault isolation. They can also transform simple local transactions into distributed workflows and multiply deployments, dashboards, alerts, and on-call burden.

Backend engineers therefore need to reason from business and organizational requirements, not “small services are modern.”

## How it works

Each service owns its implementation and usually authoritative data for its capability. Other services interact through APIs or events rather than writing its tables directly.

Independent deployment requires backward-compatible contracts. If service A can deploy only after service B and C change together, the boundary is operationally coupled even if they run in separate pods.

Cross-service workflows cannot rely on one local ACID transaction. The architecture must define asynchronous events, sagas, idempotency, reconciliation, or another consistency strategy.

Scaling is per service only when bottlenecks are actually separated. If five services share one database, adding replicas to one service may still overload the same database.

## Key concepts

**Business capability.** Stable domain responsibility such as Billing or Fulfillment, not one CRUD endpoint.

**Independent deployment.** One service can change within its compatible contract without a lockstep release of consumers.

**Data ownership.** One service is authoritative for its model. Shared reads can use APIs, events, replicas, or analytical copies rather than uncontrolled shared writes.

**Remote failure.** Timeouts, retries, duplicate requests, network partitions, and uncertain outcomes are normal design concerns.

**Distributed transaction boundary.** Cross-service invariants need explicit workflow and recovery design.

## Production example

A media platform has account management and video transcoding in one monolith. Transcoding is CPU-heavy, scales independently, and its deployments are frequent and operationally risky. Account requests should remain available even if workers are saturated.

The team extracts transcoding behind a durable job contract. Account service creates a stable job ID and stores user-visible workflow state. Workers consume jobs, write immutable output, and publish completion. Duplicate delivery is safe because output identity is derived from job ID.

Account reads no longer synchronously call the transcoder. A worker outage delays media processing but does not prevent login or profile updates.

The team does **not** split profile email, display name, and preferences into three services because those fields share one ownership model and have no independent scale or team requirement.

## Trade-offs

Microservices improve independent ownership and targeted scaling when boundaries are strong. They add network calls, deployment pipelines, service discovery, contract management, telemetry, and incident surfaces.

Isolation can reduce blast radius while synchronous call chains can create a larger one. More services are not automatically more resilient.

## Failure modes / pitfalls

Shared databases with cross-service writes undermine ownership. Chatty request chains create latency and cascading failure.

Lockstep version releases indicate compatibility or boundary problems. Tiny ownerless services become permanent operational cost.

A “shared common business library” can couple services as tightly as one monolith if every release must upgrade together.

## When to use it

Use microservices when independent team ownership, deployment cadence, scaling, security isolation, or failure isolation has concrete value greater than distributed-system cost.

A proven modular boundary is usually a better extraction starting point than a table or endpoint count.

## When not to use it

For a small cohesive product or rapidly changing domain, a modular monolith may provide better refactoring and transaction simplicity.

Do not split services solely to match organization charts that are themselves unstable.

## What a Senior Engineer should know

A Senior Engineer should design service contracts, data ownership, timeout and retry behavior, asynchronous workflows, and backward-compatible migrations.

They should recognize when a remote call is creating coupling that would be cheaper as an internal module call.

## What a Staff Engineer should understand

A Staff Engineer should choose service boundaries in the context of team topology, domain stability, failure domains, consistency needs, and lifecycle cost.

They should actively remove boundaries that provide no independent value and prevent the organization from equating service count with architectural maturity.

Further reading: [Microservices](https://martinfowler.com/articles/microservices.html), [Microservice prerequisites](https://martinfowler.com/bliki/MicroservicePrerequisites.html).
