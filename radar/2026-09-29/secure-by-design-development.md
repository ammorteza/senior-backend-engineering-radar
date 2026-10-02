---
title: "Secure-by-design development"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Secure-by-design development makes security properties part of a system's ordinary architecture and interfaces. Instead of asking every handler author to remember a tenant filter, the data-access API can require a trusted tenant scope. Instead of hoping callers remember timeouts, a supported client can require a bounded operation context.

The aim is to make safe behavior easy to use and difficult to bypass accidentally. Scanners and reviews remain useful, but they check a design that already expresses its security requirements rather than compensating for defaults that are unsafe.

## Why it matters for backend engineers

A recurring vulnerability often indicates an interface problem, not just an individual mistake. If five endpoints omit the same ownership check, fixing those five leaves the sixth endpoint vulnerable when it is written next month.

Backend engineers can change that pattern by moving an invariant into the appropriate shared boundary. This improves efficiency as well as safety: reviewers spend less time searching for boilerplate and more time examining the business-specific authority that the shared component cannot infer.

## How it works

Start with the assets and trust boundaries of the feature. State the security property in concrete terms, such as “ordinary customer requests cannot read another tenant's records.” Identify where all relevant paths converge and which inputs that boundary can trust.

Choose an interface that expresses the property. A repository can require a validated tenant context and always include it in queries. A request parser can accept an explicit set of fields rather than populate an unrestricted persistent model. A downloader can expose approved destinations rather than arbitrary network access.

Define safe behavior when configuration or context is missing. Missing tenant scope should reject the operation, not select all tenants. Missing policy data should not silently enable a permissive default. Provide a distinct, reviewed path for legitimate exceptional operations such as cross-tenant administration.

Verify the property with negative tests and operational checks. Include alternate entry points, background jobs and error handling. Revisit the design when a new use case does not fit; forcing it through an unsafe escape hatch weakens the original guarantee.

## Key concepts

**Secure defaults.** The ordinary configuration should minimize unnecessary exposure. An optional protection that every team must remember to enable is weaker than a default that requires explicit justification to relax.

**Least privilege.** Give code only the authority its responsibility needs. This includes cloud permissions, database roles, filesystem access and network reachability, not just user roles in the application.

**Defense in depth.** Independent controls address different failure paths. Tenant-scoped queries and a separate administrative identity can complement each other; repeating the same incorrect client-supplied tenant check twice does not add meaningful protection.

**Complete mediation.** Apply the relevant decision to every access path. An HTTP handler can be correct while an export worker or internal RPC bypasses the same boundary.

**Safe failure.** A dependency error must preserve the security property. Decide how to reject or defer work without leaking sensitive details or performing a partially authorized effect.

## Production example

A multi-tenant service has a generic `FindInvoice(id)` helper. Each handler is expected to compare the returned invoice's tenant with the authenticated user. During review, the team finds that an export route forgot the comparison.

They fix the route and change the ordinary repository interface to require a trusted tenant identifier: `FindInvoice(ctx, tenantID, invoiceID)`. Its query constrains both identifiers. List and update operations receive the same scope, and request decoding cannot populate that trusted value directly.

This API does not magically prove authorization: the handler must still establish the caller's membership and action permission. However, it removes a repeated, easily forgotten data-isolation step from ordinary callers. A separate administrative repository is available only to specifically authorized tooling, rather than through a `skipTenantCheck` Boolean on every method.

Tests attempt reads, lists and updates using another tenant's IDs. They also exercise exports and missing tenant context. The team reviews database access outside the repository because a direct SQL path could bypass the abstraction.

The improvement is structural: new endpoints using the supported interface inherit the isolation behavior. The team documents the remaining responsibilities so engineers do not mistake a scoped query for complete business authorization.

## Trade-offs

Shared controls prevent repeated mistakes but can become difficult to understand if they hide too much. A framework that implicitly changes identity or silently filters results can make authorization failures confusing. Prefer explicit inputs and clear rejection behavior.

Strict defaults sometimes block legitimate administrative workflows. Provide a separate, auditable path with appropriate authority rather than weakening the default for everyone. The cost of that separation should be compared with the risk of a widely available bypass.

## Failure modes / pitfalls

**A Boolean disables the main protection.** An escape hatch passed through ordinary application code can become the default workaround. Restrict exceptional authority structurally.

**Untrusted input is renamed “trusted.”** A typed tenant identifier still needs a trustworthy origin. Types help communicate a contract but cannot establish membership by themselves.

**Shared code is assumed to cover every path.** Search for direct database calls, alternate protocols and background consumers that bypass it.

**Security becomes only a final gate.** Late findings may require architecture changes that would have been cheap during design. Review new authority and data flows early.

**Configuration omission increases privilege.** Test absent and malformed settings, not only the fully configured deployment.

## When to use it

Use secure-by-design practices for new services and whenever recurring defects point to a weak shared interface. Start with concrete invariants that many callers must obey, such as tenant isolation, safe SQL construction or bounded parsing.

Improve existing systems incrementally. Introduce the safer interface, migrate callers, measure remaining bypasses and retire the unsafe entry point after its legitimate uses have a supported replacement.

## When not to use it

Do not create a large generic security framework before understanding the application's permissions and trust boundaries. An abstraction that cannot express real business rules invites bypasses.

Do not treat structural prevention as permission to remove independent testing or review. The shared component itself can be wrong, and some decisions remain specific to the operation and resource state.

## What a Senior Engineer should know

A Senior Engineer should turn a security requirement into an explicit interface, safe default and negative test. They should explain which invariant the shared component enforces and which responsibilities remain with callers.

They should recognize repeated review findings as a design signal and propose a migration that removes the unsafe path without breaking legitimate behavior. A good fix makes the next implementation safer, not merely the current diff.

## What a Staff Engineer should understand

A Staff Engineer should identify high-value shared controls and fund their maintenance, documentation and adoption. Standardization should reduce repeated security decisions while leaving business policy visible to the teams that own it.

Track remaining bypasses, exception use and recurring defect classes. Review whether supported paths remain usable as products evolve; a secure interface that teams routinely circumvent is an operational design problem, not just a training problem.

Further reading: [CISA Secure by Design](https://www.cisa.gov/securebydesign).
