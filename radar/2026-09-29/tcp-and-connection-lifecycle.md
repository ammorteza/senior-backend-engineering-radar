---
title: "TCP and connection lifecycle"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

TCP is a reliable, ordered byte-stream transport used underneath many backend protocols, including HTTP/1.1, HTTP/2, PostgreSQL, Redis, and TLS. “Reliable” means TCP retransmits and reorders bytes while the connection remains viable; it does not mean a remote application completed an operation or that a network partition is detected immediately.

For application engineers, the most useful TCP knowledge concerns connection setup, reuse, failure detection, buffering, and close behavior rather than memorizing every header bit.

## Why it matters for backend engineers

Connection behavior frequently dominates production symptoms. Creating too many connections causes handshake and kernel overhead. Keeping connections indefinitely can leave clients using stale routes. Load balancers and NAT devices can close idle connections without an application knowing until its next write.

A timeout or reset is also ambiguous. The request may never have reached the server, or the server may have committed its effect and the response was lost. TCP cannot answer that business-level question.

## How it works

A TCP connection is identified by endpoint address/port pairs and begins with a handshake that establishes sequence state. TCP sends a byte stream split into segments, acknowledges received ranges, retransmits missing data, and delivers bytes to the receiving application in order.

**Flow control** protects the receiver: the receiver advertises how much additional data it can buffer. **Congestion control** protects the network by adapting how much unacknowledged data the sender puts in flight.

Applications need their own message framing because TCP exposes a stream, not message boundaries. One `Write` on the sender does not imply one `Read` on the receiver.

Connections close with protocol state. Active closers can remain in `TIME_WAIT` so delayed packets from an earlier connection are not confused with a new one using the same tuple. Large volumes of short-lived outbound connections can therefore consume ephemeral ports and kernel state.

Persistent clients reuse established connections. Pooling amortizes TCP and TLS handshakes, but pool lifetime, idle timeout, maximum size, and downstream capacity must be coordinated.

## Key concepts

**Connect timeout.** Bounds establishment of a new connection. It is different from an overall request deadline or read timeout.

**Retransmission.** Packet loss is often hidden from the application but appears as additional latency. Tail latency can rise while average CPU remains low.

**Keepalive versus application heartbeat.** TCP keepalive probes, protocol pings, and domain-level heartbeat messages serve different purposes and operate at different intervals.

**Idle timeout.** A load balancer or NAT may drop an idle mapping sooner than a client library retires it. The next reuse can fail and require reconnect.

**Half-close and reset.** Closing one direction, orderly FIN shutdown, and abrupt RST behavior are distinct. Applications usually consume these through higher-level library errors.

**Ephemeral ports.** Outbound connections use local ephemeral ports. Rapid connection churn to the same destination can exhaust available tuples before old state expires.

## Production example

A Go service calls an internal HTTP dependency through an L7 load balancer. After scaling out, connection resets and connect latency increase. Application CPU and the dependency's request latency remain normal.

Metrics show thousands of new TCP connections per second. Code review reveals that each request constructs a new `http.Transport`. Creating a new `http.Client` alone does not necessarily fragment the pool if it shares `http.DefaultTransport`; the independent transports are the important problem.

The service creates one long-lived client/transport per intended upstream configuration and sets bounded idle and total connection behavior. It also discovers that the load balancer closes connections idle for five minutes while the client retains them much longer. Client idle retirement is adjusted so stale connections are less likely to be selected.

A load test measures connection establishment rate, request latency, resets, and open sockets. The team also performs a rolling deployment of the dependency to ensure pooled connections are replaced safely.

Finally, a mutating request is tested with a connection drop after the server commits but before the client reads the response. The client cannot infer rollback from `connection reset by peer`; it resolves the operation through its idempotency/status protocol.

## Trade-offs

Long-lived connections reduce handshake cost and ephemeral-port pressure, but consume file descriptors and downstream connection capacity. Very large pools move queuing into the downstream service; very small pools queue locally.

Aggressive keepalives and heartbeats detect dead peers sooner at the cost of traffic and battery/network usage. Reusing connections improves efficiency but can make load distribution less even for long-lived connections.

## Failure modes / pitfalls

Creating independent transports or database pools per request causes churn. Leaking response bodies or sockets prevents reuse. Mismatched idle timeouts create intermittent first-request failures on stale connections.

Connection storms after autoscaling or failover can overload NAT, TLS termination, or the downstream server even when steady-state traffic is safe. SYN backlog pressure can make new connections fail while existing ones continue.

Do not treat a successful socket write as evidence that the remote application committed, or a read timeout as evidence that it did not.

## When to use it

TCP is appropriate for reliable ordered streams and underlies most conventional backend client/server protocols. Engineers normally select a higher-level protocol and then need to understand how its library uses TCP.

Connection metrics belong in the diagnostic toolkit for HTTP, databases, caches, and RPC systems.

## When not to use it

Do not create a custom raw-TCP protocol when HTTP, gRPC, or another established protocol already provides framing, tooling, security integration, and compatibility.

Do not carry TCP-specific assumptions into QUIC-based protocols such as HTTP/3 without checking the different transport semantics.

## What a Senior Engineer should know

A Senior Engineer should understand establishment, reuse, flow control, retransmission, common close states, file descriptors, idle timeouts, and pool interactions.

They should distinguish DNS resolution, connect time, TLS handshake, server processing, and response transfer when diagnosing latency.

## What a Staff Engineer should understand

A Staff Engineer should reason about fleet-wide connections across proxies, NAT, meshes, load balancers, zones, and regions. They should model failover/redeployment connection storms and set platform defaults that preserve downstream capacity.

They should also ensure retry and idempotency designs acknowledge TCP's uncertain-completion boundary instead of treating transport errors as business results.

Further reading: [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293).
