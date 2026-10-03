---
title: "Delve"
ring: trial
segment: tools
tags: [backend]
---

## What it is

Delve is a debugger for Go programs. It can launch or attach to a process, set breakpoints, inspect variables and call stacks, step through code, and inspect goroutines.

Unlike profiling, which answers statistical performance questions, a debugger pauses or controls one execution. It is most useful when a deterministic reproduction reaches an unexpected branch or state.

## Why it matters for backend engineers

Adding log statements for every hypothesis is slow when a bug is reproducible locally. Delve lets an engineer stop at the exact failing condition and inspect the runtime values that produced it.

Go-specific goroutine awareness also helps when multiple goroutines participate in the control flow. However, pausing execution changes timing, so Delve is not proof that concurrent code is race-free.

## How it works

Delve uses platform debug facilities to control a compiled Go program. Breakpoints stop at selected functions or source locations. Conditional breakpoints stop only when an expression is true, reducing noise in loops or repeated tests.

Optimizing compilers inline functions, eliminate variables, and move code. Local debug builds commonly use compiler flags that disable optimization and inlining for easier inspection. A production binary may therefore expose less convenient variable/state information.

Stepping operations advance through source/instruction execution under debugger control. Goroutine commands allow switching the inspected goroutine and viewing stacks.

Attaching requires OS permissions and can pause the target. Remote debugging opens another powerful access path and must be authenticated, restricted, and removed when not needed.

## Key concepts

**Breakpoint.** Stops execution at a location. Conditional breakpoints narrow large reproductions.

**Optimized binary.** Variables may be unavailable or source stepping may appear surprising because the compiler transformed code.

**Goroutine versus OS thread.** Delve lets engineers inspect Go concurrency at the goroutine level rather than reason only about native threads.

**Watch/evaluation.** Inspecting values is usually safer than invoking arbitrary functions whose evaluation may have side effects.

**Core dump/offline debugging.** In some environments, a crash artifact and matching binary can support investigation without attaching to a live service.

## Production example

A parser test fails only for one malformed payload. Logs show “index out of range” but not which earlier branch constructed the incorrect slice.

The engineer reproduces the failure in a focused test and starts Delve with optimization disabled. A conditional breakpoint stops when the parsed length field is zero. Inspection shows that one helper re-slices a shared buffer before another offset is calculated, so the later offset refers to the wrong view.

The engineer fixes the boundary calculation and adds a regression test containing the exact malformed shape. Then the test runs under normal optimized compilation and the normal race/fuzz test suite where applicable.

The debugger is removed from the equation once the mechanism is understood; the permanent evidence is the regression test, not a sequence of interactive steps.

## Trade-offs

Interactive debugging provides exact local state and control flow but is intrusive and difficult to automate.

Logs, traces, and profiles are usually better for live production because they observe without stopping the process. Debuggers excel when a failing test can reproduce the issue.

## Failure modes / pitfalls

Attaching to a production process can pause it long enough to trigger health-check failure or violate latency objectives. Debugger output can expose sensitive values.

Stepping through concurrent code changes scheduling and can hide races. Debug builds also differ from optimized production binaries, so the fix must be validated under normal build settings.

## When to use it

Use Delve for deterministic local failures, focused integration tests, and controlled offline investigation where inspecting exact variables/control flow is valuable.

Prefer a minimal reproduction that reaches the bug quickly.

## When not to use it

Do not attach casually to busy production processes. Do not use debugger timing to reason about race correctness.

For CPU, memory, or scheduling questions, choose pprof, runtime tracing, or the race detector instead.

## What a Senior Engineer should know

A Senior Engineer should set conditional breakpoints, inspect goroutines/stacks, understand optimization effects, and convert debugger findings into repeatable tests.

They should know the operational risk of attach/remote-debug modes.

## What a Staff Engineer should understand

A Staff Engineer should establish safe debugging access and artifacts, with strong preference for reproducible tests over permanent production debugger dependence.

They should make the diagnostic toolchain available without creating uncontrolled remote execution/debug surfaces.

Further reading: [Delve documentation](https://github.com/go-delve/delve/tree/master/Documentation).
