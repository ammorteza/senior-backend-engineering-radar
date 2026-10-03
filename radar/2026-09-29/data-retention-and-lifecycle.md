---
title: "Data retention and lifecycle"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Data lifecycle design determines when information is active, archived, inaccessible, physically removed or retained only for recovery. These states are different. Removing a record from the UI does not delete its object-store versions, search documents, exports or backups.

A retention policy therefore needs both a business rule and an implementation across the places the data exists. The period itself must come from product, contractual and applicable governance requirements; engineers should not invent a legal deadline from a storage-cost target.

## Why it matters for backend engineers

Unbounded retention increases storage cost, recovery time and the amount of information exposed by an incident. Incomplete deletion can also make a product promise false even when the primary database row is gone.

Backend teams create copies continuously through caches, analytics, logs and integration payloads. Each new copy needs an owner and lifecycle. If that decision is deferred, cleanup becomes a difficult investigation across systems years later.

## How it works

Classify data by purpose and required lifecycle. Define the event that starts the clock—creation, completion, cancellation or another business transition—and how corrections or holds affect it. A single `created_at` timestamp is not always the right basis for expiry.

Inventory authoritative and derived copies. Decide how each one is removed or made inaccessible and how completion is recorded. Some stores support lifecycle policies or TTLs; others need a cleanup worker. Provider expiry is often asynchronous, so the application may need to deny access at the product deadline before physical removal finishes.

Make cleanup resumable. Work in bounded batches, record progress and retry failed deletions without treating already absent data as an error. Avoid marking the whole workflow complete before all required stores acknowledge the intended state. For data that can be recreated from late events, preserve an appropriate deletion marker or generation rule so stale work does not resurrect it.

Integrate recovery. A restored backup may contain records removed after the backup was taken. Recovery procedures need current lifecycle decisions or another controlled reconciliation mechanism before that information returns to service. Backup retention and access must be defined explicitly, not silently treated as exempt.

## Key concepts

**Logical deletion versus physical reclamation.** A soft-delete flag changes application visibility. Database page cleanup, object-version deletion and backup expiry are separate mechanisms with different timing.

**Versioned objects.** In S3, deleting an object without specifying a version in a versioned bucket ordinarily creates a delete marker; older versions can remain. Lifecycle rules for current and noncurrent versions need deliberate configuration. Other providers have their own semantics.

**Archive is not deletion.** Moving data to a colder tier changes access cost and latency, not necessarily retention. Archive retrieval and eventual disposal still need policy and ownership.

**Holds and exceptions.** A valid hold may suspend ordinary cleanup under the organization's requirements. Model that state explicitly and restrict who can create or release it; do not bury it in an undocumented manual exclusion.

**Deletion evidence.** Record enough identifiers and outcomes to operate and verify cleanup without retaining the sensitive payload merely to prove it was deleted. The evidence itself needs an appropriate lifecycle.

## Production example

A product offers generated reports for thirty days after successful generation. This is an illustrative product rule, not a legal retention recommendation. Reports exist in a database catalog, a versioned object bucket and a search index; signed download links may also have been issued.

At the access deadline, the API stops issuing links and treats the report as unavailable. Previously issued links have lifetimes chosen to fit the product's access guarantee, or another access-control mechanism enforces that guarantee. A cleanup workflow then removes the catalog's active reference, relevant search entry and object versions according to the chosen policy.

A test reveals that deleting the current object key leaves older versions in the bucket. The team corrects the lifecycle configuration and checks for unfinished multipart uploads that belong to failed report generation. Completion metrics distinguish “no longer accessible” from “required stored copies removed.”

Another test delivers a delayed generation-complete event after deletion. The consumer consults the report's generation or deletion state and does not recreate the expired report as active. A recovery drill restores an older catalog, applies the current lifecycle decisions and verifies that expired links and reports remain unavailable.

The work is complete only when the product behavior, background cleanup and restore path agree. One successful SQL DELETE would have addressed only a small part of the lifecycle.

## Trade-offs

Short retention reduces stored volume and exposure but limits debugging, reprocessing and historical analysis. Longer retention increases those capabilities while adding cost and governance obligations. Archive tiers can reduce storage cost but introduce retrieval delays and possible additional charges.

Soft deletion simplifies some recovery and user workflows, but it is not a substitute for eventual disposal when required. Immediate synchronous removal across every store can make a user request fragile; an asynchronous workflow needs a clear access policy, completion tracking and failure handling.

## Failure modes / pitfalls

Cleanup can skip forgotten exports, object versions or logs. A failed deletion job may remain unnoticed because the main API still works. Large unbounded deletes can create database load, locks and maintenance work, so lifecycle implementation must respect service capacity.

Late events, retries and backup restores can resurrect removed state. Deleting a parent before recording dependent cleanup can lose the identifiers needed to remove its copies. Applying a broad TTL to data under a hold can violate the intended policy.

Do not promise that deleting a record immediately removes every physical byte from underlying storage. State the relevant access and disposal guarantees with the actual system behavior behind them.

## When to use it

Design lifecycle whenever persistent information is introduced or copied into another store. Include data used only for debugging or experimentation; those copies are easy to forget because no product feature owns their deletion.

Start by tracing one entity through creation, derived copies, expiry and restore. This reveals missing ownership more effectively than adding a generic retention field to every table.

## When not to use it

Do not apply one arbitrary TTL to every dataset or guess legally required periods. Obtain the appropriate requirements and translate them into explicit technical states and procedures.

Do not retain all payloads forever “just in case,” or delete authoritative records purely to solve a temporary disk-capacity problem without understanding recovery and business obligations. Capacity and lifecycle decisions need coordination.

## What a Senior Engineer should know

A Senior Engineer should implement bounded, idempotent cleanup; distinguish access expiry from physical disposal; and verify dependent stores and object versions. They should test late events, partial failures and restored backups.

They should also expose backlog age and failed cleanup with clear ownership, and avoid collecting sensitive payloads in deletion logs. A lifecycle feature must remain operable after its initial rollout.

## What a Staff Engineer should understand

A Staff Engineer should establish retention classes, copy ownership and recovery semantics across the organization. Data lineage and supported deletion mechanisms should evolve with new integrations rather than depend on occasional manual discovery.

Coordinate product commitments with governance and storage capabilities. Measure unresolved copies, cleanup delays and restore regressions so the organization can substantiate its lifecycle promises.

Further reading: [S3 lifecycle management](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html), [Deleting versioned objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html).
