---
title: "Regular expressions"
ring: adopt
segment: languages-and-frameworks
tags: [backend]
---

## What it is

Regular expressions describe patterns over text for matching, extraction, splitting, and replacement. Their syntax and performance depend heavily on the regex engine.

Two expressions that look similar can have very different guarantees in different runtimes. Go's `regexp` package uses RE2-style automata and deliberately omits constructs such as backreferences that are difficult to support with linear-time guarantees. Backtracking engines may support richer syntax but can exhibit catastrophic backtracking on adversarial input.

## Why it matters for backend engineers

Regex often sits on public input paths: validation, routing, log parsing, security rules, and import pipelines. A pattern that works on ten test strings can consume extreme CPU when it receives a long nearly matching string.

Correctness matters too. Search semantics are different from full-string validation, Unicode categories differ from ASCII ranges, and a regex cannot safely replace filesystem normalization or authorization.

## How it works

An engine parses a pattern into an internal representation and finds matches according to its algorithm.

Anchors constrain where matching occurs. Character classes describe allowed characters. Quantifiers control repetition. Capturing groups expose substrings for extraction or replacement.

In backtracking engines, ambiguous nested alternatives may cause the engine to try many possible paths before concluding no match. In automata-based engines, matching follows a bounded-state process with different feature limitations.

Regex escaping happens twice in many languages: once for the source-language string literal and once for regex syntax. Raw strings can reduce confusion where supported.

## Key concepts

**Search versus full match.** A search asks whether some substring matches. Validation usually needs the whole input constrained.

**Greedy and lazy.** These affect which match is chosen, not whether a pattern is computationally safe.

**Unicode.** `[A-Za-z]` is intentionally narrower than “letters in every language.” Choose the actual accepted character set.

**Backtracking and ReDoS.** Nested ambiguous repetition can cause very expensive work in backtracking engines. Input limits and safer patterns or engines reduce exposure.

**Capture versus non-capture.** Captures are useful when extracting fields; unnecessary captures can make complex patterns harder to understand.

## Production example

A filename endpoint validates user input with an unanchored expression and a search-style matcher. An input containing a valid-looking substring followed by path traversal is accepted even though the full value should be invalid.

The team changes validation to require the entire allowed grammar and separately performs filesystem path normalization. Even a perfectly anchored regex does not prove the resolved path remains inside the intended directory.

A second endpoint uses a backtracking regex with nested repetitions against request bodies. A long nearly matching string causes one CPU core to remain busy for seconds. The team simplifies the grammar, adds a maximum input size, and adds adversarial test cases.

In Go, the team confirms that the standard RE2-style engine avoids the same catastrophic-backtracking class, but still keeps input bounds because linear work over arbitrarily huge input is not free.

## Trade-offs

Regex is concise and maintainable for small lexical rules. As grammars become nested or semantic, a parser becomes easier to reason about and produces better error messages.

Richer backtracking engines support features such as backreferences or lookarounds but can have worse worst-case performance. Linear-time engines trade features for predictable matching.

## Failure modes / pitfalls

Using search when validation requires full-string matching, confusing shell globs with regex, and mishandling escaping are common correctness errors.

Backtracking ReDoS, overly broad `.*`, and patterns that accidentally exclude international characters can create security or product bugs.

Replacement strings have their own escaping and group semantics and should be tested independently from matching.

## When to use it

Use regex for bounded textual patterns such as IDs, simple log lines, filenames, and extraction where the engine and accepted grammar are understood.

Add explicit input-size limits at untrusted boundaries.

## When not to use it

Do not parse nested languages such as arbitrary HTML or programming syntax with one giant regex. Do not encode complex business rules in patterns that reviewers cannot understand.

Use a parser when structure and error reporting matter more than concision.

## What a Senior Engineer should know

A Senior Engineer should understand the chosen engine's guarantees, anchoring and full-match behavior, Unicode implications, and adversarial test cases.

They should distinguish lexical validation from normalization, authorization, and semantic validation.

## What a Staff Engineer should understand

A Staff Engineer should define input-size and parser or regex safety conventions for public boundaries and ensure shared validation libraries use well-understood engines.

They should recognize regex CPU exhaustion as one possible denial-of-service mechanism without treating every regex as inherently unsafe.

Further reading: [Go regexp syntax](https://pkg.go.dev/regexp/syntax), [RE2 syntax](https://github.com/google/re2/wiki/Syntax).
