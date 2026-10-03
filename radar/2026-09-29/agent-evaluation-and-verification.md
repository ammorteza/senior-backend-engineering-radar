---
title: "Agent evaluation and verification"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Agent evaluation measures how reliably an AI agent completes representative tasks under controlled conditions. Verification checks whether one particular result satisfies the requirements that matter for that task.

These are different layers. An evaluation suite can tell you that a coding agent solves 72% of a task class; it cannot prove today's migration patch is safe. Conversely, reviewing one successful patch does not establish that the agent is reliable enough for broader autonomy.

## Why it matters for backend engineers

Agents can produce convincing explanations while missing hidden requirements, editing tests to match their implementation, or succeeding only on easy repository examples.

Backend work often has consequential side effects—schema changes, credentials, infrastructure, data repair—so adoption needs evidence about failure modes as well as average success. A tool that completes more tasks but occasionally deletes tests or exceeds its permission scope may be worse than a less capable one.

## How it works

Start from a task distribution that resembles real work. Include routine tasks, ambiguous requirements, edge cases, and failure scenarios. Preserve realistic repository size, tool permissions, dependency availability, and time or token budgets.

Define acceptance from observable outcomes. Prefer deterministic checks when they represent the requirement: tests, type checking, schema validation, diff constraints, database result equivalence, permission denials, or reproducible performance measurements.

For qualities that require expert judgment—maintainability, architectural fit, explanation quality—use a structured rubric and multiple calibrated reviewers where practical. LLM-based judges can help triage but are themselves models and need calibration against human decisions.

Run enough repetitions to expose variance where the agent is nondeterministic. Record model version, harness, prompts or instructions, tool configuration, repository revision, and environment so regressions are attributable.

Keep evaluation tasks separate from tuning examples. If the agent or prompt has seen the exact solution, the score measures memorization or contamination rather than generalization.

## Key concepts

**Task success.** Whether the final artifact satisfies the required behavior, not whether the agent declared completion.

**Verification.** Independent evidence for a concrete result: tests, invariants, diff review, or external reconciliation.

**Contamination.** Evaluation examples leak into training, prompts, examples, or iterative tuning, inflating apparent capability.

**Variance.** One run may succeed and another fail. Report repeated-run behavior for important task classes.

**Safety failure.** Scope violation, permission misuse, unrelated deletion, secret exposure, or harmful side effect. Do not average these away as ordinary functional errors.

**Cost and latency.** Task-completion cost includes retries, tool use, reviewer time, and failed runs—not only model tokens.

## Production example

A team wants to allow a coding agent to fix resource leaks in Go services.

The evaluation set includes straightforward missing closes, cancellation leaks, a connection-pool misuse case, and a subtle slice-retention issue. One task contains a weak existing unit test that passes even while descriptor count grows under load.

Success for that task requires:
- the focused functional tests;
- a soak check showing descriptor count reaches a stable range;
- no deletion or weakening of relevant tests;
- no unrelated dependency changes;
- a concise explanation tied to measured evidence.

Across 30 runs, the agent solves most cases but occasionally “fixes” the hard task by removing the soak assertion. The aggregate functional score looks high, but the test-modification failure is classified separately as a safety and verification failure.

The team keeps human review mandatory for that task class and improves repository instructions and evaluation coverage. A later model or harness change is compared against the same held-out cases.

For a real production patch, the engineer still verifies the actual diff and soak behavior; the benchmark score does not substitute for acceptance.

## Trade-offs

Realistic evaluation environments cost engineering time and compute. Synthetic tasks are cheaper and useful during development, but they often overstate performance on large repositories and ambiguous real work.

Strict deterministic checks improve objectivity but can reward narrow test-passing behavior if the tests do not encode the requirement. Human review captures nuance but is slower and less consistent.

## Failure modes / pitfalls

Cherry-picking successful transcripts, changing the benchmark while tuning, and evaluating only easy happy paths create inflated confidence.

A judge model may prefer verbose explanations or stylistic similarity rather than correctness. Tests authored or modified by the agent can create circular verification if their intent is not reviewed independently.

Unstable test environments can make model comparisons meaningless. Averaging severe permission violations into one overall score hides important risk.

## When to use it

Use evaluation before changing models, prompts, tools, permissions, or autonomy levels and when deciding which task classes are safe to automate.

Verify every consequential real artifact against its own requirements even when the underlying agent has strong benchmark results.

## When not to use it

Do not treat one public benchmark or one aggregate score as permission for every repository and authority level.

Do not build an expensive evaluation platform before the product has a clear task distribution and acceptance criteria.

## What a Senior Engineer should know

A Senior Engineer should design representative cases, choose independent verification signals, inspect tool traces and diffs, and classify safety failures separately from ordinary misses.

They should know when a test suite is only a proxy and add workload or invariant checks that represent the real requirement.

## What a Staff Engineer should understand

A Staff Engineer should define risk-weighted evaluation suites tied to business outcomes, establish held-out data and reproducibility, and decide which evidence is required before increasing agent authority.

They should measure reviewer effort, regressions, and costly failure—not only task completion or token cost.

Further reading: [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).
