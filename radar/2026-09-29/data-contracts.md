---
title: "Data contracts"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A data contract defines the meaning, shape, quality and ownership of data shared between producers and consumers. It extends beyond a schema to the expectations needed to use the data correctly.

## Why it matters for backend engineers

A column can remain a string while its timezone or business meaning changes. Downstream reports can then be wrong without any parser failing.

## How it works

Producers and consumers agree on fields, units, identifiers, update/deletion semantics and freshness expectations. Validation checks enforce what can be measured, while documentation records semantic obligations. Compatibility and deprecation policies govern change; ownership determines who investigates violations and communicates fixes.

## Key concepts

Schema validity differs from semantic quality. Completeness and freshness need measurable definitions. Null can mean missing, inapplicable or unknown. Contract changes must account for backfills and historical datasets, not just new records.

## Production example

A settlement feed supplies amounts in minor units and timestamps in UTC. A daily reconciliation expects records by a stated cutoff. Validation checks currency codes and totals, while freshness alerts detect a missing batch. Changing settlement-date semantics requires consumer review even if the field type stays unchanged.

## Trade-offs

Contracts make dependencies explicit and reduce silent drift. Strict enforcement can block legitimate evolution, so exception and migration paths matter.

## Failure modes / pitfalls

Ownerless datasets, undocumented units, null meanings that vary by source and schema-only “quality” checks produce misleading trust.

## When to use it

Use contracts for shared events, analytical datasets and external integration feeds.

## When not to use it

Do not add heavyweight governance to every private temporary table.

## What a Senior Engineer should know

Define units, lifecycle, validation and actionable quality checks.

## What a Staff Engineer should understand

Resolve producer/consumer ownership and align freshness and compatibility obligations across teams.

Further reading: [Data Contract Specification](https://datacontract.com/).
