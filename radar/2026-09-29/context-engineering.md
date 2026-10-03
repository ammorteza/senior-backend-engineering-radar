---
title: "Context engineering"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Context engineering is the deliberate construction of the information an AI model receives for a task: user goal, system and repository instructions, selected source material, tool descriptions, current workflow state, and relevant prior results.

It is not “put as much text as possible into the prompt.” Context is a limited working set. Irrelevant or duplicated material can hide the important invariant just as missing evidence can cause the model to invent an unsuitable solution.

## Why it matters for backend engineers

Repository and production tasks are evidence-heavy. A query optimization may depend on the actual schema and execution plan; an incident analysis may depend on the deployment diff and one specific metric; a migration may depend on an earlier ADR.

If the model sees only the error message, it guesses. If it receives thousands of unrelated logs, it may miss the decisive clue. Good context engineering increases the proportion of task-relevant, authoritative information while preserving provenance.

## How it works

Start by identifying what facts could change the decision. Retrieve those sources rather than whole knowledge bases.

Separate **instructions** from **evidence**. Repository rules or system policy define how the agent should behave. Retrieved documents, issue comments, web pages, and tool output are data that may contain incorrect or malicious instructions.

Preserve provenance: file path, commit, document version, timestamp, query parameters, or tool result identity. A summary without its source makes later verification difficult.

For long tasks, checkpoint completed decisions and unresolved questions. A useful checkpoint says “query X was tested under dataset Y and rejected because it lost tenant filtering,” not simply “we investigated performance.”

Refresh facts whose truth changes with time. A cached cloud quota, current API version, or policy document may need a fresh lookup even if an older summary exists.

Keep tool descriptions narrow and precise. The model needs to know input types, side effects, authorization boundary, and output semantics to choose a tool safely.

## Key concepts

**Relevance.** Information that materially changes task decisions. Semantic similarity alone does not guarantee relevance.

**Authority.** A retrieved comment and the repository's executable test suite may conflict; context should preserve which source is authoritative for which claim.

**Provenance.** Identity and version of evidence so a human or later model step can verify it.

**Context budget.** Finite model input capacity and attention. Repeated logs and boilerplate consume budget without adding signal.

**Lossy summary.** Summaries save space but can omit qualifiers. Preserve links or identifiers back to the original evidence.

**Instruction boundary.** Untrusted retrieved text should not silently override system, user, or repository instructions.

## Production example

An order service has a latency incident. An assistant initially receives 30 MB of application logs, dashboards, and unrelated Kubernetes events. It produces a generic list of possible causes.

The context is rebuilt around the decision:
- request route and feature-flag change;
- the exact SQL introduced;
- table and index definitions;
- representative `EXPLAIN (ANALYZE, BUFFERS)`;
- database CPU and connection metrics;
- previous baseline plan;
- deployment timestamp.

The model now identifies a severe row-estimation mismatch on correlated columns and proposes checking extended statistics.

A checkpoint records the tested hypothesis, the old and new plan hashes, the dataset characteristics, and the fact that rollback restored latency but does not by itself prove root cause.

If the task continues tomorrow, engineers refresh current database state rather than assuming the old incident snapshot still represents production.

## Trade-offs

Focused context reduces token cost and distraction. Narrow selection can miss hidden dependencies, so retrieval needs iterative expansion when evidence points elsewhere.

Full raw source improves auditability while increasing privacy and cost. Summaries are efficient while introducing omission risk.

Automatic retrieval saves time but may select semantically similar yet outdated or unauthorized documents.

## Failure modes / pitfalls

Stale summaries become accidental truth. Duplicating the same constraint in several places can create contradictions as one copy ages.

Retrieval systems can surface prompt-injection text and give it too much authority. Missing file versions makes it impossible to reproduce an earlier conclusion.

A huge tool catalog or context dump can reduce selection quality even though “more information” was provided.

## When to use it

Use deliberate context construction for repository work, RAG, long-running agents, incident investigation, and any task where several sources compete for attention.

Keep the context tied to the current decision and retain source identities.

## When not to use it

Do not build a retrieval pipeline for a task where the necessary evidence is one short file already in the conversation.

Do not summarize away the exact code, schema, or contract when correctness depends on its details.

## What a Senior Engineer should know

A Senior Engineer should identify decisive evidence, preserve provenance, separate instructions from untrusted content, and maintain concise checkpoints for long tasks.

They should verify assumptions against source material instead of allowing summaries to become unquestioned facts.

## What a Staff Engineer should understand

A Staff Engineer should design context pipelines with authority, freshness, privacy, and retention rules across repositories and connected systems.

They should standardize useful repository context without creating giant mandatory prompts that reduce model focus.

Further reading: [Agent Skills specification](https://agentskills.io/specification), [OpenTelemetry GenAI conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/).
