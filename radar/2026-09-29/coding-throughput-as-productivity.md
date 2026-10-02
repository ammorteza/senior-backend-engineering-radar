---
title: "Coding throughput as productivity"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

This caution rejects equating engineering value with lines of code, commits or AI-generated output. Activity can increase while the product becomes harder to operate and maintain.

## Why it matters for backend engineers

A fix removing unnecessary work may deliver more value than thousands of new lines. Volume targets encourage fragmentation, duplication and rushed review.

## How it works

Evaluate outcomes and flow: the customer problem solved, time to usable delivery, defects, operational burden and maintainability. Use activity data only to ask questions about bottlenecks, with context. Compare an intervention against its intended benefit rather than assuming generated volume is progress.

## Key concepts

Output is produced work; outcome is the effect of that work. Goodhart-style gaming appears when a proxy becomes a target. Review burden and rework are costs. Team-level measures still need context and should not erase individual qualitative contributions.

## Production example

An AI tool doubles submitted code volume but reviewers spend longer and defects increase. The team narrows usage to well-scoped changes and measures lead time, escaped defects and maintenance effort. A smaller generated patch with a reproducible test is preferable to a large rewrite nobody can assess.

## Trade-offs

Activity counts are easy to collect and can reveal anomalies. They are weak measures of value and encourage unhealthy behavior when tied to rewards.

## Failure modes / pitfalls

Ranking developers by commits, rewarding needless churn and ignoring deleted code or incident prevention misrepresent contribution.

## When to use it

Apply this caution when defining productivity dashboards or evaluating coding-tool adoption.

## When not to use it

Do not abandon measurement; choose signals that relate to delivery and product outcomes.

## What a Senior Engineer should know

Explain the impact of a change with evidence and acknowledge review and operational costs.

## What a Staff Engineer should understand

Design incentives that reward sustainable outcomes, collaboration and removal of unnecessary complexity.

Further reading: [SPACE productivity framework](https://queue.acm.org/detail.cfm?id=3454124), [DORA guidance](https://dora.dev/guides/dora-metrics/).
