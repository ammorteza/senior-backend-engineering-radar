---
title: "API gateway pattern"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

An API gateway is a client-facing entry layer that routes requests to backend services and applies policies shared across those requests. Typical responsibilities include TLS termination, authentication, request-size limits, routing, coarse rate limits, protocol translation, and observability.

A gateway is a boundary component, not the owner of every business rule. It can establish who the caller is and which route they may enter, but the downstream service normally remains responsible for resource-level authorization and domain invariants.

## Why it matters for backend engineers

Without a gateway, external clients may need to know many service addresses and each service may reimplement the same edge policy differently. A gateway can simplify that surface.

The concentration also creates risk. A bad routing rule, exhausted connection pool, or expensive aggregation path can affect many otherwise independent services. Engineers must therefore treat gateway configuration as production code with capacity, rollout, and rollback requirements.

## How it works

The client connects to the gateway. The gateway terminates the external protocol, authenticates the request under the chosen scheme, normalizes trusted forwarding information, selects an upstream route, applies configured limits, and forwards the request with an end-to-end deadline.

Identity forwarding must have a trust boundary. The gateway should remove or overwrite externally supplied identity headers and send downstream identity in a form services know came from the trusted gateway or identity layer. A plain `X-User-ID` header is not trustworthy merely because the gateway commonly sets it.

Routing can be host-, path-, header-, or policy-based. Upstream pools need health checks, connection limits, and failure handling. Retries at the gateway must be coordinated with client and service retries or one failed call can multiply into a retry storm.

Some gateways aggregate several backend calls. This can reduce client round trips, but it turns the gateway into an orchestrator with its own latency budget and partial-failure semantics. That responsibility should be explicit rather than gradually accumulated through convenience routes.

## Key concepts

**Edge authentication versus domain authorization.** The gateway can reject an invalid access token; the report service still decides whether that authenticated principal may read report 42.

**Trusted forwarding.** Client IP, authenticated identity, and trace context pass through proxies. Every trusted hop needs a defined mechanism for overwriting or appending those values without accepting spoofed client input.

**Timeout budget.** The gateway timeout includes routing, queueing, upstream work, and response transfer. Its upstream deadline should leave time for the gateway itself to complete the response.

**Rate and concurrency limits.** Requests per second protect one dimension. Slow expensive routes may need concurrent-request or body-size limits so they cannot exhaust shared gateway or upstream resources.

**Aggregation.** Fan-out to several services increases latency exposure and introduces partial results. Define whether the gateway fails the whole response, returns a partial representation, or uses cached data.

## Production example

A partner API exposes account metadata and generated reports through one gateway. The gateway validates OAuth access tokens, caps request bodies, and routes `/accounts/*` and `/reports/*` to separate services.

A reporting endpoint can run for tens of seconds and return megabytes. Under load, those requests consume most gateway upstream connections and memory, causing simple account requests to queue. Increasing the global gateway connection limit merely pushes more concurrency into the report service and database.

The team separates limits by route class. Report generation becomes an asynchronous command returning a job ID, while report download uses streaming with an explicit size policy. Account routes retain a short timeout and independent concurrency budget.

The gateway forwards a signed or otherwise trusted identity context, but the report service still checks tenant ownership of each report. Security tests send a valid partner token with another tenant's report ID and verify denial. They also send spoofed forwarding headers directly to the public edge and confirm the gateway overwrites them.

A configuration rollout is canaried. Metrics compare route-level latency, upstream failures, rejected requests, and gateway resource use before expanding the change.

## Trade-offs

A gateway centralizes common policy and hides internal topology, but adds latency and a shared failure domain. It can simplify external API changes while increasing platform coupling to gateway-specific configuration.

Aggregation can provide a client-oriented interface, yet too much domain logic at the edge creates a “smart gateway, thin services” architecture that is hard to test and scale independently.

## Failure modes / pitfalls

Putting all authorization at ingress leaves direct or internal service paths underprotected. Blindly trusting forwarded headers allows identity spoofing. Unlimited buffering of uploads or responses can exhaust memory.

Gateway retries combined with SDK and service retries amplify load. One global timeout penalizes fast and slow routes differently. Broad routing patterns can expose internal endpoints accidentally.

A gateway can also hide upstream saturation: edge error rates rise while service CPU looks normal because requests are queued or rejected before they reach the service.

## When to use it

Use a gateway when external or cross-trust-boundary clients benefit from one managed entry point and several policies genuinely belong at that boundary.

It is especially useful for public APIs, partner APIs, mobile/web backends, and gradual backend migrations where routing must change without updating every client.

## When not to use it

Do not route every internal service-to-service call through one gateway simply for architectural uniformity. That creates an unnecessary central hop and blast radius.

Do not put domain workflows in the gateway when a dedicated backend-for-frontend or domain service owns that behavior more clearly.

## What a Senior Engineer should know

A Senior Engineer should configure routing, identity propagation, upstream pools, request/response limits, deadlines, retry policy, and route-level observability. They should test both bypass attempts and overload behavior.

They should be able to trace one request across proxies and distinguish edge rejection, gateway queueing, upstream connection failure, and service failure.

## What a Staff Engineer should understand

A Staff Engineer should define which concerns belong at the gateway and which remain in services, avoiding both duplicated edge policy and excessive centralization.

They should own capacity, configuration rollout, emergency bypass, and multi-team migration strategy, and ensure the gateway's availability target matches the number of products that depend on it.

Further reading: [API gateway pattern](https://microservices.io/patterns/apigateway.html), [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110).
