---
title: "AI tool calling and structured outputs"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Tool calling lets a model request a named operation with structured arguments. Structured outputs constrain response shape; neither mechanism establishes that the requested action is authorized or semantically correct.

## Why it matters for backend engineers

A schema-valid amount can still be negative for the business operation, or reference another tenant's account. Deterministic validation must sit between generated arguments and real effects.

## How it works

Present clear tool descriptions and schemas. Parse the model's request, validate shape and domain constraints, authorize it against trusted identity, then execute. Return a typed outcome that distinguishes success, rejection and unknown completion. The next model step reasons from that outcome under a bounded loop.

## Key concepts

Syntactic validity differs from semantic validity. Idempotency keys identify one logical mutation. Tool results are untrusted data for subsequent reasoning. Models may decline, truncate or emit unsupported calls; the application must handle these cases explicitly.

## Production example

A scheduling assistant proposes `create_hold` with a facility ID and expiry. The service checks tenant ownership, expiry bounds and available capacity before writing. A timeout is resolved with the original operation key rather than issuing another hold. Structured output made parsing predictable; service checks made the action safe.

## Trade-offs

Typed interfaces reduce parsing ambiguity. Rich tool menus increase selection complexity and attack surface; strict schemas can still permit harmful valid requests.

## Failure modes / pitfalls

Trusting model-supplied identity, executing before authorization and retrying uncertain mutations with new IDs create failures.

## When to use it

Use tool calling for explicit application operations and structured outputs for machine-consumed results.

## When not to use it

Do not expose a generic unrestricted shell or database tool where a narrow operation suffices.

## What a Senior Engineer should know

Implement schema, domain and permission validation with clear outcome semantics.

## What a Staff Engineer should understand

Design capability boundaries and audit evidence independently of model reliability.

Further reading: [MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).
