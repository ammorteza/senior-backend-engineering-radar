---
title: "JSON Schema"
ring: trial
segment: languages-and-frameworks
tags: [backend]
---

## What it is

JSON Schema is a vocabulary for describing and validating JSON instances. A schema can constrain types, object properties, required members, numeric/string limits, array structure, and combinations of alternatives.

Its behavior depends on the declared dialect. Draft 2020-12, for example, defines keywords and vocabularies differently from older drafts. A validator configured for another dialect can accept, reject, or ignore constructs in ways the schema author did not expect.

## Why it matters for backend engineers

JSON appears in APIs, configuration, events, and stored documents. Declarative validation prevents malformed shapes from reaching deeper code and provides reusable tooling for documentation and tests.

Schema validation is only one layer. It can establish “this field is an integer between 1 and 100”; it cannot establish “this account belongs to the authenticated user” or “this URL is safe for the server to fetch.” Engineers must keep syntactic/structural validation separate from business and security validation.

## How it works

A validator evaluates an instance against a schema under a chosen dialect. `$schema` identifies the dialect, and `$id` can identify schemas for reference resolution. `$ref` reuses another schema; remote reference loading should be controlled so validation does not become arbitrary network access.

Object keywords such as `properties` describe member schemas. A member is not required merely because it appears under `properties`; `required` controls presence. Nullability is modeled by allowing the `null` type, for example `"type": ["string", "null"]`.

Composition keywords have precise logic. `allOf` requires every subschema to succeed. `anyOf` requires one or more. `oneOf` requires exactly one, which means overlapping alternatives can make an instance invalid even though each branch looks reasonable in isolation.

Draft 2020-12 distinguishes tuple prefixes using `prefixItems` and subsequent items using `items`. It also separates `format` annotation from assertion vocabulary behavior. Do not assume every validator enforces formats such as email or URI unless it is configured to do so.

## Key concepts

**Dialect.** Pin the dialect and validator version in tests. “Valid JSON Schema” is incomplete without knowing which draft and vocabularies apply.

**Presence versus null.** Missing and explicit null often have different product meaning. Model them separately and test both.

**Open versus closed objects.** `additionalProperties: false` can catch typos, but can also make additive evolution breaking. Draft 2020-12's evaluated-property features can help complex composition, but require tool support.

**Reference resolution.** Relative references depend on base identifiers. Bundling schemas can reduce runtime network dependencies and supply-chain ambiguity.

**Validation cost.** Deeply recursive or highly ambiguous combinations can consume substantial CPU. Treat schemas supplied by untrusted users as executable validation workload with limits.

## Production example

A webhook configuration API accepts:

```json
{
  "destination": "https://hooks.example.net/orders",
  "events": ["order.created", "order.cancelled"],
  "timeout_ms": 3000
}
```

The schema requires `destination` and `events`, limits event count, bounds the timeout, and rejects unknown top-level fields so a typo such as `timout_ms` does not silently fall back to a default.

The application then performs checks JSON Schema cannot safely replace: the authenticated tenant may configure only its own integration, event names must be enabled for that tenant, and the destination must satisfy the service's SSRF policy. A string matching a URI format is not evidence that connecting to it is safe.

The team pins Draft 2020-12 and the validator version in CI. Tests cover missing versus null values, two `oneOf` branches accidentally matching the same object, an unknown property, oversized event arrays, and the validator's configured `format` behavior.

Schemas are bundled with the service rather than fetched from arbitrary instance-provided URLs at runtime. When a new optional configuration field is added, the team checks whether existing “closed object” consumers can accept it before declaring the change compatible.

## Trade-offs

Declarative validation improves reuse and consistency, but complex schemas can become harder to understand than straightforward application code. Composition is powerful but can produce verbose and confusing error messages.

Closing object shapes catches mistakes early while reducing forward compatibility. Leaving them completely open improves extensibility but can hide misspelled configuration. The right policy depends on whether producer and consumer evolve together.

## Failure modes / pitfalls

Using the wrong dialect can change keyword behavior. Assuming `format` always rejects invalid values creates false confidence. Treating `oneOf` as “at least one” produces surprising failures when two branches match.

Fetching remote `$ref` targets during request validation introduces availability and trust risks. Very broad regular expressions or recursive schemas can create expensive validation. A valid schema can still authorize the wrong tenant or express a semantically impossible combination.

## When to use it

Use JSON Schema for configuration, API/message boundary validation, and reusable data-shape contracts where JSON is the actual interchange format.

It is especially useful when multiple tools need to validate or document the same shape.

## When not to use it

Do not use JSON Schema as a replacement for business invariants that depend on database state, identity, or external systems. Do not force a highly procedural rule into an unreadable declarative schema merely to keep all validation in one format.

For a tiny internal struct validated in one language, native type validation may be simpler.

## What a Senior Engineer should know

A Senior Engineer should understand dialects, required/null distinctions, composition, reference resolution, additional/unevaluated properties, and validator configuration.

They should return actionable validation errors and know which critical rules remain outside the schema.

## What a Staff Engineer should understand

A Staff Engineer should define schema-version policy, validator support, remote-reference rules, and compatibility expectations across producers and consumers.

They should also consider validation cost and supply-chain behavior when schemas become user-provided or distributed across many repositories.

Further reading: [JSON Schema Specification](https://json-schema.org/specification), [Draft 2020-12](https://json-schema.org/draft/2020-12/).
