---
title: "HTTP"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

HTTP defines request and response semantics for resources and representations. HTTP/1.1, HTTP/2 and HTTP/3 change transport behavior while preserving much of this application model.

## Why it matters for backend engineers

Method semantics, cache headers and status codes affect retries and intermediaries. A syntactically valid endpoint can still violate client expectations or disclose private content through caching.

## How it works

Clients send a method, target, headers and optional content. Servers return a status and representation metadata. HTTP/1.1 commonly reuses TCP connections; HTTP/2 multiplexes streams over TCP; HTTP/3 uses QUIC streams. Multiplexing does not remove application limits or every source of head-of-line delay.

## Key concepts

Safe methods request no intended state change; idempotent methods tolerate repetition by defined semantics. `ETag` and conditional requests support validation or concurrency checks. Cache freshness differs from validation. Content negotiation and compression affect representations and resource usage.

## Production example

A document API returns an ETag. A client edits using `If-Match`; if another editor changed the document, the server rejects the stale update rather than overwriting it. Private representations use deliberate cache directives, and proxy behavior is tested with authenticated requests.

## Trade-offs

HTTP offers broad interoperability. Rich semantics require disciplined implementation, and multiple proxies can complicate timeout and caching behavior.

## Failure modes / pitfalls

State-changing GETs, retries of non-idempotent POSTs, missing body limits, leaked response bodies and trusting forwarded headers are recurring failures.

## When to use it

Use HTTP for interoperable APIs and resource retrieval with explicit semantics.

## When not to use it

Do not invent status meanings incompatible with standard clients or assume transport success establishes a completed business operation.

## What a Senior Engineer should know

Understand methods, status classes, conditional requests, caching and connection reuse.

## What a Staff Engineer should understand

Set API and intermediary policies that preserve security, compatibility and end-to-end budgets.

Further reading: [RFC 9110 HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9111 caching](https://www.rfc-editor.org/rfc/rfc9111).
