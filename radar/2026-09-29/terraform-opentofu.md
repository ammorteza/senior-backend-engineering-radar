---
title: "Terraform / OpenTofu"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Terraform and OpenTofu manage infrastructure by comparing declared configuration, stored state and provider-observed resources. They share a lineage but must be evaluated as distinct tools with versioned compatibility.

## Why it matters for backend engineers

Infrastructure changes can replace databases or widen permissions. A reviewed plan makes those consequences visible before execution, provided it matches the state and configuration actually applied.

## How it works

Providers expose resource operations. Planning builds a dependency graph and proposes changes; applying calls provider APIs and updates state. State maps configuration addresses to real resources and can contain sensitive values. Remote state and locking reduce concurrent-write risks but do not eliminate drift or stale plans.

## Key concepts

Modules package declarations. Lifecycle settings influence replacement behavior. Imports adopt existing resources; moved-resource declarations preserve identity across refactors where supported. Provider and tool version locks reduce unexpected planning changes.

## Production example

A team renames a database resource in configuration. Without identity migration, the plan proposes destruction and recreation. A reviewed moved/import procedure preserves the existing instance. CI stores the approved plan and applies it under restricted credentials, while independent drift checks identify manual console changes.

## Trade-offs

Declarative plans improve repeatability. State, provider behavior and external APIs add failure modes; a successful apply is not proof that applications remain healthy.

## Failure modes / pitfalls

Plaintext state exposure, concurrent applies, broad credentials and accepting replacement plans casually can cause serious incidents. Tool forks and provider versions are not interchangeable forever.

## When to use it

Use either tool for reviewable cloud infrastructure lifecycle management with explicit state ownership.

## When not to use it

Do not use infrastructure apply as an unreviewed application-data migration mechanism.

## What a Senior Engineer should know

Read plans, protect state, understand dependencies and recover interrupted operations.

## What a Staff Engineer should understand

Define module contracts, state boundaries and tool upgrade policy across infrastructure owners.

Further reading: [Terraform state](https://developer.hashicorp.com/terraform/language/state), [OpenTofu documentation](https://opentofu.org/docs/).
