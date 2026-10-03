---
title: "Durable agent workflows"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Durable agent workflows persist enough execution state that a multi-step AI task can survive process restarts, long waits, human approvals, provider outages, and resumptions without accidentally repeating completed business effects.

Durability is more than saving a chat transcript. A correct workflow distinguishes model reasoning, proposed actions, approved actions, executed effects, and unknown outcomes.

## Why it matters for backend engineers

Agent tasks increasingly span minutes or days: research followed by approval, supplier onboarding, code generation followed by CI, or incident investigation waiting for a deployment.

If execution state exists only in model context, a restart can lose progress or repeat an already executed mutation. If approvals are stored only as free-form text, the workflow may reuse an old approval after the proposed action changes.

Backend reliability patterns—idempotency, state machines, checkpoints, reconciliation, and versioning—apply directly.

## How it works

Give each workflow a stable identity and persist explicit states such as `collecting_data`, `awaiting_approval`, `executing`, `completed`, or `needs_reconciliation`.

Checkpoint after meaningful boundaries, especially **before** and **after** external effects. Record the operation ID, exact proposed arguments, approval identity, tool result, and whether completion is known.

Model outputs are nondeterministic. If a model produced an accepted structured plan before a restart, the workflow may persist and reuse that plan instead of regenerating a potentially different one.

External mutations need stable operation IDs. If the tool times out after submission, the next step first queries by the existing ID or reconciles external state. It does not create a fresh mutation blindly.

Human approval binds to the concrete action. If the workflow later changes amount, recipient, scope, or tool, a new approval may be required.

Long-running workflows need versioning. New code must understand older persisted states or route them to compatible handlers.

## Key concepts

**Checkpoint.** Durable workflow state from which execution can safely resume.

**Effect identity.** Stable ID connecting retries to one logical external mutation.

**Unknown outcome.** The workflow cannot determine whether an external operation completed. This state requires lookup or human reconciliation, not optimistic retry.

**Approval binding.** Approval is attached to exact action semantics, not the entire future conversation.

**Nondeterministic result reuse.** Persist accepted model decisions when replaying them could change behavior unexpectedly.

**Workflow version.** Schema and control-flow version needed to resume instances created under older logic.

## Production example

An onboarding agent prepares a new supplier record. It gathers company data, validates bank information through approved tools, then presents a draft for human approval.

The approved draft is persisted with operation ID `supplier-onboard-2026-1042` and a hash of the exact submitted fields.

The submission tool sends the record to an ERP. The ERP creates the supplier, but the HTTP response is lost. The workflow process restarts.

On resume, the state is `executing/unknown_outcome`. The workflow queries the ERP by the original operation or external reference. It finds the supplier and marks the workflow completed. It does not ask the model to create another supplier.

Now consider that the bank account changed after approval but before execution. Because the action hash differs, the old approval is invalidated and a new review is required.

The workflow trace records both the approval and reconciled outcome so operators can explain why no duplicate supplier was created.

## Trade-offs

Durability improves recovery, auditability, and user trust for consequential automation. It adds persistence, state schemas, retention, encryption, and workflow migration.

Checkpointing every token or model message creates huge state and privacy exposure. Persist business-relevant decisions and effect boundaries rather than indiscriminate transcripts.

Using a workflow platform can simplify timers and retries, but a simple database state machine may be enough for a small process.

## Failure modes / pitfalls

Checkpointing only after an irreversible action leaves a crash window where the effect happened but no durable record exists.

Replaying every tool call duplicates work. Generating a new idempotency key on retry defeats deduplication.

Approvals stored without the exact parameters can be reused for changed actions. Workflow upgrades that delete old states can strand long-running instances.

## When to use it

Use durable workflows for agent tasks with long waits, human approval, costly model work, external mutations, or business obligations that must survive restart.

Treat durability as a state-machine problem independent of the model vendor.

## When not to use it

A short read-only question or disposable brainstorming session rarely needs durable execution infrastructure.

Do not persist sensitive model context solely “just in case” if no recovery requirement justifies the exposure.

## What a Senior Engineer should know

A Senior Engineer should design workflow states, checkpoints, operation identity, approval semantics, and unknown-outcome reconciliation.

They should test restart at every important boundary, especially around external effects.

## What a Staff Engineer should understand

A Staff Engineer should choose platform ownership, retention and encryption policy, versioning strategy, and autonomy limits for workflows that can outlive models, services, and teams.

They should ensure durable execution guarantees come from state and tool semantics rather than assumptions about deterministic model replay.

Further reading: [Temporal workflow execution](https://docs.temporal.io/workflow-execution).
