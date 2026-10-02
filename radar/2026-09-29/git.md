---
title: "Git"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Git stores a content-addressed history of snapshots and references. Branches are movable names for commits, making lightweight parallel work possible without copying the repository's entire state.

## Why it matters for backend engineers

Confident history investigation reduces debugging time and accidental loss. Understanding what a rebase or reset changes is more useful than memorizing command recipes.

## How it works

Blobs store file content, trees describe directory snapshots and commits reference a tree plus parents. The working tree and index represent current files and the next proposed snapshot. Merge combines histories; rebase recreates commits on a new base. Reflogs record local reference movement and can help recover otherwise unreachable commits.

## Key concepts

A commit SHA identifies content and history. Uncommitted working-tree changes differ from staged changes. `bisect` narrows a regression through tested revisions. Reflog retention is limited and local; it is not an external backup.

## Production example

A serialization regression appears sometime after a known-good release. `git bisect` runs a focused reproducer to locate the introducing commit. The fix is reviewed against its intended behavior rather than reverting unrelated releases. A mistaken local reset is recovered from the reflog before garbage collection removes the unreachable work.

## Trade-offs

Rebasing yields a linear history but rewrites identities. Merges preserve branching history while potentially adding review complexity. Small coherent commits improve both review and bisect.

## Failure modes / pitfalls

Force-pushing shared history, committing secrets and confusing reset modes can destroy collaboration or disclose credentials. Removing a secret from the latest commit does not revoke it.

## When to use it

Use Git for versioned source and reviewable changes with a documented branch policy.

## When not to use it

Do not use a repository as an unlimited binary artifact store or rewrite shared history casually.

## What a Senior Engineer should know

Explain index/worktree/history, resolve conflicts and investigate with log, blame, bisect and reflog.

## What a Staff Engineer should understand

Set review, protected-branch and release policies that preserve traceability without excessive friction.

Further reading: [Git documentation](https://git-scm.com/docs).
