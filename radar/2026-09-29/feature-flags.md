---
title: "Feature flags"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A feature flag changes runtime behavior without requiring a new binary deployment. Flags can control user-facing release, operational safety, experiments, migrations, or temporary emergency behavior.

A flag is state in the production control plane. It needs ownership, defaults, observability, and deletion just like code.

## Why it matters for backend engineers

Flags separate deployment from release and make incremental rollout or rollback fast. They are also a source of combinatorial behavior: two booleans create four possible paths; ten independent booleans create many more.

Backend flags can be especially dangerous when they change data writes or message formats. Turning a flag off may not undo state already produced while it was on.

## How it works

The application evaluates a flag using a key and context such as environment, tenant, account, hub, or percentage bucket. The provider returns a variant or value.

Evaluation must have a safe default when the flag service is slow or unavailable. For critical paths, SDKs often use locally cached configuration so request success does not synchronously depend on the control plane.

Targeting rules should use stable attributes. Percentage rollout usually hashes a stable subject key so the same user remains in the same cohort.

Flags need type and lifecycle. A short-lived release flag should have an owner and removal date. A permanent operational configuration may belong in a configuration system rather than accumulating as “feature flags.”

## Key concepts

**Release flag.** Controls exposure of already deployed code.

**Kill switch.** Disables a risky capability quickly. It should be tested before the emergency that requires it.

**Migration flag.** Controls old/new data paths. Its rollback semantics depend on whether new state is backward-compatible.

**Stable bucketing.** Percentage rollout should not randomly move users between cohorts on every request.

**Flag debt.** Old flags preserve dead branches and multiply test combinations. Remove them after rollout stabilizes.

## Production example

An order service introduces a new query path expected to reduce latency. The code is deployed disabled.

The team enables the flag for two internal tenants, then 1%, 10%, and 50% of production traffic. Targeting uses a stable tenant or request cohort. Metrics compare old and new paths by flag variant: latency, database CPU, query rows, and errors.

At 10%, one large tenant causes database CPU to spike. The team turns off the flag immediately without redeploying and investigates the query.

Because the flag only selected a read path, rollback is straightforward.

A separate schema migration flag is handled differently. Once new code writes a field old binaries cannot understand, switching the flag off is not a safe rollback. The migration uses expand/contract compatibility first; the flag changes reads only after old writers are gone.

After full rollout and a stability window, the release flag and old code branch are removed. The kill-switch behavior is preserved only if the product needs a permanent operational control.

## Trade-offs

Flags enable gradual exposure and fast mitigation. They add runtime state, testing complexity, and dependence on correct targeting.

Long-lived configuration can be valuable, but calling every config value a feature flag obscures ownership and lifecycle.

## Failure modes / pitfalls

A flag defaulting to “on” when the flag service is unavailable can unexpectedly expose a feature. Targeting on unstable identifiers moves users between variants.

Flags around irreversible writes create false rollback confidence. Old flags can leave untested branches that break months later.

Embedding secrets or authorization decisions directly in general feature flags can create inappropriate trust boundaries.

## When to use it

Use flags for staged release, experiments, temporary safety controls, and migrations where runtime selection reduces risk.

Attach owner, purpose, observability, and removal criteria at creation time.

## When not to use it

Do not use a flag as a substitute for a stable configuration model or for authorization.

Do not wrap every code change in a flag; unnecessary branches create complexity without reducing meaningful risk.

## What a Senior Engineer should know

A Senior Engineer should design safe defaults, stable cohorts, variant telemetry, flag-service failure behavior, and rollback semantics for stateful changes.

They should remove temporary flags and test kill switches and migration paths.

## What a Staff Engineer should understand

A Staff Engineer should define organizational flag taxonomy, ownership, maximum lifetime, auditability, and emergency-control practices.

They should ensure flags support progressive delivery without becoming a hidden permanent architecture of conditional branches.

Further reading: [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html).
