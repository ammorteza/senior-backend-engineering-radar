---
title: "DORA metrics"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

DORA's software-delivery metrics describe an application's delivery throughput and instability. They are feedback about a delivery system, not an individual engineer's productivity score.

## Why it matters for backend engineers

Slow or risky releases often reflect review queues, test environments and deployment design. Measurement helps identify these constraints without counting code volume.

## How it works

Collect consistent events for commits, deployments and deployment-related interventions. The current five-metric guidance includes change lead time, deployment frequency, failed deployment recovery time, change fail rate and deployment rework rate. Follow one application's trends and investigate changes with the people operating the process.

## Key concepts

Change lead time covers commit to production. Failed deployment recovery time is narrower than all-incident MTTR. Change fail rate counts deployments needing intervention; deployment rework rate captures unplanned deployments resulting from incidents. Definitions and denominators must stay explicit.

## Production example

A team's lead time rises although coding time is stable. Mapping the delivery flow shows changes waiting two days for a shared test environment. Fixing environment access shortens lead time while change failure and rework are monitored, demonstrating improvement without rewarding more commits or trivial deployments.

## Trade-offs

A small set of metrics supports discussion. Precise collection can be costly, and comparing unlike applications may obscure context. Product outcomes still need separate measurement.

## Failure modes / pitfalls

League tables, individual targets, gaming deployment counts and treating older four-key definitions as the only current model distort improvement.

## When to use it

Use DORA metrics to evaluate one delivery system over time and test improvement hypotheses.

## When not to use it

Do not rank people or mechanically compare unrelated services with different constraints.

## What a Senior Engineer should know

Understand event definitions and investigate the process behind a trend.

## What a Staff Engineer should understand

Use shared feedback to reduce systemic bottlenecks while preserving reliability and avoiding metric gaming.

Further reading: [DORA metrics guidance](https://dora.dev/guides/dora-metrics/) (checked 2026-10-02).
