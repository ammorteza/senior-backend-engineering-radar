---
title: "API design and evolution"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

API design defines the contract between a service and its consumers: operations, identifiers, request and response shapes, errors, concurrency behavior, retry semantics, and compatibility rules. API evolution is the discipline of changing that contract while existing consumers continue to work or migrate deliberately.

The contract is larger than the schema. A field can keep the same type while its unit changes, a `POST` can remain syntactically identical while becoming unsafe to retry, and a list response can keep the same JSON shape while changing ordering in a way that breaks cursor pagination. Good API design makes these behavioral assumptions explicit.

## Why it matters for backend engineers

APIs create long-lived coupling. An internal endpoint used by five teams can be harder to change than a public endpoint used by one controlled client because each consumer has its own deployment cadence, retry policy, and assumptions.

Senior engineers therefore need to design for failure and evolution from the beginning. Questions such as “What happens if the client times out after the server commits?”, “Can a consumer distinguish conflict from overload?”, and “What is a stable page boundary while new rows arrive?” are API questions, not implementation details.

## How it works

Start from the business operation rather than the transport. Define the resource or command, who owns it, which identifiers are stable, and what constitutes success. Then map that meaning to HTTP, gRPC, or another protocol.

For reads, define filtering, ordering, pagination, consistency, and cache behavior. For writes, define validation, authorization, concurrency control, idempotency, and the result of repeated or conflicting requests. Errors should separate caller mistakes from transient server conditions because clients react differently to each category.

Evolution usually works best through additive changes. Add optional fields with safe defaults, add new operations, or introduce new enum values only when old consumers can handle them. Breaking changes require an overlap period: producers and consumers support both representations, usage is observed, and the old contract is removed only after migration evidence exists.

Compatibility must include behavior. Renaming a field while preserving an alias may be syntactically compatible, but changing “amount” from euros to cents is not. Similarly, adding a new enum value can break a client that assumes exhaustive handling even though decoding succeeds.

## Key concepts

**Resource identity.** Stable identifiers should survive display-name changes and deployment boundaries. Do not overload mutable business attributes as permanent identity unless the domain guarantees that stability.

**Idempotency.** Naturally idempotent operations such as replacing a representation with `PUT` differ from commands that need an idempotency key to make retries safe. The retry contract must include how long keys are remembered and what happens when the same key carries different input.

**Optimistic concurrency.** Version numbers, ETags, or conditional writes allow clients to reject stale updates rather than silently overwrite newer state.

**Pagination.** Offset pagination is simple but shifts as rows are inserted or removed. Keyset or cursor pagination should encode a deterministic ordering, commonly including a unique tie-breaker. Pagination does not by itself create a stable snapshot across requests.

**Error model.** Distinguish validation, authentication, authorization, not-found, conflict, rate limiting, temporary unavailability, and internal failure. A machine-readable error code can remain stable even when human text changes.

**Deprecation.** A deprecation needs ownership, observability, a consumer migration path, and a removal criterion. A date without knowledge of who still calls the endpoint is only a hope.

## Production example

A reporting API exposes:

```http
GET /reports?status=ready&limit=100&offset=200
```

A client processes all ready reports page by page. While it is reading, new reports become ready and sort ahead of rows it has not yet seen. Offsets shift, so the client can process a report twice or miss one.

The team first defines a deterministic order: `created_at DESC, id DESC`. It introduces cursor pagination where the response contains the last pair `(created_at, id)` and the next request asks for rows strictly after that boundary in the same ordering. The API also caps page size and documents that each page reflects current data rather than one frozen snapshot.

The old offset parameters remain available during migration. Metrics identify remaining offset consumers by client identity. Contract tests exercise equal timestamps, rows inserted between pages, deleted rows, invalid cursors, and the final empty page.

A separate write endpoint creates report-generation jobs. Because clients retry after timeouts, the API accepts an idempotency key and returns the existing job for a repeated request with the same meaningful parameters. Reusing the key with a different report definition is rejected as a conflict.

Only after consumers migrate and the deprecation objective is met does the service remove the offset contract. The migration changes both schema and behavior deliberately instead of shipping a “v2” endpoint with unspecified differences.

## Trade-offs

Very generic APIs reduce endpoint count but often weaken semantics: a generic “execute action” endpoint can hide authorization, retry, and observability differences between actions. Extremely specialized endpoints can make one client simple while creating a large surface area and duplicated policy.

Strict compatibility preserves independent deployment but slows cleanup. Coordinated breaking changes can be reasonable inside a tightly controlled system; the cost should be explicit rather than hidden behind “internal API” assumptions.

Schema-first development improves agreement and tooling, while code-first development can move faster in small teams. In both cases, the implementation and contract need automated drift checks.

## Failure modes / pitfalls

Exposing database rows directly leaks storage choices into the API and makes migrations harder. State-changing `GET` endpoints are unsafe around caches and retries. Unbounded list endpoints convert one request into uncontrolled database work.

Breaking enum changes, ambiguous nullability, inconsistent errors, and server defaults that change over time create subtle compatibility failures. Versioning every small change produces permanent parallel APIs; refusing all versioning can force unsafe flag-day migrations.

Another common failure is assuming a 2xx response means the complete business workflow finished. For asynchronous work, return an operation identity and explicit state such as pending, completed, or failed.

## When to use it

Apply deliberate API design whenever a contract crosses a process, team, organizational, or trust boundary. The more independently producers and consumers deploy, the more important compatibility and deprecation become.

For important APIs, keep executable examples and contract tests near the implementation so behavior can be verified during change.

## When not to use it

Do not create remote APIs between modules that belong in one deployable unit merely to imitate a microservice architecture. An in-process interface is easier to refactor and does not introduce network failure.

Do not build a broad “platform standard” that forces every domain into one resource shape when their concurrency and workflow semantics differ.

## What a Senior Engineer should know

A Senior Engineer should be able to design identifiers, pagination, idempotent writes, concurrency checks, error categories, timeouts, and backward-compatible changes. They should review a client retry as part of the API behavior, not as a client-only concern.

They should write negative contract tests, identify breaking semantic changes even when schemas still validate, and run staged deprecations using real usage evidence.

## What a Staff Engineer should understand

A Staff Engineer should establish lightweight API governance that improves interoperability without creating a central approval queue. They should standardize high-value conventions—identity propagation, errors, pagination, compatibility, and deprecation—while leaving domain semantics with the owning team.

They should also plan organization-wide migrations, identify highly coupled contracts, and decide when an API boundary is creating more coordination cost than architectural value.

Further reading: [RFC 9110 HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110), [Google API Improvement Proposals](https://google.aip.dev/).
