---
title: "Unbounded retries and queues"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

Unbounded retries and queues are an anti-pattern: they promise eventual progress without limiting time, attempts or resource consumption. During sustained failure they create more work than a recovering service can finish.

## Why it matters for backend engineers

A failed integration can fill storage with outdated work and then overwhelm a provider when it recovers. The backlog becomes a second incident rather than a recovery mechanism.

## How it works

An arrival rate above processing capacity increases backlog continuously. Retrying each failing attempt adds new demand; retries at multiple layers multiply it. A safe replacement bounds attempts or elapsed time, adds backoff with jitter, limits outstanding work and gives exhausted jobs an owned terminal path.

## Key concepts

A retry budget limits amplification. Job expiration distinguishes still-useful work from obsolete work. Dead-letter storage preserves diagnosis but needs retention and review. Recovery traffic must share capacity deliberately with new requests.

## Production example

A webhook endpoint is down for six hours. Infinite immediate retries consume workers and delay healthy destinations. Separate per-destination concurrency, schedule bounded retries and expire time-sensitive notifications. A reviewed dead-letter stream retains delivery records; recovery ramps up gradually rather than releasing the entire backlog at once.

## Trade-offs

Limits can expose failures earlier, requiring support or caller handling. Unlimited persistence only appears simpler: it transfers the cost to storage, operators and future traffic.

## Failure modes / pitfalls

Dead-letter queues without owners, retrying permanent validation errors and resetting attempt counters on replay defeat the intended bounds.

## When to use it

Use this caution when reviewing retry loops, client queues and broker retention settings; replace unbounded behavior with explicit budgets.

## When not to use it

Do not interpret the caution as banning durable retry. Critical work may retry over long periods if resources and escalation are bounded.

## What a Senior Engineer should know

Quantify retry amplification, age limits and backlog drain capacity.

## What a Staff Engineer should understand

Define which work remains valuable during outages and how unresolved obligations reach operators.

Further reading: [AWS: Timeouts, retries, backoff and jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).
