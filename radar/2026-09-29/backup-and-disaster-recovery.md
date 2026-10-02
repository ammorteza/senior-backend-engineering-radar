---
title: "Backup and disaster recovery"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Backups preserve recoverable copies; disaster recovery restores a usable service after loss or corruption. Replication and high availability do not replace protection from accidental deletion or compromised credentials.

## Why it matters for backend engineers

A successful backup job proves that data was copied, not that the business can resume within its promised time. Recovery depends on keys, configuration, dependencies and operator access too.

## How it works

Choose recovery point and recovery time objectives, then design snapshots, log archives and independent copies accordingly. Restore into an isolated environment, verify integrity and application behavior, and rehearse cutover. Point-in-time recovery combines an appropriate base copy with retained logs; available targets depend on their continuity and retention.

## Key concepts

RPO describes tolerable data loss; RTO describes tolerable recovery duration. Immutable or separately controlled copies limit destructive credential reach. Restore bandwidth and database replay determine actual recovery time. Reconciliation resolves work performed outside the restored database.

## Production example

A faulty cleanup deletes active records at 14:05. The team restores to a timestamp before the mistake, validates critical counts and identifies legitimate changes made afterward. It reconciles external payments before reopening writes. The drill had already tested encryption-key access and documented who authorizes cutover.

## Trade-offs

More copies and longer retention improve recovery options but add storage, testing and privacy obligations. Aggressive RTO may require warm capacity rather than backups alone.

## Failure modes / pitfalls

Untested restores, missing encryption keys, backups in the same administrative blast radius and recovery that resurrects expired data are serious gaps.

## When to use it

Use backups and recovery planning for every authoritative dataset, proportional to its business importance.

## When not to use it

Do not claim recovery from replica count or green backup status alone.

## What a Senior Engineer should know

Restore and validate the service, not just its files; explain achievable RPO/RTO.

## What a Staff Engineer should understand

Coordinate recovery authority, independent copies and reconciliation across all critical systems.

Further reading: [PostgreSQL continuous archiving/PITR](https://www.postgresql.org/docs/current/continuous-archiving.html).
