---
title: "GitHub Actions"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

GitHub Actions is GitHub's workflow automation system. YAML workflows respond to repository or manual events, start jobs on runners, and execute steps such as tests, builds, artifact publication, and deployment.

For backend teams, the important design question is not merely how to write workflow syntax. It is how untrusted source code, reusable actions, artifacts, caches, runners, and deployment credentials cross trust boundaries.

## Why it matters for backend engineers

CI routinely executes pull-request code. Deployment and release workflows may also hold permission to publish packages, modify cloud infrastructure, or sign artifacts.

If untrusted PR code runs in a context with those privileges, a contributor can turn a build step into credential exfiltration. CI/CD therefore needs explicit least privilege and separation between “test code” and “trusted publication.”

## How it works

A workflow selects events such as `push`, `pull_request`, or `workflow_dispatch`. Jobs run on GitHub-hosted or self-hosted runners. Job dependencies control order and outputs or artifacts move data between jobs.

`GITHUB_TOKEN` is issued to the workflow with permissions determined by repository and workflow settings. Permissions should be specified narrowly rather than relying on broad defaults.

Artifacts store build outputs for later jobs or download. Caches accelerate replaceable dependencies and build inputs; they should not be treated as trusted immutable release artifacts.

Environments can add deployment protection and scope secrets. OpenID Connect allows a workflow to exchange its GitHub identity for short-lived cloud credentials instead of storing long-lived cloud keys.

Third-party actions execute code. Pinning to reviewed immutable commit SHAs gives stronger supply-chain control than floating tags.

## Key concepts

**Event trust.** `pull_request` and `pull_request_target` have different privilege and checkout behavior. Running untrusted checkout code in a privileged target-context workflow is a serious risk.

**Permissions.** Set `permissions` at workflow or job scope to the minimum needed.

**Artifact provenance.** Build once in a trusted job and deploy the exact immutable artifact; rebuilding later can produce a different result.

**Caches.** Performance optimization only. Cache poisoning should not be able to change the integrity of a release.

**Runner isolation.** Persistent self-hosted runners can retain files or malicious changes across jobs unless carefully isolated and cleaned.

## Production example

A public Go repository has PR tests and production deployment.

The PR workflow uses `pull_request`, checks out the contributor branch, and runs tests with read-only repository permissions and no production secrets. It may build a test artifact, but that artifact is never automatically published to production.

After merge to a protected branch, a trusted workflow builds the release once, records the source commit and dependency metadata, and uploads an immutable artifact.

The deploy job depends on that artifact and targets a protected production environment. It obtains short-lived cloud credentials through OIDC, using claims restricted to the expected repository, branch or environment, and role. The deploy does not re-check out and rebuild source after approval.

Concurrency settings ensure only one production deployment proceeds at a time. A newer deployment can cancel a queued obsolete one according to policy.

The team tests that a fork PR cannot print deployment secrets or obtain the production cloud role.

## Trade-offs

Hosted runners remove fleet maintenance but create platform coupling and execution cost. Self-hosted runners offer custom hardware or network access while adding isolation and patching responsibilities.

Aggressive caching speeds builds but can make correctness depend on hidden state if build steps are not reproducible.

Reusable workflows reduce duplication, but a change to a widely shared workflow has organization-wide blast radius.

## Failure modes / pitfalls

Privileged `pull_request_target` workflows that check out attacker-controlled code are a critical mistake. Long-lived cloud secrets, mutable action tags, overly broad `GITHUB_TOKEN` permissions, and persistent shared runners expand the blast radius.

Logging commands or environment can expose secrets despite masking. Deploying by rebuilding source instead of using the reviewed artifact can break provenance.

A failed test hidden behind `continue-on-error` can silently turn a required gate into decoration.

## When to use it

Use GitHub Actions for repository-centered CI and CD where event, permission, artifact, and deployment boundaries can be expressed clearly.

Prefer short-lived identity and protected environments for privileged operations.

## When not to use it

Do not grant deployment authority to arbitrary pull-request code. Do not use a long-lived shared self-hosted runner for mutually untrusted jobs without strong isolation.

If the workflow needs capabilities GitHub-hosted Actions cannot provide safely, use a dedicated build or deploy system rather than weakening permissions.

## What a Senior Engineer should know

A Senior Engineer should design job dependencies, immutable artifacts, caches, permissions, OIDC, environments, and concurrency controls.

They should understand workflow event trust and reproduce key checks locally where practical.

## What a Staff Engineer should understand

A Staff Engineer should establish trusted build provenance, reusable workflows, action-pinning policy, runner isolation, and cloud-identity boundaries across repositories.

They should design CI/CD so platform convenience never requires exposing production credentials to unreviewed code.

Further reading: [GitHub Actions security](https://docs.github.com/en/actions/security-for-github-actions), [OIDC in GitHub Actions](https://docs.github.com/en/actions/concepts/security/openid-connect).
