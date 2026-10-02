---
title: "Model routing and AI gateways"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

AI gateways centralize access to model providers and can apply routing, budgets and telemetry. Routing selects a model based on task requirements rather than treating every endpoint as interchangeable.

## Why it matters for backend engineers

Provider availability, latency, quality and data handling affect product behavior. A cheaper fallback can silently violate a tool contract or lower correctness on difficult cases.

## How it works

The gateway authenticates callers, enforces approved providers and budgets, then forwards under a routing policy. It records model/version and outcome. Fallback handles selected failures only when compatibility is verified. Streaming, tools and structured-output behavior must be tested per route. Cache keys need identity and policy context where responses are not universally shareable.

## Key concepts

Request cost differs from task-completion cost. Provider rate limits may be shared across customers. Retries can duplicate billed work or tool effects. Residency requirements and payload redaction constrain eligible routes.

## Production example

A document classifier uses a cheaper validated model for ordinary inputs and escalates uncertain cases. A provider outage triggers only a tested compatible fallback. The gateway records route and classification quality; it does not silently send restricted documents to an unapproved region.

## Trade-offs

Central controls simplify attribution and access management. The gateway becomes another dependency and can hide provider differences behind an overly generic interface.

## Failure modes / pitfalls

Untested fallbacks, cross-tenant caches, unlimited retries and inaccurate token accounting create quality, security or cost failures.

## When to use it

Use a gateway when several workloads need shared model policy and operational controls.

## When not to use it

One modest application may be simpler with a direct maintained provider client.

## What a Senior Engineer should know

Test route compatibility, budgets and streaming/error behavior.

## What a Staff Engineer should understand

Own quality-aware routing, provider trust and cost allocation across AI products.

Further reading: [Envoy AI Gateway](https://aigateway.envoyproxy.io/docs/).
