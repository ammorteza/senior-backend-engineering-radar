---
title: "Progressive delivery"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Progressive delivery exposes a change to increasing portions of real traffic while measuring whether it behaves safely enough to continue. Common techniques include canary releases, percentage rollout, region or tenant rollout, and automated promotion or rollback.

It is broader than “deploy slowly.” A progressive rollout needs a comparison cohort, relevant health criteria, and a way to stop or reverse exposure.

## Why it matters for backend engineers

Tests cannot reproduce every production data shape, traffic pattern, or dependency interaction. Gradual exposure limits blast radius while creating evidence from the real system.

The technique is only useful if metrics can attribute behavior to the new version or variant. A global average can hide a canary that is failing badly under 5% of traffic.

## How it works

Deploy the new artifact alongside the stable version or gate the behavior behind a controlled flag.

Choose the first cohort deliberately: internal users, one low-risk tenant, one region, or a small stable percentage. Ensure the cohort is representative enough to reveal relevant risks.

Measure release criteria by version or variant: request errors, SLO burn, latency, saturation, database load, queue age, and business correctness as appropriate.

Hold each stage long enough to observe the failure modes that matter. A five-minute canary cannot validate a daily batch job or memory leak.

Promotion increases exposure only if criteria remain acceptable. Rollback may route traffic back to the old version, but data/schema changes must remain backward-compatible for that to be safe.

## Key concepts

**Canary.** Small subset of traffic receives the new version.

**Analysis window.** Time needed to accumulate enough evidence. It depends on traffic volume and delayed effects.

**Comparison cohort.** Stable baseline used to distinguish a release regression from an unrelated incident.

**Automated analysis.** Tools can promote or rollback from thresholds, but metrics and thresholds must represent the actual product risk.

**Rollback compatibility.** Old code must still understand state written by the new code during the rollout window.

## Production example

A dispatch service releases a new route-scoring algorithm.

The new binary is deployed to a small subset of pods, and the load balancer sends 2% of traffic to them. Requests are tagged with the deployed version in metrics and traces.

The rollout checks technical signals—error rate, p95 latency, CPU, database load—and a business guardrail: fulfillment-time distribution for eligible orders. The business metric needs several hours of traffic, so promotion is intentionally slower than ordinary API changes.

At 10%, database query latency rises only on the new pods. Automated promotion stops; engineers find an N+1 query in one score-enrichment path. Traffic is routed back to the stable version.

Because the database migration was additive and both versions understand the current schema, rollback is safe. After fixing the query, the same staged rollout resumes.

## Trade-offs

Progressive delivery reduces blast radius and creates realistic evidence. It lengthens the time two versions coexist and requires compatibility and release attribution.

Small canaries may not receive enough traffic to detect rare failures. Large canaries provide better statistical power while increasing impact.

Automated rollback improves response speed but can oscillate if thresholds are noisy or rollback itself changes load.

## Failure modes / pitfalls

Global dashboards that do not segment by version can hide a failing canary. Promoting too quickly before delayed effects appear defeats the technique.

A canary receiving only low-value traffic may not exercise expensive code paths. Stateful migrations can make rollback impossible even if traffic routing supports it.

Feature flags and canary deployments can interact in confusing ways if version and variant are not both observable.

## When to use it

Use progressive delivery for changes whose production behavior has uncertainty and where exposure can be segmented safely.

It is especially valuable for performance-sensitive, infrastructure, query, and algorithm changes.

## When not to use it

Do not add complex rollout machinery for trivial low-risk changes if normal deployment and rollback are sufficient.

A change whose impact cannot be segmented or whose data migration is instantly irreversible needs a different safety plan.

## What a Senior Engineer should know

A Senior Engineer should define rollout stages, representative cohorts, versioned telemetry, stop criteria, and data-compatible rollback.

They should choose analysis windows based on actual failure modes rather than one standard duration.

## What a Staff Engineer should understand

A Staff Engineer should establish organization-wide rollout defaults and automated guardrails while preserving domain-specific business criteria.

They should connect progressive delivery to SLOs, feature flags, schema compatibility, and incident rollback so teams do not treat canarying as merely a deployment percentage.

Further reading: [Argo Rollouts concepts](https://argo-rollouts.readthedocs.io/en/stable/concepts/).
