---
title: "API security and abuse prevention"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

API security protects the data and operations exposed through an interface. Abuse prevention also considers harmful use of otherwise valid functionality: an authenticated customer might repeatedly request expensive exports, enumerate identifiers or exploit a business workflow for unintended benefit.

Authentication is only the starting point. The service must decide which resources and fields the caller may access, what inputs it will accept and how much work one request can cause. These controls belong to the operation's semantics, not solely to the gateway in front of it.

## Why it matters for backend engineers

Backend APIs often connect a small request to a large effect: a few bytes can launch a report over millions of records or ask a worker to download an arbitrary URL. A request-per-second limit does not account for that difference in cost.

The same applies to data access. A token can be valid while its owner has no authority over the supplied account ID. Security testing must therefore include authenticated misuse and expensive legal inputs, not only unauthenticated requests and obviously malformed JSON.

## How it works

Build protection around the path from input to effect. Authenticate the actor, establish resource scope from trusted data, validate the operation and accepted fields, then enforce business constraints before committing the effect. Use parameterized SQL so input values are not interpreted as query syntax; dynamic identifiers such as sort columns still need an explicit allowlist.

Bound resource use at the layer where it occurs. Request-body limits constrain ingress bytes, parser limits constrain expansion and nesting, query limits constrain scanned work, and worker concurrency controls expensive jobs. A compressed input can be small on the wire and huge after extraction, so one byte limit is not sufficient.

For outbound URL features, defend against server-side request forgery (SSRF). Validation must account for destinations, resolution, redirects and actual connection behavior. Network egress restrictions provide an additional boundary against internal services. A string check for `localhost` alone is not a reliable destination policy.

Apply operation-specific abuse controls. Per-tenant budgets, concurrent-job limits and durable deduplication can be more useful than an IP limit when many users share an address or attackers control many addresses. Preserve enough audit context to attribute misuse without logging sensitive request contents.

## Key concepts

**Object-level authorization** checks whether the actor may use the particular resource, not merely the endpoint. Tests should substitute another tenant's resource ID while retaining valid credentials.

**Property-level authorization** determines which fields can be read or changed. Request DTOs with explicit writable fields help prevent a customer from setting internal approval state through mass assignment.

**Resource amplification** is the ratio between cheap input and expensive work. Large date ranges, nested queries, archive expansion and unlimited exports need controls specific to their execution cost.

**Business-flow abuse** uses allowed operations in an unintended sequence or volume. Repeated promotion redemption or reservation hoarding may require business constraints, not just a web application firewall rule.

**Idempotency and replay** are related but distinct. An idempotency key can prevent duplicate execution of the same operation, but does not authorize it or stop a malicious actor from submitting new keys repeatedly.

## Production example

A reporting API accepts an organization ID, date range and callback URL, then queues an export. The first implementation checks the user's token and enforces ten requests per second. One request can nevertheless read another organization's records or start an enormous export.

The team separates the controls. Organization membership scopes the query. The date range and export size have explicit limits. Each organization gets a bounded number of in-flight jobs, and the worker enforces a deadline and output budget. Callback delivery runs under a destination policy with controlled redirects and egress access.

Tests use valid users from two organizations and attempt cross-organization exports. A user tries to set internal fields such as `approved=true`. Large but syntactically valid date ranges exercise the cost limits. Callback tests include redirects toward disallowed destinations. These are separate assertions because passing one does not imply the others hold.

Operational metrics show rejected requests by reason, queued jobs by tenant and actual execution cost. If a legitimate customer needs a larger export, the product offers a deliberate asynchronous path or adjusted quota rather than disabling protections globally. This makes the boundary both secure and usable.

## Trade-offs

Strict limits can reject legitimate bulk work. Limits should therefore reflect the service's capacity and product contract, with an explicit way to handle larger supported workloads. Silent truncation is usually worse than a clear rejection because it can make incomplete reports appear correct.

Layered controls add implementation effort and can overlap. Assign each a purpose: the gateway limits ingress, the service enforces business authority and the worker bounds expensive execution. Duplicating authentication at several layers does not compensate for missing object authorization.

## Failure modes / pitfalls

- **Opaque IDs are treated as permissions.** IDs can appear in logs, links or exports. Possession does not establish authority.
- **CORS is treated as API authentication.** Browser cross-origin policy does not stop a direct HTTP client from calling the endpoint.
- **Only the first URL is checked.** Redirects or mismatched resolution and connection behavior can bypass a superficial destination check.
- **Request count stands in for workload cost.** One export can consume more resources than thousands of small reads. Bound concurrency and work size.
- **Internal endpoints escape the inventory.** Deprecated APIs and administrative routes can remain reachable after the main product path is hardened.
- **Errors disclose sensitive details.** Return useful failure categories without revealing another tenant's data or embedding credentials in diagnostics.

## When to use it

Apply API security to every exposed operation, including internal automation and asynchronous submission endpoints. Start from the actors, resources and effects of each route, then write negative tests for the boundaries that matter.

Revisit abuse controls when product usage changes. A feature that was safe for a handful of manual users may become expensive when exposed to integrations that can invoke it continuously.

## When not to use it

Do not delegate all authorization to a gateway that lacks the application's resource relationships. Do not treat a clean dependency scan or a valid schema as evidence that a business operation is authorized.

Avoid expensive or intrusive controls without a threat or resource model. The aim is to prevent concrete misuse while preserving legitimate workflows, not to accumulate arbitrary restrictions that users must bypass.

## What a Senior Engineer should know

A Senior Engineer should review an endpoint from input to side effect, identify who controls each value and test resource, property and tenant boundaries. They should recognize amplification paths and place limits where the expensive work occurs.

They should also inspect generated endpoints, callbacks and background execution. A safe submission handler does not guarantee that a worker later applies the same assumptions or that authorization remains valid when queued work runs.

## What a Staff Engineer should understand

A Staff Engineer should maintain API ownership and inventory, establish common enforcement primitives and make abuse economics visible across services. Shared limits need tenant fairness so one customer's work cannot starve another's.

Coordinate incident response for abused credentials and APIs, including revocation, targeted restrictions and safe recovery of queued work. Track recurring defect classes and strengthen shared interfaces when teams repeatedly miss the same boundary.

Further reading: [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/), [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).
