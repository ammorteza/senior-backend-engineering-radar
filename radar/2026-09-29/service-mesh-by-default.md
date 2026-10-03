---
title: "Service mesh by default"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

“Service mesh by default” is a caution against making mesh enrollment an automatic requirement before the organization has a concrete communication or security problem that a mesh solves better than simpler alternatives.

A service mesh can be valuable infrastructure. The anti-pattern is treating it as a mandatory accessory of microservices and accepting proxy, policy, certificate, upgrade, and debugging complexity before those capabilities are needed.

## Why it matters for backend engineers

Every mesh-enrolled request may cross additional data-plane components and policy. Engineers must understand those components during latency incidents, connection failures, certificate problems, and retries.

If a team adopts a mesh only for generic request metrics, it may be paying a large operational cost for something OpenTelemetry and existing ingress or client libraries already provide.

The correct question is: which repeated requirement justifies organization-wide interception?

## How it works

Evaluate candidate requirements separately:

- workload-to-workload identity and mTLS;
- consistent transport authorization;
- traffic routing or failover policy;
- common retries, timeouts, or circuit controls;
- telemetry that cannot be achieved adequately elsewhere.

Then compare the mesh with simpler options such as cloud workload identity, ingress or gateway policy, client libraries, Kubernetes NetworkPolicy, or application-level authentication.

Prototype the smallest realistic scope. Measure latency, CPU and memory overhead, rollout behavior, certificate lifecycle, failure diagnosis, and upgrade effort.

Decide who owns the control plane, policies, upgrades, and incidents. A mesh with no dedicated platform ownership becomes shared infrastructure that everybody depends on and nobody can safely change.

## Key concepts

**Requirement-driven adoption.** Choose the mesh from explicit needs rather than architecture fashion.

**Control-plane ownership.** Somebody must operate upgrades, compatibility, certificates, and policy changes.

**Data-plane overhead.** Proxies or node-level components consume resources and change the network path even when the application code is unchanged.

**Enrollment consistency.** Partially enrolled services can have different trust and routing behavior; mixed-mode operation needs design.

**Exit path.** Know how services can bypass or remove the mesh if a capability is unsuitable or the organization later changes platforms.

## Production example

A company with 12 internal services installs a mesh primarily because “we need observability.” No workload authorization policies are defined and application clients already emit OpenTelemetry traces.

Six months later, a proxy upgrade changes connection behavior and several services see resets. Product teams look only at application logs because nobody has operational experience with the proxy layer. Recovery takes longer than the original service failure would have.

The platform review identifies the actual requirements: HTTP metrics, distributed traces, and one ingress authentication policy. Existing OTel and gateway infrastructure already cover them.

The team runs a staged removal. One low-risk service stops interception, traffic is compared before and after, and retry or timeout settings are checked so removing the proxy does not silently change behavior. Enrollment is then removed from other services.

Later, if the organization needs uniform workload identity across dozens of services, the mesh can be reconsidered with clear ownership and measurable benefits.

## Trade-offs

A standardized mesh can make security and traffic policy consistent at large scale. Making it universal too early creates fixed resource and operational cost for every service.

Simple libraries distribute some logic into applications; a mesh centralizes it. Centralization reduces duplication while increasing shared blast radius.

## Failure modes / pitfalls

No platform owner, broad default allow policies, duplicated client and mesh retries, and untested certificate rotation indicate unsafe adoption.

Teams may also assume “mTLS enabled” means internal APIs are authorized correctly, leaving domain permissions weak.

Another failure is irreversible dependence on mesh-specific traffic features before the organization understands how to debug or migrate them.

## When to use it

Use this caution whenever a platform proposes default mesh enrollment or when an existing mesh appears underused relative to its operational cost.

Require a small set of explicit capabilities that justify the shared layer.

## When not to use it

Do not interpret this caution as “never use a mesh.” Large organizations with strong workload-identity, policy, or traffic-management requirements may benefit substantially.

Once the mesh solves a real repeated problem and has mature ownership, making enrollment a default can be reasonable.

## What a Senior Engineer should know

A Senior Engineer should compare mesh capabilities with application and cloud alternatives, understand the added request path, and reproduce common failure diagnosis before depending on the mesh.

They should identify duplicated policies such as retries or timeouts across layers.

## What a Staff Engineer should understand

A Staff Engineer should require measurable benefits, platform ownership, compatibility testing, capacity budget, and an exit or exception path before standardizing mesh enrollment.

They should evaluate the total organizational cost, not only the convenience of one security or traffic feature.

Further reading: [Istio deployment models](https://istio.io/latest/docs/ops/deployment/deployment-models/).
