---
title: "Vector databases"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Vector databases store embeddings and retrieve nearby vectors under a distance metric, often alongside metadata filtering. Similarity is an approximate representation of relevance, not a truth or authorization decision.

## Why it matters for backend engineers

Semantic search can find related text without exact keywords. Index configuration, filtering and embedding versions determine whether relevant authorized results are actually returned.

## How it works

An embedding model maps items into vectors. Indexes such as HNSW or IVF reduce search work compared with exhaustive distance calculation, trading recall, memory and latency. Queries embed input using a compatible model and retrieve candidates under distance and filter policy. Hybrid search can combine vector candidates with lexical matches.

## Key concepts

Cosine, dot-product and Euclidean distance are not interchangeable without appropriate normalization and model assumptions. Approximate recall needs measurement. Filtering before or after candidate generation affects results. Reembedding can require a full migration and parallel indexes.

## Production example

A help-center search combines exact product-code matches with semantic retrieval. Evaluation shows vector-only search misses short codes, so lexical results remain. When the embedding model changes, the team builds a new index and compares relevance before switching; it never mixes incompatible vectors in one space.

## Trade-offs

Approximate search scales useful retrieval. It adds index memory, embedding cost and update lifecycle; ordinary relational vector extensions may suffice before a separate database is warranted.

## Failure modes / pitfalls

Mismatched models, weak metadata permissions, post-filter recall loss and assuming high similarity proves factual relevance create mistakes.

## When to use it

Use vector retrieval for semantic matching with measurable relevance requirements.

## When not to use it

Exact identifiers and structured predicates often need lexical or relational lookup instead.

## What a Senior Engineer should know

Measure recall/latency and manage embedding, distance and filtering compatibility.

## What a Staff Engineer should understand

Choose retrieval architecture and migration strategy based on relevance, permissions and operating cost.

Further reading: [pgvector](https://github.com/pgvector/pgvector), [HNSW paper](https://arxiv.org/abs/1603.09320).
