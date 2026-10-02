---
title: "Authorization models"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Authorization determines whether a principal may perform an action on a resource. RBAC uses roles, ABAC evaluates attributes and relationship-based models derive access from relationships between entities.

## Why it matters for backend engineers

“Authenticated” says who made a request, not which account or document they may use. An authorization model must fit tenant boundaries, delegation and revocation needs.

## How it works

A policy enforcement point asks for a decision using principal, resource, action and relevant context. RBAC maps roles to permissions; ABAC applies predicates; relationship systems traverse or evaluate stored relationships. Decision inputs must come from trusted sources, and checks must occur before effects or disclosure.

## Key concepts

Default deny, least privilege and explicit scope constrain access. Cached decisions introduce revocation delay. Listing authorized resources differs from checking one resource. Policy version and decision evidence improve auditability.

## Production example

A workspace member may view documents, while a finance role may approve an invoice only within its workspace. A user removed from the workspace must lose access under a stated revocation window. Tests cover both direct fetch and list queries so unauthorized items never leak through pagination.

## Trade-offs

Roles are simple but can proliferate. Attribute policies are expressive but harder to explain. Relationship models fit sharing while adding graph and consistency considerations.

## Failure modes / pitfalls

Client-controlled attributes, broad administrator shortcuts, stale caches and checking only the UI create bypasses. A policy engine failure needs a deliberate fail policy.

## When to use it

Choose the simplest model matching actual permissions, tenant structure and delegation.

## When not to use it

Do not adopt a complex policy platform for a handful of stable checks unless centralized ownership adds value.

## What a Senior Engineer should know

Trace trusted policy inputs and test negative cases, list filtering and revocation.

## What a Staff Engineer should understand

Define permission semantics, consistency and ownership across services and organizational changes.

Further reading: [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
