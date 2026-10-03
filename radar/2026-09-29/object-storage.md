---
title: "Object storage"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Object storage stores blobs under keys inside buckets and exposes operations such as put, get, list, delete, metadata updates, and multipart upload. Services such as Amazon S3 and Google Cloud Storage provide durable distributed object storage but are not ordinary POSIX filesystems.

A key can contain slash characters, yet those “directories” are usually naming conventions built on prefixes. Filesystem assumptions such as atomic rename, append, advisory locks, and directory-local transactions do not automatically apply.

## Why it matters for backend engineers

Uploads, generated reports, backups, media, and analytical files often belong in object storage rather than relational rows. The design still needs identity, authorization, lifecycle, integrity, and transaction-boundary decisions.

Object storage is also frequently used indirectly through signed URLs. A predictable key does not authorize access; the signed request or service identity does.

## How it works

A client authenticates to the object service and operates on a bucket/key. Modern providers define their own consistency and conditional-write behavior. For example, Amazon S3 currently documents strong read-after-write consistency for successful PUT and DELETE operations; engineers should not repeat older “eventual consistency” folklore across all providers.

Large objects can use multipart/resumable upload. Parts are uploaded independently and later committed into one object. Failed uploads can leave parts that consume storage until aborted or cleaned by lifecycle policy.

Versioning can retain prior object versions when a key is overwritten or deleted. A normal delete in a versioned bucket may create a delete marker while older versions remain. Retention and deletion therefore require more than deleting the visible current key.

Signed URLs delegate narrowly scoped temporary access under the signer/service's permissions and provider semantics. Keep expiry short enough for the use case and do not expose broader credentials to clients.

## Key concepts

**Object key versus business identity.** A stable business record may point to immutable object versions/keys. Overwriting the same key makes cache and concurrency behavior harder to reason about.

**Conditional operations.** ETag/generation/version preconditions can prevent stale writers from overwriting a newer object. Provider-specific ETag semantics are not universally “MD5 of the file.”

**Multipart cleanup.** Incomplete uploads are separate resources and need expiration/abort policy.

**Versioning.** Protects against accidental overwrites/deletes but increases storage and does not replace independent backups or access control.

**Lifecycle.** Transition to colder storage, expiry, version cleanup, and multipart cleanup have different rules and costs.

## Production example

A report service generates a 500 MB PDF. It first creates a database job with a unique report ID and chooses an immutable key such as `reports/{tenant}/{report-id}/output.pdf`.

The worker performs a multipart upload. Only after the provider confirms completion does it commit the object's provider version/generation and checksum metadata into the job record and mark the report ready. If the worker crashes before multipart completion, the job remains incomplete and a lifecycle rule eventually removes abandoned parts.

The download API verifies tenant ownership and creates a short-lived signed URL for exactly that object. The key itself is never treated as authorization.

A retry of the generation job uses the same report identity. Depending on the workflow, it either detects the completed immutable object or writes a new attempt key and atomically changes the database pointer after verification. It does not blindly overwrite a shared filename that another worker may be publishing.

The team also tests versioning/lifecycle behavior and a restore scenario. Deleting the current key from a versioned bucket is verified against noncurrent versions so the product's retention promise matches actual stored data.

## Trade-offs

Object storage scales to large durable blobs and separates application compute from file-serving capacity. Per-request, retrieval, and network egress costs can dominate some workloads.

Immutable keys simplify caching and concurrency while producing more objects. Overwrite-in-place can simplify naming but requires stronger conditional-write and cache invalidation discipline.

Cold storage reduces cost but increases retrieval time and may add retrieval charges.

## Failure modes / pitfalls

Public bucket policies, overly broad signed URLs, and long-lived signing credentials expose data. Assuming prefix names create filesystem security boundaries is incorrect.

Incomplete multipart uploads accumulate cost. Listing huge prefixes as part of a synchronous request can be slow/expensive. Relying on ETag as a universal content hash can break with multipart upload or encryption behavior.

Deleting only the current version can leave historical sensitive versions behind. Treat lifecycle and backup retention as part of the data model.

## When to use it

Use object storage for uploads, media, static artifacts, generated reports, backups, archives, and analytical files that do not need fine-grained in-place mutation.

Keep relational/search metadata in systems suited to those access patterns and reference immutable object identity explicitly.

## When not to use it

Do not use object storage as a transparent shared filesystem when applications depend on POSIX locking, rename, append, or low-latency small random writes.

Do not use it as a replacement for relational transactions over related business records.

## What a Senior Engineer should know

A Senior Engineer should understand provider consistency, conditional writes, multipart lifecycle, versioning, signed access, checksums, and immutable naming.

They should design upload completion so database state never claims a partially uploaded object is ready.

## What a Staff Engineer should understand

A Staff Engineer should define bucket/project boundaries, retention, recovery, residency, egress, and access policy across many producers and consumers.

They should understand how object lifecycle interacts with legal/product deletion, backups, CDN caching, analytics, and incident recovery.

Further reading: [Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [Google Cloud Storage consistency](https://docs.cloud.google.com/storage/docs/consistency).
