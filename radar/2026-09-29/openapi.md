---
title: "OpenAPI"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

OpenAPI describes HTTP API operations, inputs, responses and security requirements in a machine-readable document. It supports documentation and tooling without automatically defining every behavioral guarantee.

## Why it matters for backend engineers

Clients need a stable contract, and implementation drift can invalidate generated SDKs. Pagination, idempotency and error behavior need explicit documentation beyond field shapes.

## How it works

A document defines paths, operations, parameters, request bodies and response schemas. Tools can generate clients, render documentation or validate requests. Supported OpenAPI versions differ in schema behavior and tool compatibility, so teams should select a version deliberately rather than assuming every generator supports the same features.

## Key concepts

Required fields differ from nullable values. Security declarations describe schemes and requirements, not actual enforcement. Response headers and error schemas matter to clients. Compatibility checks should compare changed operations and model fields.

## Production example

A file API declares a bounded upload and asynchronous processing response. Generated clients expose the job ID, while documentation explains polling and retry identity. Contract tests catch a server returning an undocumented error body, and CI checks the spec's generated outputs for drift.

## Trade-offs

A shared contract reduces manual client work. Generation can expose awkward types or lock callers into generator conventions; a schema alone cannot validate business behavior.

## Failure modes / pitfalls

Stale documents, unconstrained `additionalProperties`, missing error responses and trusting generated validation as authorization create gaps.

## When to use it

Use OpenAPI for maintained HTTP contracts, especially with multiple clients or external consumers.

## When not to use it

Do not add a large generation pipeline for an interface whose modest needs a simpler maintained contract meets.

## What a Senior Engineer should know

Model parameters, nullability and errors; test the implementation against the chosen specification version.

## What a Staff Engineer should understand

Own compatibility and SDK lifecycle without turning schemas into bureaucracy.

Further reading: [OpenAPI specification](https://spec.openapis.org/oas/latest.html).
