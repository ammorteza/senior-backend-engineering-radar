---
title: "Delve"
ring: trial
segment: tools
tags: [backend]
---

## What it is

Delve is a debugger for Go that inspects execution state: breakpoints, variables, call stacks and goroutines. It is particularly useful when a deterministic test reproduces a surprising control path.

## Why it matters for backend engineers

Logging guesses about state is slower than inspecting the actual branch and variable values. Go-specific goroutine awareness helps explain concurrent execution beyond a single OS thread.

## How it works

Delve launches or attaches to a process and controls execution through debug facilities. A breakpoint pauses the debugged program; stepping follows selected execution. Compiler optimizations can inline functions or remove variables, so debug builds commonly disable optimization and inlining. Production binaries may therefore offer less convenient inspection.

## Key concepts

Conditional breakpoints narrow a reproduction. Watch expressions inspect values without changing business code, but evaluated calls can have effects. Core-dump support depends on platform and binary details. Attaching requires permissions and may interrupt service availability.

## Production example

A parser test mishandles one malformed payload. A conditional breakpoint stops when the input length is zero, revealing that an earlier slice operation changes the expected buffer view. The engineer adds a focused regression test and fixes the boundary calculation, then reruns under normal compilation.

## Trade-offs

Interactive inspection is precise but intrusive. Profiles and logs usually suit live production better; debugging optimized or timing-sensitive code can alter the symptom.

## Failure modes / pitfalls

Pausing a production process can trigger health-check failures. Printing secrets leaks data. Stepping through a race may hide it; debugger behavior is not proof of concurrency safety.

## When to use it

Use Delve for local reproductions, failing tests and carefully controlled offline investigations.

## When not to use it

Avoid attaching casually to a busy production instance or relying on debugger timing for race diagnosis.

## What a Senior Engineer should know

Set breakpoints, inspect goroutines and account for optimization and permissions.

## What a Staff Engineer should understand

Define safe debugging access and prefer reproducible tests over permanent production debug dependencies.

Further reading: [Delve documentation](https://github.com/go-delve/delve/tree/master/Documentation).
