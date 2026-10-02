---
title: "RAG architecture"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Retrieval-Augmented Generation (RAG) supplies selected external material to a model before it answers. Its value depends on retrieving relevant, authorized and current evidence, then using it faithfully.

## Why it matters for backend engineers

A model may lack current internal knowledge. Retrieval helps, but a wrong document or weak permission filter can produce confidently incorrect answers or expose private information.

## How it works

Ingest documents with source identity and access metadata, split them into meaningful chunks and index lexical or vector representations. At query time, retrieve candidates, filter authorization, rerank and provide evidence with citations. Evaluate retrieval and answer quality separately. Updates and deletions must reach indexes and cached results.

## Key concepts

Chunk boundaries affect meaning. Hybrid search combines lexical precision and semantic matching. Recall concerns finding relevant evidence; grounding concerns whether the answer follows it. Retrieved instructions remain untrusted content. Citation presence alone does not prove support.

## Production example

A support assistant answers policy questions from versioned documents. A query retrieves an obsolete refund rule, so the system filters by effective version and identifies the cited source. Tenant permissions apply during retrieval and again where needed before display. A test asks an unanswerable question and expects explicit uncertainty.

## Trade-offs

RAG improves access to changing knowledge without retraining. Indexing, freshness and evaluation add complexity; extra context can distract rather than help.

## Failure modes / pitfalls

Stale indexes, permission filtering after generation, poor chunking and citations unrelated to claims cause failures.

## When to use it

Use RAG when answers need a maintained external knowledge base and evidence can be evaluated.

## When not to use it

A deterministic lookup or SQL query may be more reliable for precise structured facts.

## What a Senior Engineer should know

Diagnose retrieval versus generation errors and implement permission/freshness checks.

## What a Staff Engineer should understand

Define source authority, deletion propagation and end-to-end answer acceptance criteria.

Further reading: [Original RAG paper](https://arxiv.org/abs/2005.11401).
