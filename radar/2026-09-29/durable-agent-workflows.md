---
title: "Durable agent workflows"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Durable agent workflows persist progress so model/tool tasks can resume after interruptions. They separate uncertain reasoning from recorded business state and external effects.

## Why it matters for backend engineers

A restart should not repeat an already-submitted application or lose a pending human review. Persisting a chat transcript alone does not solve those execution guarantees.

## How it works

Record workflow state, selected actions and tool outcomes at explicit boundaries. Use stable operation IDs for effects, retain approval context and resume from the last durable state. Completed nondeterministic model results may be reused rather than recomputed. Unknown tool outcomes require lookup or reconciliation before another attempt.

## Key concepts

Checkpointing preserves state, not atomicity with every external system. Replay must distinguish reasoning from effect execution. Human approvals should bind to the actual proposed action. Workflow versioning protects executions started under older logic.

## Production example

An assistant drafts a supplier onboarding record and waits for review. After approval, submission times out. A resumed workflow queries by the original submission ID and confirms completion rather than creating a duplicate supplier. Changes after approval require the workflow to evaluate whether the original approval still applies.

## Trade-offs

Persistence improves recovery and auditability. It adds storage, versioning and privacy obligations; saved context can become stale.

## Failure modes / pitfalls

Replaying every tool call, dropping operation IDs, reusing approvals for changed actions and checkpointing only after irreversible effects cause failures.

## When to use it

Use durability for long-running tool workflows with waiting, costly steps or consequential effects.

## When not to use it

A short read-only answer may not justify a durable execution platform.

## What a Senior Engineer should know

Design checkpoints, effect identity and unknown-outcome handling.

## What a Staff Engineer should understand

Choose workflow ownership and guarantees independent of model nondeterminism.

Further reading: [Temporal workflow execution](https://docs.temporal.io/workflow-execution).
