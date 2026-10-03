---
title: "Agent Skills"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Agent Skills are a portable directory format for packaging reusable task instructions plus optional scripts, references, and assets for AI agents. A skill contains at least a `SKILL.md` file with YAML frontmatter and Markdown instructions.

The current Agent Skills specification requires `name` and `description` metadata and supports optional fields such as license, compatibility, metadata, and an experimental `allowed-tools` field. Host implementations still decide discovery, activation, tool availability, and execution policy.

## Why it matters for backend engineers

Repeated engineering workflows—database plan review, incident triage, release verification, API compatibility checks—need more than a one-sentence prompt. A skill can preserve the sequence, edge cases, evidence requirements, and supporting scripts in a reusable form.

Progressive disclosure is important because loading every procedure into every agent prompt wastes context and can create instruction conflicts. The skill format lets hosts discover concise metadata first and load full instructions only when relevant.

## How it works

A skill directory contains:

~~~text
my-skill/
  SKILL.md
  scripts/       # optional
  references/    # optional
  assets/        # optional
~~~

`SKILL.md` starts with YAML frontmatter. The specification requires the name to match the skill directory and constrains its syntax. The description should explain both what the skill does and when to use it so hosts can make a good selection.

The Markdown body contains the task procedure. Large background material should move into focused reference files; executable helpers belong in scripts.

The specification describes progressive disclosure: skill metadata can be loaded for discovery, the main instructions on activation, and referenced resources only when required.

A skill does not inherently grant permissions. If it mentions a database command but the host does not expose that capability, the skill cannot create authority. Similarly, an experimental pre-approved-tool declaration still depends on host support and policy.

## Key concepts

**Discovery metadata.** Name and description help the host select a relevant skill. Vague descriptions lead to under- or over-activation.

**Progressive disclosure.** Load only the instruction depth needed for the current task.

**References.** Detailed domain or tool documentation kept separate from the main procedure to preserve focus.

**Scripts.** Executable helpers that need their own tests, dependency declarations, and supply-chain review.

**Compatibility.** Optional metadata can describe required environment or tools; it does not install or authorize them automatically.

**Validation.** The Agent Skills project provides a reference validator for frontmatter and naming conventions; task-quality evaluation is still separate.

## Production example

A platform team creates a `postgres-plan-review` skill.

The `SKILL.md` says when it applies, how to obtain `EXPLAIN (ANALYZE, BUFFERS)` safely, how to compare estimates with actual rows, and which production cautions apply. A reference file explains common plan nodes. A script formats plans into a stable report but never issues write SQL.

The description is specific enough that the skill activates for query-plan review, not every PostgreSQL question.

Tests validate the skill structure and the formatter script. An evaluation set contains skewed-data plans, misestimated joins, and one case where `ANALYZE` would be unsafe on a mutating statement. The skill is considered useful only if agents follow the safety boundary and produce actionable analysis rather than boilerplate.

When PostgreSQL tooling changes, the skill version and references are updated together.

## Trade-offs

Skills reduce repeated prompting and allow domain procedures to evolve independently from the base agent.

Too many overlapping skills make selection ambiguous. Oversized `SKILL.md` files consume context and hide the important procedure.

Bundled scripts improve determinism while increasing executable supply-chain risk and maintenance.

## Failure modes / pitfalls

A description such as “helps with databases” activates too broadly. Stale commands can make a once-useful skill dangerous.

Treating skill text as higher authority than user or system policy is incorrect. Experimental `allowed-tools` support can vary by host and should not be assumed portable.

Deep chains of references make the procedure difficult for agents to navigate and version consistently.

## When to use it

Use skills for recurring specialized work with stable procedures, reusable evidence, and enough frequency to justify maintenance.

Keep repository-wide rules in repository instructions rather than duplicate them into many skills.

## When not to use it

Do not create a skill for a one-off question or for trivial knowledge that a short instruction expresses better.

Do not use a skill as a security boundary; permissions and validation belong in the host and tool services.

## What a Senior Engineer should know

A Senior Engineer should write specific descriptions, concise procedures, focused references, and tested scripts and evaluate the skill on realistic tasks.

They should inspect what capabilities the host actually grants rather than infer them from skill contents.

## What a Staff Engineer should understand

A Staff Engineer should govern skill ownership, distribution, versioning, script trust, overlap, and evaluation across teams.

They should use skills to encode high-value reusable practice without creating another unreviewed plugin ecosystem.

Further reading: [Agent Skills specification](https://agentskills.io/specification).
