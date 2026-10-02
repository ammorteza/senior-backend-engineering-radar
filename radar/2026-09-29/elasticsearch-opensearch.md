---
title: "Elasticsearch / OpenSearch"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Elasticsearch and OpenSearch are search and analytical engines built around indexed documents. Their shared history does not make their current versions, plugins or managed products interchangeable.

## Why it matters for backend engineers

Text search needs tokenization and relevance, not just equality lookup. Indexing changes data representation and introduces a freshness gap between authoritative writes and searchable documents.

## How it works

Mappings define field types and analyzers tokenize text into terms. Inverted indexes map terms to documents. Shards distribute index data; replicas improve availability and read capacity. Refresh makes newly indexed documents searchable, while flush and durability have different purposes. Updates generally involve replacing indexed representations rather than in-place relational updates.

## Key concepts

`text` and `keyword` fields serve different queries. Shard count and size affect overhead and recovery. Dynamic mappings can create field explosion. Relevance scores and aggregations have different accuracy and resource considerations.

## Production example

A support system indexes tickets for full-text search. PostgreSQL remains authoritative; CDC updates documents with version checks. When the index is rebuilt after mapping changes, an alias switches readers after validation. The UI tolerates a defined indexing delay rather than treating search absence as deletion.

## Trade-offs

Rich retrieval and aggregations are valuable. Index storage, shard management and synchronization add cost, and business transactions do not naturally span documents.

## Failure modes / pitfalls

Excess shards, mapping explosion, deep pagination and expensive wildcard queries can exhaust resources. Ignoring deletes leaves stale results.

## When to use it

Use a search engine when language-aware retrieval or specialized search capabilities justify a separate index.

## When not to use it

Do not use it as the default transactional database solely because it stores JSON.

## What a Senior Engineer should know

Design analyzers and mappings, interpret refresh behavior and test relevance.

## What a Staff Engineer should understand

Own index rebuilds, synchronization guarantees and tenancy/query cost controls.

Further reading: [Elasticsearch documentation](https://www.elastic.co/docs), [OpenSearch documentation](https://docs.opensearch.org/).
