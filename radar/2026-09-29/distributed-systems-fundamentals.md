---
title: "Distributed systems fundamentals"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A distributed system is a collection of independent processes or machines that cooperate over a network to provide a capability that users experience as one system. The defining difficulty is not simply that there are many machines; it is that communication is imperfect and components can fail independently.

In a single process, a function call either returns, blocks or crashes with the process. Across a network, a request can be delayed, duplicated, reordered, lost, processed even though the response is lost, or reach a dependency that fails halfway through its work. Distributed-systems engineering is therefore largely the discipline of reasoning about uncertainty.

## Why it matters for backend engineers

Modern backend systems routinely depend on databases, caches, queues, object stores, external APIs and other services. Even a modest service is therefore part of a distributed system.

This knowledge changes how you design APIs, retries, transactions, deployments and incident response. It helps you distinguish a local programming bug from a coordination problem and prevents assumptions such as "the request timed out, so nothing happened" or "the message broker delivered this only once."

## How it works

Distributed components communicate by exchanging messages. Each component has only partial knowledge of the overall system and learns about other components through messages that take nonzero and variable time to arrive.

Failures are consequently ambiguous. If service A calls service B and times out, A cannot infer whether B never received the request, received it but failed, completed it but lost the response, or is merely slow.

Systems manage this uncertainty using mechanisms such as timeouts, retries, idempotency, replication, quorum decisions, leases, durable logs and explicit consistency models. These mechanisms do not remove failure; they define what the system does when failure occurs.

## Key concepts

### Partial failure
One component can fail while the rest of the system remains healthy. Callers must decide how long to wait and how to degrade.

### Network partitions
Two healthy components may temporarily be unable to communicate. Designs must define which operations remain available and what consistency guarantees survive.

### Replication
Copies of data improve availability and read scalability but create synchronization, ordering and failover problems.

### Consistency
Consistency describes what different clients are allowed to observe. Strong consistency simplifies reasoning but may require coordination; eventual consistency permits temporary divergence.

### Time and ordering
Wall clocks are imperfect coordination mechanisms. Distributed systems often need sequence numbers, logical ordering, versions or consensus rather than assuming timestamps establish causality.

### Coordination
Some decisions require components to agree: electing a leader, assigning ownership or committing replicated state. Coordination improves correctness but costs latency and availability during some failures.

## Production example

Consider an order service that reserves inventory and then publishes an OrderConfirmed event. The database commit succeeds, but publishing to the broker times out.

Retrying blindly can create duplicate events. Not retrying can leave the order committed without notifying fulfillment.

A robust design can store the order and an outbox record in the same database transaction. A publisher later sends the event, possibly more than once. Consumers process it idempotently. This design accepts that communication can fail and moves correctness into durable state and explicit retry semantics.

## Trade-offs

Distributed systems trade simplicity for independent scaling, fault isolation, geographic distribution and organizational autonomy. Replication improves availability but creates consistency decisions. Asynchrony decouples components but introduces lag and harder debugging. Coordination provides stronger guarantees but adds latency and can reduce availability during partitions.

The right design minimizes distributed coordination rather than maximizing architectural sophistication.

## Failure modes / pitfalls

Common failures include retry storms, duplicate side effects, stale reads, split brain, unbounded queues, cascading failures, clock assumptions, lost events and overload after recovery.

A particularly dangerous pitfall is treating remote calls like local function calls. Remote operations need deadlines, observability, failure semantics and usually idempotency.

## When to use it

Distributed-systems principles apply whenever correctness depends on communication between independently failing components. Use the techniques deliberately when introducing service boundaries, replicated storage, messaging, multi-region operation or external dependencies.

## When not to use it

Do not introduce distribution merely for architectural fashion. If one process and one transactional database satisfy the requirements, a modular monolith can avoid many failure modes while retaining good internal boundaries.

## What a Senior Engineer should know

A Senior Engineer should reason comfortably about partial failure, timeouts, retries, idempotency, delivery semantics, replication lag, consistency and backpressure. They should design APIs and consumers so duplicate or delayed work does not corrupt state, and diagnose incidents without assuming the network is reliable.

They should also recognize where a database transaction ends and where distributed correctness begins.

## What a Staff Engineer should understand

A Staff Engineer should reason about guarantees across service and organizational boundaries. They should know where coordination is unavoidable, where it can be removed, and how architecture changes failure domains.

They should be able to challenge unnecessary distribution, choose consistency models from business invariants, design migration paths, and establish organization-wide patterns for reliability, ownership, observability and recovery.
