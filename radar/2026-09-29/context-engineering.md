---
title: "Context engineering"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Context engineering selects and organizes the information a model receives: goals, instructions, relevant evidence, tool descriptions and intermediate state. It aims to make the task understandable within a limited context budget.

## Why it matters for backend engineers

More text is not automatically better. Irrelevant files can bury the actual invariant, while missing a key schema or previous decision can lead to a convincing but unsuitable solution.

## How it works

Identify what changes the decision, retrieve that material and preserve its provenance. Separate trusted instructions from untrusted content. Summarize completed work into explicit state while retaining critical constraints and references. Refresh facts when they may have changed rather than trusting an old summary indefinitely.

## Key concepts

Retrieval relevance differs from truth. Context budgets create omission risk. Summaries are lossy and need reference back to original evidence. Tool descriptions should state inputs, effects and authority clearly.

## Production example

For a database incident, an assistant receives the endpoint diff, representative SQL, plan and pool metrics. Unrelated service logs are excluded. A checkpoint records tested hypotheses and unresolved questions so the next turn does not rerun the same investigation or infer that a rollback proves a particular root cause.

## Trade-offs

Focused context improves attention and cost. Selecting too narrowly can hide dependencies; broad retrieval increases noise and potential data exposure.

## Failure modes / pitfalls

Stale summaries, missing source identity, retrieved instructions treated as authority and context filled with duplicated logs distort reasoning.

## When to use it

Use deliberate context selection for repository work, retrieval applications and long-running agent tasks.

## When not to use it

Do not build elaborate retrieval infrastructure for a small task whose needed evidence is already available.

## What a Senior Engineer should know

Provide decisive evidence, constraints and current state; check assumptions against sources.

## What a Staff Engineer should understand

Design provenance, refresh and privacy policies for context pipelines across tools and teams.

Further reading: [Agent Skills progressive disclosure](https://agentskills.io/specification).
