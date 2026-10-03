---
title: "Model routing and AI gateways"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

An AI gateway centralizes some combination of model-provider access, authentication, request policy, routing, usage limits, telemetry, and provider abstraction. Model routing chooses which model or provider handles a task based on quality, latency, capability, policy, or cost.

A gateway can make provider access consistent. It cannot make different models semantically interchangeable simply because they expose similar APIs.

## Why it matters for backend engineers

Model endpoints vary in tool calling, structured-output support, context size, latency, safety behavior, rate limits, region, and price. A fallback from one model to another can change product correctness even when both return HTTP 200.

Central gateways also sit on the critical path. Bad retry, caching, or fallback policy can multiply cost and hide provider-specific incidents.

Routing should optimize **task completion under constraints**, not just cost per token.

## How it works

Applications authenticate to the gateway under service or tenant identity. The gateway checks allowed models, regions, budgets, and data policies.

A routing policy selects a model using task metadata or measured behavior. Static routing may send extraction to one model and difficult reasoning to another. Dynamic routing can use confidence or evaluation signals but needs strong offline and online validation.

The gateway forwards the request while recording selected provider and model version. Tool and structured-output compatibility is verified per route.

Fallback is selective. A transient provider outage may justify sending to a tested equivalent model. A model that lacks required tool schema support or approved data residency is not a valid fallback.

Retries need budgets because they incur latency and billable work. For agent requests that can trigger tools, gateway-level retries must not replay external mutations invisibly.

Response caching is safe only when identity, model, prompt, policy, and freshness make the result genuinely shareable.

## Key concepts

**Capability compatibility.** Same API shape does not mean same tool, structured-output, vision, or reasoning behavior.

**Quality routing.** Model selection based on task success or calibrated uncertainty, not only token price.

**Task cost.** Includes failed attempts, retries, latency, and human review. A cheap model that often escalates may cost more per successful task.

**Data policy.** Region, retention, training policy, and provider approval can constrain eligible routes.

**Fallback.** Secondary route used for named failures under tested compatibility.

**Gateway blast radius.** A shared gateway outage or bad configuration can affect every AI product at once.

## Production example

A document-classification system handles millions of forms. Offline evaluation shows a smaller model reaches required accuracy for ordinary forms but struggles with damaged scans and ambiguous categories.

The gateway routes standard forms to the cheaper model. Cases with low classifier confidence or OCR quality escalate to a larger model.

Every classification record stores model family, version, route decision, latency, and outcome so quality can be compared later.

When provider A has an outage, the gateway falls back only for task classes already evaluated on provider B. Restricted documents are never routed to provider B because its approved region or data policy does not match.

The gateway's retry budget is one transient attempt. It never retries an entire agent workflow after a downstream tool mutation simply because the model-stream connection failed.

Unit economics are tracked as cost per correctly processed document including escalations, not cost per million input tokens alone.

## Trade-offs

Central gateways simplify credentials, policy, cost allocation, and provider changes. They add latency and become a shared production dependency.

Provider abstraction reduces application-specific code while risking a lowest-common-denominator API that hides useful capabilities.

Dynamic routing can lower cost while increasing evaluation and debugging complexity.

## Failure modes / pitfalls

Untested fallback silently reduces quality. Cross-tenant prompt or response caching can leak data.

Unlimited retries amplify provider outages and spend. Token accounting that ignores retries, cached responses, or tool calls misstates cost.

A gateway can also hide model-version changes unless version metadata is propagated to application telemetry.

## When to use it

Use an AI gateway when several workloads need consistent provider policy, routing, credentials, telemetry, budgets, or regional controls.

Start with transparent proxy and policy capabilities before adding complex adaptive routing.

## When not to use it

One modest application using one provider may be simpler and more debuggable with a direct maintained client.

Do not centralize routing before teams have representative evaluations to decide which routes are actually compatible.

## What a Senior Engineer should know

A Senior Engineer should test provider and model route compatibility, streaming and tool behavior, retry budgets, caching policy, and failure attribution.

They should measure cost per successful task and preserve model/version identity in telemetry.

## What a Staff Engineer should understand

A Staff Engineer should define provider trust, residency, cost allocation, fallback policy, gateway availability, and evaluation evidence across AI products.

They should prevent the shared gateway from hiding model differences or becoming an unreviewed single point of policy and failure.

Further reading: [Envoy AI Gateway](https://aigateway.envoyproxy.io/docs/).
