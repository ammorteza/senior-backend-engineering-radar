---
title: "Chaos engineering"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Chaos engineering runs controlled failure experiments to test a stated resilience hypothesis. It is a learning method with stop conditions, not random disruption.

## Why it matters for backend engineers

A replica or retry mechanism may exist but fail under the conditions it was intended to cover. Experiments provide evidence before an uncontrolled outage does.

## How it works

Define expected user-visible behavior, select one failure and limit the initial scope. Observe a steady-state signal, inject the failure, and stop if impact exceeds the budget. Compare actual behavior with the hypothesis and implement improvements. Begin in suitable nonproduction environments, progressing only when safeguards and organizational authorization support it.

## Key concepts

Blast radius covers customers and shared dependencies. Abort signals must be observable during the failure. Fault injection differs from load testing. Recovery behavior and retries are part of the experiment, not an afterthought.

## Production example

A worker system claims one lost node will not exceed its job-age objective. A controlled test terminates one node and observes reassignment, redelivery and backlog drain. Duplicate-safe writes are checked. The experiment stops if age crosses the agreed threshold and exposes a recovery-concurrency bottleneck.

## Trade-offs

Experiments uncover hidden coupling and recovery assumptions. They consume capacity and can harm users if safeguards or hypotheses are weak.

## Failure modes / pitfalls

Random failures without a question, broken abort automation and ignoring shared downstream impact turn learning into avoidable incidents.

## When to use it

Use chaos experiments after baseline telemetry, recovery controls and ownership exist.

## When not to use it

Do not inject production failure merely to prove maturity or while ordinary reliability basics are unresolved.

## What a Senior Engineer should know

Design bounded experiments and explain the observed difference from the hypothesis.

## What a Staff Engineer should understand

Choose useful failure scenarios and ensure experiments improve reliability rather than become a ritual.

Further reading: [Principles of Chaos Engineering](https://principlesofchaos.org/).
