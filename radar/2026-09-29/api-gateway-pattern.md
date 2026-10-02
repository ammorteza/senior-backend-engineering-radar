---
title: "API gateway pattern"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

An API gateway is an entry layer that routes client requests to backend services and applies boundary policies. It presents a controlled external surface over internal service topology.

## Why it matters for backend engineers

Clients should not need every internal address or security mechanism. Central routing and authentication can help, but an overloaded gateway can affect otherwise independent services.

## How it works

The gateway terminates supported protocols, selects upstream routes and applies policies such as token validation, request-size limits and rate limits. Some gateways aggregate responses. Services still enforce resource-level authorization and business constraints; gateway admission does not prove a caller may access a particular record.

## Key concepts

Routing, authentication and aggregation have different resource costs. Forwarded client identity must resist spoofing. Timeout budgets include upstream calls. Gateway policy configuration deserves deployment review and rollback.

## Production example

A partner API exposes customer reports through a gateway. It validates tokens and caps upload size, then forwards a trusted identity representation. The report service independently checks tenant ownership. A slow analytics route gets separate concurrency limits so it cannot exhaust connections used by basic account endpoints.

## Trade-offs

A shared boundary simplifies policy and client contracts. It adds a hop and central configuration blast radius; extensive aggregation can turn the gateway into a tightly coupled business service.

## Failure modes / pitfalls

Blindly trusting forwarded headers, putting all authorization at ingress, unlimited buffering and global timeouts cause security or availability failures.

## When to use it

Use a gateway for external APIs or a justified client-facing boundary with shared policies.

## When not to use it

Do not route every internal call through one central component without a concrete requirement.

## What a Senior Engineer should know

Configure routes, identity forwarding, upstream budgets and observability by route.

## What a Staff Engineer should understand

Define gateway ownership and separate boundary policy from domain behavior.

Further reading: [API gateway pattern](https://microservices.io/patterns/apigateway.html).
