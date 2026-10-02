---
title: "Regular expressions"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Regular expressions describe text patterns for matching, extraction or replacement. The engine's supported syntax and execution algorithm strongly affect both meaning and performance.

## Why it matters for backend engineers

A validation pattern may run on attacker-controlled input. Backtracking expressions that behave well on short examples can consume extreme CPU on nearly matching strings.

## How it works

A matcher interprets or compiles a pattern and searches input. Backtracking engines may revisit many alternative paths; automata-based engines such as Go's regexp implementation offer different complexity guarantees and omit features such as backreferences. Anchors, character classes and quantifiers determine which portion of input matches.

## Key concepts

Greedy versus lazy matching controls choice, not safety by itself. Unicode classes differ from ASCII ranges. Capture groups expose substrings; escaping passes through both the language string and regex syntax. Search and full-string validation are different operations.

## Production example

A filename validator uses an unanchored expression and accepts `valid.txt/../../private`. The fix defines the entire accepted grammar, anchors it appropriately for the engine, and separately rejects path traversal after normalization. Adversarial long inputs test cost; regex matching alone is not filesystem authorization.

## Trade-offs

Regex can make small lexical rules concise. Complex patterns become difficult to review; parsers are better for nested syntax or semantic validation.

## Failure modes / pitfalls

Nested ambiguous repetition in backtracking engines can cause ReDoS. Confusing shell globs with regex, careless replacement syntax and incomplete anchoring create incorrect behavior.

## When to use it

Use regex for bounded textual patterns whose grammar and engine are understood.

## When not to use it

Do not parse arbitrary HTML or enforce complex business rules with one enormous expression.

## What a Senior Engineer should know

Read engine guarantees, test edge cases and distinguish normalization from matching.

## What a Staff Engineer should understand

Set input-size and parsing policies at public boundaries to prevent validation becoming a denial-of-service path.

Further reading: [Go regexp syntax](https://pkg.go.dev/regexp/syntax).
