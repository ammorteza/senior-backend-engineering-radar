---
title: "CRDTs"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Conflict-free Replicated Data Types converge after replicas exchange updates, provided the datatype's mathematical rules and delivery assumptions hold. Conflict handling is encoded into the data structure.

## Why it matters for backend engineers

Offline collaboration cannot always coordinate each update. CRDTs let replicas accept selected operations independently while defining what merging means.

## How it works

State-based CRDTs merge states using an associative, commutative and idempotent join over an appropriate lattice. Operation-based designs deliver operations under their specified dissemination and ordering assumptions. A grow-only counter keeps per-replica counts and merges by componentwise maximum, then sums them.

## Key concepts

Convergence does not mean arbitrary business invariants survive. Observed-remove sets distinguish addition identities so removals can specify what was observed. Tombstones and causal metadata preserve information but need safe compaction. A last-write-wins register encodes a winner policy and may discard concurrent intent.

## Production example

A replicated reaction counter records separate replica contributions. Merging repeated state does not count the same increment twice. Using the same design for available credit would be unsafe: independent spending can exceed a limit despite eventual convergence. Credit requires coordination or a suitable bounded-allocation design.

## Trade-offs

Independent writes improve disconnected operation and availability. Metadata growth, merge semantics and garbage collection add complexity; some desirable invariants are not naturally coordination-free.

## Failure modes / pitfalls

Choosing the wrong set removal semantics, reusing replica IDs, deleting metadata before all replicas can observe it and claiming convergence equals correctness are major pitfalls.

## When to use it

Use CRDTs for counters, sets or collaborative state whose merge behavior matches product expectations.

## When not to use it

Do not use a generic CRDT to enforce global uniqueness or financial bounds without an explicit invariant-preserving design.

## What a Senior Engineer should know

Demonstrate merge properties and concurrent-update outcomes for the selected datatype.

## What a Staff Engineer should understand

Evaluate disconnected operation, metadata lifecycle and where coordination remains unavoidable.

Further reading: [CRDT research overview](https://crdt.tech/).
