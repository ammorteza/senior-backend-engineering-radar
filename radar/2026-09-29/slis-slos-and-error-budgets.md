---
title: "SLIs, SLOs and error budgets"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A Service Level Indicator (SLI) is a measurement of a service property that matters to users, such as successful request ratio or job completion latency. A Service Level Objective (SLO) sets the desired level over a defined measurement window. An error budget is the amount of bad service permitted by that objective.

For an availability-style SLO of 99.9%, the budget is the remaining 0.1% of eligible events over the chosen window. This is an event ratio unless the SLI is explicitly time-based; it is not automatically “43 minutes of downtime.”

## Why it matters for backend engineers

Infrastructure health is not the product experience. CPU can be low while requests wait on a dependency. An API can return 202 successfully while every accepted job misses its completion deadline.

SLOs focus reliability work on what customers actually need and provide a way to discuss trade-offs. A team consuming its budget rapidly may slow risky releases; a team consistently far above an unnecessarily strict target may be overpaying for reliability users do not value.

## How it works

Define **eligible events**: the requests, jobs, or observations included. Define **good events**: those satisfying the intended contract. The SLI is typically good / eligible over a window.

For latency, event-based SLIs often measure the fraction of requests faster than a threshold, for example “99.5% of eligible reads complete within 300 ms.” This integrates naturally with error-budget math. Percentiles can be useful diagnostics but are not interchangeable with an event-ratio budget.

Choose an objective and window with product context. A 28-day rolling window gives recent reliability strong weight; calendar windows align differently with reporting. Document exclusions carefully—excluding overload or dependency errors simply because they are inconvenient can make the SLO meaningless.

Burn rate compares the observed bad-event rate with the allowed bad-event rate. A burn rate of 10 means budget is being consumed ten times faster than sustainable for the window. Multi-window, multi-burn-rate alerting uses a fast window for severe incidents and a slower window for sustained degradation.

## Key concepts

**SLI.** The measured user-relevant signal.

**SLO.** The target and window, for example 99.9% successful completions over 28 days.

**SLA.** A contractual/business agreement that may include penalties and usually should not be conflated with an internal SLO.

**Error budget.** Allowed bad service under the objective. It gives teams a shared reliability/risk language.

**Burn rate.** How quickly budget is being consumed relative to the sustainable rate.

**Low traffic.** A handful of failures can dominate percentages; alert design may need minimum volume or longer windows while still surfacing severe individual failures appropriately.

## Production example

A report API immediately returns 202 when it accepts a job. The original “availability SLO” measures only those HTTP responses and reports 99.99% success even during a worker outage.

The team redefines the user journey. An eligible event is an accepted report job. A good event is one that reaches a correct terminal result within five minutes. Validation rejections are not accepted jobs and are measured separately.

A worker outage causes the completion SLI to deteriorate even while HTTP acceptance remains healthy. An SLO alert uses burn rate over a short and long window so a brief small spike does not page while sustained or severe budget consumption does.

The dashboard shows remaining budget, completion-latency distribution, and contributing failure categories. The release policy states what happens after substantial budget exhaustion: high-risk changes pause while reliability work and recovery take priority.

The team also keeps the HTTP request SLI because it answers a different question. One service can legitimately have several SLIs for distinct user interactions.

## Trade-offs

A stricter SLO can require more redundancy, testing, and capacity. A looser SLO saves cost but may create unacceptable customer impact. The “right” number is a product/reliability decision, not an industry badge.

Simple event SLIs are easy to explain but may hide severity differences. More detailed segmentation helps diagnosis while making objectives and alerting harder to operate.

## Failure modes / pitfalls

Choosing “five nines” without business justification creates an expensive target nobody understands. Measuring only server responses can miss asynchronous completion failures.

Excluding periods of overload or maintenance after the fact makes the indicator look better instead of measuring reality. Confusing percentiles with event ratios can produce incorrect error-budget arithmetic.

Paging on every small budget change creates alert fatigue; never acting on budget consumption turns the SLO into dashboard decoration.

## When to use it

Use SLOs for important user journeys where reliability decisions and alerts need a shared objective.

Start with a small number of understandable SLIs and improve them as the team learns which failures matter.

## When not to use it

Do not invent an SLO for every internal metric or set targets that cannot be measured credibly.

Do not use an internal SLO as a contractual SLA without the required business/legal agreement and measurement rules.

## What a Senior Engineer should know

A Senior Engineer should define good and eligible events, calculate budget and burn rate, implement alerts, and trace SLO failures to actionable telemetry.

They should challenge indicators that reward the system for rejecting or excluding the very traffic users care about.

## What a Staff Engineer should understand

A Staff Engineer should negotiate objectives with product stakeholders, align dependency and capacity design with end-to-end goals, and connect budget policy to release/risk decisions.

They should keep the SLO program small enough to drive action and prevent target inflation or metric gaming across teams.

Further reading: [Google SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/), [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).
