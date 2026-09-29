---
title: "DNS"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

The Domain Name System maps human-readable names to network information and forms part of the control plane of almost every backend system. DNS is hierarchical, distributed and heavily cached.

It is not merely a directory that converts a hostname into one permanent IP address.

## Why it matters for backend engineers

Service discovery, database endpoints, third-party APIs, CDNs and cloud load balancers commonly depend on DNS. A DNS problem can therefore look like an application outage even when every application process is healthy.

TTL behavior also affects migrations and failovers. Changing a DNS record does not instantly change what every client uses.

## How it works

A client typically asks a recursive resolver for a name. The resolver may answer from cache or follow the DNS hierarchy toward authoritative name servers. Responses have TTLs that control caching.

Different record types represent different information: A and AAAA map names to addresses, CNAME aliases names, and records such as TXT, MX and SRV support other use cases.

Applications rarely implement this resolution directly; operating systems, runtimes, containers and service-discovery systems add their own caching and behavior.

## Key concepts

### Recursive and authoritative DNS
Recursive resolvers obtain answers for clients. Authoritative servers publish the records for a zone.

### TTL
TTL controls how long an answer may be cached. Lower TTLs improve change propagation at the cost of more resolution traffic.

### Positive and negative caching
Successful answers and some failures can both be cached.

### A, AAAA and CNAME
These common records represent IPv4, IPv6 and aliases respectively.

### Split-horizon DNS
The same name may resolve differently depending on network or resolver context.

### Service discovery
Platforms such as Kubernetes frequently use DNS names as a stable interface over dynamic endpoints.

## Production example

A team migrates an API from one load balancer to another and changes its DNS record. Some clients immediately use the new endpoint while others continue reaching the old one.

The cause is not inconsistent deployment: resolvers and application processes still hold valid cached answers. A safe migration keeps the old destination healthy for at least the relevant caching window, lowers TTL ahead of planned cutover when appropriate, and observes traffic on both endpoints.

## Trade-offs

DNS gives stable names over changing infrastructure and distributes resolution efficiently through caching. The same caching makes immediate global changes impossible.

Very low TTLs can increase resolver dependency and query volume. Very high TTLs make migrations and incident response slower.

## Failure modes / pitfalls

Common problems include expired or incorrect records, stale caches, resolver outages, CNAME chains, incorrect search domains, negative caching and assuming DNS-based load distribution gives precise traffic control.

Kubernetes adds another class of mistakes: confusing a service's DNS identity with the lifecycle of individual pods.

## When to use it

Use DNS as the normal naming layer for network services and as one component of service discovery, failover and traffic architecture.

## When not to use it

Do not treat DNS as a transactional coordination mechanism or assume it can perform instantaneous failover. Fine-grained traffic management often belongs in a load balancer, proxy or service-routing layer.

## What a Senior Engineer should know

A Senior Engineer should understand resolution flow, TTLs, common record types, caching and how to investigate resolution with tools such as dig or nslookup.

They should include DNS in incident hypotheses when name resolution or endpoint changes are involved.

## What a Staff Engineer should understand

A Staff Engineer should design migrations and failover around caching behavior, understand DNS ownership and blast radius, and reason about public versus private resolution, multi-region routing and service discovery.

They should avoid architectures whose correctness depends on all clients observing a DNS change at the same moment.
