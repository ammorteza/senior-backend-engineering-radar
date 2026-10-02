---
title: "Post-quantum cryptography readiness"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Post-quantum cryptography readiness is preparation to replace public-key mechanisms that would be vulnerable to a sufficiently capable quantum computer. It includes discovering where cryptography is used, understanding how long protected information must remain confidential and planning supported algorithm and protocol migrations.

Algorithms such as RSA and elliptic-curve cryptography rely on mathematical problems that a sufficiently capable quantum computer could solve using Shor's algorithm. This differs from the quantum threat to symmetric primitives; replacing RSA and replacing AES are not the same migration task.

It does not mean rewriting every cryptographic operation today. Public-key encryption and key agreement, digital signatures and symmetric encryption serve different purposes and face different implications. A useful readiness program distinguishes them before selecting a migration strategy.

## Why it matters for backend engineers

Backend services rarely choose cryptography in only one place. TLS termination, client libraries, certificate authorities, token signing, archived documents and external integrations can all depend on different algorithms and vendors. Changing the server's preferred cipher does not update every client or historical artifact.

Some data must remain confidential for decades. An adversary may retain encrypted traffic now in the hope of decrypting it later. That makes data lifetime and migration lead time relevant even when the organization has no claim about when a capable quantum computer will exist.

## How it works

Build an inventory of cryptographic dependencies and their purpose. For each one, record the algorithm or protocol, library or provider, owner, peer compatibility and the lifetime of the information or signature involved. Identify hard-coded assumptions about key sizes, certificate formats and algorithm identifiers.

Separate key establishment from signatures. NIST standardized ML-KEM for key encapsulation in FIPS 203 and ML-DSA and SLH-DSA for signatures in FIPS 204 and 205. These standards address different functions. Their existence does not mean every TLS stack, HSM, certificate ecosystem or client supports a suitable production integration.

Evaluate maintained implementations and defined protocol combinations. Where a hybrid scheme is supported, use the protocol's specified construction rather than combining cryptographic outputs ad hoc. Test with actual clients and middleboxes, including fallback behavior and error visibility.

Plan migration and retirement together. A rollout that always falls back silently to the old mechanism may preserve compatibility while providing less protection than expected. Track negotiated behavior and decide when incompatible peers must upgrade or use an explicitly accepted exception.

## Key concepts

**Key encapsulation versus signatures.** A KEM helps establish shared secret material; a signature authenticates a message or artifact. Replacing one does not replace the other, and neither should be described simply as “the new encryption.”

**Confidentiality lifetime.** A short-lived public notification and a long-lived confidential archive have different exposure. Prioritize according to the actual information and its retention needs rather than a single deadline for every system.

**Cryptographic agility.** Systems need to support changes in algorithms, keys, formats and dependencies without a complete redesign. An algorithm field is not enough if database columns or protocols assume one fixed key length.

**Hybrid integration.** Combining classical and post-quantum mechanisms can support a transition under a defined security design. The combination's guarantees depend on the construction and protocol, not merely on running two algorithms.

**Operational overhead.** Larger keys, ciphertexts or signatures can affect handshakes, packetization, stored metadata and CPU usage. Measure the chosen implementation and workload instead of assuming a universal overhead.

## Production example

A service stores confidential research documents for twenty years and exchanges them with external partners. The team initially proposes replacing its TLS configuration and marking the migration complete.

An inventory reveals several distinct paths: browser-to-edge TLS, edge-to-service TLS, partner file exchange and envelope encryption of stored documents. It also identifies signing certificates used to authenticate exported archives. These paths have different owners and compatibility requirements; one TLS change cannot cover all of them.

The team first prioritizes long-lived confidentiality and asks providers which maintained protocol integrations they support. In a test environment, it measures handshake size, latency and success across actual partner clients. It checks whether failed negotiation is visible and whether fallback follows the intended policy.

For stored data, it distinguishes the symmetric data-encryption key from the mechanism protecting that key. It evaluates whether supported key rewrapping can change the protection of stored keys without decrypting every large document, while accounting for backups and retained old wrapping keys. Rewrapping cannot retroactively protect an old encrypted key or ciphertext already obtained by an adversary, so retained copies and prior exposure remain part of the assessment. Signature migration is planned separately because historical verification has different requirements.

The result is an owned migration map with measured compatibility, not a claim that the service is “quantum safe” after one configuration change. This example is illustrative; implementation choices depend on the provider and protocol versions actually available.

## Trade-offs

Early inventory and compatibility work reduce the risk of a rushed future migration. Deploying unsupported primitives or experimental combinations can introduce immediate security and availability problems that outweigh the intended benefit.

Compatibility periods are often necessary, but indefinite fallback can prevent the migration from ever completing. Make legacy support visible and accountable. Use production-supported libraries and protocols, and involve cryptographic expertise for decisions beyond normal library configuration.

## Failure modes / pitfalls

- **All cryptography is treated as equivalent.** Identify whether a dependency provides key agreement, encryption, signatures or hashing before changing it.
- **Standards are confused with ecosystem support.** A standardized algorithm may not yet fit the particular HSM, runtime or client population.
- **Hybrid construction is invented locally.** Protocol composition has security properties that cannot be inferred from concatenating outputs.
- **Only live traffic is inventoried.** Archived data, backups and historical signature verification can outlast current deployments.
- **Fallback is unobserved.** Tests can appear successful while every real connection negotiates the old path.
- **Migration deletes necessary keys.** Verify historical decryption and verification requirements before retiring key material.

## When to use it

Assess systems with long confidentiality requirements, long-lived devices, difficult partner migrations or substantial cryptographic dependencies. Inventory and agility work are useful even before selecting a production migration date.

Begin with the most consequential data paths and ask providers for concrete supported capabilities. Tie experiments to compatibility and performance questions that inform a real decision.

## When not to use it

Do not implement cryptographic primitives yourself or weaken established authentication and key management to adopt a new algorithm. Do not replace symmetric encryption indiscriminately because public-key algorithms face a different threat.

Avoid blanket claims that a product or service is protected against every future quantum threat. State which mechanism, protocol and data path have changed, which peers use it and which limitations remain.

## What a Senior Engineer should know

A Senior Engineer should identify cryptographic purposes in their service, locate the libraries and providers responsible and recognize fixed-format assumptions that could block migration. They should test supported integrations with actual clients and observe negotiated behavior.

They should distinguish key-establishment changes from signature and stored-data changes, and know when a decision requires specialist review rather than ordinary backend implementation.

## What a Staff Engineer should understand

A Staff Engineer should coordinate an inventory and migration sequence across services, vendors and partners. Prioritization should combine confidentiality lifetime, migration lead time, supported capabilities and business consequences.

Define ownership for legacy fallback, historical data and key retirement. Track evidence of adoption and interoperability so the program can demonstrate which risks have changed instead of relying on a broad readiness label.

Further reading: [NIST post-quantum cryptography project](https://csrc.nist.gov/projects/post-quantum-cryptography).
