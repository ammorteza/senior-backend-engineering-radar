---
title: "WebSockets and Server-Sent Events"
ring: trial
segment: languages-and-frameworks
tags: [backend]
---

## What it is

WebSockets and Server-Sent Events (SSE) are techniques for maintaining a long-lived connection so a server can deliver updates without repeated short polling.

WebSocket provides a bidirectional framed channel after an HTTP-based opening handshake, allowing both peers to send text or binary messages. SSE is a server-to-client stream carried as `text/event-stream` over HTTP. Browsers provide native SSE reconnection behavior and a `Last-Event-ID` mechanism.

Neither protocol is a durable message broker. A connection dropping says nothing about whether an application update was lost unless the application defines replay or snapshot behavior.

## Why it matters for backend engineers

Persistent connections change the capacity model. A service may have modest messages per second but hundreds of thousands of open sockets, each with memory, timers, authentication state, and proxy/load-balancer involvement.

Slow consumers are also dangerous. If the server keeps buffering updates for a client that cannot read fast enough, one connection can grow until process memory is exhausted. Reconnection storms during deployments or network failures can cause a second overload even when normal traffic is small.

## How it works

A WebSocket connection begins with an HTTP upgrade or an equivalent supported mechanism and then exchanges framed messages over the established connection. The application defines message types, correlation, authorization, and delivery/replay semantics.

SSE sends UTF-8 text events separated according to the event-stream format. Events can include `id`, `event`, `data`, and `retry` fields. A browser reconnect can send `Last-Event-ID` so the server knows which event the client last observed, but replay is possible only if the server retains a suitable event history.

Heartbeat traffic keeps idle connections visible to intermediaries and detects dead peers faster than waiting for operating-system timeouts. The exact heartbeat strategy should account for proxy idle timeouts and mobile/network cost.

Authentication is usually established when the connection opens, but long-lived connections outlive short access-token lifetimes. Decide whether to close and reauthenticate, support in-band credential refresh, or keep a shorter maximum connection age.

During deployment, servers should stop accepting new long-lived sessions, mark themselves unready, and allow a bounded drain period before closing remaining connections. Clients need reconnect backoff and jitter so thousands do not reconnect simultaneously.

## Key concepts

**Directionality.** SSE is server-to-client only. WebSocket supports two-way messaging. If clients only receive progress updates, bidirectional protocol complexity may add no value.

**Replay window.** Event IDs are useful only when the server can map an ID to retained updates or a state snapshot. Otherwise reconnect is simply a new stream.

**Slow consumer policy.** Bound per-client queued bytes/messages. Then choose whether to drop old transient updates, disconnect the client, or require it to fetch a fresh snapshot.

**Connection affinity.** Stateful per-connection data can complicate load balancing and failover. Prefer recoverable shared state or explicit reconnection semantics over assuming a client always returns to one instance.

**Backpressure.** TCP/QUIC flow control protects transport buffers, but application producers may still outpace a slow client. Bound work above the socket layer.

## Production example

A report dashboard only needs server-to-browser progress updates, so the team chooses SSE instead of WebSocket. Report state changes are also stored durably in a job table.

The service emits events with monotonic per-job sequence numbers and keeps a bounded recent history. On reconnect, the browser sends the last event ID. If that sequence is still retained, the server replays the missing transitions. If it is too old, the server sends or instructs the client to fetch the current job snapshot and then resumes live updates.

A browser tab is throttled in the background and stops reading quickly. The server's per-connection queue reaches its configured byte limit. Rather than allocate memory indefinitely, the service closes the connection; the client later reconnects and recovers from history or snapshot.

A deployment drains instances for a bounded period. Reconnect attempts use exponential backoff with jitter. Load testing opens the expected number of concurrent connections and then deliberately restarts a percentage of servers to measure reconnection peak, not just steady-state message throughput.

## Trade-offs

Persistent streams reduce polling latency and repeated request overhead. They increase connection-state management, deployment complexity, and sensitivity to proxy idle behavior.

SSE is simple and browser-friendly for one-way text events but does not provide client-to-server streaming or binary frames. WebSocket is more flexible, but flexibility means the application must define more protocol details itself.

## Failure modes / pitfalls

Unbounded per-client buffers cause memory incidents. Missing heartbeats leave half-open connections consuming resources. Assuming a reconnect replays missed data when no durable history exists silently loses updates.

Authenticating only once can keep revoked sessions alive longer than intended. Proxy buffering can make SSE appear stuck. Reconnecting every client immediately after a deployment can overload authentication, load balancers, and the streaming service.

Treating the socket as the authoritative workflow state also makes failover difficult; durable state should survive connection replacement.

## When to use it

Use SSE for server-driven browser updates such as job progress, notifications, or dashboards when one-way text events are sufficient.

Use WebSocket when the product genuinely needs low-latency bidirectional messaging or application-defined streaming over one persistent connection.

## When not to use it

Use normal request/response or polling for infrequent updates where simplicity outweighs latency. Do not use either protocol as a substitute for durable asynchronous messaging between backend services.

If every event must be retained and independently consumed by many services, a broker or log is usually the more appropriate system of record.

## What a Senior Engineer should know

A Senior Engineer should design authentication lifetime, heartbeat, bounded queues, replay/snapshot recovery, reconnect backoff, and graceful draining.

They should load-test concurrent connections and reconnection storms, not only messages per second, and understand how proxies and load balancers affect the stream.

## What a Staff Engineer should understand

A Staff Engineer should define organization-wide connection budgets, edge/proxy support, regional routing, and delivery/freshness expectations for persistent connections.

They should decide which state belongs in the connection and which must be durable, ensuring deployments and regional failures remain recoverable without relying on sticky sessions as a hidden correctness mechanism.

Further reading: [RFC 6455: WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455), [WHATWG Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html).
