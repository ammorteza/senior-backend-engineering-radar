---
title: "DNS"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

The Domain Name System (DNS) maps names to records such as IP addresses, aliases, mail routes, and service metadata. It is a distributed hierarchical naming system with recursive resolvers, authoritative name servers, delegation, and caching.

For backend engineers, DNS is a control-plane dependency. A hostname such as `db.internal.example` is only stable at the application layer; the addresses behind it can change, answers can be cached for different lengths of time, and different networks can intentionally receive different answers.

## Why it matters for backend engineers

Nearly every service depends on DNS indirectly: managed databases, external APIs, Kubernetes Services, load balancers, CDNs, and package registries all rely on name resolution.

A DNS problem often looks like an application problem. One instance may keep using an old address while another resolves the new target. A negative answer can remain cached after a record is created. Existing TCP connections can continue using an old endpoint even after every resolver has learned the new address.

Understanding DNS prevents unsafe assumptions such as “we changed the record, so traffic moved immediately.”

## How it works

A client typically asks a local stub resolver, which sends the query to a recursive resolver. If the recursive resolver has a valid cached answer, it returns it. Otherwise it follows the DNS hierarchy: root servers point toward the relevant top-level domain, delegation points toward authoritative servers, and the authoritative server returns records for the zone.

Answers carry TTL values that limit how long caches may reuse them. Multiple caching layers can exist: the operating system, language runtime, local DNS forwarder, container platform, corporate resolver, and recursive service. The effective application behavior depends on all of them.

Common records include `A` for IPv4 addresses, `AAAA` for IPv6, `CNAME` for aliases, `MX` for mail exchange, `TXT` for arbitrary text used by many protocols, and `SRV` for service/location information. CNAMEs add another lookup and cannot be used everywhere a record is allowed.

Negative responses such as NXDOMAIN can also be cached according to DNS rules. Creating a record immediately after clients queried a nonexistent name can therefore produce a period where some clients continue seeing failure.

## Key concepts

**Recursive resolver versus authoritative server.** A recursive resolver answers clients and performs lookups. An authoritative server publishes the zone's data. Their logs and failure modes are different.

**TTL.** TTL is a maximum cache lifetime for a record under normal behavior, not a guaranteed refresh moment. Lowering it after clients cached a high value does not shorten those already cached answers.

**Delegation.** Parent zones point to authoritative servers for child zones. Incorrect NS/glue configuration can break resolution even when the final record looks correct in one management console.

**Split-horizon DNS.** The same name can intentionally resolve differently inside and outside a network. Debugging must use the same resolver context as the failing workload.

**Name resolution versus connection lifetime.** DNS affects new resolutions. A client with a long-lived existing connection may continue talking to the old address until it reconnects.

**Search paths.** Systems can append search suffixes to short names. This is convenient inside clusters but can create extra queries or surprising matches. Prefer fully qualified names at important boundaries.

## Production example

A team migrates `api.example.com` from load balancer A to load balancer B. The current TTL is one hour. Ten minutes before cutover they lower the TTL to 30 seconds and assume every client will update quickly.

That does not work: resolvers that cached the old one-hour answer before the change are allowed to keep it until the original TTL expires. Some application processes also retain connections to A.

A safer migration starts earlier. At least one old-TTL window before cutover, the team lowers the TTL and confirms the new value is visible from representative resolvers. Both load balancers remain healthy during overlap. At cutover, the record changes to B, but A continues serving correctly while cached answers drain.

The team monitors request volume at both destinations and tests public, corporate, and internal resolver paths. Only after old traffic approaches zero and the relevant connection/TTL windows pass does it decommission A.

If the migration is an emergency failover, the team accepts that DNS is not an instantaneous global switch. It may combine DNS with a load-balancing layer or anycast/edge routing whose failover behavior better matches the objective.

## Trade-offs

DNS gives applications stable names while infrastructure changes and distributes lookup load efficiently through caching. Caching is also what makes coordinated instant changes impossible.

Very low TTLs reduce stale-answer duration but increase resolver traffic and dependence on authoritative availability. Very high TTLs reduce lookup traffic but extend migration and recovery windows.

Complex alias chains can simplify ownership delegation but increase query latency and the number of records that can fail.

## Failure modes / pitfalls

Lowering TTL too late is a classic mistake. So is testing only with a laptop that uses a different resolver from production.

Deleting a record before creating its replacement can cause negatively cached NXDOMAIN. CNAME loops or long chains cause resolution failure or extra latency. Private and public zones with the same name can produce confusing split-horizon behavior.

Applications that resolve once at startup may never discover endpoint changes. Others re-resolve correctly but keep stale pooled connections. Diagnose DNS, client caching, and connection reuse separately.

## When to use it

Use DNS as the normal naming layer for services and public endpoints, and as one component of service discovery and traffic management.

Design planned migrations around observed resolver behavior and the previous TTL, not only the new record value.

## When not to use it

Do not use DNS as a transactional coordination system or assume all clients will observe one change simultaneously.

Do not rely on DNS round-robin alone for precise request balancing, per-request health decisions, or rapid draining; a load balancer or service proxy is better suited to those tasks.

## What a Senior Engineer should know

A Senior Engineer should understand recursive and authoritative resolution, delegation, common records, positive/negative caching, TTLs, search paths, and application-level DNS caching.

They should use tools such as `dig` against the same resolver path as production, inspect TTLs and authoritative answers, and correlate them with active connections.

## What a Staff Engineer should understand

A Staff Engineer should design DNS ownership, public/private zones, migrations, multi-region failover, and provider dependencies with explicit cache windows and blast radius.

They should ensure critical recovery plans do not depend on every client resolving a new address immediately and should provide platform defaults that make service discovery refresh behavior predictable.

Further reading: [RFC 1034: Domain Names — Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034), [RFC 1035: Domain Names — Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035).
