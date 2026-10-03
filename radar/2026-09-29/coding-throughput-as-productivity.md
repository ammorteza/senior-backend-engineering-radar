---
title: "Coding throughput as productivity"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

“Coding throughput as productivity” is a caution against using lines of code, commits, pull requests, prompts, or AI-generated code volume as a proxy for engineering value.

Activity measures what was produced. Productivity is about useful outcomes relative to time, risk, maintenance, and collaboration. A change deleting 5,000 lines of unnecessary code can be more valuable than generating 20,000 new lines.

## Why it matters for backend engineers

AI tools make code generation much cheaper. That makes output volume an even weaker signal than before: teams can create more code than they can review, test, operate, or understand.

Backend quality includes reliability, security, on-call burden, performance, and ability to evolve. Volume incentives encourage duplicated abstractions and rushed merges while those costs appear later.

## How it works

Measure the outcome of an intervention rather than its raw output.

For delivery flow, examine lead time, review delay, deployment reliability, rework, and escaped defects. For a specific AI coding tool, compare task completion, reviewer effort, defect rate, and time to production before and after adoption.

Use activity counts only diagnostically. A sudden drop in pull requests may reveal a blocked release process, but it does not prove individuals became less productive.

Combine quantitative measures with qualitative evidence: complexity removed, incidents prevented, cross-team enablement, mentoring, and architectural decisions are important engineering contributions that code volume misses.

## Key concepts

**Output.** Artifacts produced: code, commits, tickets, deployments.

**Outcome.** Effect on customers, delivery, reliability, cost, or engineering capability.

**Goodhart's Law.** When a proxy becomes a target, people optimize the proxy and its relationship to the real goal weakens.

**Review burden.** Generated output consumes reviewer attention; that cost belongs in the productivity calculation.

**Rework.** Changes needed because earlier work was incomplete or defective. High output with high rework is not efficient delivery.

## Production example

A team introduces a coding agent and observes that monthly submitted lines of code double.

At first this is presented as a productivity gain. However, review queue time rises from four hours to fourteen, rollback rate increases, and two generated abstractions need substantial manual rewrite.

The team changes the measurement. For three task categories—test generation, small bug fixes, and service refactors—it tracks:
- median task lead time;
- reviewer minutes;
- post-merge defects and rework;
- size of unrelated diff;
- deployment outcome.

The agent provides strong gains for focused test scaffolding and small fixes but performs poorly on broad refactors. Usage guidance is narrowed accordingly.

A later change removes a redundant service and 12,000 lines of code while reducing incidents. Under a volume metric this looks like negative output; under outcome measures it is clearly valuable.

## Trade-offs

Activity metrics are easy to collect and can reveal process anomalies. Outcome measures are slower, noisier, and require interpretation.

Team-level flow metrics reduce individual gaming but still need context. A compliance-heavy service and a low-risk internal tool should not be compared mechanically.

## Failure modes / pitfalls

Ranking engineers by commits or lines encourages fragmentation, trivial changes, and avoidance of high-leverage work such as incident prevention or deletion.

Deployment frequency can also be gamed if turned into an individual quota.

AI adoption metrics such as tokens consumed or code accepted can reward use of the tool even when delivery quality worsens.

## When to use it

Apply this caution when designing engineering productivity dashboards, AI-tool adoption measures, or performance-review inputs.

Use output metrics to ask “what changed in the workflow?” rather than “who is most productive?”

## When not to use it

Do not abandon measurement entirely. Teams need evidence about lead time, quality, reliability, developer experience, and business outcomes.

The caution is about proxies becoming goals, not about refusing quantitative feedback.

## What a Senior Engineer should know

A Senior Engineer should explain the impact and verification of work, including review, maintenance, and operational cost.

They should resist optimizing for visible volume at the expense of simpler systems and durable outcomes.

## What a Staff Engineer should understand

A Staff Engineer should design incentives and measurement systems that reward sustainable delivery, reliability, collaboration, and complexity reduction.

They should evaluate AI tools by task outcomes and rework rather than adoption or generated volume.

Further reading: [SPACE framework](https://queue.acm.org/detail.cfm?id=3454124), [DORA metrics](https://dora.dev/guides/dora-metrics/).
