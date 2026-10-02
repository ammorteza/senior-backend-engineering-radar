---
title: "Zero trust architecture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Zero trust treats access as an explicit decision based on identity and context rather than assuming that a request inside the network is safe. It is an architectural approach, not a product feature.

## Why it matters for backend engineers

A compromised internal workload should not gain broad access merely because it shares a subnet. Identity and resource-specific policy constrain lateral movement.

## How it works

A policy decision considers authenticated subject, target resource and available context, while enforcement points apply the decision. Credentials and authorization are bounded and reevaluated according to risk and session policy. Network segmentation remains useful, but location alone does not establish trust.

## Key concepts

Workload identity differs from user identity. Least privilege limits allowed actions. Device posture and session context can influence human access. Continuous verification does not require contacting a central server on every instruction; availability and caching still need design.

## Production example

A reporting service authenticates with workload credentials and receives permission for selected data APIs. Database administration requires separate short-lived human elevation. If the reporting pod is compromised, its network location does not grant access to production secrets or unrelated customer services.

## Trade-offs

Explicit identity and policy reduce implicit trust. Rollout can be complex, particularly for legacy workloads, and central decision infrastructure needs resilient operations.

## Failure modes / pitfalls

Buying a mesh and declaring zero trust, broad service roles and unbounded credential lifetimes leave the old assumptions intact.

## When to use it

Use zero-trust principles when redesigning access across workloads, users and sensitive resources.

## When not to use it

Do not discard segmentation or require fragile synchronous checks everywhere without evaluating failure behavior.

## What a Senior Engineer should know

Identify principals, resources, decision inputs and effective permissions.

## What a Staff Engineer should understand

Plan incremental identity migration, policy ownership and incident containment across the estate.

Further reading: [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final).
