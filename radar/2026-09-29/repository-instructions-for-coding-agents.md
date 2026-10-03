---
title: "Repository instructions for coding agents"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Repository instructions give coding agents stable project-specific guidance: how to build and test, which files are generated, important architecture boundaries, security constraints, and what evidence is expected before completion.

`AGENTS.md` is one open Markdown convention used by many coding-agent tools. Its current public guidance supports nested instruction files, where the closest relevant file can provide more specific rules. Exact precedence and behavior still depend on the agent harness, so repository owners should test the tools they support.

## Why it matters for backend engineers

A coding agent can read a repository yet still miss conventions that human teammates learned informally: use `make verify` rather than one package test, never edit generated clients, database migrations must be backward-compatible, or integration tests require a local emulator.

Without explicit guidance, the agent spends time rediscovering these rules or produces patches that look reasonable but violate the repository's delivery process.

Stale instructions are equally dangerous because they appear authoritative. Instructions therefore need ownership and executable checks behind important rules.

## How it works

Place concise top-level instructions at the repository root for rules that apply broadly: setup, canonical build/test commands, code-generation entry points, security boundaries, and architecture references.

In large monorepos, add scoped instructions near subprojects only when they genuinely differ. Avoid copying the same rule into many files; duplicated instructions drift.

State commands as runnable entry points. Prefer `make verify`, `task test`, or a package script over ten manually ordered shell commands when the repository already provides a stable task interface.

Explain generated files and their source. “Do not edit `client.gen.go`; update `api.proto` and run `make generate`” is much more actionable than “generated files are read-only.”

For important constraints, connect prose to executable enforcement: architecture tests, lint, schema drift checks, or CI. An agent instruction is guidance, not a security or correctness boundary.

## Key concepts

**Scope.** Which files or subproject an instruction applies to.

**Precedence.** Harness-specific rule deciding which nested or explicit instructions win. Test rather than assume portability.

**Canonical command.** Stable repository entry point for build, lint, test, generation, and verification.

**Reason.** Explaining why a constraint exists helps the agent choose correctly when an exception appears.

**Executable enforcement.** CI or tooling verifies critical rules independently from prose compliance.

## Production example

A Go monorepo contains hand-written server code and generated gRPC clients. Agents frequently patch generated files because the generated code is where the compile error appears.

The root `AGENTS.md` states:
- use `make verify` before completion;
- API changes start in `proto/*.proto`;
- run `make generate` after schema changes;
- do not edit `*.pb.go` or generated clients directly;
- database migrations must support a rolling old/new deployment;
- production deployment commands are out of scope for coding tasks.

A nested instruction under `analytics/` adds its own test-data command without repeating the root rules.

CI runs generation and fails if the working tree differs, so a patch cannot pass merely because the agent ignored the instruction.

After a toolchain migration from Make to Task, the same pull request updates repository instructions and CI together. An automated smoke task periodically validates that documented commands still run.

## Trade-offs

Clear instructions reduce repeated mistakes and agent exploration time. Too much instruction consumes context and can turn every task into reading an internal handbook.

Agent-only documentation can drift from human developer workflows. Prefer shared canonical commands and architecture docs, with instructions pointing to them.

Nested files improve local specificity while increasing precedence complexity.

## Failure modes / pitfalls

Obsolete commands create false failures. Contradictory nested rules produce unpredictable behavior across different agent hosts.

Putting secrets, tokens, or sensitive operational details in instruction files expands exposure to every agent run.

Instructions that tell an agent to run destructive deployment or cleanup commands can create broad side effects if the harness grants those permissions.

## When to use it

Use repository instructions when automated contributors need project-specific knowledge that cannot be inferred reliably from code or standard tooling.

Keep the file focused on actions and constraints that change agent behavior.

## When not to use it

Do not duplicate every style-guide sentence or API reference into agent instructions.

Do not rely on prose for mandatory security controls; enforce those in permissions, CI, and service authorization.

## What a Senior Engineer should know

A Senior Engineer should keep instructions concise, accurate, scoped, and connected to canonical commands and executable checks.

They should update instructions as part of toolchain or architecture changes rather than wait for repeated agent failures.

## What a Staff Engineer should understand

A Staff Engineer should standardize repository instruction conventions across teams while preserving local scope and harness differences.

They should ensure agents follow the same developer-platform workflows humans use instead of creating a parallel unmaintained process.

Further reading: [AGENTS.md](https://agents.md/).
