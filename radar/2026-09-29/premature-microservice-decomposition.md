---
title: "Premature microservice decomposition"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

Premature decomposition creates independently deployed services before stable boundaries or operational needs justify them. It locks uncertain domain assumptions into expensive remote contracts.

## Why it matters for backend engineers

A feature that once required one transaction can become a multi-service workflow before the team understands its invariants. Development slows because every change crosses several release owners.

## How it works

The anti-pattern often begins by splitting tables or CRUD endpoints into services. Shared business operations then require synchronous calls, duplicate data and coordinated releases. A better starting point is internal modules with explicit interfaces; extract a boundary when scaling, ownership or failure isolation provides evidence for it.

## Key concepts

A service boundary is a commitment to remote failure and compatibility. Code size is a weak extraction criterion. Domain uncertainty and cross-boundary transaction frequency reveal coupling. Operational maturity includes deployment, telemetry and on-call ownership.

## Production example

A startup splits customer preferences, contacts and identity into three services maintained by two engineers. Profile updates require all three to be healthy. It consolidates the cohesive workflow into modules, retaining external contracts during migration. Later a genuinely distinct high-volume notification capability is considered for extraction.

## Trade-offs

Early distribution may help exceptional scaling or ownership requirements. Otherwise it trades cheap refactoring for hard coordination before the domain settles.

## Failure modes / pitfalls

Shared tables, version-locked releases and long call chains are evidence that deployment count exceeded architectural independence.

## When to use it

Use this caution when proposing a new service or reviewing a distributed system with constant coordinated changes.

## When not to use it

Do not consolidate a proven independent boundary merely because fewer services sounds simpler.

## What a Senior Engineer should know

Identify coupling from change patterns, transaction scope and incident paths.

## What a Staff Engineer should understand

Sequence modularization and extraction around durable product and team boundaries.

Further reading: [Microservice prerequisites](https://martinfowler.com/bliki/MicroservicePrerequisites.html).
