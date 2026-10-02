---
title: "Serverless platforms"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Serverless platforms operate execution infrastructure and scale workload instances under a managed contract. Functions and managed container runtimes differ in lifecycle, concurrency and limits.

## Why it matters for backend engineers

Scaling application execution is not the same as scaling its database or provider. Rapid fan-out can exhaust downstream connections long before compute reaches its own limit.

## How it works

Requests or events invoke managed instances. The platform starts capacity, routes work and may retire idle instances. Cold starts initialize code and dependencies. Event sources define acknowledgement and retry behavior; instance lifetime and local storage are not durable workflow state.

## Key concepts

Maximum instances, per-instance concurrency and timeout limits bound behavior. Warm caches are opportunistic. Retry identity must survive new instances. Pricing depends on the chosen service's execution, request and resource model.

## Production example

A thumbnail function responds to object-created events. It uses the source object's stable identity to avoid duplicate output and caps concurrency against an image API quota. Large files are routed to a suitable job runtime instead of hoping the function timeout can stretch indefinitely.

## Trade-offs

Managed execution reduces host work and handles bursts well. Cold starts, runtime limits and invocation economics can complicate steady or long-running workloads.

## Failure modes / pitfalls

Unbounded fan-out, duplicate events, reliance on local state and large initialization work cause failures or cost spikes.

## When to use it

Use serverless for stateless request/event work that fits documented execution and scaling constraints.

## When not to use it

Reconsider it for persistent connections, predictable heavy utilization or long tasks unsupported by the selected runtime.

## What a Senior Engineer should know

Model retries, initialization, concurrency and downstream capacity together.

## What a Staff Engineer should understand

Choose execution models by workload economics and recovery semantics, not the serverless label.

Further reading: [Cloud Run documentation](https://docs.cloud.google.com/run/docs), [AWS Lambda best practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html).
