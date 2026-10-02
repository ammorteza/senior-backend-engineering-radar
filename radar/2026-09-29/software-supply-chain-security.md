---
title: "Software supply-chain security"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Software supply-chain security protects the path by which source code, dependencies and build tools become the software running in production. An application can have sound business logic and still be compromised because a release runner was hijacked, a dependency was replaced, or deployment selected an artifact different from the one tested.

The central question is evidential: can you connect a running artifact to the intended source, inputs and authorized build process? Answering it requires controls at several boundaries. Dependency scanning addresses known component vulnerabilities; supply-chain integrity also concerns who could change the component or the build itself.

## Why it matters for backend engineers

Backend engineers routinely grant CI enough power to publish images, fetch secrets and deploy infrastructure. That makes a release pipeline a privileged production system. Running untrusted pull-request code with those credentials can be equivalent to handing an attacker the release role.

Troubleshooting also depends on traceability. When a compromised package is discovered, the team must identify affected images and running services, not merely search the current default branch. Immutable artifact identities, retained provenance and build records reduce the time needed to answer that question.

## How it works

Start with controlled source and dependencies: reviewed changes, protected release paths, resolved dependency versions and explicit build-tool versions. Pinning prevents unexpected movement but does not prove the pinned input is safe; updates and review remain necessary.

Build in an environment with limited credentials and clearly defined inputs. Separate untrusted validation jobs from privileged release jobs. A short-lived credential reduces how long a stolen credential remains useful, but the job receiving it must still be trustworthy.

Publish the resulting artifact under a content digest and record **provenance** describing the build. An attestation can bind that statement to a builder identity. At deployment, verification must check the actual artifact digest and the expected issuer, builder or workflow identity under your policy. Accepting any cryptographically valid signature would allow an unrelated signer to satisfy the gate.

Promote the tested artifact between environments instead of rebuilding it for production. Even the same source commit can produce different bytes when base images, package repositories or build inputs change. Where environment-specific builds are unavoidable, each resulting artifact needs its own evidence and validation.

## Key concepts

**Digest versus tag.** An image tag is a name that can move. A cryptographic digest identifies particular content. Deploying by digest prevents a later tag update from silently selecting a different image, but does not prove that the selected image is benign.

**SBOM versus provenance.** An SBOM describes components. Provenance describes the process and inputs that produced an artifact. Both can be inaccurate if their producer is compromised; the trustworthiness of the producing environment matters.

**Signing versus authorization.** A signature supports integrity and signer identification. Policy decides whether that signer was authorized to produce this service's release. Identity constraints must be specific enough to exclude untrusted branches and workflows.

**Reproducibility.** Independently obtaining the same output from declared inputs can strengthen confidence in the build. It does not demonstrate that those inputs contain no malicious code. SLSA describes increasing supply-chain assurance requirements, including build provenance and build-platform protections; adopting a label requires meeting its requirements, not just generating a JSON file.

## Production example

Imagine a service whose staging deployment passed tests using `payments:release`. Before production deploys, another job overwrites that tag. Production now runs different bytes while the release record still points to successful staging tests.

The improved pipeline builds once and records the image digest, source commit and authorized build identity. Staging and production both select that digest. Before promotion, deployment policy checks that the attestation refers to the same digest and came from the approved release workflow. A tag can still be used for discoverability, but it is not the authority for artifact selection.

The team tests three negative cases: an unsigned image, an image signed by the wrong workflow, and a valid attestation for a different digest. All must fail the intended gate. It also tests how emergency rollback selects a previously verified digest.

This prevents artifact substitution through tag movement. It does not prevent malicious code merged through the approved process, so source review, dependency review and build isolation remain necessary. The example teaches one concrete boundary rather than claiming that signing solves every supply-chain threat.

## Trade-offs

Stronger release evidence improves investigation and limits accidental substitution, but operating verification requires key or identity management, retained metadata and a supported policy rollout. Introducing a gate before the build can consistently produce the required evidence can halt releases.

Use staged enforcement and measure legitimate failures. Begin by collecting and validating evidence, repair gaps, then enforce on the relevant production path. An emergency exception should select a specific artifact and leave an audit trail; a permanent “temporarily disable verification” switch destroys the protection.

## Failure modes / pitfalls

- **Untrusted CI code receives release credentials.** Separate validation from promotion, including caches and artifacts transferred between those jobs.
- **A signed artifact is accepted from any signer.** Match expected identity and artifact scope, not just cryptographic validity.
- **Production rebuilds after approval.** The new artifact is not the one that passed tests. Promote by digest or validate the new build independently.
- **Dependencies are pinned forever.** Integrity of an old vulnerable input does not remove its vulnerability. Pinning needs an update process.
- **Compromised builders can approve themselves indefinitely.** Define how to revoke trust, isolate runners and rebuild affected releases from a trusted environment.

## When to use it

Apply these controls to production release paths, especially where CI can publish public packages, modify infrastructure or deploy services handling sensitive data. A practical starting point is one traceable release: source commit to build identity to tested digest to running workload.

Expand the assurance level according to the consequences of build compromise and the evidence your consumers require. Shared build platforms are especially valuable targets for consistent controls because one improvement can protect many repositories.

## When not to use it

Do not treat signatures, SBOMs or a compliance badge as a replacement for secure application design. They establish different properties from correct authorization, safe parsing or absence of vulnerabilities.

Avoid implementing a custom signing protocol when maintained tooling can express the required policy. Extra cryptography without a clear trust model creates complexity while leaving the important question—who is authorized to release this artifact—unanswered.

## What a Senior Engineer should know

A Senior Engineer should trace a deployment to its digest, source and build records; identify where mutable references remain; and explain which identities can publish or promote a release. They should be able to test both valid and invalid attestations against the actual deployment gate.

They should also inspect the credentials available to pull-request jobs, third-party actions and release scripts. The permissions of the pipeline are part of the service's attack surface even when application code never sees them.

## What a Staff Engineer should understand

A Staff Engineer should define release trust across repositories and shared platforms: approved builders, identity constraints, evidence retention, exception authority and recovery after a builder or registry compromise. Ownership must include third-party CI components and artifact stores.

Rehearse the ability to identify affected releases, revoke compromised trust and rebuild critical services using a clean path. A strong supply-chain program makes these actions possible under pressure; it does not merely make ordinary releases display a green signature icon.

Further reading: [SLSA specification](https://slsa.dev/spec/v1.2/), [Sigstore documentation](https://docs.sigstore.dev/).
