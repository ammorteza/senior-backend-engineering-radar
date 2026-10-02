---
title: "GitHub Actions"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

GitHub Actions runs event-triggered workflows as jobs composed of steps. It connects repository activity to testing, artifact creation and deployment with explicit permission boundaries.

## Why it matters for backend engineers

CI can execute code from untrusted contributors while holding valuable credentials. Correct workflow design must separate that trust boundary from privileged publication.

## How it works

Events select a workflow; jobs run on hosted or self-hosted runners with dependency ordering. Steps invoke commands or actions. Artifacts pass build outputs between jobs; caches reuse replaceable inputs and must not become a source of truth. Environments can constrain deployment, and OIDC can exchange workload identity for short-lived cloud credentials.

## Key concepts

`GITHUB_TOKEN` permissions should be minimal. Pin third-party actions to reviewed immutable commits where policy requires supply-chain control. Concurrency prevents overlapping deployments. Matrix jobs exercise supported variants rather than merely multiplying redundant runs.

## Production example

A public Go project tests pull-request code without publication credentials. A trusted branch build produces one immutable artifact; the deployment job consumes that artifact under a restricted environment and OIDC role. It does not rebuild from changed source during release.

## Trade-offs

Managed CI lowers runner operations but introduces execution cost, platform coupling and caching complexity. Self-hosted runners need isolation and cleanup.

## Failure modes / pitfalls

Privileged `pull_request_target` workflows checking out untrusted code, secrets in logs, mutable action references and cache poisoning can compromise releases.

## When to use it

Use Actions for repository-centered CI/CD with clear event and credential policies.

## When not to use it

Do not grant deployment authority to arbitrary PR code or share persistent privileged runners across untrusted jobs.

## What a Senior Engineer should know

Design artifacts, caches, permissions and failure conditions; reproduce checks locally where practical.

## What a Staff Engineer should understand

Establish trusted build provenance, runner isolation and reusable deployment boundaries.

Further reading: [GitHub Actions security](https://docs.github.com/en/actions/security-for-github-actions).
