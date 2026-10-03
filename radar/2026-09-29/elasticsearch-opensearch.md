---
title: "Elasticsearch / OpenSearch"
ring: trial
segment: platforms
tags: [backend]
---

## What it is

Elasticsearch and OpenSearch are document-oriented search and analytical engines built around indexes, including inverted indexes for text retrieval. They transform source documents into structures that support token matching, relevance scoring, filtering and aggregation.

The products share history but have diverged. Versions, plugins, APIs and managed-service behavior must be evaluated separately. A design can use their common concepts without assuming that every current feature or configuration is interchangeable.

## Why it matters for backend engineers

Text retrieval is not simply a database equality lookup. Searching for a phrase, a word variant or a relevant document involves analysis and ranking choices that shape what users find. Backend engineers need to test those choices against the product's language and data.

A separate search index also introduces synchronization. The authoritative record may be updated before the new representation becomes searchable, and deleted source data can remain visible if cleanup fails. Search correctness includes freshness and authorization as well as relevance.

## How it works

Mappings define field types and indexing behavior. Text analyzers transform strings into tokens, potentially applying normalization, stop-word handling or stemming. An inverted index associates terms with documents so the engine can find candidates without scanning every original string.

Exact values and analyzed text serve different queries. A title may need analyzed search while an account identifier should preserve exact matching. Aggregations and sorting commonly rely on suitable column-like doc values for supported field types rather than reusing the text-search representation indiscriminately.

Indexes are divided into shards, with replicas providing additional copies and search capacity under the product's topology. Shard count affects memory, coordination and recovery overhead; many small shards are not a free scaling strategy.

Indexing acknowledgement and search visibility are separate milestones. Refresh exposes newly indexed changes to search under the engine's near-real-time model. Transaction logs, flushes and replication govern other durability and recovery concerns. Forcing refresh after every write can make ingestion and search less efficient.

## Key concepts

**Text versus keyword.** An analyzed text field supports token-based retrieval; an exact-value field supports identifiers, categories and suitable sorting or aggregation. A multi-field mapping can represent one source value in both ways where useful.

**Relevance requires examples.** Analyzer and ranking choices should be evaluated with representative queries and expected results. A technically valid query can still return poor product results.

**Mapping evolution.** Changing how an existing field is indexed often requires a new index and reindexing. Plan for old and new readers rather than assuming every mapping can be mutated in place.

**Versioned synchronization.** Change streams can duplicate or reorder updates. A stable document ID and supported source-version policy help prevent an older event from overwriting a newer state, including deletion handling.

**Pagination and consistency.** Deep offset pagination can require substantial work. Search-after and point-in-time mechanisms, where supported, address different parts of efficient and stable traversal; verify the selected product's semantics.

## Production example

A support application stores authoritative tickets in PostgreSQL and indexes them for full-text search. A search response links to the authoritative ticket, and the product accepts a defined indexing delay rather than interpreting immediate search absence as proof that creation failed.

The team tests a mapping with analyzed title and body fields, exact tenant and status fields, and a suitable timestamp field. Queries include common abbreviations, phrases and misspellings supported by the chosen search design. Security tests confirm that search filters and the subsequent record fetch both enforce tenant authority; an index hit must not grant access by itself.

A CDC consumer uses stable ticket IDs and a version strategy appropriate to the source. Tests deliver an old update after a new one, duplicate events and a deletion followed by a delayed update. The index must not resurrect a deleted ticket through an unexamined replay path.

When a mapping change requires rebuilding, the team creates a new index, backfills it and reconciles ongoing changes. It validates counts, sampled records, deletion behavior and relevant search results. An alias switches reads only after the new index has reached the required state. The old index remains available for a controlled period, with a plan for any writes or synchronization needed during rollback.

This example treats search as a maintained projection with explicit recovery. It does not assume that copying documents once creates a permanently correct search service.

## Trade-offs

Search engines provide retrieval and aggregation capabilities that would be awkward to reproduce in application code. They add index storage, ingestion work, shard operations and another consistency boundary.

Denormalizing related information into documents can make retrieval fast but requires updates when that information changes. Frequent forced refreshes improve immediate visibility at a throughput cost. Rich user queries need resource limits so flexibility does not become uncontrolled CPU and memory demand.

## Failure modes / pitfalls

Dynamic fields from arbitrary payload keys can cause mapping explosion. Excessive shards increase overhead and recovery work. Expensive wildcard patterns, large aggregations and deep pagination can overwhelm resources even when document ingestion is stable.

Ignoring deletes or event ordering produces stale or resurrected records. Treating refresh as a durability setting confuses separate mechanisms. Switching an alias before backfill and change catch-up are consistent can expose incomplete results.

A healthy cluster does not establish good relevance or correct tenant filtering. Validate these as product properties, not merely infrastructure health.

## When to use it

Use a search engine when language-aware retrieval, ranking or specialized search capabilities justify a separate index. Define source authority, synchronization, freshness and rebuild procedures at the same time as mappings.

Start with real query examples and representative documents. Inspect both the quality of results and the resource cost of the query patterns users can submit.

## When not to use it

Do not choose it as the default transactional database solely because it stores JSON documents. Multi-record business invariants and arbitrary relational constraints require different guarantees.

Avoid a separate search cluster when a simpler supported database search feature meets the product need. The extra projection, operations and recovery path should earn their cost through required capabilities or scale.

## What a Senior Engineer should know

A Senior Engineer should design mappings and analyzers, distinguish indexing visibility from durability and test relevance with representative queries. They should understand shard and query-cost implications enough to avoid unbounded operations.

They should build synchronization that handles duplicates, old updates and deletes, and rehearse a complete index rebuild while the source continues changing.

## What a Staff Engineer should understand

A Staff Engineer should define search authority and freshness contracts across teams, with clear ownership of schemas and rebuilds. Shared clusters need tenant isolation, query budgets and lifecycle policies.

Evaluate version and plugin compatibility for the selected product rather than relying on historical interchangeability. Plan migrations so the organization can change engines or mappings without losing the ability to explain and recover its search results.

Further reading: [Elasticsearch documentation](https://www.elastic.co/docs), [Near-real-time search](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search), [OpenSearch field types](https://docs.opensearch.org/latest/field-types/).
