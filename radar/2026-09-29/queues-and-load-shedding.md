---
title: "Queues and load shedding"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A queue absorbs temporary mismatch between arrival and service rates. Load shedding rejects selected work before overload consumes the resources needed for useful progress.

## Why it matters for backend engineers

Queueing changes immediate failure into waiting. If arrival persistently exceeds service capacity, an unlimited queue converts overload into extreme latency, disk growth or memory failure.

## How it works

Admission control accepts work only within capacity and deadline budgets. Workers drain bounded queues at the sustainable service rate. When limits are reached, policy may reject, defer or discard appropriate low-value work. Deadline-aware execution avoids spending capacity on results that will arrive too late to matter.

## Key concepts

Little's Law links average in-flight work, throughput and time. Queue age indicates user impact better than depth alone. Concurrency limits protect expensive resources; per-tenant queues prevent one customer monopolizing the backlog.

## Production example

An image API can finish 100 jobs per second but receives 300 for several minutes. It caps accepted backlog to its promised completion window and rejects further bulk submissions with clear retry guidance. Interactive thumbnails receive reserved workers so batch overload cannot block the main interface.

## Trade-offs

Buffering smooths bursts but adds delay. Shedding reduces completion rate for admitted demand while preserving service for selected requests. Fairness and priority policy are product decisions.

## Failure modes / pitfalls

Hidden client queues, retrying rejected work immediately, stale jobs and queue-length-only dashboards conceal overload. More workers cannot fix a fixed downstream quota.

## When to use it

Use bounded admission and queues wherever expensive work has finite capacity.

## When not to use it

Do not queue latency-sensitive requests indefinitely or silently drop business-critical work whose caller believes it was accepted.

## What a Senior Engineer should know

Calculate backlog drain time and implement explicit overload responses and expiration semantics.

## What a Staff Engineer should understand

Allocate capacity across priorities and tenants, including recovery bursts and contractual acceptance guarantees.

Further reading: [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/).
