---
title: "RAG architecture"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Retrieval-Augmented Generation (RAG) retrieves external evidence at request time and places selected material into the model's context before generation. It is useful when answers depend on private, current, or large knowledge sources that should not be baked permanently into model weights.

RAG is a pipeline, not simply “vector search plus an LLM.” Ingestion, source authority, permissions, chunking, indexing, retrieval, reranking, context construction, citation, freshness, and deletion all affect correctness.

## Why it matters for backend engineers

A model can generate fluent answers from the wrong evidence. Retrieval therefore introduces new failure classes: the relevant document was never indexed, the query matched an obsolete version, permission filtering happened too late, or context contained a malicious instruction.

Separating retrieval quality from generation quality is essential. If the right source never reaches the model, prompting cannot repair the missing evidence.

## How it works

Ingestion starts from authoritative sources. Each document or record keeps source identity, version or effective date, ownership, and access-control metadata.

Content is split into chunks that preserve enough context to be meaningful. Chunking by arbitrary token count can separate a heading from its condition or exception, so structure-aware boundaries are often better.

Chunks can be indexed lexically, semantically through embeddings, or both. Hybrid search combines exact terms with semantic similarity and often improves product codes, names, and domain terminology.

At query time, authorization should constrain candidate retrieval as early as the storage/search system permits. Retrieve candidates, optionally rerank them with a stronger model, and build a context containing only the evidence needed for the answer.

Generation should cite or otherwise identify supporting sources. A citation must actually entail the nearby claim; the presence of a URL is not proof of grounding.

Updates and deletion need propagation through indexes, caches, and derived summaries. A user losing permission to a document should not continue receiving cached answers that contain it.

## Key concepts

**Retrieval recall.** Whether the relevant evidence appears in the candidate set.

**Precision/ranking.** Whether top results are actually useful rather than merely similar.

**Grounding.** Whether the generated claim follows from the supplied evidence.

**Chunking.** Determines the unit of retrieval and therefore how much local meaning is preserved.

**Hybrid search.** Combines lexical and vector retrieval rather than assuming embeddings solve every query type.

**Freshness and effective version.** The most semantically similar document may be obsolete.

**Authorization propagation.** Permissions must cover source, index, retrieval, cache, and final display.

## Production example

A support assistant answers refund-policy questions from internal policy documents.

The source system contains current policy, superseded policy, draft policy, and country-specific exceptions. The first RAG version indexes all of them together and retrieves by semantic similarity.

A user asks, “Can German customers cancel after activation?” The highest-scoring chunk comes from a 2025 policy that has been superseded. The model answers confidently and cites it.

The team changes ingestion to store effective-from/effective-to dates, policy status, market, and source version. Retrieval filters to current approved policy for the user's market before vector ranking.

Hybrid retrieval keeps exact statutory and product terms. A reranker operates only on authorized candidates.

Evaluation separates stages:
- did retrieval include the authoritative current section?
- did ranking place it in useful context?
- did the answer state only what that section supports?
- did citations point to the exact source?
- did an unanswerable question produce uncertainty instead of invention?

Deletion tests remove a source document and verify its chunks, caches, and citations disappear within the defined freshness objective.

## Trade-offs

RAG adds current private knowledge without model retraining and can provide source evidence. It adds indexing, retrieval latency, storage, freshness, and evaluation complexity.

Larger context can increase the chance the answer sees the right fact while also adding distraction, cost, and prompt-injection surface.

Vector search improves semantic matching; lexical search remains strong for identifiers, error codes, and exact language.

## Failure modes / pitfalls

Permission filtering after generation is too late because unauthorized text already entered model context.

Stale indexes and duplicate document versions can cause the wrong policy to win. Poor chunking can remove the exception clause from the rule it qualifies.

Citation generation can point to a relevant document that does not actually support the claim.

Retrieved documents can contain instructions; they remain untrusted content and should not override system or user policy.

## When to use it

Use RAG when answers depend on a maintained corpus that changes independently of model training and when source evidence can be evaluated.

It is particularly useful for documentation, support knowledge, policy, and internal engineering information.

## When not to use it

Use deterministic SQL, key-value lookup, or business APIs for precise structured facts when generation adds no value.

Do not add a vector database to a small static FAQ if ordinary search and templates already meet the product need.

## What a Senior Engineer should know

A Senior Engineer should diagnose ingestion, retrieval, ranking, and generation separately; implement permission and freshness rules; and build evaluations for both retrieval and answer grounding.

They should inspect failed queries and sources, not tune prompts blindly.

## What a Staff Engineer should understand

A Staff Engineer should define source authority, data lifecycle, tenant isolation, deletion propagation, index/version strategy, evaluation, and cost across RAG products.

They should keep the retrieval architecture proportional to the corpus and use simpler deterministic sources where they are more reliable.

Further reading: [Retrieval-Augmented Generation paper](https://arxiv.org/abs/2005.11401).
