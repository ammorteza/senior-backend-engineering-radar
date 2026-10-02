---
title: "Temporal"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Temporal runs durable workflows by recording execution history and replaying workflow code after failures. Workers host application code; the service retains the history and schedules tasks.

## Why it matters for backend engineers

It can replace fragile chains of queues and database flags for long-running processes. Its replay model also imposes rules that ordinary request handlers do not have.

## How it works

Workflow code makes deterministic decisions and schedules activities, timers or child workflows. Replay uses recorded activity results rather than reexecuting completed activities. Activities perform I/O and may retry; their external effects require idempotency. Signals and updates interact with running workflows under their documented semantics.

## Key concepts

Task queues route work to workers. Workflow IDs define execution identity. Activity timeouts cover distinct phases, while heartbeats help detect stalled long activities. Continue-As-New starts a new run to bound history. Versioning protects old executions as code changes.

## Production example

A subscription renewal waits until the renewal date, charges through an activity and then updates entitlements. The worker crashes after the provider charges. Retrying the activity with the renewal's original idempotency key avoids another charge. The workflow resumes from durable history, not from a new subscription request.

## Trade-offs

Durable timers and retries simplify process recovery. Temporal adds an execution platform, history limits and deterministic-code discipline.

## Failure modes / pitfalls

Calling network APIs or reading nondeterministic time directly in workflow code can break replay. Large payloads inflate history. Activity retries do not make arbitrary effects unique.

## When to use it

Evaluate Temporal for long-lived, failure-prone workflows with timers and complex recovery.

## When not to use it

Do not introduce it for one inexpensive stateless job or treat it as a replacement for transactional data modeling.

## What a Senior Engineer should know

Separate workflow decisions from activities; test replay and idempotent activity retries.

## What a Staff Engineer should understand

Plan worker versioning, platform ownership, retention and migration of long-running executions.

Further reading: [Temporal documentation](https://docs.temporal.io/).
