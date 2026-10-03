---
title: "Protocol Buffers"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Protocol Buffers (Protobuf) define typed messages and services using numeric field identifiers and a compact binary wire format. Code generation maps those declarations into language-specific APIs.

The field number, not the source-code field name, is the durable binary identity on the wire. That is why changing or reusing numbers is more dangerous than renaming a source symbol. Binary compatibility also differs from ProtoJSON compatibility; a change safe in one representation can be unsafe in the other.

## Why it matters for backend engineers

Protobuf schemas often outlive individual deployments because services roll independently, messages may be retained, and historical data can be replayed. A careless schema edit can reinterpret old bytes or cause one client language to treat presence differently from another.

Generated code reduces serialization boilerplate, but it cannot preserve business meaning automatically. Changing “amount” from cents to micros remains semantically breaking even if the field type remains `int64`.

## How it works

A `.proto` file assigns each field a positive numeric tag and a wire-compatible type. Encoded messages carry the field number and wire type, allowing readers to skip unknown fields. This supports additive evolution: a new writer can include a field an old reader does not understand, and the old reader can usually ignore it in the binary format.

When removing a field, reserve its number and preferably its name. Reusing the number can cause archived messages or old writers to be interpreted as a completely different concept.

Presence depends on field kind and language API. Message fields, `optional` scalar fields, and oneof members can distinguish unset state in ways ordinary implicit-presence proto3 scalars may not. Choose explicit presence when “not supplied” differs from the scalar's default value.

Enums can receive new values. Consumers must not assume they will only ever see the values known at compile time; language behavior for unknown enum values should be tested.

ProtoJSON maps fields by names rather than numeric tags and has different evolution constraints. Renaming a field can therefore be binary-safe while breaking JSON interoperability.

## Key concepts

**Field number stability.** Numbers are the wire identity. Never renumber existing fields merely to make the source file tidy.

**Unknown fields.** Binary readers can preserve or ignore fields they do not understand depending on runtime behavior. Application logic still must tolerate future data intentionally.

**Presence.** Zero, false, empty string, and absent can represent different domain states. Use schema constructs that preserve the distinction when it matters.

**oneof.** A oneof represents mutually exclusive alternatives. Moving fields into or out of oneofs can have subtle compatibility consequences and needs mixed-version tests.

**Generated-code/tool version.** Protoc, plugins, and runtime libraries evolve. Pin compatible versions in builds and test upgrades as part of schema tooling.

## Production example

A billing event originally contains:

```proto
message Charge {
  string charge_id = 1;
  int64 amount_minor = 2;
  string currency = 3;
  string discount_code = 7;
}
```

The product removes `discount_code`. The team marks field 7 reserved instead of assigning 7 to a new `payment_method` field:

```proto
message Charge {
  reserved 7;
  reserved "discount_code";

  string charge_id = 1;
  int64 amount_minor = 2;
  string currency = 3;
  optional string payment_method = 8;
}
```

Archived messages containing field 7 remain unambiguously historical discount data. New readers do not reinterpret those bytes.

The team also keeps the unit encoded in the field name and documentation. A later requirement for greater precision introduces a new field with explicit semantics rather than silently changing `amount_minor`.

Compatibility tests serialize with the old writer and read with the new code, then reverse the direction for the supported overlap. They test unknown enum values and ProtoJSON clients separately because binary compatibility does not guarantee JSON compatibility.

## Trade-offs

Protobuf offers compact encoding, generated types, and efficient RPC integration. It is less convenient for manual inspection and ad hoc editing than JSON, and generated-code/tooling lifecycle becomes part of the repository.

Strict field discipline preserves long-term compatibility but leaves gaps and historical names in schemas. That “untidiness” is valuable evidence of the wire contract.

## Failure modes / pitfalls

Reusing a removed field number can corrupt meaning. Changing a field to a wire-incompatible type breaks mixed versions. Even some wire-compatible numeric changes can truncate or reinterpret values at application level.

Assuming scalar default values mean “not provided” loses presence information. Treating enums as closed can crash or reject newer producers. Converting through JSON can lose assumptions that were safe in binary form.

Schema registries or CI checks also cannot detect semantic changes such as units or changed authorization meaning.

## When to use it

Use Protobuf for typed service contracts, gRPC, and durable binary messages where controlled schema evolution and code generation provide clear value.

It works well when producers and consumers are engineered systems rather than humans editing payloads manually.

## When not to use it

Prefer JSON or another self-describing human-oriented format when manual inspection, browser-native interoperability, or loosely coupled external consumers matter more than binary efficiency and generated types.

Do not adopt Protobuf solely for performance without measuring whether serialization is actually a bottleneck.

## What a Senior Engineer should know

A Senior Engineer should manage field-number identity, reservations, presence, unknown enum values, oneofs, and reader/writer compatibility. They should test the actual representations in use, including ProtoJSON if applicable.

They should recognize semantically breaking changes that schema tooling cannot detect.

## What a Staff Engineer should understand

A Staff Engineer should define schema ownership, compatibility policy, toolchain/version management, and retention-aware evolution across teams.

They should establish how deprecated fields are retired, how old data remains readable, and how generated-code changes are rolled out without forcing organization-wide lockstep deployment.

Further reading: [Protocol Buffers proto3 guide](https://protobuf.dev/programming-guides/proto3/), [ProtoJSON format](https://protobuf.dev/programming-guides/json/).
