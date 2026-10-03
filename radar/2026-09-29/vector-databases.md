---
title: "Vector databases"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Vector databases and vector-capable search engines store embeddings and retrieve nearby vectors under a similarity or distance function. They are commonly used for semantic search, recommendation candidates, deduplication, and RAG retrieval.

A vector represents a model's learned geometry, not factual truth. High similarity means “close according to this embedding and metric,” which may or may not match the product's notion of relevance.

## Why it matters for backend engineers

Semantic search finds conceptually related text even when exact keywords differ. It also introduces new compatibility concerns: embedding model, vector dimension, normalization, distance metric, approximate-index parameters, filters, and re-embedding lifecycle.

Authorization remains a separate requirement. A highly relevant vector from another tenant must never be returned merely because it scores well.

## How it works

An embedding model converts documents and queries into fixed-dimensional vectors. Retrieval compares a query vector with stored vectors using a distance or similarity function such as cosine distance, dot product, or Euclidean distance.

Exact nearest-neighbor search compares against every candidate and becomes expensive at large scale. Approximate nearest-neighbor (ANN) indexes such as HNSW or IVF reduce work by trading some recall for latency and memory.

Metadata filters restrict candidate sets by tenant, document type, time, or other structured attributes. The search engine's filter execution order matters: post-filtering a small ANN candidate set can return too few authorized matches.

Hybrid retrieval combines lexical methods such as BM25 with vector similarity. This often performs better for product codes, names, acronyms, and exact error strings.

Changing embedding model usually means producing vectors in a new space. Build a parallel index and evaluate it rather than mixing incompatible embeddings.

## Key concepts

**Embedding model/version.** Defines vector space. Store it with indexed data and query configuration.

**Distance metric.** Cosine, dot product, and Euclidean metrics have different assumptions. Use the metric recommended or validated for the embedding model.

**ANN recall.** Fraction of true relevant or exact-neighbor results recovered under approximate search. Measure it against a benchmark.

**HNSW.** Graph-based ANN index with memory, build-time, and search-quality trade-offs.

**IVF.** Partitions vector space into coarse clusters and searches selected clusters, trading build and query work against recall.

**Metadata filtering.** Must preserve authorization and product constraints without silently destroying retrieval recall.

## Production example

A help-center search initially uses vector-only retrieval. Users search for exact product codes such as `XR-500` and receive semantically related but wrong models.

The team builds a hybrid ranker: lexical retrieval gives high weight to exact code matches, while vector retrieval helps natural-language questions.

Tenant and product permissions are applied before final candidate selection. The evaluation corpus contains known exact-code queries, paraphrased questions, and permission-boundary cases.

Six months later the embedding provider releases a stronger model with a different vector dimension. The team creates a parallel index, re-embeds documents, and measures recall, ranking quality, latency, storage, and build cost.

During migration, old queries use the old index and new experiments use the new index. Vectors from the two spaces are never compared directly.

For a 100k-row corpus, benchmarks also show that PostgreSQL with pgvector meets latency and operational needs, so the team avoids introducing a separate specialized database solely for branding.

## Trade-offs

ANN indexes make large semantic search practical but consume memory and return approximate results.

Dedicated vector databases provide specialized scaling and filtering; existing search engines or relational vector extensions may reduce infrastructure for moderate workloads.

Re-embedding can be expensive and doubles storage during migration. Hybrid search improves quality while adding rank-combination complexity.

## Failure modes / pitfalls

Mixing vectors from different embedding models or dimensions invalidates similarity. Choosing a distance metric without model guidance can reduce quality.

Applying authorization only after generation can leak content. Post-filtering a tiny ANN result set can create severe recall loss.

High similarity can still retrieve outdated, semantically misleading, or factually irrelevant text; downstream grounding remains necessary.

## When to use it

Use vector retrieval when semantic similarity materially improves a measured search, recommendation, or RAG task.

Benchmark against lexical and relational alternatives and evaluate quality with representative queries.

## When not to use it

Use ordinary keyed lookup for IDs and exact facts. Use SQL or search filters for structured predicates.

Do not add a separate vector database before the corpus size, latency, filtering, and operating needs justify it.

## What a Senior Engineer should know

A Senior Engineer should understand embedding compatibility, metrics, ANN recall, index parameters, filters, hybrid retrieval, and re-embedding migrations.

They should evaluate retrieval quality and permission correctness, not only query latency.

## What a Staff Engineer should understand

A Staff Engineer should choose vector architecture based on corpus size, quality, isolation, update frequency, and total operating cost.

They should establish embedding versioning and migration standards so retrieval systems can evolve without silently mixing incompatible vector spaces.

Further reading: [pgvector](https://github.com/pgvector/pgvector), [HNSW paper](https://arxiv.org/abs/1603.09320).
