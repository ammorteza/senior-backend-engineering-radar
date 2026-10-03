---
title: "Load balancing"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Load balancing distributes incoming connections, requests, or work across eligible backends. It provides a stable entry point while instances are added, removed, or replaced, and it can route according to capacity, health, locality, or application attributes.

Balancing is not proof that load is equal. Long-lived connections, hot keys, uneven request cost, and backend-local state can all make equally counted requests produce very different resource use.

## Why it matters for backend engineers

Load-balancer behavior participates in deployments and incidents. A process can receive `SIGTERM` and exit correctly from its perspective while an external balancer continues routing new traffic to it for several seconds.

Retries can also multiply. If a client, service mesh, and L7 balancer each retry one failure, one user request can produce many backend attempts. Capacity planning must include the combined policy.

## How it works

A load balancer exposes a stable listener and maintains an eligible backend set. Layer 4 (L4) balancers route based primarily on connection/network information. Layer 7 (L7) balancers understand protocols such as HTTP and can route by host, path, headers, cookies, or request properties.

Selection strategies include round robin, weighted round robin, least connections, hashing, and locality-aware policies. The algorithm works only over backends considered healthy and eligible.

Health checks should answer whether an endpoint should receive new traffic. A liveness check that merely proves the process exists may be too weak; a health check that synchronously depends on every downstream system may be too strict and remove the entire fleet during one dependency outage.

Connection draining coordinates removal. The backend becomes ineligible for new work, the balancer propagates that state, and existing requests/connections receive a bounded period to finish before the process stops.

## Key concepts

**L4 versus L7.** L4 can be efficient and protocol-agnostic; L7 supports routing, HTTP-aware retries, headers, and richer observability at additional complexity.

**Health versus readiness.** An instance can be alive but temporarily unready. The health signal should match traffic-admission intent.

**Affinity.** Cookie or hash affinity can keep users on one backend, but reduces freedom to rebalance and can concentrate failures.

**Locality.** Zone/region-aware routing can reduce latency and transfer cost. Fallback must preserve enough remote capacity for a failed locality.

**Outlier ejection.** Some systems temporarily stop using failing backends based on observed requests. Incorrect thresholds can amplify transient noise and overload the remaining fleet.

## Production example

A Kubernetes service behind an external L7 balancer performs a rolling deployment. Pods receive `SIGTERM` and exit within two seconds. The external balancer takes roughly longer than that to stop routing to removed endpoints, so users see intermittent 502s.

The service changes shutdown order. On termination it marks itself unready, stops accepting new background work, and leaves the process alive for a propagation/drain period. It then gracefully stops HTTP/gRPC listeners, waits for bounded in-flight work, and exits before the platform's termination deadline.

The team verifies three layers: Kubernetes endpoint removal, external balancer backend state, and application active-request count. A deployment test continuously sends traffic while replacing a large fraction of pods.

A second scenario removes one zone. Traffic shifts to the remaining zones, where CPU and database connection demand rise. Capacity planning therefore targets failure-mode load, not just normal balanced utilization.

Retry configuration is reviewed end to end: the gateway retries only clearly safe failures under a small retry budget, while application clients do not independently multiply the same attempt.

## Trade-offs

More health checking and faster ejection can remove bad instances quickly but may overreact to brief downstream problems. Slower removal reduces flapping but leaves bad endpoints active longer.

Affinity can simplify local caches or legacy sessions while weakening balancing and resilience. Locality reduces latency/cost but requires spare capacity outside the preferred zone.

L7 features improve control at the cost of CPU, memory, and another application-aware configuration layer.

## Failure modes / pitfalls

Shallow health checks send requests to instances that cannot serve them. Overly deep checks can remove every instance because one dependency is unavailable.

Long-lived connections can make round-robin connection assignment look balanced while one backend receives much more stream traffic. Retry amplification, slow deregistration, and mismatched idle timeouts produce deployment and failure storms.

Incorrect forwarded headers at L7 can also affect security and URL generation.

## When to use it

Use load balancing whenever multiple interchangeable instances serve one logical endpoint or traffic must be routed according to application/network policy.

Combine it with application behavior that is safe on any eligible replica or deliberately scoped affinity when state requires it.

## When not to use it

Do not use arbitrary load balancing for partitioned ownership where one key must reach a specific leader or shard. Deterministic routing or discovery is more appropriate.

Do not hide fundamentally stateful session design behind sticky routing without a failover plan.

## What a Senior Engineer should know

A Senior Engineer should understand L4/L7 behavior, selection algorithms, health/readiness, draining, affinity, locality, and retries.

They should test deployments and backend failures with live traffic and trace a request through all retrying/proxy layers.

## What a Staff Engineer should understand

A Staff Engineer should design capacity for zone/region failure, set organization-wide retry budgets, and coordinate ingress, mesh, client, and application timeout behavior.

They should choose platform defaults that make graceful removal reliable and prevent one shared balancing layer from becoming an unnoticed global blast radius.

Further reading: [RFC 9110 HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110), [Kubernetes terminating endpoints](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/).
