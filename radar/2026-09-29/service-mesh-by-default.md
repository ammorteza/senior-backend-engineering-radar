---
title: "Service mesh by default"
ring: caution
segment: techniques
tags: [backend]
---

## What it is

This caution targets adopting a service mesh before identifying a requirement that simpler networking or identity tools cannot meet. A mesh is a substantial platform commitment, not a mandatory microservice accessory.

## Why it matters for backend engineers

Every injected or intercepted workload gains new configuration and failure paths. Teams may pay this cost while using only features their existing ingress or clients already provide.

## How it works

Evaluate concrete needs: workload authentication, consistent policy or specialized traffic management. Prototype the smallest relevant scope and measure latency, resource use, upgrade effort and diagnostic complexity. Compare against platform-native routing, application clients and narrowly scoped identity systems.

## Key concepts

Adoption needs a platform owner, compatibility policy and tested removal path. A control plane's benefits differ from data-plane overhead. Sidecar and non-sidecar architectures should be compared on actual feature needs rather than branding.

## Production example

A small team installs a mesh for “observability” but never uses workload policy. A proxy upgrade breaks traffic and nobody can diagnose interception. The review finds OpenTelemetry and existing ingress metrics answer the intended questions; the team removes the mesh incrementally and verifies routing before and after.

## Trade-offs

Standardized policy can justify significant complexity at scale. Premature adoption creates fixed operational costs before the benefits materialize.

## Failure modes / pitfalls

No owner, duplicated retries, inconsistent enrollment and treating default settings as security policy are warning signs.

## When to use it

Apply this caution during platform selection and when reviewing an underused mesh installation.

## When not to use it

Do not reject meshes categorically when documented identity or traffic-policy needs justify them.

## What a Senior Engineer should know

Compare a mesh's specific capabilities with current tools and reproduce failure diagnosis.

## What a Staff Engineer should understand

Require measurable benefits and lifecycle ownership before making enrollment an organizational default.

Further reading: [Istio deployment models](https://istio.io/latest/docs/ops/deployment/deployment-models/).
