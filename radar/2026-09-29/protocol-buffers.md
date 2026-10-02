---
title: "Protocol Buffers"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Protocol Buffers define typed messages with numbered fields and a compact binary encoding. Generated code handles serialization, while field-number discipline protects compatibility.

## Why it matters for backend engineers

Changing a schema can affect services and retained data long after deployment. Binary compatibility does not guarantee that consumers interpret a field's meaning correctly.

## How it works

A `.proto` declaration assigns each field a unique number and type. The wire format carries field tags and encoded values, allowing readers to skip unknown fields under supported rules. Generated code maps messages into language-specific types. JSON mappings have separate compatibility considerations from the binary format.

## Key concepts

Never reuse retired field numbers; reserve removed numbers and names where appropriate. Presence differs across field declarations and language APIs. Unknown enum values and `oneof` evolution require tests. Wire-compatible type changes can still truncate or reinterpret values.

## Production example

A billing message removes `discount_code` at field 7. The schema reserves 7 rather than assigning it to `currency`. Old archived messages therefore cannot reinterpret a discount string as currency. Compatibility tests exercise old writers with new readers and the reverse where required.

## Trade-offs

Compact encoding and generated APIs improve efficiency and consistency. Humans cannot inspect raw binary as easily as JSON, and code generation introduces tool-version management.

## Failure modes / pitfalls

Number reuse, changed units, missing presence checks and assuming JSON conversion preserves every binary detail break consumers.

## When to use it

Use Protobuf for typed service contracts and serialized data with controlled evolution.

## When not to use it

Prefer simpler formats when human editing or loose ecosystem integration matters more than generated types.

## What a Senior Engineer should know

Manage field identity, presence, defaults and reader/writer compatibility.

## What a Staff Engineer should understand

Set schema ownership and retention-aware evolution policies across services.

Further reading: [Protobuf language guide](https://protobuf.dev/programming-guides/proto3/).
