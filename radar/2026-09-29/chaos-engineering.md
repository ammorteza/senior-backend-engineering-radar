---
title: "Chaos engineering"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Chaos engineering is the practice of running controlled experiments that deliberately introduce failures in order to test a resilience hypothesis. The goal is not to “break production” or prove that a team is brave. It is to discover whether a system behaves as expected when a dependency, node, network path, or other component fails.

A useful experiment begins with a specific claim such as: “losing one worker node will not make accepted jobs exceed a ten-minute completion objective.” The experiment then injects the smallest failure capable of testing that claim, observes user-relevant behavior, and stops when predefined safety limits are reached.

## Why it matters for backend engineers

Architecture diagrams often contain reassuring labels—replicated, retried, highly available, auto-scaled—but those labels do not prove the recovery path works.

A failover can be too slow. Retries can overload the surviving dependency. A queue can redeliver work that is not actually idempotent. DNS can keep clients on an old endpoint. Chaos experiments turn those assumptions into evidence before a real failure forces the same test under worse conditions.

## How it works

First establish a **steady-state signal** tied to product behavior: request success, job completion age, message freshness, or another measurable property. CPU alone is rarely enough.

State the hypothesis and exact fault. Examples include terminating one pod, blocking one dependency, adding latency, exhausting a connection pool, or making one availability zone unreachable. Keep the first blast radius small.

Define abort conditions before injection. Operators need a way to stop the fault and enough observability to know whether the experiment is exceeding the allowed impact.

Inject the fault using a controlled mechanism. Observe both immediate user impact and recovery behavior: reassignment, retry rate, queue growth, replica promotion, cache refill, and backlog drain. The experiment ends only after the system returns to an understood state.

Record what differed from the hypothesis and turn that gap into engineering work. Repeating an unchanged experiment that has already proven the same result adds little value; evolve experiments with the architecture.

## Key concepts

**Hypothesis.** A falsifiable statement about user-visible or system behavior under a named failure.

**Blast radius.** The customers, regions, workloads, or shared dependencies that can be affected. Limit it deliberately.

**Steady state.** A measurable property representing acceptable service, not merely component health.

**Abort condition.** A threshold or observation that ends the experiment before impact grows unacceptable.

**Fault injection versus load testing.** Fault injection removes or degrades capabilities. Load testing changes demand. Combining them can be valuable, but they answer different questions.

**Recovery behavior.** The test includes what happens after the fault: retries, catch-up, reconnection, rebalancing, and removal of temporary overrides.

## Production example

A job platform runs ten workers. The team claims that losing one worker will not push the oldest accepted job beyond five minutes.

Before the experiment they verify baseline job age, duplicate-safe job claims, worker utilization, and downstream database capacity. They define an abort threshold of four minutes of oldest-job age so they have room before the product objective is violated.

They terminate one worker while traffic continues. Jobs assigned to the lost worker are redelivered correctly, but the surviving workers retry their database writes aggressively. Database pool wait rises, useful throughput falls, and queue age approaches the abort threshold even though nine workers remain healthy.

The experiment is stopped. The finding is not “Kubernetes failed to reschedule”; it is that recovery concurrency and retry policy overload the shared database. The team caps retry concurrency, adds jitter, and reserves database capacity for recovery.

The next experiment repeats the same worker loss and verifies that job age remains bounded. A later experiment tests loss of an entire node or zone. The sequence grows evidence gradually rather than beginning with the largest possible outage.

## Trade-offs

Chaos experiments reveal hidden coupling and recovery weaknesses that ordinary tests miss. They consume engineering time and can affect real users or shared systems.

Non-production experiments are safer but may not reproduce production scale, routing, quotas, and data distribution. Production experiments provide stronger evidence but require mature observability, rollback, authorization, and blast-radius controls.

## Failure modes / pitfalls

Randomly killing components without a hypothesis produces anecdotes rather than learning. Running an experiment without working abort controls turns it into an avoidable incident.

Testing only the moment of failure can miss the more dangerous recovery phase, where retries and cache refill overwhelm dependencies.

Another common mistake is injecting faults while the service already has unresolved reliability problems. Chaos engineering does not substitute for basic timeouts, backups, health checks, and capacity planning.

## When to use it

Use chaos experiments after the expected behavior, telemetry, ownership, and recovery controls are clear enough to evaluate the result.

Good candidates are important claims that are difficult to prove with ordinary tests: failover, stale-read behavior, queue redelivery, zone loss, dependency latency, or cache failure.

## When not to use it

Do not inject production failures merely to demonstrate engineering maturity. Do not run experiments when teams cannot observe the impact or stop the fault safely.

If a known reliability defect already exists, fix or deliberately test that defect rather than introducing unrelated chaos.

## What a Senior Engineer should know

A Senior Engineer should turn a reliability claim into a bounded experiment with meaningful steady-state metrics, abort criteria, and a clear recovery check.

They should distinguish the injected fault from secondary effects such as retry amplification and preserve evidence needed to explain why the hypothesis passed or failed.

## What a Staff Engineer should understand

A Staff Engineer should choose experiments that test important architectural assumptions across shared dependencies and failure domains, not simply individual service restarts.

They should establish authorization, production-safety rules, experiment ownership, and a progression from small faults to larger scenarios, ensuring the program produces reliability changes rather than ritual.

Further reading: [Principles of Chaos Engineering](https://principlesofchaos.org/), [Google SRE: Testing for reliability](https://sre.google/sre-book/testing-reliability/).
