---
title: "Backup and disaster recovery"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

A backup preserves a recoverable copy of data. Disaster recovery is the process of restoring a usable service after a serious loss, corruption or infrastructure failure. The difference matters: successfully copying database files does not establish that the application can resume safely within its promised time.

Replication and high availability address some failures quickly, but they can faithfully propagate an accidental deletion or malicious change. Recovery needs copies and procedures that survive the specific failures the service must tolerate.

## Why it matters for backend engineers

Backend recovery includes state outside the database: object storage, queues, encryption keys, identity configuration and external providers. Restoring one database to yesterday can make its records inconsistent with actions that happened elsewhere today.

Engineers therefore need to know what “recovered” means for the product. The database accepting connections is an intermediate milestone. Users need correct records, valid permissions and workflows that will not duplicate already completed external actions.

## How it works

Define recovery objectives for concrete failure scenarios. Recovery point objective (RPO) describes the tolerated loss of recent data; recovery time objective (RTO) describes the tolerated time to restore the required service. A regional failure and a deletion discovered a week later may require different mechanisms.

Choose backup types and retention accordingly. Logical exports can help restore selected objects or migrate formats, while physical backups preserve engine-level state. PostgreSQL point-in-time recovery combines a suitable physical base backup with a continuous sequence of archived WAL through the target point. Missing required log segments can make a desired target unreachable.

Store recovery material under controls appropriate to the threat. If the same compromised identity can delete production and every backup, the copies do not provide independent protection. Encryption keys and the permissions to use them must also remain recoverable through a controlled path.

Restore into an isolated environment, validate data and application behavior, then reconcile state with other systems before cutover. Prevent restored workers from immediately sending emails, charging providers or publishing old outbox events. Reopening those paths is an explicit recovery step, not an accidental side effect of booting the application.

## Key concepts

**Backup success versus restore success.** A job can finish while omitting a required object, key or log range. Restore exercises verify the full chain, including operator access and application compatibility.

**Recovery throughput.** Download, disk preparation, replay, index work and validation all consume time. As a rough lower bound, reading 2 TB at a sustained 200 MB/s takes about 2.8 hours using decimal units, before replay and cutover. A one-hour RTO cannot be justified by that transfer path alone.

**Recovery point selection.** The latest backup is not always the desired state. Corruption may have existed for hours before detection. Preserve enough history and evidence to select a known-good point.

**Independent copies.** Separate failure domains and administrative authority reduce shared risk. Immutability and retention controls need tested operational procedures; a label alone does not prove a compromised operator cannot destroy access.

**Reconciliation.** Restored database state must be compared with externally committed facts. Operation IDs and retained provider records are far more useful than guessing from timestamps alone.

## Production example

A faulty cleanup deletes active customer records at 14:05, and the problem is detected at 14:20. Valid writes and provider actions also occurred during those fifteen minutes. Restoring the entire service to 14:04 would recover deleted rows but discard other legitimate progress.

The team first contains further damage and preserves evidence, including logs and the current database where feasible. It restores a known-good point into an isolated environment with outgoing integrations disabled. It verifies the affected records and determines whether a carefully controlled selective repair is safer than replacing the whole database.

If full cutover is necessary, the recovery plan identifies post-target operations from durable evidence and reconciles them. Provider-side actions are queried using their operation identifiers before anything is retried. Current deletion restrictions and access changes are reapplied where needed so restoration does not revive data or permissions that should remain removed.

Validation checks business invariants and representative workflows, not just row counts. Operators confirm required encryption keys, object references and service configuration are available. Only then do they switch traffic and progressively resume consumers and external effects.

The exercise records detection, decision, restore, reconciliation and cutover time separately. These illustrative steps show why a fast file restore may still fail the user-facing RTO, and why a backup strategy must be rehearsed with application owners.

## Trade-offs

Frequent backups and longer retention improve recovery options but consume storage, transfer and verification effort. Retention also interacts with privacy and product requirements. Choose it deliberately rather than preserving everything indefinitely.

A warm recovery environment can reduce RTO but costs more and may still share corruption or administrative risks. Offline recovery copies improve independence but can take longer to use. The right combination depends on the failures and business consequences being addressed.

## Failure modes / pitfalls

Untested keys or credentials can make otherwise valid backups unusable. Backups in the same administrative blast radius can disappear during the incident they were meant to survive. Missing WAL can prevent recovery to the selected timestamp.

Restored consumers can duplicate external actions if their progress and the restored data are inconsistent. Old backups can also restore deleted personal data or obsolete permissions. A successful database health check does not catch these problems.

Do not assume backup retention equals detection coverage: if corruption is discovered after all clean copies expire, the nominal backup schedule may provide no useful recovery point.

## When to use it

Provide recovery planning for every authoritative dataset, proportional to its importance and reproducibility. Derived caches may be rebuildable, but measure rebuild time and dependencies before excluding them from the recovery plan.

Run exercises using the same access mechanisms, artifact types and application versions the real procedure would use. Verify who can authorize cutover and who decides how to handle uncertain business operations.

## When not to use it

Do not use replica count or a green backup dashboard as proof of recovery capability. Do not impose a full-database restore when a verified selective repair can safely recover the affected data with less disruption.

Avoid promising aggressive RTO or RPO without measuring the complete procedure. A target that ignores provisioning, key access, replay and reconciliation is not an operational guarantee.

## What a Senior Engineer should know

A Senior Engineer should restore and validate their service's data, explain the available recovery range and identify external state requiring reconciliation. They should know how to prevent restored workloads from causing premature effects.

They should also distinguish data transfer, replay and application recovery time, and maintain a runbook that another engineer can follow under pressure.

## What a Staff Engineer should understand

A Staff Engineer should coordinate recovery objectives, independent copies and decision authority across services. The recovery plan must account for shared identity, key management, infrastructure and provider dependencies, including a compromised administrative account.

Use drills to expose incompatible recovery points and missing evidence for reconciliation. Invest where measured recovery fails business objectives, rather than treating backup-job completion as the program's success metric.

Further reading: [PostgreSQL continuous archiving and PITR](https://www.postgresql.org/docs/current/continuous-archiving.html), [PostgreSQL backup methods](https://www.postgresql.org/docs/current/backup.html).
