---
title: "TLS and PKI"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

TLS protects network communication by providing confidentiality, integrity and authentication. Public Key Infrastructure provides the certificate and trust mechanisms commonly used to establish the identity of servers and, in mutual TLS, clients.

HTTPS is HTTP carried over TLS; the security properties come from both correct cryptography and correct identity validation.

## Why it matters for backend engineers

Backend services handle credentials, personal data and business-critical traffic. Engineers must understand why certificate verification matters, how certificates expire and rotate, and how TLS termination changes trust boundaries.

Misconfigured TLS can cause outages just as easily as security incidents.

## How it works

During a TLS handshake, peers negotiate protocol parameters and establish shared cryptographic keys. The server normally presents a certificate containing its identity and a signature chain leading to a trusted certificate authority.

Modern TLS uses asymmetric cryptography primarily during authentication and key establishment, then efficient symmetric cryptography for application data.

TLS can terminate at a load balancer or proxy, or continue end-to-end to the application. Mutual TLS additionally authenticates the client with a certificate.

## Key concepts

### Certificate chain
A leaf certificate is validated through intermediate certificates to a trusted root.

### Hostname verification
A valid certificate is insufficient if it is not valid for the hostname being contacted.

### SNI
Server Name Indication lets a client indicate the hostname during connection setup, allowing multiple TLS identities behind one endpoint.

### Certificate rotation
Certificates expire. Automated issuance and rotation are operational requirements, not optional housekeeping.

### mTLS
Mutual TLS authenticates both sides and is useful for workload identity, but certificate lifecycle and authorization still require design.

### TLS termination
Where encryption ends defines a security boundary.

## Production example

An internal service suddenly cannot connect to a dependency after certificate rotation. The server certificate is valid, but the client image contains an outdated CA bundle and cannot build the new trust chain.

Observability exposes handshake failures rather than generic connection errors. Updating trust distribution fixes the immediate issue; centralized certificate lifecycle monitoring prevents recurrence.

## Trade-offs

TLS adds handshake and cryptographic work, although modern hardware, session resumption and persistent connections make the overhead generally modest.

mTLS provides strong workload authentication but introduces certificate issuance, rotation, revocation and debugging complexity.

## Failure modes / pitfalls

Frequent mistakes include disabling certificate verification to fix development problems, expired certificates, incomplete certificate chains, hostname mismatches, outdated trust stores, insecure protocol versions and assuming TLS authentication automatically provides application authorization.

Another pitfall is encrypting external traffic while leaving sensitive internal hops unexamined.

## When to use it

Use TLS for network communication carrying credentials, sensitive information or traffic crossing trust boundaries. In modern production environments, encrypted transport should generally be the default.

Use mTLS when mutual workload identity meaningfully strengthens the architecture.

## When not to use it

Do not build custom cryptography or custom certificate protocols. Avoid adding mTLS everywhere without a plan for identity, rotation, observability and authorization.

## What a Senior Engineer should know

A Senior Engineer should understand certificates, trust chains, hostname verification, TLS termination, common handshake failures and the difference between encryption, authentication and authorization.

They should never solve certificate problems by casually disabling verification.

## What a Staff Engineer should understand

A Staff Engineer should define transport-security boundaries across ingress, internal services and external dependencies. They should reason about workload identity, certificate automation, key rotation and incident blast radius.

They should also evaluate when mTLS or a service identity system provides enough value to justify its operational complexity.
