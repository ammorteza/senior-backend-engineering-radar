---
title: "DORA metrics"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

DORA metrics are software-delivery performance measures used to understand how effectively a delivery system moves changes into production and recovers from deployment problems.

Current DORA guidance uses five software-delivery metrics: change lead time, deployment frequency, failed deployment recovery time, change fail rate, and deployment rework rate. They describe a system of work; they are not productivity scores for individual engineers.

## Why it matters for backend engineers

Delivery problems often live outside coding: review queues, slow CI, scarce test environments, unsafe database migrations, or manual release gates.

Measuring the flow helps teams locate those constraints. Used badly, the same metrics become targets people can game—splitting deployments artificially, redefining failures, or optimizing throughput while reliability declines.

The purpose is learning and improvement, not league tables.

## How it works

Collect events consistently for source changes, deployments, deployment failures or interventions, and recovery.

**Change lead time** measures elapsed time from a code change entering version control to running successfully in production under the defined model.

**Deployment frequency** counts successful production deployments over time.

**Change fail rate** measures the fraction of deployments that cause a production failure requiring remediation.

**Failed deployment recovery time** measures how long it takes to restore service after a failed deployment. It is narrower than the mean time to recover from every incident.

**Deployment rework rate** captures unplanned deployments performed to address incidents or deployment failures.

The exact event definitions must remain stable enough for trends to be meaningful. One team's batch-release process and another team's continuous deployment cannot be compared fairly without context.

## Key concepts

**System metric.** The unit of analysis is usually an application, service, team delivery system, or value stream—not an individual person.

**Trend over ranking.** The strongest use is “did our change improve this delivery system?” rather than “which team is best?”

**Denominator discipline.** Change fail rate requires a consistent deployment definition. Changing what counts as a deployment changes the metric.

**Outcome separation.** DORA metrics describe delivery performance; product outcomes, customer value, security, and service reliability need their own measures.

**Gaming risk.** Turning a metric into a quota changes behavior and can destroy its usefulness as feedback.

## Production example

A team believes implementation is slow because lead time from commit to production has grown from 12 hours to three days.

The delivery timeline shows coding and review time are stable. Most changes spend two days waiting for a shared integration environment.

The team creates disposable integration environments for the affected service and moves compatible tests earlier in CI. Median lead time drops sharply.

They check change fail rate and deployment rework at the same time. If faster flow caused more failed deployments, the change would not be considered an unqualified improvement.

No individual engineer is scored on “deployments per week.” A developer making one high-value schema change is not compared with another who deploys ten documentation updates.

## Trade-offs

A small shared metric set makes delivery bottlenecks visible and comparable over time within the same context. Precise data collection across many deployment systems can be expensive.

Aggregated metrics can hide one painful stage; teams often need value-stream details such as review wait or CI queue time for diagnosis.

Targets can motivate focus while increasing gaming pressure. Use them as feedback with context rather than compensation or ranking mechanisms.

## Failure modes / pitfalls

Leaderboards across unrelated systems punish teams with different compliance or operational constraints.

Deployment frequency can be gamed through trivial releases. Change fail rate can be lowered by redefining incidents. Lead time can improve while abandoned work before commit remains invisible.

Using older four-metric definitions without noticing current DORA guidance can also make organizational reports inconsistent.

## When to use it

Use DORA metrics to follow one delivery system over time, identify flow constraints, and test whether process or tooling improvements help.

Pair them with qualitative investigation and product or reliability metrics.

## When not to use it

Do not rank individual engineers, use the metrics as compensation targets, or mechanically compare unrelated services.

Do not collect them if nobody will investigate or act on changes; measurement alone does not improve delivery.

## What a Senior Engineer should know

A Senior Engineer should understand the event definitions, explain what each metric does and does not mean, and help map a bad trend to a concrete workflow bottleneck.

They should resist interpretations that reward code or deployment volume independently of outcome.

## What a Staff Engineer should understand

A Staff Engineer should create trustworthy collection across the value stream, keep definitions stable, and use the metrics to improve systemic constraints.

They should protect the measurements from ranking and gaming and connect faster delivery to reliability and product outcomes.

Further reading: [DORA metrics guidance](https://dora.dev/guides/dora-metrics/).
