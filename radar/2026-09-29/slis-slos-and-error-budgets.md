---
title: "SLIs, SLOs and error budgets"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

An SLI measures a user-relevant service property; an SLO sets its target over a stated window. An error budget expresses the allowed amount of bad service and guides reliability decisions.

## Why it matters for backend engineers

A healthy CPU graph does not prove users can finish a task. Explicit service objectives connect operational work to experiences the product actually promises.

## How it works

Define eligible events and what counts as good, measure their ratio or distribution, and choose an objective with product stakeholders. For a 99.9% success objective, the bad-event budget is 0.1% of eligible events. Burn rate compares observed bad-event rate with that allowance. Multi-window alerts distinguish urgent consumption from slower sustained degradation.

## Key concepts

A service SLO differs from a contractual SLA. Measurement windows and exclusions change meaning. Request-based budgets do not automatically equal minutes of downtime. Low-volume services need special alert treatment. Dependency SLOs must support end-to-end objectives.

## Production example

A report product defines success as accepted jobs completing correctly within five minutes. HTTP acceptance alone is not the SLI. A worker outage burns the completion budget even while the API returns 202. Alerts observe completion age and failure outcomes, and release policy responds to sustained budget exhaustion.

## Trade-offs

Objectives focus reliability investment. Poor definitions can incentivize hiding failures or set targets more expensive than users need.

## Failure modes / pitfalls

Measuring only server responses, excluding inconvenient traffic, confusing percentiles with event ratios and paging on tiny samples create misleading budgets.

## When to use it

Use SLOs for critical user journeys with credible measurement and an agreed response policy.

## When not to use it

Do not impose arbitrary “five nines” targets or collect budgets that never influence decisions.

## What a Senior Engineer should know

Define good/eligible events and implement understandable burn-rate alerts.

## What a Staff Engineer should understand

Negotiate realistic objectives and align dependency, release and reliability policies with user value.

Further reading: [Implementing SLOs](https://sre.google/workbook/implementing-slos/), [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).
