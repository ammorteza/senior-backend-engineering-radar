---
title: "Strangler Fig migration"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A strangler migration replaces a legacy system incrementally by routing selected capabilities to new implementations. It keeps old behavior available while the replacement gains coverage.

## Why it matters for backend engineers

Large rewrites delay feedback and make rollback difficult. Incremental replacement reduces risk only if routing, data ownership and mixed-version behavior are explicit.

## How it works

Introduce a seam such as an API facade, route or event boundary. Move one capability, verify equivalent or deliberately changed behavior, and expand gradually. Data migration needs backfill and synchronization where both systems remain active. Retire old paths only after traffic, consumers and operational dependencies are accounted for.

## Key concepts

The routing boundary must be observable. Anti-corruption layers prevent old concepts spreading into the replacement. Dual writes create consistency hazards; prefer owned synchronization with reconciliation. Rollback becomes harder after new-only state appears.

## Production example

A legacy customer portal's document downloads move first. The facade routes selected users to the new object-storage path while existing uploads remain in the old system. Backfill checks file counts and checksums; traffic metrics show which callers still depend on the old path before retirement.

## Trade-offs

Incremental delivery provides feedback and smaller rollback scope. Temporary duplication and migration plumbing can persist if no retirement plan exists.

## Failure modes / pitfalls

Unreconciled dual writes, mismatched identity mapping and a facade that becomes permanent business logic undermine replacement.

## When to use it

Use strangler migration where a legacy capability has a manageable seam and continued service is necessary.

## When not to use it

A small disposable system may be easier to replace directly; an inseparable invariant may need a different migration boundary.

## What a Senior Engineer should know

Design routing, compatibility, backfill and rollback for one capability.

## What a Staff Engineer should understand

Sequence ownership transfer and fund removal of temporary integration machinery.

Further reading: [Strangler Fig application](https://martinfowler.com/bliki/StranglerFigApplication.html).
