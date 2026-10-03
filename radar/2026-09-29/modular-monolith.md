---
title: "Modular monolith"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A modular monolith deploys as one application while its code and data access are divided into explicit internal modules with controlled dependencies. It aims to preserve domain ownership and refactorability without paying the network and operational cost of independent services.

“One deployment” does not mean “one giant module.” Modularity comes from interfaces, dependency direction, data ownership, and tests—not directory names.

## Why it matters for backend engineers

Many products need clear domain boundaries long before they need independent deployment. Keeping boundaries in one process makes local transactions, debugging, refactoring, and testing much simpler.

A well-structured monolith can later extract a module if independent scale or ownership becomes valuable. A poorly structured monolith with unrestricted table access is difficult to extract because hidden coupling has already spread everywhere.

## How it works

Each module owns domain logic and exposes an intentional API to other modules. Internal packages and persistence details remain private.

Dependencies follow an agreed direction. Architecture tests or build/package rules can prevent forbidden imports and circular references.

Data can live in one physical database while ownership remains logical. For example, Reporting may read a published Billing query interface rather than updating invoice tables directly. Some systems also separate schemas or database roles to make ownership more explicit.

Because everything runs in one process, workflows that truly belong in one transaction can use local ACID transactions rather than compensating across services.

## Key concepts

**Module API.** Explicit contract other modules use. It should express domain operations rather than leak internal table structures.

**Dependency direction.** The architecture defines which modules may depend on which. Cycles usually signal unclear ownership.

**Data ownership.** A shared database does not mean every module may mutate every table.

**Internal event.** Modules can use in-process events for decoupling where useful, but should not add broker semantics unless needed.

**Extraction seam.** A clean module interface and controlled data access make later service extraction feasible.

## Production example

A billing product has Invoicing and Reporting in one Go binary and PostgreSQL database.

Reporting initially imports the invoice repository package and joins internal tables directly. Every invoice schema change breaks reporting, making the boundary cosmetic.

The team introduces an Invoicing query interface returning a report-specific read model. Reporting depends only on that API. An architecture test prevents imports of `invoicing/internal/*` from other modules.

For writes, only Invoicing owns invoice tables. Reporting may maintain its own derived summary table through an internal event after invoice commit.

Later report generation consumes large CPU and needs independent scaling. Because the module API and data flow are explicit, extraction can move the same contract across a process boundary deliberately rather than discovering dozens of hidden SQL dependencies during migration.

## Trade-offs

A modular monolith keeps deployment, transactions, and local calls simple. One release still carries all modules, and one process shares CPU, memory, and failure scope.

Strong internal boundaries require discipline because the compiler and database do not automatically forbid every shortcut.

Extracting later is easier than from a big ball of mud, but it is never zero-cost; remote failure semantics still need to be added.

## Failure modes / pitfalls

Shared `utils` packages accumulating domain logic create backdoor coupling. Circular dependencies and global mutable state undermine module ownership.

Direct cross-module table writes create hidden APIs harder to evolve than code interfaces. Internal events can become an imitation message bus with unnecessary complexity.

Modularity enforced only by folder naming disappears under delivery pressure.

## When to use it

Use a modular monolith for cohesive products where one deployment and database transaction boundary remain operationally appropriate.

It is an excellent default when the domain is still evolving and the team benefits from cheap refactoring.

## When not to use it

Reconsider one deployment when a module has demonstrably different scaling, security, failure-isolation, or team-ownership requirements.

Do not keep everything in one process merely to avoid operating any distributed systems if the product requirements clearly demand isolation.

## What a Senior Engineer should know

A Senior Engineer should design module APIs, dependency rules, transaction boundaries, and data ownership and use tests or tooling to make the boundaries enforceable.

They should keep internal contracts ready for evolution without prematurely treating them as remote APIs.

## What a Staff Engineer should understand

A Staff Engineer should guide where modular boundaries align with domains and teams, preserve credible extraction seams, and decide when independent deployment has become worth its cost.

They should resist both extremes: unstructured monoliths and service extraction before the boundary is stable.

Further reading: [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html).
