---
title: "Secrets management"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Secrets management is the lifecycle of sensitive credentials: creating them, granting access, delivering them to consumers, rotating them and revoking them. Passwords, API keys, signing keys and encryption keys all require protection, but their replacement procedures differ.

A secret store is only one part of the design. Putting a database password in a managed vault improves storage and access control, but the service still needs an identity to retrieve it, a safe way to load it and a defined response when it expires. Prefer eliminating static credentials through workload identity where the dependency supports it.

## Why it matters for backend engineers

Credentials often outlive the code that introduced them. A forgotten job can continue using an old API key, a debug dump can expose an environment variable, or a deployment can fail days after rotation because it opens its first new database connection then.

Backend engineers own much of this behavior. They decide when credentials are loaded, whether clients refresh them, how connection pools react and what error details enter logs. Rotation is therefore an application integration task as well as a security operation.

## How it works

First establish the consumer's identity using the platform's supported mechanism, such as workload identity or a narrowly scoped machine identity. That identity should be able to retrieve only the secrets needed by that workload and environment. Giving every service access to the whole secret project defeats isolation.

Choose a delivery method deliberately. Direct API retrieval supports explicit version handling and refresh but adds client logic. Mounted files can integrate with platform refresh, though the application must reread them. Environment variables are easy to consume at startup but normally do not change inside a running process; rotation may require replacement instances.

For a credential whose provider supports overlapping versions, create a new credential, distribute it, confirm consumers can authenticate, then revoke the old credential. Some providers permit only one active password. Their rotation needs a different sequence, an alternate principal, or a coordinated interruption; do not assume overlap exists.

Revocation is separate from ordinary rotation. During compromise you may need to disable a credential immediately, accepting some disruption. A tested emergency path should explain how consumers recover and how remaining uses of the old credential are detected.

## Key concepts

**Version and current alias.** An explicit version makes a rollout reproducible; a moving “current” alias makes updates easier. Neither helps if the process caches the value forever. Document how version changes reach running code.

**Credential lifetime and caching.** Short-lived credentials reduce the useful lifetime of a stolen value. Consumers must refresh before expiry and handle temporary refresh failures. A cached credential may continue working during a secret-store outage, but only until its validity or revocation policy prevents it.

**Connection state.** Changing a password does not necessarily terminate already authenticated database sessions. Old pool connections may work while replacement connections fail. Test new authentication, not merely an existing health-check connection.

**Encryption-key rotation.** Replacing a key for future encryption does not automatically make historical ciphertext readable under the new key. Retain necessary decrypt capability or perform a planned rewrap or re-encryption process. Deleting the old key prematurely can cause permanent data loss.

## Production example

Suppose a Go API loads a database password once at startup and opens a connection pool. Operations rotates the password in the secret store and revokes the old one. Existing sessions remain usable, so the first checks appear healthy. As connections age out or traffic grows, new authentication attempts fail and requests begin timing out while waiting for the pool.

The diagnosis compares the credential version used by each deployment with the rotation timeline and distinguishes connection establishment failures from query failures. Logs include the version identifier and database error category, never the password.

If the database supports separate overlapping users, the team creates a new least-privilege user, deploys that credential, verifies fresh connections from all consumers and only then retires the old user. If overlap is unavailable, it documents the coordinated rotation procedure instead. A rolling restart may be a simpler, safer reload mechanism than adding live client replacement to every service.

The validation includes the main API, scheduled tasks, migrations and disaster-recovery tooling. It also simulates an unavailable secret store during startup and refresh. The fix is complete when all consumers can authenticate using the new credential and the old credential's remaining access matches the intended revocation policy.

## Trade-offs

Retrieving secrets dynamically supports rotation but introduces a dependency on secret-service availability and quotas. Fetching the same secret on every request creates unnecessary latency and a large failure surface. Caching avoids that cost but needs expiry, refresh and revocation behavior.

Centralization improves auditability and consistent access controls. It also concentrates privilege: administrators or automation able to read every secret can cross many service boundaries. Separate environments and administrative duties according to their actual trust relationships.

## Failure modes / pitfalls

**Rotation updates storage but not consumers.** Test the complete path into running clients, including long-lived pools and background jobs.

**Secrets leak after retrieval.** Environment dumps, traces, command-line arguments and exception messages can expose values. Redaction must cover diagnostic paths, not only normal application logs.

**A bootstrap secret recreates the original problem.** A permanent vault token embedded in an image is still a permanent secret. Prefer a platform identity and restrict its access.

**Revocation is assumed to kill every session.** Check the target system's behavior and terminate sessions separately if the incident requires it.

**Encryption keys are deleted as if they were passwords.** Verify historical data and backup recovery requirements before removing decrypt capability.

## When to use it

Use maintained secret infrastructure whenever software needs credentials that cannot be replaced by direct workload identity. Establish an owner, consumer list and rotation procedure for each important credential class.

Start with one exercised lifecycle: provision, deliver, rotate and revoke a non-production credential using the same integration as production. This exposes reload assumptions more effectively than documenting only where the secret is stored.

## When not to use it

Do not build a bespoke vault merely to avoid integrating with an existing maintained service. Secure storage, access auditing, backup and recovery create substantial obligations.

Do not put ordinary non-sensitive configuration into the secret system without a reason, or couple every request to secret retrieval. Keep credentials out of source, images and generated artifacts even when those locations are currently private.

## What a Senior Engineer should know

A Senior Engineer should explain how a credential reaches their process, when it refreshes and what happens during expiry, revocation or store unavailability. They should test new connections after rotation and ensure every consumer is included.

They should also distinguish password replacement from signing-key and encryption-key rotation, prevent secret values from entering telemetry, and provide enough non-sensitive identifiers to diagnose which version a workload uses.

## What a Staff Engineer should understand

A Staff Engineer should define cross-service ownership, identity standards and rotation expectations that teams can actually operate. The design should answer who can perform emergency revocation, which systems might stop working and how recovery is coordinated.

Inventory and drills matter as much as a vault rollout. Track unowned credentials, long-lived keys and consumers that cannot rotate safely. Ensure recovery procedures retain access to necessary encryption keys without placing all backups and secrets under one easily compromised identity.

Further reading: [OWASP secrets management guidance](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
