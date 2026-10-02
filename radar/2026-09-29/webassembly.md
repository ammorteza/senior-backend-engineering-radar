---
title: "WebAssembly"
ring: assess
segment: languages-and-frameworks
tags: [backend]
---

## What it is

WebAssembly (Wasm) is a portable binary instruction format executed by a runtime. Server-side use includes plugins and sandboxed extensions whose access to host capabilities can be restricted.

## Why it matters for backend engineers

Running customer code inside a service requires a clear execution boundary. Wasm can help, but host functions and resource budgets determine what a module can actually do.

## How it works

A runtime validates and compiles or interprets a module. Linear memory and defined imports constrain access; the host deliberately supplies capabilities such as file or network operations. WASI defines system interfaces, with support varying by runtime and version. Sandboxing still depends on runtime correctness and safe host integrations.

## Key concepts

Fuel or execution-time controls bound CPU where supported. Memory limits constrain linear memory. Host calls can escape resource assumptions if unbounded. ABI and component-interface versions affect portability beyond the core instruction format.

## Production example

A rules service loads a customer-supplied module to transform records. It supplies only approved host functions, limits execution and memory, and validates output. A malicious infinite loop is interrupted under the runtime's supported budget; the host does not expose filesystem or cloud credentials.

## Trade-offs

Portability and capability control support extension systems. Runtime overhead, debugging and ecosystem compatibility may make native trusted code simpler.

## Failure modes / pitfalls

Unrestricted imports, missing time budgets and assuming all runtimes implement the same WASI capabilities weaken the boundary.

## When to use it

Assess Wasm for untrusted plugins or portable extensions with deliberately narrow host APIs.

## When not to use it

Do not replace an ordinary trusted service merely to use a new runtime format.

## What a Senior Engineer should know

Understand module imports, memory and execution limits for the selected runtime.

## What a Staff Engineer should understand

Evaluate runtime security, interface lifecycle and tenancy isolation under hostile workloads.

Further reading: [WebAssembly documentation](https://webassembly.org/), [WASI](https://wasi.dev/).
