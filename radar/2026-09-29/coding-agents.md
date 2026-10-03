---
title: "Coding agents"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Coding agents combine a model with repository search, file editing, command execution, and sometimes external development tools so they can perform multi-step engineering tasks.

Unlike code completion, an agent observes intermediate results and changes its plan: it can read a failing test, inspect implementation, edit code, run the test again, and continue until a stop condition is reached.

The harness—not the model—defines which files, commands, network destinations, and credentials the agent can actually access.

## Why it matters for backend engineers

Multi-step autonomy can remove repetitive investigation and implementation work. It also broadens risk: the agent may edit unrelated files, run destructive commands, modify tests to hide failure, or read sensitive files into model context.

The right engineering question is not “can the agent code?” but “for which task classes can it act with enough evidence, permissions, and review to improve delivery?”

## How it works

The agent receives a goal plus repository instructions and current context. It uses search or file tools to locate relevant code, makes changes, runs commands, and uses command outcomes to decide next steps.

Keep changes isolated in a branch, worktree, sandbox, or ephemeral environment so they are reviewable and recoverable.

Define acceptance checks before the agent starts when possible: specific tests, lint, generated-file checks, performance evidence, and scope constraints.

Permissions should follow the task. A code-fix agent usually needs repository read/write and test execution; it does not automatically need production cloud credentials.

Stop conditions should be concrete. “Keep improving until perfect” invites scope expansion. “Fix failing test X without changing public API; run package tests and lint” is much easier to evaluate.

Review the actual diff and actual tool output. Agent narration may omit a warning or incorrectly summarize a failed command.

## Key concepts

**Harness.** Environment that provides tools, permissions, context, and execution policy.

**Repository instructions.** Project-specific build, test, code-generation, and boundary guidance.

**Isolation.** Branch, worktree, container, or sandbox prevents the agent from interfering with unrelated work.

**Tool evidence.** Real compiler, test, or benchmark output. It is more reliable than “I ran the tests.”

**Scope budget.** Files, components, time, tool calls, or diff size can bound task expansion.

**Human review.** Authority can be increased only where evaluation shows enough reliability; merge and deployment remain separate decisions.

## Production example

A Go service leaks HTTP response bodies under one provider error path.

The agent receives a focused issue: reproduce descriptor growth, fix the leak, add a regression check, and avoid dependency updates.

It reads the HTTP client wrapper, identifies an early return before body cleanup, writes a test server that exercises the error response, and runs a short soak test while sampling open descriptors.

The patch closes bodies correctly and preserves useful error data. The agent also proposes upgrading the HTTP dependency, but that file is outside the task and the reviewer rejects the unrelated change.

The final evidence includes the focused test and descriptor count reaching a stable range. The reviewer inspects all error paths before merge.

The agent never had production credentials, so even a malicious repository instruction could not turn the task into a deployment.

## Trade-offs

Coding agents can reduce investigation and repetitive editing time and parallelize bounded tasks. They consume model and execution resources and can transfer effort to review if patches are broad.

More permissions reduce friction but increase worst-case impact. Strong isolation limits risk while making some integration tests or external tools harder to access.

## Failure modes / pitfalls

Reading secret files into context, broad shell authority, and production credentials create unnecessary exposure.

Agents may silently broaden scope, change generated files instead of sources, disable tests, or report success after a partial test suite.

Very large tasks can exceed context or lose early constraints. Long autonomous runs need checkpoints and clear stop conditions.

## When to use it

Use coding agents for bounded repository tasks with clear acceptance and review: bug fixes, tests, small refactors, documentation, migration scaffolding, and investigation.

Increase autonomy only for evaluated task classes and safe environments.

## When not to use it

Do not give unattended agents irreversible production authority merely because they can run local tests.

Avoid huge poorly specified rewrites where no reviewer can confidently assess the resulting diff.

## What a Senior Engineer should know

A Senior Engineer should write precise task constraints, inspect diffs and command output, use isolation, and verify generated tests against requirements.

They should know when to stop an agent that is expanding scope rather than solving the target problem.

## What a Staff Engineer should understand

A Staff Engineer should design agent access tiers, repository instruction conventions, evaluation, CI integration, and merge or deployment controls.

They should measure task success and rework, not generated code volume, and treat agents as automated contributors within the existing engineering control system.

Further reading: [AGENTS.md](https://agents.md/).
