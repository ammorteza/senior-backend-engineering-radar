---
title: "Bash / shell scripting"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Shell scripting composes programs through arguments, exit statuses, pipes and redirection. Bash adds arrays and other features beyond portable POSIX shell behavior.

## Why it matters for backend engineers

Automation bugs can misinterpret filenames, hide failed commands or run against the wrong environment. A ten-line deployment script deserves the same attention to inputs as application code.

## How it works

The shell performs expansions before launching commands. Quoted variables preserve argument boundaries; unquoted expansions can split words and expand globs. Pipelines connect streams, but exit behavior depends on shell options. Each subprocess has its own environment and cannot directly change the parent's working directory.

## Key concepts

Prefer arrays for dynamic Bash argument lists. `set -e` has contextual exceptions; it is not comprehensive error handling. `pipefail` exposes some pipeline failures but is not POSIX. Traps can clean temporary resources, provided cleanup does not obscure the original status.

## Production example

A backup script passes an unquoted path containing spaces to a tool, creating multiple arguments. The corrected script quotes paths, validates required variables, checks the command status and writes into a temporary destination before publishing success. Tests cover missing input and failed uploads.

## Trade-offs

Shell excels at short command orchestration. Complex parsing, branching and retries become harder to maintain than equivalent Go or Python code.

## Failure modes / pitfalls

`eval`, unsafe command substitution, newline-containing filenames and logs exposing credentials are common risks. Bash syntax run under `/bin/sh` can fail only in CI.

## When to use it

Use shell for small, well-bounded workflows around reliable command-line tools.

## When not to use it

Move complicated data processing or recovery logic into a language with clearer types and error handling.

## What a Senior Engineer should know

Understand quoting, expansion, pipeline status and portability; use ShellCheck and explicit failure paths.

## What a Staff Engineer should understand

Standardize interpreters and command contracts so automation behaves predictably across developer and CI environments.

Further reading: [Bash manual](https://www.gnu.org/software/bash/manual/bash.html), [ShellCheck](https://www.shellcheck.net/).
