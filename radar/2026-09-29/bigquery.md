---
title: "BigQuery"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

BigQuery is a managed analytical warehouse for large SQL scans and aggregations. Its execution and billing model differs from a row-oriented transactional database.

## Why it matters for backend engineers

A dashboard query that scans an entire historical dataset can be both slow and expensive. Application engineers need to understand data layout and cost before exposing arbitrary warehouse queries.

## How it works

Data is stored in analytical tables and queried through distributed execution. Partition filters can prune time or other partitions; clustering can reduce scanned blocks for suitable predicates. On-demand and capacity-based models allocate costs differently. Ingestion and freshness depend on the selected loading or streaming path.

## Key concepts

Bytes processed differ from rows returned. Partitioning and clustering have distinct purposes. Reservations and slots govern capacity under relevant pricing models. Materialized results and scheduled transformations can avoid repeated expensive computation.

## Production example

A usage report queries a year's raw events for yesterday's totals. Partitioning by event date and requiring appropriate filters avoids unnecessary scanning. The team validates bytes processed, not only response time, then maintains a daily summary for repeated customer reports. It monitors data freshness separately from successful query execution.

## Trade-offs

Managed analytics removes server management and supports large scans. It introduces query economics, platform coupling and latency unsuitable for many synchronous transactional paths.

## Failure modes / pitfalls

`SELECT *`, missing partition filters, uncontrolled exploratory queries and stale ingestion can create cost or correctness surprises.

## When to use it

Use BigQuery for reporting, batch analysis and large-scale SQL over analytical datasets.

## When not to use it

Do not substitute it for low-latency row transactions or per-request account lookups without demonstrated fit.

## What a Senior Engineer should know

Read scan estimates, design partitions/clusters and verify query results and cost.

## What a Staff Engineer should understand

Govern analytical access, ingestion quality and workload budgets across teams.

Further reading: [BigQuery performance guidance](https://docs.cloud.google.com/bigquery/docs/best-practices-performance-compute).
