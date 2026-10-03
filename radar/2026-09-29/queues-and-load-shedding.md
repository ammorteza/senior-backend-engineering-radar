---
title: "Queues and load shedding"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A queue absorbs a temporary mismatch between arrival rate and processing rate. Load shedding deliberately rejects or drops selected work before overload consumes the resources needed to make useful progress.

Queueing turns immediate failure into waiting. That is useful only while the backlog remains bounded and the resulting delay still satisfies the product. If work arrives faster than it can be processed for long enough, every finite system eventually has to reject, expire, or reduce work.

## Why it matters for backend engineers

Queues are often mistaken for extra capacity. They are not. If a service can sustainably process 100 jobs per second and receives 300 jobs per second, the backlog grows by roughly 200 jobs each second until arrivals fall or capacity rises.

An unbounded queue hides the overload from callers while latency and storage grow. By the time errors appear, customers may be hours behind. Load shedding makes the product's admission decision explicit before the system collapses.

## How it works

Model three rates: offered load, admitted load, and completed throughput. Admission control decides whether new work enters the system. A bounded queue stores accepted work. Workers consume at the sustainable rate imposed by CPU, database capacity, or downstream quotas.

When the queue reaches its capacity or an age/deadline threshold, the system applies a policy: reject new work, reject low-priority work, replace obsolete queued work, or defer it to another mechanism.

For synchronous requests, queueing often happens implicitly in connection pools, thread pools, goroutine semaphores, or load balancers. Hidden queues are dangerous because callers cannot see where latency accumulates.

Deadline-aware processing avoids spending capacity on work whose result is already useless. If a queued interactive request has 50 ms left but needs 500 ms to complete, rejecting it now can preserve capacity for another request that can still succeed.

## Key concepts

**Queue depth.** Number of waiting items. Useful, but does not capture work size or age.

**Queue age.** Time the oldest or percentile job has waited. Often closer to customer impact.

**Drain time.** Backlog divided by spare processing capacity. If arrivals equal service capacity, the backlog never drains.

**Admission control.** Decide before expensive work whether the system can accept it under the product's completion objective.

**Load shedding.** Drop or reject selected work to preserve service for higher-value traffic.

**Fairness.** Per-tenant or priority scheduling prevents one source from monopolizing the backlog.

## Production example

An image-rendering service can sustainably complete 100 jobs per second. A bulk customer submits 300 jobs per second for five minutes.

If every job is accepted, the backlog grows by about 60,000 jobs. Even after the burst ends, draining at 100 jobs per second would take ten minutes if no new traffic arrived; with ordinary traffic continuing, drain time is much longer.

The product promises interactive thumbnails within 10 seconds but permits bulk exports to wait several minutes. The service maintains separate priority classes. Interactive work has reserved worker capacity and a small bounded queue. Bulk submissions are admitted only while predicted completion remains inside the agreed window.

When bulk capacity is exhausted, the API returns a clear overload response rather than accepting work it cannot finish on time. Clients use backoff rather than immediate resubmission.

The team load-tests above capacity and verifies that queue age reaches a controlled plateau, memory remains bounded, interactive latency stays within objective, and the service recovers without releasing all deferred work simultaneously.

## Trade-offs

More buffering can absorb short bursts and improve utilization, but increases worst-case latency and hides persistent overload. Smaller queues make overload visible sooner and usually preserve tail latency.

Load shedding improves availability for selected work while reducing acceptance rate. Priority scheduling expresses business value, but poor priority policy can starve low-priority customers indefinitely.

## Failure modes / pitfalls

Unbounded in-memory queues cause memory failure. Durable queues can fill disk or retain obsolete work indefinitely. Hidden client-side queues make server metrics look healthy while user latency grows.

Immediate retries of rejected work recreate overload. Scaling workers against a fixed database or provider limit increases contention without throughput.

Using queue depth alone can miss a small number of extremely old jobs or very expensive jobs.

## When to use it

Use bounded queues when temporary bursts are expected and waiting is an acceptable product state. Use admission control wherever expensive work has a known finite capacity.

Test the behavior above capacity deliberately; overload is not an exceptional edge case for a production system.

## When not to use it

Do not queue latency-sensitive requests indefinitely. Do not silently accept business-critical work when the system cannot provide the promised durability or completion window.

If the workload should fail immediately when capacity is unavailable, a queue may be the wrong abstraction.

## What a Senior Engineer should know

A Senior Engineer should calculate backlog growth and drain time, measure queue age, design expiration, and implement explicit overload responses.

They should find hidden queues in connection pools and clients and understand how worker scaling interacts with the real bottleneck.

## What a Staff Engineer should understand

A Staff Engineer should allocate queue/admission capacity across priorities and tenants and define what the product promises when demand exceeds capacity.

They should design recovery so old backlog, new traffic, and high-priority work share capacity deliberately rather than creating a second incident after the original outage.

Further reading: [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/), [Google SRE Workbook: Managing load](https://sre.google/sre-workbook/managing-load/).
