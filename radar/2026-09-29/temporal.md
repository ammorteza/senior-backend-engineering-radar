---
title: "Temporal"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Temporal is a durable workflow platform. Application workers execute workflow and activity code, while the Temporal Service stores workflow event history, schedules tasks, persists timers, and enables execution to continue after process failure.

Its defining programming model is deterministic workflow replay. Workflow code is re-executed against recorded history to reconstruct state; previously completed activity results and timer decisions come from history rather than being repeated as arbitrary external I/O.

## Why it matters for backend engineers

Temporal can replace hand-built combinations of cron jobs, retry tables, queue consumers, and process-state columns for complex long-running workflows.

The benefit comes with a new constraint: workflow code is not an ordinary request handler. Reading wall-clock time, generating uncontrolled randomness, calling a database directly, or iterating over nondeterministic data structures can produce replay behavior different from the recorded history.

External effects still occur in activities and are at-least-once in practical failure scenarios unless the destination provides stronger identity. Temporal's durable history does not make a provider charge exactly once.

## How it works

A workflow execution is identified by a Workflow ID and Run ID. The Temporal Service appends events describing workflow tasks, commands, activity scheduling and completion, timers, signals, updates, and other lifecycle changes.

A worker receives workflow tasks and replays the recorded history through workflow code. When code reaches decisions already present in history, the SDK returns the recorded result. When it reaches a new deterministic decision, it emits commands for Temporal to persist and act upon.

Activities perform network, database, or other side-effecting work. They can be retried according to policy. Activity timeout types distinguish queue wait, execution, and total retry duration depending on configuration. Long activities can heartbeat progress and cancellation awareness.

Task Queues route workflow and activity tasks to compatible workers. Continue-As-New starts a new run while preserving logical workflow identity, useful for bounding very large histories.

Workflow code evolves through Temporal's worker versioning or supported patching and deployment mechanisms; the exact approach should follow the current SDK and server version in use.

## Key concepts

**Workflow ID.** Stable business process identity; reuse policy controls what happens when executions with the same ID already exist.

**History.** Durable event log used to reconstruct workflow state.

**Determinism.** Given the same history, workflow code must issue compatible decisions.

**Activity.** Side-effecting external work that may retry. It needs idempotency or reconciliation.

**Signal and Update.** Mechanisms for interacting with running workflows under their documented semantics.

**Continue-As-New.** Starts a new run to keep history bounded for long or looping processes.

## Production example

A subscription renewal workflow waits until the renewal date, creates a provider charge, updates entitlements, and sends confirmation.

The charge activity calls the provider using idempotency key `renewal/{subscription}/{billing-period}`. The provider successfully creates the charge, but the worker loses its connection before recording the activity result.

Temporal retries the activity. Because the same key is reused, the provider returns the existing charge instead of creating another one.

The workflow then updates entitlement through another activity and records completion. If email fails, that activity can retry without recharging.

Months later, workflow code changes. The team deploys the new version using Temporal's supported versioning mechanism so in-flight executions continue under compatible code while new workflows use the new path.

A load test also checks history growth. A workflow that records daily events for years uses Continue-As-New or another bounded-history design before approaching operational limits.

## Trade-offs

Temporal provides durable timers, retries, state reconstruction, and workflow visibility. It adds a dedicated service, worker model, SDK constraints, and history retention to the architecture.

Its deterministic model simplifies recovery but requires engineers to separate decision code from side effects consciously.

For simple jobs, a queue plus database state can be significantly cheaper.

## Failure modes / pitfalls

Network or database calls directly from workflow code can violate replay assumptions. Large payloads and frequent signals can inflate history.

Activities that retry non-idempotent effects can duplicate them. Heartbeats that are too infrequent can delay detection or lose progress information.

Changing workflow code without a versioning strategy can make old histories incompatible after deployment.

## When to use it

Evaluate Temporal for long-running business processes with durable timers, retries, complex branching, external signals, and recovery that would otherwise require substantial custom state-machine infrastructure.

Prototype the workflow and failure model, not only the happy path.

## When not to use it

Do not introduce Temporal for one short stateless task or use it as a replacement for relational transactions.

High-throughput stream transformations and bulk analytics may fit dedicated stream or batch engines better.

## What a Senior Engineer should know

A Senior Engineer should separate workflow logic from activities, understand replay and determinism, configure activity timeouts and retries, design idempotent effects, and test workflow replay.

They should know how Workflow IDs, signals, updates, child workflows, and Continue-As-New affect lifecycle.

## What a Staff Engineer should understand

A Staff Engineer should plan Temporal service ownership, worker versioning, task-queue strategy, retention, namespace boundaries, capacity, and migration of long-running executions.

They should decide which workflow patterns become shared conventions and which processes should remain simpler state machines.

Further reading: [Temporal documentation](https://docs.temporal.io/), [Workflow execution](https://docs.temporal.io/workflow-execution).
