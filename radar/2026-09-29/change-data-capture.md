---
title: "Change Data Capture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Change Data Capture (CDC) transfers database changes into another system. Log-based CDC observes the database's committed change stream rather than asking every application writer to publish separately. It is commonly used to maintain search indexes, analytical datasets and other derived views.

A row change is a storage fact. It may indicate that an address changed, but not whether that change was a customer correction, an administrator action or an import repair. CDC and domain events can complement each other; an outbox captured through CDC can carry explicitly designed business meaning.

## Why it matters for backend engineers

CDC can cover writes made by services, maintenance scripts and other clients. That makes it useful when manually coordinating publication across every writer would be fragile.

It also creates a dependency between downstream progress and source operations. In PostgreSQL, a replication slot can retain WAL needed by a consumer. A stalled pipeline can therefore threaten the primary's disk capacity even when application queries remain healthy. Freshness and source protection must both be operational objectives.

## How it works

A connector establishes a consistent relationship between an initial dataset snapshot and a position in the change log. It then streams subsequent changes while checkpointing progress. The exact snapshot algorithm varies: copying rows and only afterward starting to watch changes is unsafe because writes during the copy can fall into a gap.

Change records identify the table, row key, operation and source position, with before/after information where supported and configured. Deletes require suitable identity information; source settings such as PostgreSQL replica identity affect what can be emitted. Some updates may not contain every unchanged large value, so sinks must follow the connector's documented representation.

The pipeline writes records to its transport and eventually applies them to a destination. Checkpoints at these stages are distinct. A restart can replay records, and parallel destination workers can reorder them even when the source log is ordered. Use stable keys and an ordering/version strategy supported by the source and sink; a wall-clock timestamp alone is not a sufficient general ordering token.

If the necessary source log is gone, an old offset cannot recreate it. Recovery may require a new snapshot and a controlled destination rebuild. Retaining an offset file is not the same as retaining the data needed to resume from it.

## Key concepts

**Snapshot continuity.** The handoff must cover changes occurring during extraction without silently losing or regressing rows. Validate the chosen connector mode under concurrent updates and deletes.

**Source position versus business version.** Log positions describe progress in a source stream. Failover, multiple sources and transaction-local ordering require the connector's full metadata contract; do not compare arbitrary position strings as if globally ordered.

**Transaction boundaries.** A source transaction affecting several rows may become several records or topics. A destination that applies them independently can expose intermediate states unless it deliberately reconstructs an atomic boundary.

**Delete records and tombstones.** A delete conveys removal; a transport tombstone can serve a separate compaction purpose. A sink must understand the emitted format rather than assuming every null payload means the same thing.

**Schema coupling.** Renaming a column or changing replica identity can affect the integration even if the application's migration succeeds. Treat connector and consumer compatibility as part of schema rollout.

## Production example

A customer directory in PostgreSQL feeds a search index. The source remains authoritative; the product allows a defined delay before a changed profile appears in search.

During initial loading, the team updates and deletes selected test profiles while snapshotting continues. It checks the eventual index against the final authoritative rows, including deletions, rather than validating only snapshot row counts. It also tests replay after the connector restarts from a saved checkpoint.

Later, a destination outage causes backlog. Operators monitor source WAL retention, connector progress, broker age and destination freshness separately. These metrics locate the bottleneck and show whether protecting the primary requires a deliberate interruption and rebuild. Deleting the slot without a recovery plan might save disk while destroying continuity.

Recovery writes into a new index when a resnapshot is required. The team coordinates backfill and change catch-up, checks sampled records and delete behavior, then switches readers. An older snapshot row must not overwrite a newer streamed state merely because its destination request finished later.

The drill also includes a source schema change and a destination failure halfway through a multi-row source transaction. The required answer is product-specific: search may tolerate a brief mixed view, while a financial projection might require stronger grouping. CDC by itself does not decide that contract.

## Trade-offs

CDC reduces publication work in application code and can capture all supported writers. It adds connectors, retained-log capacity, snapshot load and coupling to physical schemas.

A broad raw feed offers flexibility but exposes more data and internal structure. A curated integration table or outbox limits that surface at the cost of explicit producer work. Choose the interface according to whether consumers need row state or business intent.

## Failure modes / pitfalls

Lost offsets, invalidated slots, unsupported DDL or expired logs can force expensive rebuilds. Ignoring deletes creates permanently stale destination records. Treating a connector's “running” status as freshness evidence can conceal a stalled sink.

Snapshot load can compete with request traffic. A rebuild may emit historical state that downstream code mistakes for newly occurring business actions. Keep data replication separate from irreversible actions unless an explicit protocol distinguishes replay.

## When to use it

Use CDC for maintained read models, analytical replication and integrations whose contract is the source's changing data. Establish source protection and a tested resnapshot path before the feed becomes essential.

Test continuity, duplicates, schema changes and destination recovery with live writes continuing.

## When not to use it

Do not expose an application's entire database as an accidental public event API when consumers need stable domain meaning. Do not assume CDC provides an indefinitely replayable business history unless retention and event modeling actually support that requirement.

For a small periodic export with loose freshness needs, a simpler bounded extraction may avoid connector operations.

## What a Senior Engineer should know

A Senior Engineer should explain snapshot-to-stream continuity, source metadata, checkpoints and delete handling. They should locate lag across stages and understand which failure destroys the ability to resume.

They should rehearse a destination rebuild and verify concurrent changes, not merely demonstrate that initial rows appear.

## What a Staff Engineer should understand

A Staff Engineer should distinguish internal storage replication from cross-team event contracts. Define data exposure, schema ownership, source-log budgets and recovery expectations for each feed.

Plan the cost and duration of rebuilding essential projections. CDC reduces manual dual-write logic, but the organization still owns continuity when the pipeline, source topology or schema changes.

Further reading: [Debezium PostgreSQL connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html), [PostgreSQL logical replication](https://www.postgresql.org/docs/current/logical-replication.html).
