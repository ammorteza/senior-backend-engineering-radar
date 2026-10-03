---
title: "Graceful degradation"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Graceful degradation preserves a product's essential capabilities while reducing or disabling optional work during dependency failure or overload.

A degradation path is not “catch every error and return something.” It is a deliberate alternative whose correctness, freshness, and user-visible meaning are defined in advance.

## Why it matters for backend engineers

Distributed products often depend on recommendation, search enrichment, analytics, personalization, fraud signals, or other capabilities that are useful but not equally critical for every user action.

If all dependencies are treated as mandatory, one optional failure can make the entire product unavailable. If everything fails open, the system can bypass authorization or correctness controls. Engineers need to classify which dependencies are essential and which have safe fallbacks.

## How it works

For each request path, identify the minimum capabilities needed to satisfy the core contract. Optional dependencies receive bounded deadlines and resource isolation so their slowness cannot consume all request capacity.

When an optional call fails or the system enters overload mode, the service returns a defined substitute: cached data within a freshness bound, a simpler computation, a reduced response, delayed enrichment, or omission of the feature.

Critical checks fail according to their risk. Authorization usually fails closed; a recommendation may fail open by omission. The decision belongs to the product/security semantics, not a universal availability rule.

Degradation can also be capacity-driven. Under high load, the service can disable expensive secondary features before core traffic saturates. Recovery should restore them gradually to avoid a sudden load jump.

## Key concepts

**Essential dependency.** Without it, the operation cannot satisfy its correctness or safety contract.

**Optional dependency.** Its result improves the response but can be omitted or replaced within explicit rules.

**Freshness bound.** Stale data is safe only up to a defined age and for a defined purpose.

**Bulkhead.** Separate concurrency or resource pools prevent optional work from consuming capacity reserved for core work.

**Degraded-mode signal.** Metrics, logs, and sometimes response metadata should reveal that fallback is active; silent degradation can hide prolonged incidents.

## Production example

A travel-search endpoint returns available trips and normally asks a personalization service to rank them.

The core search service can produce a correct set of available trips without personalization. Its request budget is 800 ms; personalization gets at most 120 ms and a small isolated concurrency pool.

If personalization times out, the response uses deterministic price/time ranking. The UI does not claim “recommended for you” in that mode. Booking later rechecks authoritative price and availability; it never uses cached personalization data as an authorization or inventory decision.

During a personalization outage, the circuit breaker opens and fallback rate rises. Metrics show degraded responses explicitly. Because personalization has separate concurrency, its timeouts do not consume every search worker.

The team tests stale-cache age, personalization timeout, total dependency outage, and recovery. When the dependency returns, traffic ramps rather than sending every request immediately through the expensive path.

## Trade-offs

Degradation preserves availability but may reduce conversion, relevance, or feature richness. Maintaining fallback code adds testing and operational burden.

A fallback that depends on stale data can be cheaper and more available while risking outdated results. A simpler deterministic response may be less personalized but easier to reason about.

## Failure modes / pitfalls

Failing open on authentication, permission, safety, or mandatory correctness checks can create severe incidents. Presenting stale values as current can mislead users.

Fallback paths often rot because they run only during emergencies. Exercise them continuously or in controlled tests.

Another trap is a fallback that calls the same failing dependency indirectly or performs even more expensive work than the normal path.

## When to use it

Use graceful degradation where optional capabilities can fail independently without invalidating the core business operation.

Define the product behavior and validity bounds before an incident, then test the degraded path under load.

## When not to use it

Do not return approximate substitutes for mandatory authorization, integrity, or safety decisions.

Do not hide a persistently unhealthy dependency behind silent fallback forever; degradation is a resilience mode, not permission to abandon the primary service objective.

## What a Senior Engineer should know

A Senior Engineer should classify dependencies, set fallback deadlines and resource isolation, define stale-data bounds, and make degraded responses observable.

They should test both activation and recovery, including whether fallback remains cheaper than the normal path under overload.

## What a Staff Engineer should understand

A Staff Engineer should align degradation policy with product and security owners and reserve capacity for essential paths across shared infrastructure.

They should decide which features are dropped first under system-wide overload and ensure customer-facing expectations match the reduced mode.

Further reading: [Google SRE: Addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/), [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/).
