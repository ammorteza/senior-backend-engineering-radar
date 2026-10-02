---
title: "Object storage"
ring: adopt
segment: platforms
tags: [backend]
---

## What it is

Object storage keeps named objects and metadata in buckets, commonly through S3- or GCS-style APIs. It stores blobs, not filesystem directories with ordinary POSIX update semantics.

## Why it matters for backend engineers

Reports, uploads and backups often exceed sensible database-row sizes. Access control, lifecycle and immutable object identity matter as much as successful upload.

## How it works

Clients upload or retrieve objects by key. Multipart uploads support large transfers and require completion or cleanup. Providers define consistency, versioning and conditional-operation guarantees; these must be checked for the selected service. Signed URLs delegate limited access under a signing identity and expiry.

## Key concepts

Prefixes are naming conventions, not necessarily directories. ETags are not universally content hashes, especially with multipart or encryption behavior. Versioning protects previous versions but increases retention cost. Lifecycle rules govern transitions and deletion.

## Production example

A report worker uploads output under a unique immutable key, verifies completion and only then marks the database job ready. A signed download URL expires quickly and is scoped to that object. Abandoned multipart uploads are cleaned by lifecycle policy, and a replay cannot overwrite an unrelated report.

## Trade-offs

Durable scalable blobs simplify storage. Request charges, egress, listing patterns and lifecycle management can dominate cost. Small random mutations fit poorly.

## Failure modes / pitfalls

Public buckets, predictable keys mistaken for authorization, missing multipart cleanup and assuming filesystem rename atomicity create problems.

## When to use it

Use object storage for uploads, static artifacts, archives and analytical files.

## When not to use it

Do not use it as a transparent shared filesystem or relational transaction store.

## What a Senior Engineer should know

Implement conditional writes, upload verification and least-privilege signed access under provider semantics.

## What a Staff Engineer should understand

Design retention, recovery, residency and access policies across producers and consumers.

Further reading: [S3 user guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [GCS consistency](https://docs.cloud.google.com/storage/docs/consistency).
