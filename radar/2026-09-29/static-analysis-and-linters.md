---
title: "Static analysis and linters"
ring: adopt
segment: tools
tags: [backend]
---

## What it is

Static analysis examines a program without executing it. The compiler performs one form of analysis: it rejects programs that violate the language's syntax or type rules. Linters and other analyzers go further, looking for suspicious behavior that is legal code, such as copying a lock, ignoring an important result or using an inconsistent format string.

The term covers tools with very different capabilities. A style checker may inspect only syntax, while a security analyzer may follow untrusted values across several functions. Static application security testing, or SAST, focuses on security defects; it is not the same as checking dependency versions against vulnerability advisories.

## Why it matters for backend engineers

Many backend defects are small enough to escape review yet expensive in production. A copied mutex can leave a shared map unprotected. A cancellation function that is never called can retain resources longer than intended. A logging mistake can discard the diagnostic information needed during an incident.

Automated checks make these recurring mistakes cheaper to catch, but only if engineers trust the findings. A repository with thousands of unexplained warnings teaches developers to ignore the output. The useful goal is a reliable feedback loop: a finding explains the defect, appears close to the edit that introduced it and has a clear repair or justified exception.

## How it works

An analyzer typically starts by parsing source into an abstract syntax tree. Rather than searching text for the word `Printf`, it can identify a call expression, resolve which function is called and inspect its arguments. Type information distinguishes a real API call from an unrelated method with the same name.

More advanced checks build a **control-flow graph**, whose edges describe paths through conditionals, loops and returns. A resource checker can ask whether a resource acquired on one path is released on all relevant exits. **Data-flow analysis** follows values through assignments and calls. Security-oriented taint analysis may track a request parameter from an input source to a SQL execution sink and recognize certain validation or escaping operations along the way.

Cross-function analysis must approximate runtime behavior. Interfaces, external libraries and dynamic dispatch can obscure which code executes. Tools trade analysis cost against precision: considering more possible paths can find additional defects but also report paths that cannot actually occur. Understand the analysis behind a rule before treating it as a proof.

## Key concepts

**Correctness rules and style rules have different value.** A definite misuse of synchronization deserves different treatment from a naming preference. Start with checks that prevent known defect classes and make stylistic choices separately.

**False positives and false negatives are unavoidable for many analyses.** A false positive reports a problem that does not apply; a false negative misses a real problem. A quiet tool can be incomplete, and a noisy tool can still catch serious defects. Evaluate representative code, not just the number of warnings.

**A baseline records existing debt.** Teams can prevent new findings while repairing old ones incrementally. The baseline must have an owner and reduction plan; otherwise it becomes a permanent exclusion list. Stable finding identifiers are preferable to suppressions that accidentally shift when line numbers change.

**A suppression is a local argument.** Name the rule and explain why this particular code is safe. “Needed for tests because this fixture deliberately supplies malformed input” is reviewable; “linter annoying” is not. Where supported, fail on unused suppressions so obsolete exemptions disappear.

**Incremental analysis must respect dependencies.** A changed helper can introduce defects in unchanged callers. Caching package facts can save time, but restricting every check to changed lines is not equivalent to analyzing affected behavior.

## Production example

Suppose a Go service protects a shared map with a mutex:

```go
type Registry struct {
    mu    sync.Mutex
    items map[string]string
}

// Wrong: the receiver copies the mutex but shares the map storage.
func (r Registry) Put(key, value string) {
    r.mu.Lock()
    defer r.mu.Unlock()
    r.items[key] = value
}
```

This compiles. However, concurrent calls lock different mutex copies while writing to the same underlying map. A lock-copy check in `go vet` can flag the value receiver. Changing it to `func (r *Registry) Put(...)` makes callers use the same mutex, provided the Registry itself is not copied elsewhere and all accesses follow the same locking discipline.

The repair should therefore inspect constructors, assignments and other methods, not merely silence the diagnostic. A concurrency test run with the race detector can exercise the intended access paths. Static analysis and runtime testing provide different evidence; neither proves that every possible use is race-free.

For adoption, run `go vet ./...` and a pinned Staticcheck version with the repository's production build tags. Introduce additional rules in reporting mode, inspect their findings and decide which should block new code. Keep editor settings aligned with CI so developers receive the same explanation before opening a pull request.

## Trade-offs

Fast local checks make feedback immediate; whole-program security analysis may require more time and infrastructure. Run high-confidence, inexpensive checks on ordinary edits and place heavier analysis where its additional coverage justifies the delay.

Custom rules can encode valuable organizational knowledge, such as forbidding an obsolete database client. They also create a maintenance obligation. Prefer a small rule with precise positive and negative fixtures over a broad pattern that requires developers to explain valid code repeatedly.

## Failure modes / pitfalls

**Tool upgrades become unrelated build failures.** Pin tool versions and review changes to diagnostics in a dedicated upgrade. Verify that the analyzer supports the language version in use.

**CI analyzes the wrong program.** Build tags, target platforms and generated files can change the code compiled for production. Check relevant configurations and document intentional exclusions.

**Generated code is either ignored completely or floods the report.** Compile generated output and inspect the generator or template when defects recur. Exempt unsuitable style checks narrowly instead of assuming generated code cannot be wrong.

**Autofixes change behavior without review.** Formatting is usually mechanical; control-flow or API rewrites may not be. Inspect the diff and run relevant tests.

**A clean report is presented as security approval.** An analyzer sees only the properties and paths it models. Business authorization, deployment configuration and unknown defect classes need other forms of verification.

## When to use it

Use static analysis continuously in repositories where supported tools can catch repeatable mistakes. Begin with compiler checks and a small correctness ruleset, then add checks informed by actual review findings or incidents. Give security findings a triage path with sufficient context and ownership.

For Go, understand the distinct roles of the compiler, `go vet`, Staticcheck, the race detector and dependency scanning. In other ecosystems choose tools that understand the relevant language and framework rather than assuming equivalent rule names imply equivalent coverage.

## When not to use it

Do not use lint compliance as a substitute for testing business behavior, fuzzing parsers or reviewing security boundaries. A linter cannot tell whether the product's settlement rule is correct unless that rule has been explicitly modeled.

Avoid custom checks for subjective preferences that ordinary formatting or review handles adequately. If a rule generates frequent exceptions and prevents no meaningful defects, simplify or remove it instead of increasing the suppression burden.

## What a Senior Engineer should know

A Senior Engineer should read a diagnostic as a technical claim and verify that claim against the code. They should know whether a rule uses syntax, types or flow analysis; configure the right build variants; and explain the remaining uncertainty after a fix.

They should also be able to introduce a rule safely: measure the initial findings, repair high-risk cases, create a bounded baseline where necessary, align local and CI commands, and write a defensible suppression when the tool lacks relevant context.

## What a Staff Engineer should understand

A Staff Engineer should manage analysis as a shared engineering capability. Common correctness checks, upgrade ownership and a predictable feedback budget help teams maintain trust. Repository-specific rules can remain local when their invariants differ.

Assess whether checks prevent recurring problems and whether teams can resolve findings promptly. Warning counts alone reward disabling rules. Track baseline age, recurring suppressions and examples of defects prevented, and retire rules whose maintenance or noise outweighs their value.

Further reading: [Go analysis API](https://pkg.go.dev/golang.org/x/tools/go/analysis), [Staticcheck documentation](https://staticcheck.dev/docs/), [gopls analyzers](https://go.dev/gopls/analyzers), [Go race detector](https://go.dev/doc/articles/race_detector).
