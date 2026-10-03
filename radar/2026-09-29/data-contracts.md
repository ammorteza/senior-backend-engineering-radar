---
title: "Data contracts"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

A data contract defines the expectations between a producer and consumers of shared data. It includes schema, field meaning, units, identifiers, null semantics, update and deletion behavior, freshness, quality, ownership, and change policy.

A schema can remain valid while the contract is broken. Changing an amount from major units to minor units or changing a timestamp from event time to ingestion time may preserve the physical type and silently corrupt downstream interpretation.

## Why it matters for backend engineers

Events, warehouse tables, CDC streams, external feeds, and analytical exports often have consumers outside the producer's codebase. Those consumers cannot safely infer meaning from column names.

Without a contract, producers make “compatible” changes that cause reports or models to become wrong rather than crash. Silent semantic drift is harder to detect than a parser failure.

## How it works

The producer and important consumers identify what the dataset represents and which fields are contractual.

Define field types and semantics, stable identifiers, units and timezone, update model, deletion/tombstone behavior, expected uniqueness, and freshness.

Quality checks should be measurable. Examples include “one record per settlement_id,” “currency is ISO 4217,” “99% of daily records arrive by 06:00 UTC,” or “deleted accounts produce a tombstone within one hour.”

Compatibility policy defines how changes happen. Additive nullable fields are often easier than changed meaning, but even additive fields may break rigid consumers. Breaking semantic changes require a new field/version or coordinated migration.

Historical data matters. A new rule may apply only to records after a date or require a backfill. The contract should tell consumers how to distinguish those cases.

## Key concepts

**Schema versus semantics.** Shape validity does not prove the data means what consumers expect.

**Freshness.** Time between source truth and availability. It should be measured from a defined reference point.

**Completeness.** What fraction of expected entities or events are present? Define the denominator.

**Null semantics.** Missing, unknown, not-applicable, and redacted are different states even if all are encoded as null.

**Ownership.** Someone owns producer correctness, contract changes, and violation response. “Data platform” is not enough if no team understands the source.

**Historical compatibility.** Backfills and old partitions may follow earlier semantics; consumers need version or effective-date rules.

## Production example

A settlement feed emits:

~~~text
settlement_id
amount_minor
currency
settled_at
account_id
~~~

The contract states that `amount_minor` is an integer in the currency's minor unit, `settled_at` is the provider-confirmed UTC settlement instant, each `settlement_id` is unique, and a daily batch is complete by 06:00 UTC with a documented late-arrival path.

Validation checks allowed currencies, duplicate settlement IDs, missing account IDs, and batch freshness. Reconciliation compares aggregate totals with the provider's control total.

Later the provider introduces a separate business settlement date that can differ from `settled_at` around timezone boundaries. Reusing the timestamp field would be semantically breaking, so the producer adds `settlement_business_date` with an explicit timezone rule and gives consumers a migration period.

Historical records are backfilled only where source data supports it. The contract documents which date range has the new field reliably.

## Trade-offs

Contracts make shared assumptions explicit and enable automated quality checks. Strong enforcement can slow producers when every tiny change requires broad coordination.

The right contract focuses on consumer-critical semantics rather than documenting every implementation detail. Too little governance creates drift; too much creates a central review queue.

## Failure modes / pitfalls

Ownerless datasets and undocumented units create silent errors. Treating every null as “missing” can misrepresent redacted or not-applicable data.

Schema registry compatibility can pass while field meaning changes. Freshness checks without a defined expected schedule generate noise.

Backfills can violate current constraints if historical source quality differs; hiding that difference makes downstream metrics misleading.

## When to use it

Use data contracts for shared events, CDC feeds, warehouse tables, external partner feeds, and datasets with multiple independent consumers.

Prioritize data that drives money, compliance, customer state, or important product decisions.

## When not to use it

Do not impose heavyweight contract governance on a private temporary table or one-off exploratory dataset with one owner and no downstream dependency.

Do not mistake a contract document for actual monitoring; important guarantees should be measured.

## What a Senior Engineer should know

A Senior Engineer should define field meaning, units, identity, freshness, completeness, deletion, and compatibility and implement checks that fail in actionable ways.

They should identify semantic changes that schema tooling cannot detect and plan consumer migrations.

## What a Staff Engineer should understand

A Staff Engineer should establish lightweight ownership and change policy across producers and consumers, prioritize contracts by business risk, and define how violations are surfaced and resolved.

They should prevent data governance from becoming centralized paperwork while ensuring shared critical data has durable meaning.

Further reading: [Data Contracts](https://martinfowler.com/articles/data-monolith-to-mesh.html).
