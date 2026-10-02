---
title: "Architecture Decision Records"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

An Architecture Decision Record (ADR) preserves a consequential choice, the context that motivated it and the alternatives considered. It explains why a design exists when the original participants are no longer available.

## Why it matters for backend engineers

Without decision history, teams revisit settled questions or retain obsolete constraints. An ADR lets a reviewer distinguish deliberate trade-offs from accidental implementation.

## How it works

Write a short record near the decision: problem, relevant constraints, options, selected choice and consequences. Assign status and date, link supporting evidence and keep it with maintained project documentation. Later decisions supersede earlier records rather than silently rewriting the historical rationale.

## Key concepts

A decision differs from a design tutorial. Accepted, proposed and superseded statuses communicate authority. Reversibility determines how much evidence is needed. Consequences should include costs and rejected benefits, not only praise for the selected option.

## Production example

A document service chooses object storage over database blobs because expected files are large and immutable. The ADR records access control, transaction-boundary implications and rejected alternatives. Two years later, a new requirement for atomic metadata/file changes is evaluated against that reasoning instead of assuming the original choice was universal.

## Trade-offs

Records reduce repeated debate at small writing cost. Excessive formality can slow routine decisions and leave a graveyard of unread proposals.

## Failure modes / pitfalls

Writing after everyone forgets the options, hiding disagreement and documenting every minor refactor dilute usefulness. Broken evidence links make claims difficult to revisit.

## When to use it

Use ADRs for durable, cross-cutting or difficult-to-reverse choices.

## When not to use it

Do not require an ADR for every local variable or trivial implementation detail.

## What a Senior Engineer should know

Capture constraints and consequences concisely and link an implemented decision to its code.

## What a Staff Engineer should understand

Build a discoverable decision history and recognize when changed constraints justify superseding prior choices.

Further reading: [Documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
