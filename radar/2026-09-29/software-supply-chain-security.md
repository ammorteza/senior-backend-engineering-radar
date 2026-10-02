---
title: "Software supply-chain security"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Software supply-chain security protects the path from source and dependencies through build systems to released artifacts. It asks whether the running software came from the intended inputs and trusted process.

## Why it matters for backend engineers

A secure application can still ship a malicious dependency or artifact altered after testing. CI identities and package registries are therefore part of the production trust boundary.

## How it works

Pin and review inputs, isolate builds, record provenance and publish immutable artifacts. Signatures or attestations bind claims to an identity; verifiers must check expected identity, artifact digest and policy. SBOMs describe components, while provenance describes how an artifact was produced. Deployment verifies the artifact that was actually built and tested.

## Key concepts

Reproducibility, provenance and vulnerability freedom are distinct properties. SLSA specifies assurance requirements for supply-chain controls. OIDC can replace persistent CI credentials; it still needs tightly scoped trust policies.

## Production example

A release pipeline builds an image once, records its source commit and build identity, and deploys by digest. Admission verifies the attestation against the expected workflow identity. A compromised tag cannot redirect deployment to an unrelated image, but malicious reviewed source still requires code and dependency controls.

## Trade-offs

Integrity evidence improves traceability and containment. Signing infrastructure and policy enforcement add operations; a signature without meaningful identity policy provides little assurance.

## Failure modes / pitfalls

Mutable tags, untrusted PR code with release credentials, accepting any valid signer and rebuilding after approval break the chain of evidence.

## When to use it

Apply supply-chain controls to production artifacts and privileged build paths, scaled to risk.

## When not to use it

Do not equate an SBOM or signature alone with trustworthy software.

## What a Senior Engineer should know

Understand digests, attestations, trusted build identity and dependency pinning.

## What a Staff Engineer should understand

Define release trust roots, provenance policy and emergency recovery after build-system compromise.

Further reading: [SLSA specification](https://slsa.dev/spec/v1.2/), [Sigstore](https://docs.sigstore.dev/).
