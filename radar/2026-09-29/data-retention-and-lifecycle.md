---
title: "Data retention and lifecycle"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Data lifecycle design decides when information is active, archived, deleted or retained for recovery. It applies separately to primary records, derived copies, logs and backups.

## Why it matters for backend engineers

Deleting a row does not remove its search document, export or backup copy. Unbounded retention also increases cost, incident exposure and restore time.

## How it works

Classify datasets and define operational retention requirements with appropriate organizational input. Implement expiry or deletion in each authoritative and derived store, track completion and handle failures. Backup retention and restore procedures must prevent unintentionally reintroducing data that should no longer be active.

## Key concepts

Logical deletion differs from physical reclamation. Legal hold and ordinary expiry need distinct states under the organization's requirements. Archive retrieval has cost and latency. Data lineage identifies copies, while tombstones or deletion ledgers can support consistent cleanup and restoration.

## Production example

A report service expires generated files after a defined product window. It removes object versions under an intentional lifecycle policy, deletes associated download links and updates search metadata. A restore drill applies the current deletion ledger before serving recovered records, avoiding resurrection from an older backup.

## Trade-offs

Short retention reduces storage and exposure but limits debugging and recovery. Archives preserve history at retrieval and management cost. Rules must reflect actual product and compliance needs.

## Failure modes / pitfalls

Forgotten exports, incomplete cascades, backups treated as exempt and deleting under a hold create lifecycle failures.

## When to use it

Design retention whenever persistent data is introduced or copied into another system.

## When not to use it

Do not guess legal periods or erase data merely to meet a storage target; obtain the relevant requirements.

## What a Senior Engineer should know

Implement resumable, observable cleanup and test dependent copies.

## What a Staff Engineer should understand

Own lineage, retention classes and restore semantics across the organization.

Further reading: [S3 lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html).
