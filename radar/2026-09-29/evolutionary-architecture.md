---
title: "Evolutionary architecture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Evolutionary architecture keeps important system characteristics observable while allowing design to change incrementally. It relies on feedback and enforceable boundaries rather than predicting every future requirement.

## Why it matters for backend engineers

Architecture degrades through ordinary changes: new imports, broader data access or longer critical paths. A diagram that nobody checks cannot protect the properties the business relies on.

## How it works

Identify characteristics such as tenant isolation, bounded latency or module independence. Define fitness functions that provide useful feedback—automated checks, operational measurements or focused reviews. Change one boundary at a time and revisit the criteria when product needs change. A metric is useful only if it approximates the intended property credibly.

## Key concepts

Fitness functions can be static or runtime-based. Reversibility lowers change risk. Architectural seams isolate volatile decisions. An ADR records why a constraint exists, preventing tests from becoming unexplained dogma.

## Production example

A modular service prevents the reporting module from importing billing internals. CI detects a new violating dependency immediately. Meanwhile a representative report benchmark monitors the latency budget. When a legitimate cross-module requirement appears, engineers redesign the interface rather than disable every boundary check.

## Trade-offs

Incremental change avoids expensive all-at-once redesign. Maintaining feedback costs effort, and rigid or weak proxies can constrain useful evolution.

## Failure modes / pitfalls

Equating coverage percentage with architecture quality, freezing outdated rules and writing checks without owners create false confidence.

## When to use it

Use this approach in systems expected to evolve over years under multiple contributors.

## When not to use it

Do not create a fitness function for every aesthetic preference or assume automated checks replace design review.

## What a Senior Engineer should know

Define useful architectural checks and keep them tied to concrete risks.

## What a Staff Engineer should understand

Choose which characteristics deserve protection and when their constraints should evolve with the product.

Further reading: [Architecture fitness functions](https://www.thoughtworks.com/insights/articles/fitness-function-driven-development).
