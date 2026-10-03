---
title: "Premature microservice decomposition"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

Premature microservice decomposition is the anti-pattern of creating independently deployed services before the domain boundaries, team ownership, scaling needs, or operational maturity justify a network boundary.

The core cost is not the number of repositories. It is turning cheap in-process refactoring into distributed contract, consistency, deployment, and incident work while the underlying model is still changing.

## Why it matters for backend engineers

Early products learn rapidly. If every domain correction requires changing four services, coordinating schemas, and handling partial failure, architecture slows learning.

A local transaction such as “update customer contact data and preferences” can become several remote calls with retries and compensation simply because tables were split into separate services.

Once external consumers depend on those contracts, consolidating again becomes a migration project.

## How it works

Premature decomposition often starts from technical rather than domain boundaries: one service per table, CRUD entity, or endpoint.

As features evolve, cohesive workflows cross those services. Teams add synchronous call chains, duplicated data, shared libraries, and direct shared-database access to regain the convenience lost in decomposition.

The better sequence is often:

1. identify domain or capability boundaries inside one deployable system;
2. enforce module and data ownership;
3. observe change patterns, scaling, failure isolation, and team ownership;
4. extract only when a boundary shows durable independent value.

This is not “monolith forever.” It is delaying an expensive remote boundary until evidence exists.

## Key concepts

**Change coupling.** How often two components must change and release together. Frequent lockstep change suggests the boundary is wrong or immature.

**Transaction coupling.** Cross-service operations requiring synchronous consistency may be evidence the invariant belongs inside one boundary.

**Operational surface.** Every service adds deployment, monitoring, ownership, capacity, and incident work.

**Boundary evidence.** Independent scale, security isolation, release cadence, or team ownership are stronger reasons than code size.

**Reversibility.** Internal modules are cheap to redraw; production service contracts are much harder to remove.

## Production example

A startup with six engineers creates separate Identity, Contact, Preferences, and Notification Settings services because each maps to a table.

A profile update needs Identity to validate the user, Contact to change phone, Preferences to update communication language, and Notification Settings to update consent. The UI now depends on four services being available and releases frequently require coordinated changes.

The team reviews six months of commits and incidents. Contact and Preferences almost always change together under the same product owner and share transactional invariants. Notification delivery, however, has independent scale and provider failure behavior.

They consolidate the cohesive profile capabilities into modules of one service while maintaining compatibility adapters for existing clients. Notification delivery remains separate.

Later, if one module develops independent scale or ownership, it can be extracted from a clearer boundary.

## Trade-offs

Early services can still be correct when independent ownership or extreme scaling exists from day one. The caution is against assuming distribution is free.

Consolidation reduces operational cost but can reduce independent deployment for boundaries that were genuinely useful. Decisions should use evidence rather than a blanket “monolith good” rule.

## Failure modes / pitfalls

Shared tables, shared internal libraries, synchronous chains, and release trains where several “independent” services must deploy together are strong warning signs.

Teams can also overcorrect by refusing any service extraction because decomposition once went badly. Proven boundaries should remain separate when they deliver real value.

## When to use it

Use this caution during proposals for new services and during reviews of systems with constant coordinated releases or cross-service transactions.

Ask what specific independent benefit the new service creates and how that benefit exceeds the operational cost.

## When not to use it

Do not use this caution to merge a proven independent capability merely to reduce service count.

A service with separate team ownership, scaling, compliance, or failure isolation may be exactly the right boundary.

## What a Senior Engineer should know

A Senior Engineer should analyze commit history, transactions, synchronous call graphs, and incident paths to identify coupling.

They should know how to build strong module boundaries first and migrate service contracts safely if consolidation or extraction is chosen.

## What a Staff Engineer should understand

A Staff Engineer should sequence modularization and service extraction around durable domain and team boundaries, considering the organization's ability to operate distributed systems.

They should challenge architecture metrics based on service count and optimize for independent change, not maximal decomposition.

Further reading: [Microservice prerequisites](https://martinfowler.com/bliki/MicroservicePrerequisites.html), [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html).
