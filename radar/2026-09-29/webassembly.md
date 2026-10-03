---
title: "WebAssembly"
ring: assess
segment: languages-and-frameworks
tags: [backend]
---

## What it is

WebAssembly (Wasm) is a portable binary instruction format executed by a Wasm runtime. Server-side systems use it for plugins, policy engines, extension functions, and isolated execution of code compiled from languages such as Rust, C/C++, and others.

Core WebAssembly provides computation and linear memory. Host capabilities such as filesystem, clocks, networking, and environment access are supplied explicitly by the runtime or system interface. That capability boundary is one reason Wasm is attractive for extension systems.

## Why it matters for backend engineers

Running third-party or customer-supplied code inside a backend creates a serious isolation problem. Native plugins can access the process address space and OS capabilities of the host.

Wasm can reduce that authority by exposing only selected imports and memory, but the sandbox is only as strong as the runtime and host functions. A host function that provides arbitrary filesystem or HTTP access can reintroduce the capabilities the sandbox was meant to remove.

## How it works

A runtime validates a Wasm module and compiles or interprets its instructions. Modules operate over one or more linear memories and call imported functions that the host makes available.

The host decides which functions exist: for example `read_config`, `emit_metric`, or `lookup_customer`. If no filesystem or network API is exposed, the module cannot simply call ordinary operating-system syscalls through the core Wasm abstraction.

WASI defines standardized system interfaces for Wasm outside the browser. WASI continues to evolve, and runtime support for versions and proposals differs. Production designs should pin the runtime and interface version they actually use.

Runtimes can expose execution limits such as fuel, epoch interruption, timeouts, or memory caps depending on implementation. Those controls protect the host from infinite loops or excessive resource use.

Data crossing the host-module boundary needs a stable ABI or component/interface model. Core binary portability does not make application-level interfaces magically compatible.

## Key concepts

**Linear memory.** Module-accessible byte-addressed memory isolated from the host process's ordinary address space under the runtime model.

**Imports and exports.** Explicit functions, memories, or values crossing the module boundary.

**WASI.** Standardized system-interface effort for capabilities such as files and clocks; support varies by runtime and proposal maturity.

**Fuel or interruption.** Runtime-specific mechanism for bounding execution so an infinite loop does not monopolize CPU indefinitely.

**Memory limit.** Protects host capacity; include host-side allocations made on behalf of a module.

**Capability host API.** Narrow host functions should expose business capabilities rather than general OS power where possible.

## Production example

A data platform lets customers upload a transformation plugin that receives one JSON record and returns another.

Each plugin runs in a fresh or pooled Wasm instance under a memory cap and execution budget. The host exposes only:
- read-only access to a small configuration object;
- a bounded logging function;
- no filesystem;
- no arbitrary network;
- no cloud credentials.

A malicious plugin contains an infinite loop. The runtime's execution-budget mechanism interrupts it and marks the record transformation failed without blocking a worker indefinitely.

Another plugin allocates memory continuously. The instance reaches its configured memory limit and is terminated.

Output is size-limited and schema-validated before being accepted. The team fuzzes host functions and tests malformed modules because sandbox safety depends on runtime and embedding code, not only the Wasm format.

If a later feature needs HTTP lookup, the host exposes a narrow `lookup_reference(id)` capability rather than unrestricted outbound sockets.

## Trade-offs

Wasm provides portable plugins and a narrower capability surface than native in-process extensions. Runtime invocation, compilation, serialization, and debugging add overhead.

A strong sandbox with few host calls is easier to reason about but limits plugin usefulness. Broader WASI access increases compatibility while expanding the attack surface.

Native trusted code is usually simpler and faster when isolation and third-party portability are not requirements.

## Failure modes / pitfalls

Assuming every Wasm runtime implements the same WASI version or limits is incorrect. Unbounded host calls can bypass module CPU or memory controls.

Granting broad filesystem directories or network access undermines capability isolation. Host functions must validate pointers, lengths, output size, and authorization carefully.

A runtime vulnerability can escape the intended sandbox; keep runtimes patched and consider stronger process or VM isolation for highly hostile multitenancy.

## When to use it

Assess Wasm for plugins, policy extensions, edge functions, or customer-supplied logic where portability and a narrow host capability model are valuable.

Benchmark the actual runtime and interface overhead for the workload.

## When not to use it

Do not convert ordinary trusted services to Wasm merely to use a new execution format.

If the threat model requires strong isolation from hostile code, evaluate whether Wasm alone is sufficient or should run inside an additional process or VM boundary.

## What a Senior Engineer should know

A Senior Engineer should understand module imports and exports, linear memory, WASI/runtime versioning, execution and memory limits, and host capability design.

They should test infinite loops, oversized allocations, malformed modules, and host-function validation.

## What a Staff Engineer should understand

A Staff Engineer should choose runtime and isolation layers, define ABI or component lifecycle, manage patches, and set tenancy/resource policies for untrusted extension workloads.

They should make the security boundary explicit rather than treating “runs in Wasm” as a complete sandbox claim.

Further reading: [WebAssembly](https://webassembly.org/), [WASI](https://wasi.dev/).
