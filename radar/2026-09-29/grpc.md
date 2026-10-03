---
title: "gRPC"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

gRPC is a remote-procedure-call framework built around service definitions and generated client/server bindings, commonly using Protocol Buffers. A service declares methods and message types; generated code handles serialization and transport integration.

It supports unary RPCs plus server-streaming, client-streaming, and bidirectional-streaming calls. The generated method may look like a local function, but it still crosses a network and therefore has latency, partial failure, cancellation, and uncertain-completion semantics.

## Why it matters for backend engineers

Strongly typed contracts reduce integration mistakes and make internal APIs discoverable. Streaming can efficiently carry long-lived or incremental data.

The danger is abstraction leakage in the opposite direction: developers may see a generated method and forget that a timeout after sending a request does not prove the server did nothing. Missing deadlines can leave work consuming resources long after the caller no longer cares.

## How it works

A `.proto` service definition declares RPC methods and messages. Code generation creates language-specific clients and servers. A client call is sent through a channel and transported using HTTP/2 in conventional gRPC deployments. Metadata carries information such as authentication and tracing context.

A deadline tells the system how long the caller is willing to wait. Servers can observe deadline or cancellation state and should stop work that is no longer useful when it is safe to do so. Downstream calls should receive an appropriately reduced deadline rather than starting a new full timeout at every hop.

Streaming methods maintain flow control, but applications can still buffer too much data above the transport. A slow consumer must not cause an unbounded application queue. Message-size limits, per-stream concurrency, and bounded internal buffers remain necessary.

Status codes are part of the API contract. `INVALID_ARGUMENT` describes a caller problem; `UNAVAILABLE` commonly represents transient service unavailability; `DEADLINE_EXCEEDED` says the caller's deadline elapsed, not that the server definitely performed no effect.

Retries can be configured in supported clients and service configurations. Retrying mutating RPCs is safe only when the operation itself has duplicate-safe semantics. The transport cannot infer whether creating a payment twice is acceptable.

## Key concepts

**Deadline propagation.** A request chain should consume one end-to-end budget. Each hop needs enough remaining time to perform useful work and return its result.

**Cancellation.** Cancellation is cooperative. A handler that ignores context cancellation may continue CPU work, database queries, or remote calls after the client has gone away.

**Unary versus streaming.** Streaming reduces repeated setup and supports incremental exchange, but introduces long-lived resource ownership, slow-consumer handling, and deployment/drain concerns.

**Status versus domain result.** A successful transport status can carry a domain-level rejection, but common client behavior is easier when transport/status semantics are used consistently.

**Interceptors.** Client and server interceptors can implement cross-cutting telemetry, authentication, or policy. They should not silently alter business semantics or create hidden retry multiplication.

## Production example

A document-conversion service accepts a large input stream and emits converted chunks. The first implementation reads all input into memory before starting conversion. A few large documents exhaust the process despite HTTP/2 flow control because the application buffers above the transport.

The team changes the pipeline to process bounded chunks, limits total document size, and stops reading when the handler context is cancelled. It also applies a conversion deadline and forwards the remaining budget to an OCR dependency.

A client submits a conversion that creates a durable artifact, but its deadline expires before the final response arrives. Blindly calling `Convert` again could create another artifact. The API therefore accepts a stable operation ID and exposes `GetConversionStatus`. A retry with the same identity resolves to the existing operation.

Tests include client cancellation while the server is blocked on output, oversized messages, an unavailable downstream dependency, a deadline expiring after the artifact commit, and graceful server shutdown with active streams.

## Trade-offs

Generated types and streaming improve developer productivity and efficiency for controlled service-to-service communication. They add code generation, Protobuf lifecycle management, HTTP/2 infrastructure requirements, and sometimes more difficult ad hoc debugging than plain JSON/HTTP.

Long-lived streams reduce connection churn but hold resources through deployments and failures. A simple unary API may be easier when updates are infrequent.

## Failure modes / pitfalls

No deadline means abandoned work can live until another limit stops it. Retrying a mutation after `UNAVAILABLE` without operation identity can duplicate effects. Treating `DEADLINE_EXCEEDED` as proof of rollback creates incorrect recovery.

Unbounded send/receive buffers defeat transport flow control. Ignoring cancellation leaks CPU and connections. Returning `INTERNAL` for every domain or validation error prevents clients from handling expected conditions correctly.

Schema evolution can also break clients even though gRPC itself remains healthy; generated code does not remove Protobuf compatibility rules.

## When to use it

Use gRPC for typed internal APIs, high-throughput RPC, and streaming when both sides are controlled and the infrastructure supports HTTP/2 well.

It is particularly useful when shared schemas and generated clients reduce repeated hand-written integration code across several languages.

## When not to use it

Prefer ordinary HTTP/JSON for public ecosystems where browser support, generic tooling, human inspection, and loose client coupling dominate.

Do not choose streaming merely because it is available; infrequent state updates may be simpler with polling or server-sent events.

## What a Senior Engineer should know

A Senior Engineer should define deadlines, cancellation, status codes, size limits, streaming backpressure, idempotent retry behavior, and Protobuf compatibility.

They should be able to diagnose whether latency comes from channel setup, queueing, server work, a downstream call, or a slow streaming peer.

## What a Staff Engineer should understand

A Staff Engineer should define shared client defaults, deadline budgets, proxy/load-balancer compatibility, and service evolution practices across the call graph.

They should also prevent organization-wide retry amplification and decide where streaming is an architectural benefit versus a long-lived operational burden.

Further reading: [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [gRPC deadlines](https://grpc.io/docs/guides/deadlines/), [gRPC retry](https://grpc.io/docs/guides/retry/).
