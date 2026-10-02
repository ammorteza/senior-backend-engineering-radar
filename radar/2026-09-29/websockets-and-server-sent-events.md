---
title: "WebSockets and Server-Sent Events"
ring: trial
segment: languages-and-frameworks
tags: [backend]
---

## What it is

WebSockets provide bidirectional message exchange over a long-lived connection. Server-Sent Events (SSE) deliver a server-to-client event stream using HTTP and a text event format.

## Why it matters for backend engineers

Live status updates avoid constant polling, but every connected client consumes resources. Slow readers and reconnections need design rather than an indefinitely growing per-client buffer.

## How it works

WebSocket peers exchange framed messages after establishing a connection. SSE sends `text/event-stream` records and supports event IDs and browser reconnection behavior. Applications define heartbeat, authentication and replay policy. Proxy buffering and idle timeouts can interrupt either approach.

## Key concepts

SSE is one-way and text-based; WebSockets support two-way and binary messages. An event ID helps resume only if the server retains replayable history. Connection authentication may need renewal. Per-client buffer limits determine slow-consumer handling.

## Production example

A report dashboard uses SSE because clients only need progress updates. It supplies event IDs and retains recent progress transitions. On reconnect the server replays missed updates or sends a fresh snapshot when history expired. Slow clients are disconnected before buffers exhaust service memory.

## Trade-offs

Persistent streams reduce polling overhead and update latency. They complicate load balancing, deployments and capacity compared with short requests.

## Failure modes / pitfalls

Missing heartbeats, disabled authentication checks after connection, proxy buffering and assuming reconnect guarantees delivery produce stale interfaces or leaks.

## When to use it

Use SSE for server-driven updates; use WebSockets when true bidirectional messaging is required.

## When not to use it

Simple occasional updates may be easier with polling. Neither protocol alone supplies durable messaging semantics.

## What a Senior Engineer should know

Design reconnect, bounded buffering, heartbeat and graceful shutdown behavior.

## What a Staff Engineer should understand

Budget concurrent connections and define delivery/freshness guarantees across regions and deployments.

Further reading: [WebSocket RFC 6455](https://www.rfc-editor.org/rfc/rfc6455), [HTML server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html).
