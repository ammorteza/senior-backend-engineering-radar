---
title: "CRDTs"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Conflict-free Replicated Data Types (CRDTs) are data structures designed so replicas can accept certain updates independently and later converge through mathematically defined merge rules.

The important promise is convergence under the CRDT's assumptions, not preservation of every possible business invariant. A counter can merge independently incremented values safely; a globally bounded resource can still be oversubscribed if disconnected replicas authorize too much independently.

## Why it matters for backend engineers

Some products must work during disconnection or high network latency: collaborative editors, mobile/offline state, geographically distributed counters, and replicated metadata.

Traditional strong coordination can make every update wait for remote agreement. CRDTs move conflict-handling rules into the data type so selected operations can proceed without that coordination.

This power is easy to overgeneralize. “Eventually converges” says the replicas will agree later; it does not say the agreed state is acceptable to the business.

## How it works

**State-based CRDTs** periodically exchange state and merge using an operation that is associative, commutative, and idempotent—often a join over a semilattice. Repeating or reordering state exchange does not change the final merged result.

A grow-only counter can store one monotonically increasing component per replica. Each replica increments only its own component. Merge takes the component-wise maximum, and the logical count is the sum. Replaying the same state does not double-count.

**Operation-based CRDTs** disseminate operations under the delivery assumptions of that specific data type. Their correctness depends on those assumptions, such as causal delivery or unique operation identities.

Sets illustrate why semantics matter. A naive add/remove set cannot always decide what a concurrent add and remove should mean. Observed-remove designs attach identities so a remove removes additions that were observed, while a truly concurrent add can survive.

## Key concepts

**Convergence.** Replicas that receive the same relevant updates eventually compute equivalent state.

**Commutativity/idempotence.** Merge or operation rules are designed so network reordering and duplication do not corrupt state under the model.

**Causal metadata.** Version vectors, dots, tombstones, or other metadata can record which updates an operation observed. That metadata has storage and lifecycle cost.

**Conflict semantics.** Add-wins, remove-wins, multi-value registers, and last-write-wins registers encode different product decisions. “Use a CRDT set” is incomplete until the semantics are chosen.

**Invariant preservation.** Some invariants can be preserved without coordination; others cannot. Global uniqueness and bounded shared resources often require coordination or carefully preallocated rights.

## Production example

A social application wants reaction counts to update while regional replicas are disconnected.

Each region has its own grow-only counter component. Region A moves from 100 to 105 and region B from 87 to 90. When states merge, the combined counter uses maxima per region and sums them. Replaying B's state does not add those three reactions again.

The team then considers using the same technique for a globally limited promotional quota. Two disconnected regions can each believe enough quota remains and both allocate beyond the global limit. The states can converge perfectly—to an invalid business result.

For the bounded resource, the team either coordinates allocation or preallocates rights to regions under an invariant-preserving design and handles rights transfer explicitly. It does not declare the invariant solved because the data type converges.

For a reaction set, tests include add/remove delivered in both orders, concurrent add and remove, duplicate delivery, replica restart, and metadata compaction. Garbage collection is allowed only when the system can prove removed causal metadata is no longer needed by replicas that may return.

## Trade-offs

CRDTs improve availability and disconnected operation for data whose merge semantics match the product. They move complexity into metadata, data-type selection, and compaction.

State-based approaches can transmit more data; operation-based approaches depend more strongly on delivery assumptions. Rich collaborative structures can be significantly more complex than a transactional row.

## Failure modes / pitfalls

Choosing last-write-wins because it is simple can discard concurrent user intent and reintroduce wall-clock assumptions. Reusing replica identities can corrupt counters or version vectors.

Deleting tombstones or causal metadata before all relevant replicas advance can resurrect removed data. Treating convergence as business correctness can violate limits, uniqueness, or cross-object invariants.

Another pitfall is adopting CRDT terminology around ordinary “merge JSON objects” code without proving the required algebraic properties.

## When to use it

Use CRDTs when independent or offline writes are a real requirement and a known data type's concurrent semantics match the product.

Prototype the exact concurrent histories the product expects, not just sequential replication.

## When not to use it

Do not use a generic CRDT to avoid coordination for bounded shared resources or global uniqueness unless the chosen design explicitly preserves the invariant.

If one database leader or transaction already meets latency and availability needs, ordinary concurrency control is usually simpler.

## What a Senior Engineer should know

A Senior Engineer should demonstrate merge behavior for the selected data type, including duplicate, reordered, and concurrent updates. They should understand the metadata and delivery assumptions, not only the library API.

They should be able to explain which business invariants remain outside the CRDT guarantee.

## What a Staff Engineer should understand

A Staff Engineer should decide where disconnected operation is valuable enough to justify CRDT complexity and where coordination remains necessary.

They should plan replica identity, causal-metadata lifecycle, compaction, and migrations over long-lived deployments and ensure product teams explicitly choose conflict semantics.

Further reading: [CRDT resources](https://crdt.tech/), [A comprehensive study of CRDTs](https://hal.inria.fr/inria-00555588/document).
