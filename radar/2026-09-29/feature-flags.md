---
title: "Feature flags"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Feature flags select application behavior at runtime or release time without requiring a new binary for every change. They separate deployment from exposure but create additional states to test.

## Why it matters for backend engineers

A new code path can be deployed safely to a small cohort first. A stale or poorly scoped flag can also leave permanent branching and unpredictable behavior.

## How it works

The application evaluates a flag using a defined key, context and default. Assignment may be deterministic by user or tenant. Configuration propagates through a service or local cache; failure behavior depends on the evaluation design. Flag lifecycle includes creation, rollout, full release and removal.

## Key concepts

Release flags differ from operational kill switches and experiments. Stable cohort assignment prevents users switching paths unintentionally. Defaults need safe semantics. A flag cannot roll back data already written in an incompatible format.

## Production example

A new PDF renderer is enabled for selected workspaces. Its error rate and output verification are compared with the existing path. When malformed fonts increase failures, the flag redirects new jobs; completed artifacts remain valid. After successful rollout, the old implementation and flag are removed together.

## Trade-offs

Flags reduce release risk and support experiments. They multiply test combinations and add configuration dependency; long-lived flags need deliberate ownership.

## Failure modes / pitfalls

Secret client-side flags, inconsistent cohort hashing, unsafe defaults and forgotten removal create risk. Coupled flags can produce untested combinations.

## When to use it

Use flags for controlled exposure, experiments or supported operational controls.

## When not to use it

Do not use a flag to hide an incompatible schema migration or permanent architecture ambiguity.

## What a Senior Engineer should know

Test both paths, defaults and context; plan cleanup at creation.

## What a Staff Engineer should understand

Define flag ownership, auditability and configuration blast-radius limits.

Further reading: [Feature toggles](https://martinfowler.com/articles/feature-toggles.html).
