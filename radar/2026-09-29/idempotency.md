---
title: "Idempotency"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

An operation is idempotent when repeating it has the same intended effect as applying it once. The code may execute repeatedly, and responses may differ, while the protected state remains equivalent. For example, deleting an already absent resource need not create a new effect, even if the API returns a different status.

For commands such as allocating credit or issuing a refund, the business operation is not naturally repeatable without consequences. An idempotency protocol gives repeated attempts one stable identity and records enough durable state to recognize their shared outcome.

## Why it matters for backend engineers

A timeout does not establish whether a server committed. Retrying without identity can duplicate the effect; refusing every retry can leave customers unable to recover a completed or abandoned operation.

The difficult cases are concurrent attempts, crashes between systems, and retries after deduplication data expires. A cache lookup followed by “do the work” does not solve these cases. Correctness depends on the storage constraint, transaction boundary and external provider contract.

## How it works

Define a key namespace, such as authenticated tenant plus operation type plus client-supplied key. Authenticate and authorize the request before using a stored result; knowing somebody else's key must not disclose their response. Store a normalized request fingerprint so reuse with different meaningful input is rejected.

For a local database operation, insert a uniquely constrained key record and perform the business change in one transaction. A conflicting attempt must wait, retry the lookup or receive a documented in-progress response according to the implementation. It must not independently perform the change after observing that the first request is unfinished.

Commit the result needed by retries with the state change. If the transaction rolls back, the system must not leave a success marker. If the response is lost after commit, the next attempt can recover the committed outcome. Application validation failures and transient execution failures need deliberately specified caching behavior; providers do not all make the same choice.

For an external effect, a local transaction cannot guarantee atomicity with an ordinary HTTP request. Persist an operation record, call the provider with its stable operation key, and resolve unknown outcomes using supported lookup or safe repetition. A worker-claim lease coordinates local effort but cannot stop an old worker's remote request after the lease expires; the remote protocol must also protect the effect.

## Key concepts

**Operation ID versus attempt ID.** One intended refund has one operation identity and may have many network attempts. A second intentional refund needs a new identity even when its amount is equal.

**Request fingerprint.** Include fields that define the operation, with documented normalization. Raw JSON byte equality can reject equivalent field ordering; excluding currency can accept a materially different request.

**Outcome state.** Pending, succeeded, rejected and unknown are different states. Unknown means evidence is insufficient, not that the provider definitely failed.

**Retention.** A retry after key expiry may execute again. Align local retention, provider retention and manual replay policies; a long-lived business identifier may still be needed after response caching ends.

**Idempotency versus ordering.** Repeatedly setting version 4 is duplicate-safe but can still overwrite version 5 unless the update also checks version order.

## Production example

A service accepts a request to issue a service-credit adjustment. It stores `(tenant, operation, key)` under a unique constraint, records the relevant account and amount, applies the ledger entry and stores the adjustment ID in one database transaction.

Two clients retry the same key simultaneously after a slow response. The constraint permits only one committed adjustment for that identity. The other attempt reads the established result after the winning transaction commits. If the winning transaction aborts, the retry can attempt the operation under the database's normal conflict handling.

Now suppose the adjustment also triggers an external refund. The database transaction records the refund intent; it does not hold a transaction open while pretending the remote call is atomic. A worker uses a stable provider key derived from the refund operation. If the provider accepts the refund but the response disappears, the record remains unresolved until lookup or supported retry confirms the outcome.

Tests cover same-key concurrency, different input with the same key, a process crash after local commit, a lost provider response and replay beyond the provider's key-retention window. The last case may require reconciliation before another call rather than blind repetition. A useful implementation explains all five, not just two sequential happy-path requests.

## Trade-offs

Persisted keys and outcomes add storage and writes. Keeping full responses forever may retain sensitive data unnecessarily; retaining a compact operation identity and reconstructing an authorized result can be a better contract.

Natural idempotency can be simpler than a key store when it really protects the full effect. Setting a preference twice is harmless, but a hook that sends a new email on every assignment changes the overall operation's semantics.

## Failure modes / pitfalls

A check-then-insert race without a unique constraint permits concurrent execution. A Redis lock alone does not durably associate a business result with the key. Deleting a pending record because its worker timed out can allow a still-running external action to be repeated.

Keys scoped only globally can collide across clients; keys scoped too narrowly may fail to connect legitimate retries. Treat provider retention and failure caching as explicit integration requirements, not assumptions borrowed from another API.

## When to use it

Use idempotency for retryable commands whose repeated effects matter, including resource creation, financial adjustments and message-driven state changes. Put the guarantee at the component that owns the protected state.

Expose enough outcome information for callers to recover after disconnection without inventing a new operation identity.

## When not to use it

Do not add a durable deduplication service to an inexpensive read merely because the transport can retry. Do not let duplicate suppression hide a request that is actually a new business action.

Avoid promising indefinite retry safety when key records expire. Define the supported window and the recovery procedure beyond it.

## What a Senior Engineer should know

A Senior Engineer should design namespace, payload comparison, atomic state changes and concurrent conflict handling together. They should be able to show that a crash cannot leave a committed effect without recoverable identity at the chosen boundary.

For external APIs, they should verify the provider's exact idempotency behavior and handle unknown outcomes without converting them prematurely to failure.

## What a Staff Engineer should understand

A Staff Engineer should establish consistent operation identity across clients, services and recovery tools. Different teams' retention windows must not create a gap in a shared workflow's guarantee.

Make reconciliation and operator tooling part of the design. A support action that generates a new key for an unresolved request can undo otherwise careful duplicate protection.

Further reading: [Stripe's specific idempotency contract](https://docs.stripe.com/api/idempotent_requests), [AWS on retry-safe APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).
