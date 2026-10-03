---
title: "Workflow orchestration"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Workflow orchestration makes a multi-step business process durable. Instead of keeping progress only in a request handler or scattering state across unrelated queues, a workflow system records enough state or history to resume after worker crashes, deploys, timers, and long external waits.

The orchestrator decides **what should happen next**. Workers or activities perform external side effects. That distinction is essential because replaying workflow state must not blindly repeat payments, emails, or file writes.

## Why it matters for backend engineers

Many workflows last longer than one HTTP request: onboarding waits for documents, fulfillment waits for delivery events, refunds wait for provider outcomes, and compliance review may pause for days.

Ad hoc implementations often grow into tables with dozens of booleans, cron jobs, and consumers whose ownership is unclear. Durable orchestration provides one model for state transitions, retries, timers, and operator visibility.

## How it works

A workflow instance has stable identity and durable state. The engine records transitions before or as it schedules the next step, depending on the platform's execution model.

External work runs as activities or tasks. Activity execution can repeat after timeout or worker failure, so the external operation needs an idempotency key, conditional write, or status-reconciliation mechanism.

Timers are durable: waiting for three days does not require a process or goroutine to remain alive. Signals or events can wake a workflow when external input arrives.

Cancellation stops future workflow progress under defined semantics. It is different from **compensation**, which is a business action such as refunding a charge after a later step fails.

Workflow code and state must evolve. Long-running instances started under version N may still exist after version N+3 is deployed, so the platform needs compatible state or workflow-version handling.

## Key concepts

**Workflow state.** Durable representation of process progress and decisions.

**Activity or task.** External work that may be retried independently of workflow decision state.

**Durable timer.** A persisted wake-up condition rather than an in-memory sleep.

**Signal or external event.** Input that changes a waiting workflow.

**Compensation.** Business action that semantically offsets a prior completed step; it is not transactional rollback.

**Versioning.** Running workflows must remain understandable as code changes.

## Production example

A loan application workflow has these states:

1. verify identity;
2. if a document is missing, request it;
3. wait up to seven days;
4. remind after two days if still missing;
5. submit for manual review;
6. issue final decision.

The workflow records that the missing-document request was sent and starts a durable reminder timer. The worker process restarts overnight; the timer still exists.

The applicant uploads the document before the reminder fires. A signal updates the workflow state, and when the timer condition is evaluated the reminder is suppressed.

Identity verification calls an external provider. If the activity times out after the provider accepted the request, the retry uses the original verification operation ID or queries provider status rather than opening a second verification.

Operations staff can inspect why a particular application is waiting—document, provider, timer, or manual review—instead of searching several queues.

## Trade-offs

A workflow engine centralizes recovery, timers, and process visibility. It introduces infrastructure, programming constraints, state-history retention, and another operational dependency.

A custom database state machine is simpler for a few short states. A workflow platform becomes valuable as waits, retries, human steps, and recovery paths grow.

## Failure modes / pitfalls

Non-idempotent activities turn engine retries into duplicate side effects. Storing large payloads or secrets in workflow history can create cost and privacy problems.

Unversioned workflow changes can make older instances fail after deployment. Compensation may also fail and needs its own retry and operator resolution path.

A workflow engine should not become a place to hide core transactional data modeling; authoritative business state still belongs in appropriate stores.

## When to use it

Use workflow orchestration for long-lived multi-step processes with durable waiting, retries, human intervention, or complex recovery.

It is especially useful when operators need one place to inspect process state.

## When not to use it

A single queue job with one retry policy may not justify a workflow platform.

Do not model a high-volume pure data transformation as millions of heavyweight workflows if stream or batch processing fits better.

## What a Senior Engineer should know

A Senior Engineer should design workflow identity, durable transitions, activities, timers, retries, cancellation, compensation, and version-compatible evolution.

They should make every externally repeated activity safe or reconcilable.

## What a Staff Engineer should understand

A Staff Engineer should decide which business processes belong in an orchestration platform, set history and retention policy, and plan worker and workflow-version lifecycle.

They should clarify ownership when workflows outlive one service or team and provide operator tooling for unresolved states.

Further reading: [Temporal workflow execution](https://docs.temporal.io/workflow-execution).
