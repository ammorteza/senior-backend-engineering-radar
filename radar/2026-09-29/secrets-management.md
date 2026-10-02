---
title: "Secrets management"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Secrets management controls how credentials are issued, delivered, rotated and revoked. A centralized store is one component; application reload and failure handling complete the lifecycle.

## Why it matters for backend engineers

Removing a password from source does not solve stale deployments, broad access or emergency revocation. Secrets can also leak through logs, image layers and diagnostics.

## How it works

A workload authenticates using an appropriate identity and reads only its required secrets. Delivery may use APIs, files or platform integration. Rotation introduces a new credential, updates consumers, verifies use and retires the old credential with a deliberate overlap period. Dynamic credentials shorten exposure where supported.

## Key concepts

Versioning permits controlled rollout. Lease expiry differs from application caching. Encryption keys and passwords have different rotation semantics. Access logs help investigate misuse but must not contain secret values.

## Production example

A database credential rotates successfully in the secret store, but pods cache it forever. New connections fail once the old password is revoked. The fix supports tested reload or rolling restart, verifies all consumers adopted the new version and only then disables the old credential.

## Trade-offs

Central stores improve access control and auditability but become dependencies for startup or refresh. Cached secrets reduce outages while delaying revocation.

## Failure modes / pitfalls

Overbroad read permissions, secrets in environment dumps, rotation without consumers and no emergency revocation procedure are common weaknesses.

## When to use it

Use managed or maintained secret infrastructure and short-lived identity where practical.

## When not to use it

Do not build a bespoke secret store or fetch a remote secret on every request without understanding availability implications.

## What a Senior Engineer should know

Implement delivery, reload, redaction and credential failure behavior.

## What a Staff Engineer should understand

Define ownership, rotation objectives and incident containment across all consumers.

Further reading: [OWASP secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
