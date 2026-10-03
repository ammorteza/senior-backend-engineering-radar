---
title: "Connection pooling"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A connection pool maintains reusable connections to a dependency and limits how many operations can hold them concurrently. Reuse avoids repeated connection setup, authentication and encryption handshakes. The limit also provides a local admission boundary for a downstream system with finite capacity.

Pooling does not make the dependency faster. Once the database is saturated, increasing the number of simultaneous queries can increase contention and delay every caller. Pool configuration therefore belongs to capacity and latency design, not only client initialization.

## Why it matters for backend engineers

Many apparent database incidents begin before SQL executes. Requests may spend most of their time waiting for a pool slot, while query dashboards show ordinary execution times. Alternatively, each instance can look healthy while the combined fleet exhausts the database's connection limit.

Autoscaling magnifies the issue. More application instances create more pools, including during rolling-deployment surge. A limit that is safe for one pod says little about its safety across all services and replicas sharing the database.

## How it works

A caller requests a connection. The pool reuses an idle one, establishes a new one within its maximum, or waits when the usable maximum is reached. Driver and pool behavior determine how cancellation, failed connections and acquisition timeouts are handled.

The caller holds the connection while executing work. A transaction normally retains one connection until commit or rollback. Streaming query results may also keep a connection occupied until rows are consumed or closed. The service must release these resources on error and early-return paths, not just after success.

Idle limits control how many connections remain ready. Lifetime and idle-time settings retire connections to accommodate infrastructure policies and avoid excessive staleness, but short lifetimes can create expensive churn. Retirement does not replace correct handling of an unexpected disconnect.

In Go, `sql.DB` is a concurrency-safe pool handle, not one connection. Create a long-lived handle for the intended database configuration rather than opening a new pool for each request. Observe `DB.Stats()` together with server activity to distinguish local waiting from downstream work.

## Key concepts

**Acquisition versus execution time.** Measure waiting for a connection separately from executing SQL. A request deadline should bound the overall operation; verify that the chosen driver honors cancellation on the relevant paths.

**Fleet budget.** Multiply each pool maximum by the maximum number of simultaneous instances, including surge, workers and scheduled jobs. Reserve capacity for other services and operational access.

**Concurrency estimate.** Under stable conditions, average occupied connections are approximately acquisition throughput multiplied by average connection-hold time. Use consistent units and boundaries. This average does not determine tail-latency headroom or account for skew by itself.

**Connection proxy semantics.** A proxy can multiplex many client connections onto fewer server connections. Transaction pooling changes session-affinity assumptions; session state, temporary objects and prepared-statement support require checking the proxy's mode and version.

**HTTP pooling differs.** HTTP/2 can multiplex multiple streams over one connection. A connection count is therefore not necessarily a request-concurrency limit; do not transfer database sizing arithmetic blindly to HTTP clients.

## Production example

Assume a database permits 500 connections. Other services and operational reserve account for 200, leaving a budget of 300 for one API. The API may run 40 pods plus ten rollout-surge pods. A maximum of six connections per pod respects that worst-case budget: `50 × 6 = 300`.

This arithmetic is a ceiling, not proof that six is sufficient or that 300 simultaneous queries are safe. Load tests measure pool waiting and database saturation. If the API performs 1,000 database operations per second with an average connection-hold time of 20 ms, its average occupied-connection demand is approximately 20 across the fleet under those measured stable conditions. Bursts, uneven load and long transactions still need examination.

During a regression, the pool limit is reached even though SQL statements remain short. Traces reveal that code starts a transaction, queries a row, then calls a remote service before committing. The connection is held during the entire remote wait.

The team changes the workflow so external work occurs outside that transaction where the business invariant permits, or uses an explicit state transition and asynchronous workflow where it does not. They also close result sets on all exit paths. Pool wait falls because hold time decreases; raising the maximum would have hidden the defect and spent more database capacity.

A failover test confirms that broken connections are replaced and retries remain bounded. Requests that lose contact around commit require outcome-aware handling, not automatic repetition just because a new connection is available.

## Trade-offs

A larger pool can reduce local waiting when the downstream has spare capacity. Beyond that point, it moves the queue into the database and can worsen lock contention, memory demand and tail latency.

A smaller pool provides backpressure but can underutilize healthy capacity. Tune using representative concurrency and hold-time distributions, and preserve a fleet-level constraint. A proxy can improve connection efficiency but adds another component and may alter session behavior.

## Failure modes / pitfalls

Leaked rows or transactions can permanently occupy capacity. One code path holding a connection while waiting for another operation that also needs the pool can create application-level deadlock, especially with a small maximum.

Synchronized connection lifetimes can create reconnect bursts. Excessively short lifetimes waste handshakes, while relying on very long lifetimes cannot prevent infrastructure disconnects. A query timeout without an acquisition deadline leaves callers waiting too long before the query even begins.

Do not ignore deployment surge or failover concentration when budgeting. A fleet safe across two independent databases may exceed one database's capacity after a routing change.

## When to use it

Use the pooling provided by maintained database and HTTP clients, with deliberate limits and observability. Configure it before scaling application replicas, and revisit it when transaction duration or downstream topology changes.

For diagnosis, start by separating waiting, holding and executing. These correspond to different causes and prevent a pool-size change from becoming the default response to every latency incident.

## When not to use it

Do not add another pool around an already pooled client without understanding both queues. Do not assume that a high database connection limit means the database can execute that many expensive queries efficiently.

Avoid deriving one permanent pool size from request rate alone. The workload's actual connection-hold time, transaction mix and maximum fleet size are necessary inputs.

## What a Senior Engineer should know

A Senior Engineer should configure open, idle and lifetime limits; close rows and transactions reliably; and interpret active, idle and waiting metrics. They should identify whether a connection is doing useful SQL work or merely being retained by application control flow.

They should also understand proxy mode restrictions and test reconnect behavior. Pooling is part of request admission and failure recovery, not just performance tuning.

## What a Staff Engineer should understand

A Staff Engineer should budget connections across services, autoscaling policies and failover scenarios. Platform defaults should expose the assumptions and allow teams to diagnose saturation instead of hiding it behind a large universal maximum.

Coordinate capacity limits with workload priorities and deployment behavior. Prevent feedback loops where rising latency causes autoscaling, which creates more database contention and further increases latency.

Further reading: [Go connection management](https://go.dev/doc/database/manage-connections), [PgBouncer features and pooling modes](https://www.pgbouncer.org/features.html).
