---
title: "gRPC"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

gRPC defines typed remote procedure calls using generated client/server interfaces, commonly from Protobuf, over HTTP/2. It supports unary calls and several streaming forms.

## Why it matters for backend engineers

Generated methods feel local but retain network failure and uncertain completion. Missing deadlines can leave work running long after a caller has abandoned the request.

## How it works

A client serializes a request and sends it through a channel; the server dispatches to a handler and returns a status plus response. Streams exchange multiple messages with flow control. Metadata carries authentication and tracing. Deadlines propagate remaining time where supported, while cancellation must be observed by handlers and downstream operations.

## Key concepts

Status codes distinguish invalid input, unavailable service and deadline expiry. Interceptors implement cross-cutting behavior. Message-size limits and streaming backpressure bound resources. Schema compatibility still matters despite code generation.

## Production example

A document conversion RPC streams chunks. The server stops processing when the client cancels and bounds buffered chunks while output is slow. A deadline-expired result leaves the caller uncertain about any already-committed artifact, so a stable operation ID supports status lookup instead of blind duplication.

## Trade-offs

Typed contracts and streaming improve internal integration. Browser and public ecosystem support may require adapters; HTTP/2 proxies and generated code add operational considerations.

## Failure modes / pitfalls

Unbounded streams, retrying mutation RPCs without identity, ignoring cancellation and logging only transport errors obscure failures.

## When to use it

Use gRPC for controlled typed service communication or streaming where client support is appropriate.

## When not to use it

Prefer ordinary HTTP APIs when broad external interoperability and simple tooling matter more.

## What a Senior Engineer should know

Set deadlines, status semantics, limits and cancellation behavior; evolve Protobuf safely.

## What a Staff Engineer should understand

Own shared client conventions and proxy compatibility across the call graph.

Further reading: [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/).
