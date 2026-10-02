---
title: "Authorization models"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Authorization decides whether a particular principal may perform an action on a particular resource. Authentication establishes the principal's identity; authorization determines the limits of that identity's authority. A valid login does not establish ownership of an invoice, membership in a workspace or permission to approve a transfer.

A model organizes those decisions. Role-based access control (RBAC) groups permissions into roles. Attribute-based access control (ABAC) evaluates properties of the principal, resource and context. Relationship-based access control derives permission from relationships such as “member of the workspace that owns this document.” Real systems often combine these approaches.

## Why it matters for backend engineers

Backend services are where product permissions become enforceable behavior. Hiding a button does not prevent direct API calls, and an unguessable resource identifier does not prevent access when an identifier leaks. Every read and mutation needs the correct scope, including list endpoints, background jobs and exports.

The difficult questions usually concern change: what happens when a user leaves a company, an approver's role changes, or a document moves between workspaces? An authorization design needs consistency and revocation expectations, not only a table of roles at creation time.

## How it works

At an enforcement point, assemble trusted decision inputs: authenticated principal, requested action, resource identity, tenant membership and any relevant conditions. Do not accept a client-supplied `role=admin` or tenant identifier as proof of authority. A client can select a resource, but the service must establish the relationship between that resource and the caller.

Evaluate the policy before disclosing data or causing the protected effect. With RBAC, the principal's role grants actions within a defined scope. With ABAC, predicates may additionally require that an invoice is below an approval limit or that the approver is not its creator. A relationship model can follow membership and ownership edges to establish document access.

Decisions and enforcement may live in one service or be separated by a policy API. Either way, ensure every relevant path actually uses the decision. A centralized engine cannot protect a handler that bypasses it. When the decision depends on mutable state, consider whether that state can change between checking and committing the operation.

## Key concepts

**Scope belongs to the permission.** “Finance administrator” should normally be tied to an organization, not treated as global authority. A user may have different roles in different organizations.

**Role explosion signals missing structure.** Roles such as `approver_under_1000_in_region_A` multiply when every condition becomes a role. Keep stable job capabilities in roles and consider explicit attributes for limits or contextual constraints.

**Listing is not repeated single-object checking by default.** Filtering unauthorized items after database pagination can leak counts, produce empty pages and perform poorly. Design a query or authorized-resource lookup that preserves the list contract.

**Revocation has a consistency budget.** Cached membership and signed role claims can remain valid after removal. Decide how quickly access must disappear and choose cache invalidation, short lifetimes or authoritative checks accordingly.

**Fail closed does not mean “return success with empty data.”** If the policy service is unavailable, distinguish inability to decide from a genuine denial internally and choose an appropriate safe external response. Do not silently grant access to maintain availability.

## Production example

Consider an invoice approval service. A member of organization A may view its invoices; an approver may approve invoices below their limit; nobody may approve an invoice they created. Those are three different conditions, not one `isAdmin` flag.

For `POST /invoices/{id}/approve`, the service authenticates the caller, loads the invoice under a trusted organization scope, retrieves current approval authority and evaluates the amount and creator constraints. The database mutation also requires that the invoice is still awaiting approval. If authority or amount can change concurrently, the design must protect the decision's inputs through an appropriate transactional boundary or explicitly handle policy-version changes.

Tests create two organizations and attempt cross-organization reads, updates, lists and exports. They also cover a former approver, an invoice above the limit, a creator trying to self-approve, and two competing approvals. Successful authentication is present in these tests: the point is to demonstrate that an authenticated user still cannot exceed their authority.

Audit records capture actor, action, resource, policy version where available and outcome. They avoid storing the entire sensitive invoice. If an approval is disputed later, the team can explain the decision instead of merely proving that someone had a valid token.

## Trade-offs

RBAC is understandable for stable capabilities but becomes awkward when every resource has unique sharing rules. ABAC expresses contextual rules well, although debugging “why denied?” requires clear policy explanations and trustworthy attributes. Relationship models suit hierarchical sharing but add graph maintenance and consistency questions.

Central policy reduces duplicated rules and supports coordinated changes. It can also introduce latency and a shared dependency. Local evaluation avoids a network hop but needs reliable policy distribution and consistent versions. Choose the arrangement from actual permission semantics and revocation requirements, not from the apparent sophistication of the engine.

## Failure modes / pitfalls

- **Checking the route but not the object.** Permission to call an invoice API does not authorize every invoice ID.
- **Mass assignment.** Decoding arbitrary request fields into a persistent model can let a caller change ownership or approval state. Accept explicit writable fields.
- **Stale administrative claims.** Removing a role in one database may not invalidate a token or cache elsewhere. Exercise the promised revocation window.
- **Background paths omit checks.** Exports and delayed jobs may run after membership changes. Define whether authorization is required at submission, execution or both.
- **Global administrator shortcuts become normal paths.** Keep exceptional authority narrowly granted, auditable and separate from routine tenant-scoped access.

## When to use it

Choose an explicit authorization model whenever multiple actors have different rights over resources. Begin with a permission matrix of real actions, scopes and business constraints, then select the simplest model that expresses it clearly.

Use centralized policy or relationship infrastructure when sharing and policy changes genuinely cross many services. Before adoption, test how it handles resource listing, revocation and outages with your workload.

## When not to use it

Do not introduce a general-purpose policy engine merely to move three stable checks into another service. Indirection without shared semantics can make simple authorization harder to understand.

Do not use OAuth scopes, UI restrictions, network location or resource-ID secrecy as the complete model. Each may contribute information or defense, but none establishes the full principal–action–resource decision.

## What a Senior Engineer should know

A Senior Engineer should trace every decision input to a trusted source, implement tenant-scoped reads and mutations, and test denied cases as carefully as successful ones. They should explain what happens when permissions change during a request or while a job is queued.

They should also make decisions diagnosable without leaking sensitive policy data. Given a denied request, they should identify whether identity, membership, action permission, resource state or policy availability caused the outcome.

## What a Staff Engineer should understand

A Staff Engineer should establish shared permission semantics across services, including who owns membership, role definitions and revocation. Without that agreement, a common policy engine only centralizes inconsistent assumptions.

Coordinate migration and policy versioning, especially when old and new services coexist. Define exceptional access, audit retention and emergency revocation, and verify that cross-service workflows cannot combine individually allowed actions into an unintended privilege escalation.

Further reading: [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
