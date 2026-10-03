---
title: "Trunk-based development"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Trunk-based development keeps engineers integrating small changes into one shared mainline frequently, usually through short-lived branches and automated review checks.

The core objective is reducing integration batch size. It does not mean every engineer pushes directly to production or that code review disappears.

## Why it matters for backend engineers

Long-lived branches accumulate merge conflicts, schema assumptions, and dependency drift. The real cost is delayed feedback: integration problems appear only after weeks of independent work.

Frequent integration forces migrations and features to be designed as compatible increments. That tends to improve rollback and reduce “big bang” releases.

## How it works

Work is split into small changes that can merge while the mainline remains releasable.

Incomplete user-facing behavior can stay behind a feature flag, dormant route, or branch-by-abstraction seam. The implementation may exist in production before users can trigger it.

CI runs the checks required to keep mainline healthy. Broken mainline is treated as urgent: fix forward or revert quickly instead of allowing many new commits to pile on top.

Database and API changes use compatibility windows so multiple versions can coexist during deployment. Trunk-based development therefore works closely with expand/contract migrations and progressive delivery.

Branches may still exist for review. The important property is that they live briefly and integrate continuously rather than becoming separate lines of development.

## Key concepts

**Small batch.** A change should be understandable and independently verifiable, not necessarily tiny by line count.

**Short-lived branch.** Reduces divergence from mainline and merge risk.

**Branch by abstraction.** Introduce an interface/seam, migrate callers incrementally, switch implementation, then remove the old path.

**Deploy versus release.** Code can be deployed behind a flag before the feature is released.

**Releasable mainline.** Main should pass required checks and be safe to deploy under the current flag/config state.

## Production example

A service is replacing its storage adapter.

Instead of a six-week branch, the team first introduces an interface implemented by the existing adapter. That merge changes no behavior.

Subsequent merges move one caller at a time behind the interface and add compatibility tests. A new adapter is implemented and deployed unused. A feature flag or configuration selects it for internal traffic, then a small percentage of production.

Once the new adapter is proven, the default switches and the old implementation is removed in later small merges.

Every step exists on mainline and remains deployable. If one increment fails CI or production canary, it can be reverted without discarding weeks of unrelated work.

## Trade-offs

Frequent integration reduces merge risk and improves feedback. It depends on fast, reliable CI and engineering skill in designing compatible intermediate states.

Feature flags and abstraction seams add temporary complexity. If teams never remove them, trunk-based delivery can accumulate dead branches.

## Failure modes / pitfalls

Calling a week-long branch “trunk based” does not change its integration risk. Large unreviewed merges undermine the practice even if they happen daily.

A permanently broken mainline trains teams to ignore failures. Flags that hide unfinished code forever create maintenance debt.

Trunk-based development also fails when database or API changes require synchronized deployment; compatibility discipline must accompany it.

## When to use it

Use trunk-based development when teams can integrate small compatible changes with fast automated feedback.

It works particularly well with continuous delivery and progressive release.

## When not to use it

Do not confuse it with skipping review, testing, or release controls. Regulated environments can still use trunk-based development with required approval gates.

If CI routinely takes many hours and fails nondeterministically, improve the feedback system before demanding ever-shorter branches.

## What a Senior Engineer should know

A Senior Engineer should split migrations into reversible increments, use flags or abstraction seams responsibly, and keep mainline compatible across rolling deployments.

They should revert or repair broken main quickly and remove temporary scaffolding after completion.

## What a Staff Engineer should understand

A Staff Engineer should improve CI latency and reliability, review flow, merge queues, schema compatibility, and release policy so frequent integration is sustainable.

They should measure integration friction rather than use branch-name conventions as a process KPI.

Further reading: [Trunk Based Development](https://trunkbaseddevelopment.com/).
