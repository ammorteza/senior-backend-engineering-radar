---
title: "Load balancing"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Load balancing distributes traffic across multiple backend instances or endpoints. It improves scalability and availability by preventing clients from depending on one server and by removing unhealthy endpoints from normal traffic.

Load balancing can happen at several layers, from transport-level forwarding to application-aware HTTP routing.

## Why it matters for backend engineers

Backend behavior and load-balancer behavior are tightly connected. Health checks, connection draining, retries, session affinity and timeouts can determine whether a deployment is seamless or causes errors.

Understanding balancing also prevents the assumption that adding replicas automatically distributes work evenly.

## How it works

A load balancer accepts traffic on a stable endpoint, selects a backend using an algorithm and forwards the connection or request. It continuously or periodically evaluates backend health.

Layer 4 balancers primarily route using transport information. Layer 7 balancers understand application protocols such as HTTP and can route by hostname, path or headers.

Selection algorithms include round robin, least connections, hashing and weighted approaches. Real systems combine selection with health, capacity and locality.

## Key concepts

### L4 versus L7
L4 balancing is transport-oriented; L7 balancing can make application-aware routing decisions.

### Health checks
A useful health check answers whether an instance should receive traffic, not merely whether its process exists.

### Connection draining
During shutdown or deployment, an endpoint stops accepting new work while existing requests are allowed to complete.

### Session affinity
Sticky routing can simplify stateful applications but weakens even distribution and resilience.

### Locality
Routing to nearby zones or regions reduces latency and cross-zone cost, but fallback behavior must be explicit.

## Production example

A Kubernetes service rolls out a new version. Pods receive SIGTERM and exit quickly, but the external load balancer still sends requests to them briefly. Users observe intermittent 502 errors.

A correct shutdown sequence marks the instance unready, allows endpoint propagation and connection draining, stops accepting new work, then waits for in-flight requests before exiting.

## Trade-offs

Load balancers improve resilience and scaling but add another stateful operational component. L7 features provide powerful routing and security capabilities but consume more resources and can hide application problems behind retries.

Affinity can preserve local state but makes balancing less effective.

## Failure modes / pitfalls

Common problems include shallow health checks, retry amplification, overloaded healthy instances after others fail, slow deregistration, uneven long-lived connections, incorrect proxy headers and timeout mismatches.

A dangerous pattern is configuring retries independently at clients, meshes and load balancers, multiplying one failed request into many downstream attempts.

## When to use it

Use load balancing whenever multiple interchangeable service instances serve the same logical endpoint or traffic must be routed by policy.

## When not to use it

Do not use a load balancer to hide fundamentally stateful application design without understanding affinity and failover. Some partitioned workloads require deterministic ownership rather than arbitrary balancing.

## What a Senior Engineer should know

A Senior Engineer should understand L4/L7 differences, health checks, balancing algorithms, connection draining, retries, affinity and timeout interaction.

They should design services that shut down gracefully and remain safe when requests are routed to any healthy replica.

## What a Staff Engineer should understand

A Staff Engineer should reason about balancing across zones and regions, capacity loss during failure, retry budgets, failover policy and how ingress, service meshes and application clients interact.

They should establish platform defaults that avoid duplicated retries, unsafe health checks and deployment-related traffic loss.
