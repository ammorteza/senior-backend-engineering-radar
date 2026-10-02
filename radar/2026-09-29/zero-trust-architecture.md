---
title: "Zero trust architecture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Zero trust is an approach to access control that does not grant authority merely because a request originates inside a network boundary. Access decisions consider the identity of the actor, the target resource and relevant context, with authority limited to the intended operation.

It is not a single product, a synonym for TLS or a reason to eliminate networks. Segmentation, authentication and resource authorization remain complementary controls. The architectural change is to stop treating internal location as sufficient evidence that a caller should be trusted.

## Why it matters for backend engineers

Backend systems increasingly include managed services, remote operators, CI runners and workloads spread across environments. A broad “inside equals trusted” rule can let a compromised service reach unrelated data or administration APIs.

Engineers need to know whose authority a request carries. A reporting service's workload identity establishes which service called, but may not establish which customer's data it may read. User identity, workload identity and delegated authority must remain distinguishable across service boundaries.

## How it works

Identify the principals and resources involved in an access path. Authenticate the caller using a supported human or workload identity, then evaluate whether it may perform the requested action on the resource. Apply the decision at an enforcement point that cannot be bypassed through an alternate route.

A policy decision may use role, device state, workload identity or other context appropriate to the operation. The source and freshness of that context matter. An unsigned header declaring a user or service identity is not equivalent to authenticated evidence.

Limit credential lifetime and permissions, and reevaluate access according to the risk and session design. This does not require every instruction or packet to call a central policy service. Local verification, cached decisions and sessions can all be appropriate, provided their staleness and revocation behavior are explicit.

Retain network restrictions that reduce reachable attack surfaces. Identity-aware authorization limits what a caller may do; segmentation can limit which targets it can reach at all. Neither removes the need to secure the application and its credential delivery.

## Key concepts

**Subject and resource.** Name the actual actor and target. “Traffic from Kubernetes” is too broad to express which workload may read which dataset.

**Authentication and authorization.** Mutual TLS can establish workload identity, but the receiving service still needs a rule about what that identity may do. An encrypted unauthorized request remains unauthorized.

**Delegation.** A service may act for a user or perform its own background responsibility. Do not silently turn the service's broad technical access into unrestricted user authority.

**Policy decision and enforcement.** The decision engine needs trusted inputs, while the enforcement point must cover real access paths. A policy that protects only the public gateway can leave an internal direct route open.

**Revocation and availability.** Short-lived credentials and refreshed policy bound some exposure, but caches and active sessions affect when access actually ends. Define behavior when identity or policy infrastructure is unavailable.

## Production example

A reporting service historically has broad database access because it runs in the production subnet. A new design gives it a dedicated workload identity and permission to call a restricted reporting API. Database administration requires a separate human identity with temporary elevation.

The reporting API checks the workload identity and the scope of each request. If it supports customer-initiated reports, it also validates the relevant user delegation or trusted job context. It does not accept an arbitrary customer ID simply because the request came from the reporting service.

The team tests the design from a workload with the same network placement but a different identity. That workload must fail the protected API call. They also test a valid reporting identity attempting an administrative operation and verify that the direct database path is not an unintended bypass.

During a simulated compromise, operators revoke or disable the affected identity and observe how existing sessions and credentials behave. The exercise documents the actual containment window. It does not claim that moving to identity-based access makes compromise impossible; it demonstrates that network location no longer grants the old broad authority.

## Trade-offs

Explicit identity and resource policy reduce implicit trust and improve attribution. Introducing them into legacy systems can be expensive, especially when shared accounts or protocols provide little identity information.

Central identity and policy infrastructure also becomes operationally important. Design resilient distribution and sensible caching without granting indefinite stale access. A migration that improves security during normal operation but forces global fail-open behavior during outages has left a critical design question unresolved.

## Failure modes / pitfalls

- **A mesh is installed and the work is declared finished.** Transport identity needs resource-specific authorization and complete enforcement paths.
- **Every service shares a broad identity.** Authentication exists, but it cannot distinguish responsibilities or contain one compromised workload.
- **Trusted headers can be spoofed.** Strip or overwrite externally supplied identity context at the appropriate boundary and authenticate its propagation.
- **Segmentation is removed prematurely.** Identity controls do not eliminate the value of reducing reachable targets.
- **Policy caches never expire.** Revocation promises become disconnected from actual access behavior.
- **Legacy bypasses remain invisible.** Direct database credentials or maintenance routes can preserve the old trust model alongside the new one.

## When to use it

Apply zero-trust principles when redesigning access to sensitive resources, separating workloads or supporting users and automation across network boundaries. Start with a high-value access path and make its current trust assumptions explicit.

Migrate incrementally: assign identities, narrow permissions, close alternate paths and test revocation. Inventory and observability are prerequisites for knowing whether the old implicit trust has actually been removed.

## When not to use it

Do not buy a product solely because it carries a zero-trust label. Define the authority boundary and evaluate whether the product helps enforce it.

Do not require fragile remote checks for every operation without considering latency, outages and session semantics. Nor should zero trust be used as an argument that encryption, patching or network controls are no longer necessary.

## What a Senior Engineer should know

A Senior Engineer should identify the principals involved in a call, distinguish service authority from user delegation and inspect the effective resource permissions. They should test same-network callers with wrong identities and valid identities requesting forbidden operations.

They should also understand credential refresh, cached policy and session termination well enough to explain the actual revocation window during an incident.

## What a Staff Engineer should understand

A Staff Engineer should coordinate identity, policy and enforcement across teams and legacy systems. Define who owns each decision, how policy changes propagate and how exceptions are retired during migration.

Prioritize containment of consequential resources and rehearse identity compromise. Success is demonstrated by reduced implicit authority and controlled recovery, not by the number of proxies or authentication prompts deployed.

Further reading: [NIST SP 800-207: Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final).
