---
title: "TCP and connection lifecycle"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

TCP is a reliable, ordered byte-stream transport protocol used underneath much of backend communication, including HTTP/1.1, HTTP/2, PostgreSQL and Redis connections. It hides packet loss and reordering from applications, but it does not make networks instantaneous or failure-free.

Understanding TCP means understanding the lifecycle and cost of connections rather than memorizing packet fields.

## Why it matters for backend engineers

Many apparent application problems are actually connection problems: intermittent resets, connection-pool exhaustion, latency after deployments, idle connections closed by load balancers, ephemeral-port exhaustion or excessive connection establishment.

A backend engineer who understands TCP can reason about why connection reuse matters, why a timeout does not prove that work failed, and why network latency affects throughput even when CPU is idle.

## How it works

A client normally establishes a TCP connection through a handshake. TCP then assigns sequence numbers to bytes, acknowledges received data, retransmits missing data and controls how much data can be in flight.

Flow control prevents a sender from overwhelming a receiver. Congestion control attempts to avoid overwhelming the network. Closing a connection also has protocol state; sockets can remain in states such as TIME_WAIT after application work is finished.

Applications usually reuse TCP connections because repeatedly creating connections adds round trips, kernel work and, when TLS is involved, cryptographic negotiation.

## Key concepts

### Reliable ordered stream
TCP delivers bytes in order or reports failure. Applications must provide their own message framing.

### Retransmission
Lost packets can be resent. This provides reliability but can increase tail latency.

### Flow control
The receiver advertises how much data it can accept.

### Congestion control
The sender adapts transmission to network conditions rather than transmitting without bounds.

### Keepalive and idle timeout
TCP keepalive, application heartbeats and infrastructure idle timeouts are different mechanisms. Their configuration must be compatible.

### Connection reuse
Pooling and persistent connections amortize setup cost and reduce socket churn.

### TIME_WAIT
Closed connections can temporarily retain kernel state to prevent old packets from being confused with new connections.

## Production example

A Go service calls another internal service through an L7 load balancer. After a deployment, errors such as connection reset by peer increase.

The application creates a new HTTP client with a new transport for every request, preventing effective connection reuse. Creating only a new client can still share Go's default transport; it is the repeated creation of independent transports that fragments the pool. The load balancer also has an idle timeout shorter than the client's assumptions.

Using a shared HTTP client and transport, configuring sensible idle-connection settings, and aligning timeouts reduces connection churn and removes many resets. Metrics on connection creation and request phases make the diagnosis visible.

## Trade-offs

Long-lived connections reduce handshake cost but consume resources and can become stale. Very large pools can overwhelm downstream systems. Very small pools create queueing. Aggressive keepalives detect failures sooner but add traffic.

TCP provides reliability, but head-of-line behavior and connection state have consequences that higher-level protocols must account for.

## Failure modes / pitfalls

Typical problems include leaking response bodies or sockets, creating independent transports per request, pool exhaustion, stale pooled connections, mismatched idle timeouts, connection storms during autoscaling, SYN backlog pressure and assuming a socket write means the remote application committed the operation.

Another pitfall is diagnosing only average latency. Retransmission and network congestion often appear in tail latency.

## When to use it

TCP is appropriate for reliable bidirectional byte streams and is the transport behind most conventional backend protocols.

The engineering lesson is usually not choosing TCP directly, but understanding the TCP behavior of the protocol or client library you already use.

## When not to use it

Do not build custom application protocols over raw TCP when HTTP, gRPC or another established protocol solves the problem. Also recognize protocols built on QUIC/UDP, such as HTTP/3, where TCP-specific assumptions no longer apply.

## What a Senior Engineer should know

A Senior Engineer should understand connection establishment, reuse, retransmission, flow control, common socket states, idle timeouts and the relationship between client pools and downstream capacity.

They should be able to diagnose connection resets and distinguish connect timeout, request timeout and application processing timeout.

## What a Staff Engineer should understand

A Staff Engineer should reason about connection behavior across proxies, service meshes, NAT, load balancers and multi-region paths. They should understand how fleet-wide connection behavior affects downstream capacity and how deployment or failover can create synchronized connection storms.

They should establish sane transport defaults so every team does not rediscover the same networking failures.
