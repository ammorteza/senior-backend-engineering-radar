---
title: "Progressive delivery"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Progressive delivery exposes a new version to increasing portions of real workload and advances only when evidence supports it. A canary is useful only with credible comparison and stop criteria.

## Why it matters for backend engineers

A release can pass tests but regress under real data or dependency behavior. Controlled exposure limits impact and supplies evidence before a full rollout.

## How it works

Deploy a candidate, route an initial cohort and compare user-impact and operational signals against an appropriate baseline. Advance after enough observations and pause or roll back on predefined conditions. Traffic splitting, cohort flags and deployment controllers offer different mechanisms. Data/schema changes must remain compatible with rollback.

## Key concepts

Canary traffic should represent risky workloads, not only the easiest users. Sample size and low-volume periods affect detection. Sequential rollout differs from an experiment measuring product causality. Automated rollback requires trustworthy metrics.

## Production example

A search release changes ranking and query execution. The first cohort includes both large and small tenants. Error rate, latency and result checks gate expansion; database load is monitored too. A tenant-skewed regression pauses rollout even though global averages remain acceptable.

## Trade-offs

Controlled exposure reduces blast radius but costs capacity, comparison tooling and time. Some rare failures need longer observation than a short canary permits.

## Failure modes / pitfalls

Unrepresentative cohorts, noisy gates, incompatible writes and globally shared dependencies can defeat isolation.

## When to use it

Use progressive delivery for consequential service changes with measurable behavior and a viable rollback path.

## When not to use it

Do not claim safety from a tiny canary that never exercises the changed path.

## What a Senior Engineer should know

Define cohorts, acceptance windows and stop conditions before rollout.

## What a Staff Engineer should understand

Connect release policy to shared dependencies, risk and recovery objectives across teams.

Further reading: [Google SRE: Canarying releases](https://sre.google/workbook/canarying-releases/).
