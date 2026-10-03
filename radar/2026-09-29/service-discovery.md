---
title: "Service discovery"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Service discovery maps a stable logical service identity to the changing network endpoints that can currently serve it. Dynamic schedulers replace pods and hosts routinely, so clients should not need hard-coded instance addresses.

Discovery can be DNS-based, registry-based, or hidden behind a stable proxy/load balancer. The important contract is how quickly endpoint membership changes become visible and how clients stop using removed endpoints.

## Why it matters for backend engineers

A service can have healthy replacement instances and still be unavailable to a client that cached an old endpoint forever. Conversely, immediately dropping existing connections as soon as discovery changes can interrupt in-flight work unnecessarily.

Discovery interacts with readiness, graceful shutdown, load balancing, DNS caching, and connection pooling. These layers must agree on endpoint lifecycle.

## How it works

In a registry model, service instances or a platform controller publish endpoint identities plus health/readiness state. Clients either query/watch the registry and choose endpoints themselves, or send traffic to a server-side proxy that performs discovery on their behalf.

DNS discovery returns one or more records under a stable name. TTLs and client resolver behavior determine refresh. Kubernetes normal Services provide a stable virtual/service endpoint, while headless Services can return backing endpoint addresses directly. Existing TCP connections are independent from new DNS answers.

Readiness should control whether an endpoint receives new application traffic. During shutdown, an instance becomes unready first, giving discovery/load-balancer state time to propagate, then drains active requests before exiting.

Discovery failures need policy. A client may temporarily use a last-known-good endpoint set when the registry is unavailable, but stale endpoints become dangerous over long periods. The acceptable behavior depends on topology and failure mode.

## Key concepts

**Registration versus readiness.** “Exists” does not mean “ready for this traffic.” Health state should reflect whether the endpoint can safely serve new work.

**Client-side discovery.** The client receives endpoint data and performs balancing. This reduces proxy hops but distributes refresh/retry logic into every client stack.

**Server-side discovery.** A proxy or platform endpoint hides membership from clients, centralizing balancing and policy.

**Freshness.** DNS TTL, registry watches, local caches, and load-balancer propagation each add delay. Measure the actual end-to-end removal time.

**Connection draining.** Discovery stops new assignment; existing connections may require explicit drain/GOAWAY/close behavior depending on the protocol.

## Production example

A gRPC client connects directly to a headless Kubernetes Service. Its resolver runs once at startup and creates channels to the returned pod IPs. During a rolling deployment, old pods disappear but the client keeps sending calls to stale addresses and reports `UNAVAILABLE` despite healthy replacement pods.

The team first confirms that Kubernetes Endpoints/EndpointSlices contain the correct new pods. The problem is inside the client discovery lifecycle.

It switches to a supported resolver/balancer that watches or periodically refreshes endpoints, or routes through the stable Service when direct endpoint awareness provides no necessary benefit. Server shutdown marks pods unready, waits for endpoint propagation, begins graceful gRPC draining, and then exits.

Tests replace pods repeatedly while a client sends continuous traffic. Metrics distinguish resolution failures, endpoint-set changes, connection errors, and RPC failures. The team also tests discovery-control-plane outage: clients can use a bounded last-known-good set rather than dropping every healthy existing connection immediately.

## Trade-offs

Client-side discovery can reduce hops and enable topology-aware balancing, but every language/runtime must implement compatible refresh and failure behavior.

Server-side proxies centralize routing, mTLS, and policy but add another dependency and resource layer. DNS is ubiquitous and simple but has TTL/cache semantics rather than instant membership notification.

## Failure modes / pitfalls

Registering an instance before it is ready sends traffic into startup failure. Removing it after process exit creates a request-loss window. Long DNS caches and long-lived sockets keep removed endpoints alive.

Health checks that require every downstream dependency can remove all instances during a dependency outage and turn degraded service into total outage. Discovery health should reflect whether the instance itself should receive traffic under the product's degradation policy.

## When to use it

Use discovery for dynamically scheduled services, managed endpoints, and environments where instance addresses change independently of clients.

Prefer the platform's supported discovery mechanism unless a concrete topology or policy requirement justifies another layer.

## When not to use it

Do not build a custom registry when DNS, Kubernetes Services, or an existing platform endpoint satisfies the requirement.

Do not use discovery as a distributed lock or ownership protocol; endpoint presence is not sufficient fencing for exclusive work.

## What a Senior Engineer should know

A Senior Engineer should trace logical name to resolver/registry, endpoint set, load-balancer choice, and live connection. They should understand readiness, refresh, stale caches, and graceful removal.

They should test endpoint replacement and discovery outage rather than only stable steady state.

## What a Staff Engineer should understand

A Staff Engineer should define stable service identities, topology/locality policy, discovery ownership, and failure behavior across languages and platforms.

They should ensure deployments, service meshes, DNS, and client pools share compatible lifecycle assumptions so platform abstractions do not fight one another.

Further reading: [Kubernetes Service discovery](https://kubernetes.io/docs/concepts/services-networking/service/), [EndpointSlices](https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/).
