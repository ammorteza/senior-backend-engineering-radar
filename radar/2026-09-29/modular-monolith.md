---
title: "Modular monolith"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A modular monolith deploys as one unit while preserving explicit internal module boundaries. It separates ownership and dependencies without introducing a network boundary for every domain.

## Why it matters for backend engineers

Teams often need manageable code structure before they need independent scaling. Internal boundaries can preserve flexibility while retaining local transactions and simple operational recovery.

## How it works

Modules expose intentional interfaces and own implementation details. Dependency direction is enforced through packages, build rules or architecture checks. Data access is constrained by ownership conventions even if storage is shared. Cross-module workflows can use local calls and transactions where their invariants belong together.

## Key concepts

Modularity is not merely folders. Public interfaces, dependency cycles and shared-table writes determine real coupling. One deployment means coordinated release, but modules can still have independent maintainers. Extraction is possible only if hidden dependencies are controlled.

## Production example

A billing product keeps invoicing and reporting modules in one Go service. Reporting reads through an explicit interface rather than directly mutating invoice tables. Architecture checks prevent imports into invoicing internals. When reporting later needs separate capacity, its data contract is already visible enough to design an extraction.

## Trade-offs

Local calls and transactions simplify reliability. Whole-application releases and shared resource limits reduce runtime independence. Strong boundaries require discipline and tooling.

## Failure modes / pitfalls

Global mutable state, shared “utils” containing business logic, circular imports and unrestricted table access create a distributed-monolith candidate rather than modularity.

## When to use it

Use a modular monolith for cohesive products where independent deployment is not yet worth remote coordination.

## When not to use it

Reconsider one deployment when failure isolation, ownership or scaling requirements demonstrably exceed it.

## What a Senior Engineer should know

Design module APIs and enforce dependency/data ownership rules.

## What a Staff Engineer should understand

Keep extraction options credible without paying their network and operational cost prematurely.

Further reading: [Monolith first](https://martinfowler.com/bliki/MonolithFirst.html).
