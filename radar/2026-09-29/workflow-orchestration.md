---
title: "Workflow orchestration"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Workflow orchestration tracks a process's steps, timers and decisions so it can survive crashes and long waits. It provides a durable execution model for work lasting longer than one request.

## Why it matters for backend engineers

Account onboarding can wait hours for documents and days for review. Keeping that process only in memory loses progress; scattering it across unrelated consumers makes ownership hard to discover.

## How it works

A workflow records state transitions or execution history before advancing. Workers execute external activities and return outcomes. Durable timers and signals resume waiting work. Recovery either replays recorded decisions or interprets persisted state, depending on the engine. External calls still need duplicate-safe identities because activity execution may repeat.

## Key concepts

Distinguish workflow state from worker execution. Timeouts can govern queue wait, execution or total step duration. Versioning must keep older in-flight processes understandable after deployments. Cancellation differs from business compensation.

## Production example

A loan-application workflow waits for verification, requests a missing document, then schedules a reminder. A worker restart does not reset the reminder clock. If document acceptance arrives before the timer fires, the recorded state suppresses the reminder. Audit history explains why the application still awaits review.

## Trade-offs

Durability and visibility replace hand-built recovery code. An engine adds infrastructure, programming constraints and lifecycle management for long-lived instances.

## Failure modes / pitfalls

Unversioned workflow changes, large histories, credentials stored in payloads and non-idempotent activities can break recovery or leak data.

## When to use it

Use orchestration for multi-step processes with durable waiting, retries and operator intervention.

## When not to use it

A single independent queue job rarely needs an entire workflow platform.

## What a Senior Engineer should know

Design resumable steps, timers, activity identity and deploy-compatible state evolution.

## What a Staff Engineer should understand

Choose process ownership, retention and operational support for workflows that outlive services and teams.

Further reading: [Temporal workflow execution](https://docs.temporal.io/workflow-execution).
