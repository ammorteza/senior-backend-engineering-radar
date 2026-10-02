---
title: "Graceful degradation"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Graceful degradation preserves a product's essential behavior while temporarily reducing optional features. It requires deciding which substitute results are acceptable under specific failures.

## Why it matters for backend engineers

A recommendation outage should not necessarily prevent a user opening an account dashboard. Conversely, a failed authorization service must not turn access checks into permissive defaults.

## How it works

Classify request dependencies by whether they are essential. Bound optional calls with deadlines and isolation, then return a defined fallback when they fail or exceed budget. Capacity-aware policy can disable costly features before core requests saturate. Recovery should restore functionality gradually and expose the mode to operators.

## Key concepts

Fail-open and fail-closed choices depend on risk. Stale data requires a freshness limit and visible semantics. Bulkheads reserve resources for critical paths. Fallbacks must not secretly call the same failing dependency through another route.

## Production example

A travel search page normally ranks results using personalization. When that service times out, search returns deterministic price ordering with a clear indication where necessary. Booking still validates price and availability against authoritative services; those checks cannot use stale personalization-era data.

## Trade-offs

Reduced features preserve availability but can lower conversion or confuse users. Maintaining fallback paths adds testing work and can hide recurring dependency problems unless measured.

## Failure modes / pitfalls

Security bypasses, stale financial values presented as current, fallback overload and unused code paths that rot are dangerous outcomes.

## When to use it

Use degradation when optional capabilities can fail independently without violating core product invariants.

## When not to use it

Do not substitute approximate results for mandatory safety, authorization or correctness checks.

## What a Senior Engineer should know

Define fallback validity, deadlines and metrics for degraded responses; exercise the path regularly.

## What a Staff Engineer should understand

Agree with product owners which capabilities survive and allocate failure-isolated capacity accordingly.

Further reading: [Google SRE: Addressing cascading failures](https://sre.google/sre-book/addressing-cascading-failures/).
