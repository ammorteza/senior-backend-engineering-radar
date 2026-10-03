---
title: "Rate limiting and backpressure"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Rate limiting controls how much new work a caller or workload may introduce over time. Backpressure is the broader feedback by which downstream capacity constrains upstream production so work does not accumulate without bound.

The two are related but different. A token bucket can cap request rate even when the service is healthy; a bounded queue or flow-control signal applies backpressure when actual processing cannot keep up.

## Why it matters for backend engineers

Traffic spikes, hot tenants, slow dependencies, and backlog recovery can all make incoming work exceed sustainable capacity. If the system keeps accepting work, queue age and memory rise until latency explodes or components fail.

Autoscaling is not a universal solution. A worker fleet cannot scale past a fixed provider quota or a database's write capacity. Reliable systems reject, delay, or degrade work before saturation becomes collapse.

## How it works

A **token bucket** accumulates tokens at a configured rate up to a burst capacity. Requests consume tokens; when none remain, the caller waits or is rejected. This models steady rate plus bounded bursts.

A **concurrency limiter** bounds simultaneous expensive operations. It often matches resource pressure better than requests per second when request duration varies.

Backpressure appears through bounded queues, broker prefetch limits, stream flow control, worker concurrency, and explicit admission errors. The producer must eventually feel that the consumer is full.

Limits can be global, per tenant, per endpoint, or per downstream account. In a multi-replica service, per-process limits do not automatically enforce a global provider quota. Use a shared limiter, partition quota deliberately, or size local limits so the fleet total is safe.

## Key concepts

**Burst capacity.** Allows short peaks without changing the long-run rate. A burst larger than the dependency's queue capacity defeats the protection.

**Queue age versus depth.** Depth counts jobs; age tells how long the oldest work has waited. Different job sizes can make depth misleading.

**Fairness.** Per-tenant or weighted limits prevent one noisy tenant from consuming all shared capacity.

**Load shedding.** Reject work when accepting it would make useful work miss deadlines. Fast rejection can preserve capacity for high-value requests.

**Retry-After / retry guidance.** A client should not immediately retry a rate-limit response and recreate the same overload.

## Production example

A worker service sends data to an external API limited to 500 operations per second for the entire account. The fleet has 20 replicas.

If every replica independently permits 500 requests per second, the account can receive up to 10,000 attempts per second. The limiter must therefore coordinate globally or allocate safe shares that account for replica count and failover.

The team uses a shared account-level token budget and separately caps active calls to protect connection and memory use. Queue admission is bounded by a promised completion window; low-priority bulk work is rejected or deferred when oldest-job age approaches that window.

Interactive work receives reserved capacity. Recovery after a provider outage ramps gradually rather than releasing the entire backlog at 500 rps plus new traffic with no prioritization.

Metrics include admitted/rejected work, token wait, active concurrency, queue age, downstream 429s, and completion latency per priority/tenant.

## Trade-offs

Strict limits protect reliability but can reject legitimate bursts. Larger burst allowances improve responsiveness while increasing risk to the dependency.

Queueing smooths short mismatches but adds latency. Priority/fairness improves product behavior while making scheduling more complex.

A globally coordinated limiter enforces exact shared capacity more directly but adds dependency and coordination cost. Conservative local shares are simpler but may leave capacity unused.

## Failure modes / pitfalls

Per-replica limits accidentally multiply with autoscaling. Unbounded queues convert overload into latency and memory/disk growth. Clients that retry 429 immediately defeat the limiter.

One tenant can monopolize a global queue unless fairness exists. Scaling consumers against a fixed downstream quota increases contention without throughput.

Another mistake is measuring only throughput: a service can complete 500 rps while queue age grows forever because arrivals are 700 rps.

## When to use it

Use rate limiting at public boundaries, expensive operations, shared dependencies, and any place demand can exceed known capacity.

Use backpressure through every asynchronous pipeline so overload becomes visible upstream before resources are exhausted.

## When not to use it

Do not choose arbitrary requests-per-second limits when concurrency, bytes, CPU, or another resource predicts saturation better.

Do not use limits to conceal a permanent capacity shortfall. If normal demand exceeds sustainable service, architecture or product capacity must change.

## What a Senior Engineer should know

A Senior Engineer should understand token buckets, concurrency limits, bounded queues, fairness, overload responses, and multi-replica quota math.

They should design recovery traffic and monitor queue age, saturation, and rejection separately.

## What a Staff Engineer should understand

A Staff Engineer should allocate scarce capacity across tenants, priorities, and recovery work and choose where global versus local admission control belongs.

They should define organization-wide overload behavior so teams do not assume autoscaling or retries can create capacity that a fixed downstream system does not have.

Further reading: [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/).
