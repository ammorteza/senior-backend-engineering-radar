---
title: "Bash / shell scripting"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Shell scripting composes existing programs through arguments, environment variables, exit statuses, pipes, redirection, and filesystem operations. Bash adds arrays and richer syntax beyond the POSIX shell language.

Shell is excellent glue for small workflows. It becomes dangerous when engineers forget that the shell performs expansions before commands receive their arguments.

## Why it matters for backend engineers

Deployment hooks, CI jobs, backups, database maintenance, and container entrypoints frequently use shell. A quoting mistake can transform one filename into several arguments; an ignored pipeline failure can publish an incomplete artifact.

Because shell scripts often run with broad CI or operational permissions, small mistakes can have large blast radius.

## How it works

The shell parses syntax, performs expansions, redirections, command substitution, globbing, and word splitting, then launches commands.

Quoted expansions such as `"$file"` preserve one argument even when the value contains spaces or wildcard characters. Unquoted `$file` may split and glob depending on shell settings.

Pipelines connect stdout of one process to stdin of the next. By default, many shells report the pipeline's status from the final command only. Bash's `set -o pipefail` makes an earlier failing stage influence the pipeline status.

`set -e` is not universal exception handling. Its behavior has contextual exceptions around conditions, pipelines, subshells, and command lists. Explicit status checks remain important around operations where failure changes safety.

Separate processes cannot modify the parent shell's working directory or environment. `cd` in a subprocess exits with that subprocess.

## Key concepts

**Quoting.** Quote variable expansions unless deliberate splitting or globbing is required.

**Arrays.** In Bash, arrays are the safe way to construct a dynamic command argument list.

**Exit status.** Commands conventionally return zero for success and non-zero for failure, but scripts must decide which failures are expected or fatal.

**Traps.** `trap` can clean temporary directories or restore state. Cleanup should preserve the original failure status.

**Shell dialect.** A script using Bash arrays or `[[ ... ]]` should run under Bash, not assume `/bin/sh` provides Bash semantics.

**Temporary files.** Use safe creation mechanisms and publish results atomically where possible rather than writing directly to final paths.

## Production example

A backup script receives a destination path from configuration and passes it unquoted to a CLI. One customer configures a path containing spaces, so the shell creates multiple arguments and the upload lands in the wrong destination.

The corrected script validates required variables, quotes every path, and uses a temporary output that is verified before publication. For an important pipeline, the script enables Bash `pipefail` deliberately and checks the command result.

Secrets are passed through supported credential mechanisms rather than echoed in debug logs. Tests cover paths with spaces, missing environment variables, upload failure, and cleanup after interruption. ShellCheck runs in CI.

## Trade-offs

Shell is concise when most work already exists as reliable command-line tools. Process orchestration, redirection, and simple conditionals are often clearer than writing a custom program.

Complex parsing, nested retries, structured data, concurrency, and recovery quickly become difficult to reason about. At that point Go or Python usually provides clearer types, tests, and error handling.

## Failure modes / pitfalls

Unquoted expansions, `eval`, shell injection, word splitting, glob expansion, and newline-containing filenames can produce surprising behavior.

`set -e` can create false confidence; `set -x` can leak secrets. A script tested under Bash can fail in CI if executed by `/bin/sh`.

Pipelines can hide failures, and cleanup traps can overwrite the original exit status if written carelessly.

## When to use it

Use shell for small, bounded workflows that orchestrate existing CLI tools, especially repository tasks, container entrypoints, and CI glue.

Keep inputs controlled, quote aggressively, and fail explicitly around important side effects.

## When not to use it

Move to a general-purpose language when the script implements complex business logic, structured parsing, long-lived retries, concurrency, or nontrivial recovery.

Do not use shell string construction where an API or library avoids command-injection ambiguity.

## What a Senior Engineer should know

A Senior Engineer should understand expansion order, quoting, arrays, pipeline status, traps, subshells, and portability.

They should use ShellCheck, write failure-path tests, and know exactly which shell interprets production scripts.

## What a Staff Engineer should understand

A Staff Engineer should standardize shell interpreters and operational command contracts across repositories, reduce privileged ad hoc scripts, and provide safer libraries or tools for complex workflows.

They should treat CI and deployment shell code as production code with review, testing, and secret-handling requirements.

Further reading: [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html), [ShellCheck](https://www.shellcheck.net/).
