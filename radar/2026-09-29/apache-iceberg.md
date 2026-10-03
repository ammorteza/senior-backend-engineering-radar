---
title: "Apache Iceberg"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Apache Iceberg is a table format for large analytical datasets stored in files. It defines metadata, snapshots and evolution rules that let compatible engines treat those files as a coherent table. It is not itself a query engine, catalog service or object store.

A directory of Parquet files does not provide the same contract. If readers discover files while writers add or replace them, they can observe an unintended mixture. Iceberg gives readers an explicit table snapshot and writers a coordinated commit mechanism.

## Why it matters for backend engineers

Backend and data-platform engineers often publish events or exports into object storage. As several writers, engines and schema versions appear, “write files into this prefix” becomes an ambiguous interface.

Iceberg can make those datasets safer to evolve and query, but ownership remains necessary. Someone must operate the catalog, choose compatible engines, manage file sizes and retire snapshots safely. Adopting a table format does not remove maintenance or access-control design.

## How it works

A catalog provides access to the table's current metadata reference under its supported commit protocol. Table metadata describes schema, partition specifications and snapshots. A snapshot points through manifest metadata to the data files and, where applicable, delete information that define the table's visible state.

A writer creates new files, then attempts a metadata commit. The catalog's concurrency mechanism determines whether that update becomes the new table state. A failed or conflicting commit may require validation and retry, not simply publishing the same metadata over another writer's changes. Uncommitted files can remain and later require safe cleanup.

Readers select a snapshot and follow its metadata rather than treating every object in a storage prefix as current data. Old and new snapshots can therefore refer to different file sets while sharing unchanged files.

Schema and partition evolution are represented in metadata. Field identifiers preserve column identity across supported changes, and partition transforms connect logical predicates to file layout. Changing partitioning can affect newly written data without automatically rewriting every historical file. Query-engine support determines which format features are usable in practice.

## Key concepts

**Snapshot is a table state.** It provides a consistent file set for the table. Do not infer automatic transactions across every table in a pipeline; cross-table publication requires the guarantees of the chosen engine or workflow.

**Catalog is a correctness dependency.** Its commit and authorization behavior matters. A catalog outage or incompatible client can stop writes even while object storage is healthy.

**Field IDs differ from column positions.** Stable identity helps supported renames and evolution avoid confusing one field with another. It does not make every type change compatible with every reader.

**Hidden partitioning.** Users can filter logical columns while metadata helps engines prune files using transforms. Partition evolution allows layouts to coexist, but old files retain their layout until rewritten.

**Compaction, snapshot expiry and orphan cleanup are separate.** Compaction rewrites data into a more suitable file layout. Expiry retires historical table states under retention rules. Orphan cleanup removes files not referenced by valid metadata, with safeguards for in-flight writes and readers.

## Production example

An event lake is initially written in small batches partitioned by day. As volume grows, each day contains many tiny files, and planners spend increasing time loading metadata and opening objects. Some teams propose switching to hourly partitioning and deleting old files directly.

The platform team separates the problems. It evaluates whether hourly partitioning improves common time-range queries, then evolves the partition specification for new writes using supported tooling. Historical daily files remain valid; the metadata allows a compatible engine to interpret both layouts.

Small-file maintenance is handled independently by rewriting selected data into suitable files. The writer commits the replacement snapshot before any old files become candidates for removal. Retained snapshots may still reference those files, so deleting them immediately would break time travel or active readers.

The team defines snapshot retention and cleanup windows from its reader durations, recovery needs and writer behavior. It tests a failed commit that leaves unreferenced files and a long-running reader using an older snapshot. Orphan cleanup must not classify a still-in-flight writer's files as abandoned merely because they are not yet in the current snapshot.

Compatibility tests use every supported query engine, including relevant delete-file and schema-evolution features. “Can read one Iceberg table” is weaker evidence than “can correctly read the feature set this platform writes.”

## Trade-offs

Snapshot semantics and metadata-driven evolution improve reliability over unmanaged file directories. An open format can support multiple engines, but real interoperability depends on format versions, catalog integration and implemented features.

Maintenance and metadata become explicit operational work. Many small files can harm planning and execution, while very large rewrites consume resources and delay progress. Retaining more snapshots improves recovery options but keeps referenced data and metadata alive longer.

## Failure modes / pitfalls

Manual object deletion can corrupt valid snapshots. Aggressive orphan cleanup can race with in-progress writes. Assuming a partition change rewrites historical data can lead to incorrect performance expectations.

An engine may support basic reads but not the delete representation or evolution feature another engine produces. A table snapshot also does not automatically synchronize all tables used by a business report. Access rules must cover both catalog and storage paths so direct object access cannot silently bypass the intended policy.

## When to use it

Use Iceberg when analytical files need concurrent publication, reproducible snapshots and controlled schema or partition evolution, especially across compatible engines. Assign catalog and maintenance ownership from the start.

Validate the exact writer/reader combinations and operational procedures before treating the table as a stable shared interface. Include restart, conflict and long-reader cases in the evaluation.

## When not to use it

Do not introduce a lakehouse table layer for a small dataset whose existing single-engine workflow already provides the required guarantees. The catalog and maintenance burden should solve an actual problem.

Do not treat Iceberg as a low-latency operational database or assume its table snapshots provide arbitrary multi-table application transactions. Choose storage and execution systems for the actual access and consistency requirements.

## What a Senior Engineer should know

A Senior Engineer should follow a snapshot through metadata and files, explain how a commit becomes visible and distinguish the maintenance operations. They should know which schema and delete features their engines support.

They should diagnose small-file and metadata growth, use supported rewrite procedures and understand why object-store cleanup must respect snapshots and active operations.

## What a Staff Engineer should understand

A Staff Engineer should choose catalog, engine compatibility and ownership boundaries for the data platform. Define publication contracts and recovery semantics for reports spanning multiple tables.

Coordinate snapshot retention, storage cost, access policy and upgrade testing across teams. An open table format creates a useful interoperability boundary only when the organization maintains that boundary deliberately.

Further reading: [Iceberg specification](https://iceberg.apache.org/spec/), [Schema and partition evolution](https://iceberg.apache.org/docs/latest/evolution/), [Maintenance](https://iceberg.apache.org/docs/latest/maintenance/).
