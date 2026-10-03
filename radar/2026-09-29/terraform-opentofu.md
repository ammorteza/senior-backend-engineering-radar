---
title: "Terraform / OpenTofu"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Terraform and OpenTofu are declarative infrastructure-as-code tools that compare configuration, stored state, and provider-observed resources to plan and apply infrastructure changes.

OpenTofu originated from Terraform's open-source codebase, but they are now independently versioned tools. Treat syntax and provider compatibility as versioned facts rather than assume permanent interchangeability.

## Why it matters for backend engineers

Infrastructure changes can delete or replace databases, rotate load balancers, and widen IAM. The plan is a critical safety artifact because it translates a small configuration edit into provider API consequences.

That plan is trustworthy only for the configuration, provider versions, variables, and state from which it was created. Applying later after state or inputs changed can produce different consequences.

## How it works

Configuration declares resources and relationships. Providers implement the operations needed to read, create, update, and delete real infrastructure.

State maps resource addresses in configuration to remote object identities and stores attributes needed for planning. Remote state backends and locking reduce simultaneous-write risk, but state remains sensitive and operationally critical.

The planning phase refreshes or reads relevant resource state and computes a proposed dependency graph of changes. Apply executes provider operations in dependency order and records resulting state.

Resource renames are important: changing only a configuration address can look like “delete old, create new.” Supported moved-block or state-migration mechanisms preserve identity when the intention is a refactor.

Provider and tool lock files stabilize versions. Modules package repeated infrastructure interfaces, but a module upgrade can still change many resources and must be planned and reviewed.

## Key concepts

**State.** The tool's mapping from configuration addresses to real infrastructure. Protect encryption, access, backup, and locking.

**Plan.** A proposed change set, not a timeless approval. Store or regenerate under controlled inputs.

**Drift.** Remote infrastructure differs from declared configuration due to manual or external changes.

**Replacement.** Some attribute changes cannot update in place and cause destroy/create behavior. Review replacement of stateful resources carefully.

**Import and moved resources.** Adopt existing objects or preserve identity across refactors without unintended recreation.

**Lifecycle controls.** Options such as prevent-destroy or create-before-destroy change behavior but do not substitute for understanding provider semantics.

## Production example

A team wants to rename a PostgreSQL resource from `aws_db_instance.main` to `aws_db_instance.orders` to match service naming.

A naive configuration rename produces a plan showing one database destroyed and another created. Because the physical database must remain, the team uses the tool's supported moved-resource mechanism to preserve identity.

CI pins tool and provider versions, initializes against the protected remote state, creates a plan, and surfaces resource replacements explicitly. The approved plan is applied under a restricted deployment identity.

A separate drift job detects a manual console change to the database parameter group. Engineers decide whether to codify or revert it instead of letting the next unrelated apply discover it unexpectedly.

For schema/data migrations, Terraform changes infrastructure only; application migration tooling owns data compatibility. The team does not put irreversible row rewrites into provisioner scripts hidden inside infrastructure apply.

## Trade-offs

Declarative infrastructure gives reviewable repeatability and dependency tracking. State and provider behavior add another control plane whose failure can block changes.

Modules reduce duplication but can hide dangerous defaults if their interface is too broad. Central modules improve policy consistency while increasing coordination for changes.

## Failure modes / pitfalls

State may contain secrets or sensitive attributes. Broad deployment credentials magnify a compromised CI job.

Concurrent or stale applies, unreviewed replacement, and manual state editing can cause serious incidents. `-target` or similar partial operations can be useful recovery tools but can also leave configuration assumptions inconsistent if used casually.

Assuming Terraform and OpenTofu versions or providers remain forever equivalent can break upgrades.

## When to use it

Use Terraform or OpenTofu for infrastructure whose lifecycle benefits from declared, reviewed state and provider integrations.

Use remote protected state and explicit ownership for production stacks.

## When not to use it

Do not use IaC apply as a generic application data migration engine. Do not force rapidly ephemeral test resources through heavyweight shared state when a simpler lifecycle tool fits better.

Avoid adopting both Terraform and OpenTofu in one organization without an explicit compatibility and ownership reason.

## What a Senior Engineer should know

A Senior Engineer should read plans, identify replacements, protect state, understand provider/version locks, import or move resource identity, and recover interrupted operations carefully.

They should verify infrastructure changes through application health rather than stop at “apply succeeded.”

## What a Staff Engineer should understand

A Staff Engineer should define state boundaries, module contracts, version upgrade policy, CI authority, drift handling, and emergency change procedures across infrastructure owners.

They should keep the infrastructure abstraction reviewable enough that teams can understand the blast radius of one plan.

Further reading: [Terraform state](https://developer.hashicorp.com/terraform/language/state), [OpenTofu documentation](https://opentofu.org/docs/).
