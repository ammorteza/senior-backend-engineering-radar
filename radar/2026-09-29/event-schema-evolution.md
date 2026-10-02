---
title: "Event schema evolution"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Event-schema evolution changes an asynchronous contract while producers, live consumers and replay jobs may run different versions. Historical events make compatibility a long-lived obligation.

## Why it matters for backend engineers

A consumer deployed today may encounter an event written months ago. A coordinated deployment is insufficient when retained messages or independent teams outlive the rollout window.

## How it works

Identify which readers must read which writers' data. Add optional fields or defaults where the encoding supports them; preserve field meanings. Introduce a new event type or version when semantics genuinely change, run old and new consumers during migration, and test recorded historical fixtures.

## Key concepts

Backward compatibility lets new readers read old data; forward compatibility lets old readers handle new data. Transitive checks include earlier versions. Unknown enum values, required fields and default values have format-specific behavior; syntactic compatibility does not establish semantic compatibility.

## Production example

A subscription event's `amount` originally means euros. Changing it to cents preserves the integer schema but multiplies invoices by one hundred. Introduce an explicit minor-unit field and currency, verify both consumer versions, then retire the ambiguous field after usage and replay requirements are addressed.

## Trade-offs

Additive contracts support independent releases but accumulate deprecated fields. New versions clarify changes while increasing migration and transformation work.

## Failure modes / pitfalls

Renaming fields, reusing Protobuf numbers, making optional data mandatory and ignoring archival replay break consumers. A registry cannot detect changed business meaning automatically.

## When to use it

Use compatibility policies on durable events shared across independently deployed consumers.

## When not to use it

Do not version every harmless metadata addition or assume strict schemas remove the need for consumer tests.

## What a Senior Engineer should know

Test old/new reader-writer combinations and document units, nullability and defaults.

## What a Staff Engineer should understand

Set contract ownership, deprecation windows and historical-data migration strategy.

Further reading: [Avro schema resolution](https://avro.apache.org/docs/current/specification/), [Protobuf updating messages](https://protobuf.dev/programming-guides/proto3/#updating).
