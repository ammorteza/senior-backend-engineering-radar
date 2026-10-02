---
title: "Static analysis and linters"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Static analysis examines source code without running the program. Compiler checks establish language validity and type correctness; linters flag suspicious constructs or conventions that valid programs can still violate. SAST adds security-focused analysis, often following untrusted input toward dangerous operations.

## Why it matters for backend engineers

A Go service can compile while copying a mutex, ignoring cancellation, or calling `Printf` with incompatible arguments. Catching such mistakes before review leaves reviewers more time for business behavior and architecture.

## How it works

An analyzer parses an abstract syntax tree (AST), resolves symbols and types, and applies rules. Syntax rules recognize local patterns; control-flow graphs describe reachable paths; data-flow or SSA analysis tracks values between assignments and calls. Interprocedural analysis follows information across functions, increasing cost and requiring approximations. These approximations create both false positives and false negatives.

## Key concepts

- **Ruleset:** distinguish correctness checks from optional style opinions.
- **Baseline:** record existing findings while preventing new violations; retire the baseline gradually.
- **Suppression:** name the rule and explain why this location is safe, rather than disabling a category globally.
- **Incremental analysis:** cache package facts or reanalyze changed dependencies; changed lines alone may miss cross-function defects.
- **Custom rules:** enforce a concrete local invariant, such as forbidding a deprecated client, with positive and negative fixtures.

## Production example

Illustrative Go adoption: CI runs `go vet ./...` and pinned Staticcheck with the same build tags used locally. Vet catches a copied lock and a missing cancel call; Staticcheck flags an ineffective assignment. Existing style findings enter a reviewed baseline. A security analyzer separately examines SQL construction. Race tests remain necessary because static checks do not establish freedom from runtime races.

## Trade-offs

Broader analysis detects more defect classes but takes longer and can interrupt developers with speculative warnings. A small reliable blocking ruleset usually earns more trust than hundreds of noisy checks. Security findings need exploitability review, not automatic dismissal as lint.

## Failure modes / pitfalls

Unpinned analyzer upgrades can break unrelated PRs. Generated code needs an explicit policy: check generator inputs and compile outputs, while suppressing unsuitable style checks. Missing build variants, broad exclusions and undocumented suppressions produce blind spots. A clean report proves only that the enabled analyses found nothing.

## When to use it

Run fast diagnostics in the editor and authoritative, version-pinned checks in CI. Introduce rules in warning mode, measure noise, then block new high-confidence defects.

## When not to use it

Do not use a linter as proof of business correctness or replace tests, fuzzing and review. Avoid enforcing stylistic rules whose churn costs more than their demonstrated benefit.

## What a Senior Engineer should know

Read findings against the actual code path, configure language-specific tools, reconcile editor and CI settings, and justify suppressions. Know which checks require types, whole packages or specific build tags.

## What a Staff Engineer should understand

Set an adoption policy across repositories that budgets analysis time and owns baseline reduction. Evaluate whether custom rules prevent recurring incidents and whether false positives encourage developers to bypass checks.

Further reading: [Go analysis API](https://pkg.go.dev/golang.org/x/tools/go/analysis), [Staticcheck](https://staticcheck.dev/docs/), [gopls analyzers](https://go.dev/gopls/analyzers).
