---
title: "Connection pooling"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Connection pooling maintains a bounded set of reusable network connections to a dependency such as a database or HTTP service. It avoids repeatedly paying connection-establishment cost and, equally importantly, limits concurrency against the downstream system.

A pool is therefore both a performance optimization and a capacity-control mechanism.

## Why it matters for backend engineers

Poor pool configuration causes some of the most common backend incidents: database connection exhaustion, requests waiting indefinitely for a connection, connection storms after scaling and downstream overload.

Increasing the pool size is not automatically a fix. It can move queueing from the application into a database that is less able to handle it.

## How it works

A caller borrows an existing idle connection or opens a new one until the configured maximum is reached. When all usable connections are busy, additional work waits, times out or fails according to pool behavior.

Pools typically manage maximum open connections, idle connections, connection lifetime and idle lifetime. HTTP pools have related controls around idle and per-host connections.

Pool sizing should follow workload concurrency, dependency capacity and latency. Little's Law provides a useful mental model: concurrency is approximately throughput multiplied by time in the system.

## Key concepts

### Maximum open connections
The upper bound protects the downstream dependency and local resources.

### Idle connections
Keeping some connections ready reduces setup latency but consumes downstream connection slots.

### Connection lifetime
Recycling connections can help with infrastructure changes and server policies, but excessive churn creates overhead.

### Pool wait time
Time spent waiting for a connection is an important saturation signal.

### Fleet-wide capacity
A per-instance pool size must be multiplied by the maximum number of application instances.

## Production example

A service has a database maximum of 500 connections. Twenty pods each configure a pool of 50 connections, creating a theoretical demand of 1,000 connections.

During a traffic spike, autoscaling increases pod count and the database rejects connections. Instead of raising every pool, the team budgets connections across the fleet, reserves capacity for administration and migrations, monitors pool wait time and optimizes slow transactions that hold connections unnecessarily.

## Trade-offs

Larger pools reduce application-side waiting until the downstream saturates. After that point they increase contention and can worsen latency.

Smaller pools provide stronger backpressure but may limit throughput if configured below the dependency's safe capacity.

## Failure modes / pitfalls

Common mistakes include multiplying pool size incorrectly across replicas, holding a database connection while calling remote services, leaking rows or transactions, unlimited waits, excessive connection lifetime, creating pools repeatedly and using pool size to compensate for slow queries.

Autoscaling can create a feedback loop: latency rises, more pods start, more database connections appear, and the database becomes even slower.

## When to use it

Use bounded connection pools for dependencies where connection setup is expensive or the server has finite concurrent-connection capacity. Most database and HTTP clients already provide pooling and should be configured deliberately.

## When not to use it

Do not create application-level pools on top of clients that already pool without understanding the interaction. Do not assume pooling solves a fundamentally overloaded dependency.

## What a Senior Engineer should know

A Senior Engineer should size pools from concurrency and capacity, monitor active/idle/waiting connections, use acquisition timeouts and keep transactions short.

They should understand that a connection pool is a backpressure boundary.

## What a Staff Engineer should understand

A Staff Engineer should budget connections across services and autoscaling ranges, account for failover and maintenance, and understand proxies such as PgBouncer.

They should recognize systemic feedback loops between autoscaling, pools and databases and define organization-level defaults and observability.
