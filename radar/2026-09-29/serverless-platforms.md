---
title: "Serverless platforms"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Serverless platforms run application code under a managed execution contract in which the provider handles most host provisioning, instance replacement, and request or event scaling. Function platforms and managed container runtimes are both called serverless, but they differ in concurrency, lifecycle, timeout, networking, and pricing.

The useful question is not “does it have servers?” Servers still exist. The question is which execution and scaling responsibilities the platform owns and which constraints the application must design around.

## Why it matters for backend engineers

Serverless compute can scale far faster than databases, SaaS APIs, or private network dependencies. A traffic burst that looks easy for the platform can create thousands of concurrent downstream connections.

Instance lifetime is also opportunistic. Local memory and disk may survive between requests but are not durable workflow state. Event redelivery can create duplicate processing on new instances.

## How it works

A request, scheduled trigger, message, or object event invokes an execution environment. The platform starts new instances according to demand, configured maximums, quotas, and service-specific concurrency rules.

Cold starts include environment creation plus application initialization. Large binaries, eager dependency loading, network setup, and expensive global initialization lengthen that path.

Some runtimes process one request per instance; others allow many concurrent requests. Maximum instances and per-instance concurrency together define a large part of downstream pressure.

Event sources define acknowledgement and retry. A successful function return may acknowledge a message; a timeout or crash may cause redelivery. Business idempotency must survive instance replacement.

## Key concepts

**Cold start.** Additional latency before a new instance can serve. Measure it in the real runtime and language rather than assume one universal number.

**Concurrency.** Per-instance concurrency and fleet scaling both matter. A low per-instance limit can create more instances and more downstream connections.

**Ephemeral local state.** Reuse can improve caches, but correctness cannot depend on a previous invocation using the same instance.

**Execution timeout.** Long workflows may need a job or orchestration service rather than stretching a request or function beyond its contract.

**Scale-to-zero and min instances.** Reducing idle cost can increase cold-start exposure; warm capacity costs money.

## Production example

An object-created event invokes a thumbnail worker. The platform may deliver the same source event more than once, so the worker derives output identity from the source object's immutable generation and target size.

The image-processing provider allows 500 requests per second. The serverless service therefore has an explicit max-instance and concurrency budget; it does not let platform autoscaling discover the quota through 429s.

For a 5 GB video, thumbnail extraction can exceed the function runtime and memory model. The workflow routes large files to a managed job or container runtime designed for longer processing.

A failure test publishes a burst of 100,000 events after an outage. Metrics track instance count, cold starts, downstream requests, queue age, and duplicate output. Recovery remains bounded by provider and database capacity rather than serverless maximum scale.

## Trade-offs

Serverless reduces host management, handles variable traffic efficiently, and can scale idle workloads to near zero. Cold starts, execution constraints, request-based pricing, and provider-specific event integration can complicate steady high utilization or long-running jobs.

Managed scaling improves elasticity but reduces control over instance placement and lifetime.

## Failure modes / pitfalls

Unbounded fan-out, reliance on local files or in-memory dedupe, large initialization, and hidden downstream connection multiplication are recurring problems.

Retries can duplicate side effects if the operation identity is not durable. A serverless platform's successful invocation metric can still hide a business failure recorded asynchronously.

## When to use it

Use serverless for stateless HTTP or event workloads that fit documented duration, memory, concurrency, and networking constraints and benefit from managed scaling.

It is especially attractive for bursty or low-duty-cycle workloads.

## When not to use it

Reconsider for persistent long-lived connections, workloads requiring stable local state, very long jobs unsupported by the runtime, or continuously saturated services where a different compute model is simpler or cheaper.

Do not choose serverless solely for an architecture label.

## What a Senior Engineer should know

A Senior Engineer should model cold starts, per-instance and fleet concurrency, retries, idempotency, local-state lifetime, and downstream limits together.

They should load-test bursts and recovery, not only one warm instance.

## What a Staff Engineer should understand

A Staff Engineer should choose serverless versus cluster or VM execution based on workload economics, recovery semantics, control needs, and team operations.

They should create guardrails preventing autoscaling compute from overrunning shared databases, quotas, or external providers.

Further reading: [Cloud Run documentation](https://docs.cloud.google.com/run/docs), [AWS Lambda best practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html).
