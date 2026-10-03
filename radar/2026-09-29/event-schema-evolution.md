---
title: "Event schema evolution"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Event-schema evolution changes a durable contract while producers, consumers and replay jobs may use different versions. Compatibility includes the encoded shape and the meaning of the data. A field can remain an integer while changing units in a way that corrupts every consumer's calculation.

Unlike a short-lived request/response interaction, stored events can outlive many deployments. The relevant compatibility horizon includes retained topics, archives, dead-letter records and recovery tools, not just the services currently running.

## Why it matters for backend engineers

Teams often deploy a new consumer before a producer or vice versa. Safe evolution lets them do that without requiring a perfectly coordinated rollout. Historical replay adds another requirement: today's consumer may need to interpret years-old facts.

An event contract is therefore an operational commitment. Engineers need to know which readers still exist, which historical forms remain recoverable and whether a default genuinely represents missing information. A registry check cannot infer business meaning or discover an unregistered export script.

## How it works

Start with a reader/writer matrix. Backward compatibility means the new reader can interpret older writer data. Forward compatibility means an older reader can handle newer writer data. Full compatibility combines both directions; transitive checks extend the comparison beyond only the immediately preceding schema.

The encoding determines the rules. Avro resolves writer and reader schemas; a reader default can supply a field absent from older data, but does not make the writer free to omit that field arbitrarily. Protobuf binary messages identify fields by number; removed numbers must not be reused, and JSON conversion has different compatibility constraints from binary transport.

Stage a change by adding a representation that old readers tolerate, deploying readers that handle both forms and then switching writers. Preserve old meanings during overlap. If the business concept changes substantially, a new event type or explicit semantic version may communicate the boundary more clearly than accumulating ambiguous optional fields.

Retirement follows evidence: active consumers migrated, historical replay addressed and operational tools updated. Deleting a schema because no current producer writes it can break recovery of old records. Keep the schemas or transformations necessary for the supported history.

## Key concepts

**Missing, null and default are distinct.** “Currency absent,” “currency unknown” and “currency is EUR” are different claims. A convenient default can turn incomplete history into false data.

**Syntactic versus semantic compatibility.** Parsers can accept a message whose units, enum interpretation or timestamp basis changed. Tests need expected business results, not only successful deserialization.

**Unknown values.** Generated clients and encodings handle unknown enums or fields differently. Consumer control flow must have an intentional policy rather than crashing or silently treating a new state as an old one.

**Envelope versus payload version.** A CloudEvents specification version says how to interpret the envelope. It does not version the domain data or establish that two event types mean the same thing.

**Historical transformation.** An upcaster adapts an old representation for a current reader. It cannot reconstruct facts that were never recorded; missing information may need an explicit unknown state or a separate authoritative lookup.

## Production example

A subscription platform originally emits `amount` as an integer number of euros. It needs fractional charges and proposes changing that same integer to cents. Both versions satisfy the old type check, but interpreting 1,250 cents as 1,250 euros would overstate the amount by a factor of one hundred.

The team introduces an explicitly named minor-unit amount and currency under a documented currency-scale policy. During migration, new readers prefer the new representation and understand how valid old records map to it. They reject inconsistent combinations instead of quietly choosing whichever field is nonzero.

Old consumers continue to require the original semantics. If a fractional charge cannot be represented in the old form, the producer must not publish a rounded value and call it compatible. The team either completes consumer migration before enabling such charges or introduces a separately governed event type.

Fixtures include historical whole-unit events, new fractional values, absent currency under the old documented contract, and an unknown future enum value. The team runs old-reader/new-writer and new-reader/old-writer checks for the combinations it actually promises.

A replay from archived events is included in acceptance. Its totals are compared with hand-calculated expectations, because “all messages decoded” would miss the unit error. This example concerns representation and compatibility, not a recommendation for a particular billing policy.

## Trade-offs

Additive changes support independent releases but accumulate transitional fields and interpretation rules. New event types clarify semantic breaks while requiring routing, migration and sometimes dual publication.

Strict registries catch useful structural mistakes, but can also encourage teams to focus on passing the registry instead of preserving meaning. Combine automated checks with a short contract covering identity, units, time basis, nullability and intended consumers.

## Failure modes / pitfalls

Renaming a field can be a breaking change depending on the encoding and aliases. Reusing a Protobuf number can make old bytes mean something new. A default can hide missing data rather than repair it.

Dual publishing can make a consumer process the same business occurrence twice unless it knows the relationship between versions. Retiring old schemas before dead-letter or archive replay expires can turn an ordinary recovery into a migration project.

## When to use it

Use explicit compatibility policy for durable messages exchanged across independent deployments. Keep representative historical fixtures with the contract and validate meaning as well as decoding.

Make deprecation windows depend on actual retention and consumers, not only the release calendar.

## When not to use it

Do not create a new major event type for every harmless optional metadata addition. Do not impose the same compatibility mode on every dataset without examining its readers and recovery needs.

Avoid claiming that a schema registry establishes semantic safety. Human decisions about units and state meaning remain part of the contract.

## What a Senior Engineer should know

A Senior Engineer should build the reader/writer matrix, understand the actual encoding rules and test unknown or missing values. They should recognize changes that preserve types while breaking meaning.

They should plan the mixed-version period and prove that replay still produces the intended results after old writers disappear.

## What a Staff Engineer should understand

A Staff Engineer should define contract ownership, consumer discovery and supported historical horizons across teams. Provide an exception path when a genuine semantic break is clearer than indefinite compatibility scaffolding.

Budget for schema retention and transformations as part of disaster recovery. An event archive is useful only while the organization can still interpret its facts correctly.

Further reading: [Avro schema resolution](https://avro.apache.org/docs/1.12.0/specification/), [Protobuf schema evolution](https://protobuf.dev/programming-guides/proto3/#updating).
