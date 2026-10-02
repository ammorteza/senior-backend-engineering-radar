---
title: "Repository instructions for coding agents"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Repository instructions give automated contributors project-specific conventions, verification commands and boundaries. Files such as `AGENTS.md` are a maintained interface to the repository, with interpretation depending on the agent's harness.

## Why it matters for backend engineers

Without explicit guidance, agents may use the wrong test command or edit generated files. Stale guidance can be worse because it appears authoritative while no longer matching the project.

## How it works

Keep instructions close to the code they govern and explain command entry points, architecture constraints and common pitfalls. Follow the harness's documented file scope and precedence rules. Link detailed references rather than loading every historical decision into every task. Verify commands when the toolchain changes.

## Key concepts

Instructions differ from executable enforcement. Nested-file scope must be understood. Generated-file rules need the corresponding regeneration command. Constraints should state a reason so exceptions can be evaluated sensibly.

## Production example

A Go repository instructs contributors not to edit generated clients and provides `make generate` plus a drift check. An API change updates the source schema and regenerates clients. CI verifies output, so compliance does not depend solely on the agent remembering prose.

## Trade-offs

Good guidance reduces repeated mistakes. Excessive instructions consume context and conflict with other documentation; duplicates drift.

## Failure modes / pitfalls

Obsolete commands, contradictory nested rules, hidden deployment side effects and instructions containing secrets create problems.

## When to use it

Use concise repository instructions when automated contributors need stable project-specific information.

## When not to use it

Do not encode every coding preference or rely on prose for mandatory security enforcement.

## What a Senior Engineer should know

Keep guidance accurate, scoped and supported by executable checks.

## What a Staff Engineer should understand

Own instruction lifecycle and align it with developer tooling rather than creating an agent-only parallel process.

Further reading: [AGENTS.md](https://agents.md/).
