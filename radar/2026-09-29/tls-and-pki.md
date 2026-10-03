---
title: "TLS and PKI"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

TLS creates a protected channel that provides confidentiality, integrity, and peer authentication under a configured trust model. Public Key Infrastructure (PKI) supplies certificates, certificate authorities, keys, and lifecycle processes commonly used to authenticate servers and, with mutual TLS, clients.

HTTPS is HTTP carried over TLS. A successful encrypted connection is not enough: the client must authenticate the intended service identity, and the application still needs authorization above that identity.

## Why it matters for backend engineers

TLS is on the critical path for public APIs, managed databases, service-to-service calls, webhooks, and package/download infrastructure. Certificate expiry, trust-store drift, hostname mismatch, or a broken intermediate chain can create a complete outage while application code is healthy.

Security failures can be quieter. Disabling verification to “fix” a certificate error preserves encryption against passive observers while removing meaningful server authentication.

## How it works

A TLS handshake negotiates a supported protocol version and cryptographic parameters, authenticates the server (and optionally the client), and establishes shared traffic secrets. TLS 1.3 then protects application records with authenticated encryption.

The server usually presents a leaf certificate plus necessary intermediate certificates. The client validates the chain against configured trust anchors and checks that the certificate identity is valid for the hostname or service identity being contacted. A certificate signed by a trusted CA but issued for another hostname must still be rejected.

Server Name Indication (SNI) lets a client indicate the target hostname during the handshake so shared endpoints can choose an appropriate certificate. Application protocols need their own rules for mapping certificate identities to the service being requested.

TLS can terminate at an edge proxy, load balancer, sidecar, or application. Every termination point creates a new trust boundary. If traffic is decrypted at the edge and sent in cleartext over a network that is not trusted for that data, “we use HTTPS” is an incomplete security statement.

Session resumption reduces handshake cost. TLS 1.3 also supports 0-RTT application data in some configurations, but 0-RTT has replay-related security properties; applications must not assume an unsafe operation becomes replay-safe simply because the transport accepts early data.

## Key concepts

**Certificate chain.** The leaf identifies the endpoint; intermediate and root certificates establish trust through signatures. Clients usually trust roots, not every leaf directly.

**Hostname/service identity verification.** Chain validation and identity validation are separate steps. Both must succeed.

**Private key protection.** Possession of the server private key enables impersonation under the relevant certificate. Storage, rotation, and access control matter as much as certificate renewal.

**mTLS.** Both peers present authenticated identities. mTLS answers “which certificate identity connected,” not “may this workload approve invoice 42?”

**Rotation overlap.** Certificate and CA rotation often requires a period where old and new material coexist. Rotating trust anchors and leaf certificates in the wrong order can strand clients.

**Revocation and short lifetimes.** Revocation mechanisms and certificate lifetime involve availability and freshness trade-offs. Follow the ecosystem/provider's supported model rather than inventing a revocation protocol.

## Production example

An internal API rotates from an old intermediate CA to a new one. The server presents a valid new certificate, but a subset of client containers has an outdated trust bundle and begins failing TLS handshakes.

The team distinguishes DNS/connect success from TLS failure using client metrics and handshake diagnostics. It verifies the presented certificate chain and the trust anchors inside the failing image, rather than disabling verification.

The immediate repair updates the trust bundle. The long-term rotation procedure becomes staged: distribute trust for both old and new chains, confirm adoption, rotate server certificates, then remove obsolete trust after the supported overlap. Monitoring alerts on certificate expiry and handshake-error categories.

A separate test attempts to connect using the correct CA but the wrong hostname. The client must reject it. Another test sends a valid mTLS client identity that lacks application permission; transport authentication succeeds while the API returns authorization failure.

For externally terminated TLS, the team documents whether edge-to-origin traffic is encrypted and how the origin authenticates the edge, preventing direct clients from bypassing the intended boundary.

## Trade-offs

TLS adds handshake, certificate lifecycle, and cryptographic work. Persistent connections and resumption amortize much of the cost, but rotation and debugging remain operational responsibilities.

mTLS provides strong workload identity and can reduce reliance on network location. It adds issuance, trust distribution, rotation, and policy complexity. A service mesh can automate some lifecycle without removing the need to understand the identities and authorization rules.

## Failure modes / pitfalls

Disabling verification, trusting every corporate root everywhere, or skipping hostname checks destroys important authentication properties. Expired leaves, missing intermediates, clock errors, and stale trust stores produce outages.

Rotating a root or intermediate before clients trust its replacement can break the fleet. Logging private keys or client certificates unnecessarily increases exposure.

TLS termination can also create a false sense of end-to-end protection if sensitive traffic crosses an unprotected hop afterward.

## When to use it

Encrypted authenticated transport should be the default for credentials, sensitive data, and traffic crossing trust boundaries. Public internet traffic should use maintained TLS configurations.

Use mTLS where mutual workload identity materially improves the architecture and the organization can operate its lifecycle reliably.

## When not to use it

Do not invent custom cryptography or certificate formats. Do not deploy mTLS everywhere solely because it sounds stronger; define the identity, authorization, rotation, and debugging model first.

Do not use TLS as a replacement for application authorization or input validation.

## What a Senior Engineer should know

A Senior Engineer should understand handshake purpose, certificate chains, identity verification, SNI, termination points, trust stores, rotation, and common failure diagnostics.

They should be able to inspect a failing certificate path safely and should never make “skip verify” a production repair.

## What a Staff Engineer should understand

A Staff Engineer should define transport-security boundaries across ingress, services, third parties, and data stores; choose identity lifecycles; and coordinate CA/key rotation with clear rollback.

They should evaluate mTLS or workload-identity platforms in terms of blast radius, operational support, and authorization integration rather than treating encryption as the entire security design.

Further reading: [RFC 9846: TLS 1.3](https://www.rfc-editor.org/rfc/rfc9846), [RFC 9525: Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525).
