---
title: "JSON Schema"
ring: trial
segment: languages-and-frameworks
tags: [backend]
---

## What it is

JSON Schema describes constraints on JSON instances, including types, object properties, arrays and composition. A schema's declared dialect determines the meaning of its keywords.

## Why it matters for backend engineers

Boundary validation catches malformed payloads before they reach business logic. It does not determine whether a valid amount belongs to the caller or whether a referenced account exists.

## How it works

A validator evaluates an instance against schema assertions. `$schema` identifies the dialect; `$ref` reuses definitions. Keywords such as `required`, `minimum` and `additionalProperties` restrict values. Composition with `allOf`, `anyOf` and `oneOf` has distinct logic; `oneOf` requires exactly one matching branch.

## Key concepts

Presence differs from nullability. A property listed under `properties` is not automatically required. Format behavior depends on dialect and validator configuration. Remote references can introduce availability or trust issues and should be controlled.

## Production example

An integration accepts webhook configuration. The schema requires an HTTPS URL string and limits event-list size; business validation additionally rejects destinations inside private networks under the application's SSRF policy. The team tests ambiguous `oneOf` branches and pins the validator dialect in CI.

## Trade-offs

Declarative validation is reusable across tooling. Complex compositions can produce confusing errors or high evaluation cost; custom semantics still belong in application checks.

## Failure modes / pitfalls

Using a schema with the wrong dialect, assuming `format` is always enforced and closing objects too aggressively during evolution can break clients.

## When to use it

Use JSON Schema for configuration and JSON boundary validation with controlled validator behavior.

## When not to use it

Do not use it as a replacement for authorization, database constraints or semantic business validation.

## What a Senior Engineer should know

Understand required/null, composition and reference resolution; return actionable validation errors.

## What a Staff Engineer should understand

Define dialect, compatibility and validation-cost policies across producers and consumers.

Further reading: [JSON Schema documentation](https://json-schema.org/learn).
