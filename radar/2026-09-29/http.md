---
title: "HTTP"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

HTTP is a stateless application-level protocol whose core semantics are shared across HTTP/1.1, HTTP/2, and HTTP/3. A request identifies a target and method and carries headers plus optional content; a response returns a status, metadata, and optional representation.

The versions differ substantially in framing and transport. HTTP/1.1 uses a textual message format over connections commonly backed by TCP. HTTP/2 uses binary framing and multiplexed streams over one TCP connection. HTTP/3 maps HTTP semantics onto QUIC, avoiding TCP's connection-wide head-of-line blocking between independent HTTP streams.

## Why it matters for backend engineers

Backend APIs depend on HTTP semantics far beyond “GET versus POST.” Method safety and idempotency affect retries. Cache headers affect whether intermediaries can reuse private data. Conditional requests can prevent lost updates. Connection reuse and body handling affect latency and resource exhaustion.

A service can return correct JSON and still be a bad HTTP API if it changes state on a safe method, leaks authenticated responses through shared caching, or never closes client response bodies and eventually exhausts connections.

## How it works

A client sends a method such as `GET`, `POST`, `PUT`, or `DELETE` to a target URI. Headers describe representation preferences, authorization, conditional state, caching, and other metadata. The server interprets the method according to HTTP semantics and returns a status code plus representation metadata.

Safe methods such as `GET` and `HEAD` are defined as read-only in intended semantics. Idempotent methods can be repeated with the same intended effect, though logging, billing for network usage, or timestamps can still differ between executions. `POST` is not inherently idempotent, so retryable commands often need an application idempotency protocol.

HTTP caching separates freshness from validation. A fresh response can be reused without contacting the origin. A stale cached response can be revalidated using validators such as `ETag` and `If-None-Match`. Conditional writes can use `If-Match` to reject updates based on an older representation.

Connections are independent from requests at the semantic layer. HTTP/1.1 can reuse a connection sequentially or with limited pipelining semantics; HTTP/2 multiplexes streams; HTTP/3 multiplexes over QUIC. An application still needs request concurrency and resource limits because multiplexing can put many active streams on one connection.

## Key concepts

**Status classes.** 2xx reports successful handling, 3xx redirection, 4xx client-facing request problems, and 5xx server-side failures. The specific code should help clients decide whether to fix input, authenticate, retry, or stop.

**Conditional requests.** `ETag` plus `If-Match` supports optimistic concurrency. `If-None-Match` supports cache validation and conditional creation patterns under the endpoint's contract.

**Cacheability.** `Cache-Control` defines freshness and reuse constraints. Responses involving authorization or personalized data need deliberate shared-cache policy rather than assumptions.

**Content negotiation.** `Accept`, `Content-Type`, and related headers describe representation formats. Servers must validate what they consume rather than guess from payload bytes alone.

**Forwarded metadata.** When proxies supply host, scheme, or client address information, applications must trust only known proxy hops and their configured headers.

## Production example

A document service returns:

```http
GET /documents/42
200 OK
ETag: "v17"
Cache-Control: private, max-age=60
```

A client edits the document and submits:

```http
PUT /documents/42
If-Match: "v17"
Content-Type: application/json
```

Another editor has already committed version 18. The server compares the validator atomically with the update and rejects the stale write, for example with `412 Precondition Failed`, rather than silently overwriting the new content.

The team also tests caching through the real proxy chain. An authenticated document must not become a shared cache entry visible to another user. They verify `Vary` behavior for negotiated representations and ensure errors containing sensitive details are not cached unexpectedly.

On the client side, a Go worker reuses one `http.Client` and its transport, fully consumes or closes response bodies as appropriate, and sets a request deadline. A load test confirms connection reuse. Creating independent transports per request would fragment pools and cause unnecessary connection establishment.

## Trade-offs

HTTP offers exceptional interoperability, debugging tooling, and proxy support. Its flexibility also means teams can invent inconsistent conventions unless they standardize errors, pagination, and identity behavior.

HTTP/2 and HTTP/3 can improve connection efficiency and concurrency, but intermediaries, TLS termination, and backend support add operational complexity. The fastest transport does not fix an API that performs unbounded database work.

## Failure modes / pitfalls

State-changing `GET` requests can be triggered by crawlers, prefetchers, or caches. Retrying non-idempotent commands without operation identity can duplicate effects. Missing request-body limits permit memory or disk exhaustion.

Not consuming or closing client response bodies can prevent connection reuse. Trusting arbitrary `X-Forwarded-For` or host headers can corrupt security decisions. Using a 200 response for every error forces clients to parse application text rather than rely on protocol semantics.

Cache configuration is another risk: a response can be semantically correct at the origin yet leak through an incorrectly shared cache.

## When to use it

Use HTTP when clients benefit from broad interoperability, standard infrastructure, cache semantics, and resource-oriented or command-oriented APIs that fit request/response communication.

It is a strong default for public and many internal APIs, especially when browser or generic tooling support matters.

## When not to use it

Do not force high-volume bidirectional streaming into repeated short polling if a streaming protocol fits better. Do not assume HTTP alone provides durable asynchronous delivery or workflow state.

Avoid inventing custom semantics that contradict standard methods and status codes when conventional behavior already expresses the requirement.

## What a Senior Engineer should know

A Senior Engineer should understand method safety/idempotency, conditional requests, caching, representation metadata, connection reuse, proxy trust, body limits, and end-to-end deadlines.

They should debug across application and transport layers: distinguish a cache hit, proxy timeout, connection setup problem, HTTP status failure, and completed request with an uncertain business outcome.

## What a Staff Engineer should understand

A Staff Engineer should define organization-wide HTTP conventions that improve compatibility without hiding domain behavior: errors, pagination, idempotency, cache policy, identity propagation, and timeout budgets.

They should evaluate protocol upgrades and proxy architecture based on measured workloads and failure modes, and ensure shared edge infrastructure does not silently weaken service-level security or reliability.

Further reading: [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111), [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114).
