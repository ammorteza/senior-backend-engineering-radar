---
title: "Git"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Git is a distributed version-control system built around content-addressed objects and movable references. Commits point to complete tree snapshots plus parent history; branches and tags are names pointing at commits.

Understanding this model makes recovery and history manipulation much safer than memorizing command recipes such as “reset fixes things.”

## Why it matters for backend engineers

Backend teams use Git history to review changes, produce releases, investigate regressions, and recover accidental work. During an incident, the difference between “revert a commit,” “reset my local branch,” and “force-push rewritten history” matters operationally.

Small coherent commits also improve bisectability and review, making source history part of the debugging toolset.

## How it works

Git stores file contents as blobs, directory snapshots as trees, and commits as objects referencing a tree plus zero or more parent commits. Object IDs identify both content and history.

The **working tree** is the files currently checked out. The **index** is the proposed content for the next commit. `git add` copies selected content into the index; committing records the staged tree.

A branch is a reference that normally advances when new commits are created. Merge creates a commit with histories joined, unless Git can fast-forward. Rebase recreates commits on another base, producing new commit identities.

The **reflog** records local movements of references such as `HEAD` and branches. It often allows recovery from an accidental reset or rebase while unreachable objects are still retained.

## Key concepts

**Commit identity.** Rewriting a commit—even with the same file content—usually creates a different ID because metadata or parent history changed.

**Reset modes.** `--soft`, mixed, and `--hard` move the reference while affecting index and working tree differently. `--hard` can discard uncommitted working-tree changes.

**Revert.** Creates a new commit that applies an inverse change. It is usually safer than rewriting shared history.

**Rebase.** Replays commits on a new base; useful before publication or under team policy, dangerous when others depend on the existing commits.

**Bisect.** Binary-searches history between known good and bad commits using a manual or automated reproducer.

## Production example

A serialization regression appears between release `v1.42` and current main. The team has a deterministic test that fails when the regression is present.

They run `git bisect`, marking `v1.42` good and the current commit bad, and use the reproducer as the test command. Git narrows the history to one introducing commit.

Review shows a schema default changed intentionally for one client but accidentally affected all clients. Rather than reverting an entire later release, the team creates a focused corrective commit with the regression test.

Separately, an engineer accidentally resets a local branch past an unpushed commit. The previous branch position still appears in the reflog, so they recover the commit before garbage collection. The team notes that reflog is local and time-limited—it is not a backup strategy.

## Trade-offs

Merge preserves branch topology and avoids rewriting shared commits. Rebase can produce a clean linear sequence but changes identities.

Squashing simplifies history when intermediate commits are noise but can remove useful bisect granularity. The best history is not necessarily the fewest commits; it is a set of coherent reviewed changes.

## Failure modes / pitfalls

Force-pushing a shared branch can invalidate teammates' history. Confusing reset modes can discard staged or working changes.

Secrets committed even briefly may remain in clones, caches, or hosting systems. Removing them from the latest commit does not revoke the credential; rotate or revoke first, then clean history according to incident policy.

Large generated binaries can inflate repository history permanently even after deletion.

## When to use it

Use Git for source history, review, reproducible release references, and investigation.

Adopt a branch and review policy appropriate to team size and release process rather than treating one workflow as universally correct.

## When not to use it

Do not use Git as an unlimited artifact or backup store. Large release binaries belong in artifact or object storage.

Do not rewrite published history casually when downstream builds, releases, or collaborators reference existing commits.

## What a Senior Engineer should know

A Senior Engineer should explain working tree, index, commits, branches, merge, rebase, reset, revert, reflog, and bisect from the underlying model.

They should recover common mistakes without risking unrelated work and use history investigation during regressions.

## What a Staff Engineer should understand

A Staff Engineer should define protected-branch, review, release-tagging, and history policies that preserve traceability without excessive friction.

They should ensure incident and release tooling can map deployed artifacts back to immutable source commits and dependencies.

Further reading: [Git documentation](https://git-scm.com/docs), [Pro Git](https://git-scm.com/book/en/v2).
