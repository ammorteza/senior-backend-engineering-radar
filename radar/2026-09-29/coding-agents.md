---
title: "Coding agents"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Coding agents combine a model with repository navigation, editing and command execution. Unlike a completion tool, an agent can take multiple actions and respond to intermediate results.

## Why it matters for backend engineers

This expands both usefulness and risk: an agent can diagnose a failing test, but it can also modify unrelated files or run commands beyond the intended scope.

## How it works

The agent receives a goal, reads relevant files, invokes tools and iterates based on their outputs. The harness controls accessible files, network and credentials. Review the resulting diff and actual command outcomes before accepting work. Branches or isolated worktrees keep changes recoverable and avoid interference with concurrent edits.

## Key concepts

Tool evidence differs from the agent's narration. Permissions define authority, not prompt wording alone. Context limits can lose prior constraints. Stop conditions should refer to concrete acceptance checks and scope.

## Production example

An agent investigates a connection leak in a Go service. It reproduces descriptor growth, patches response-body cleanup and runs a focused soak test. The reviewer checks error paths and rejects unrelated dependency changes. The final report cites measured descriptor behavior, not merely “all fixed.”

## Trade-offs

Agents can automate multi-step work. They add execution risk and may consume significant review time when tasks are underspecified.

## Failure modes / pitfalls

Reading secrets into context, destructive commands, silently broadening scope and claiming tests passed without execution undermine trust.

## When to use it

Use agents for bounded repository tasks whose changes and evidence remain reviewable.

## When not to use it

Avoid unattended authority over irreversible operations unless a deliberate workflow constrains and authorizes them.

## What a Senior Engineer should know

Set scope, inspect diffs and distinguish tool results from generated claims.

## What a Staff Engineer should understand

Design repository access, evaluation and deployment controls suitable for autonomous contributors.

Further reading: [Repository agent instructions](https://agents.md/).
