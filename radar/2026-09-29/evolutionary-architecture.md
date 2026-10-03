---
title: "Evolutionary architecture"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Evolutionary architecture is an approach in which important architectural characteristics are kept visible and testable while the design changes incrementally. Instead of predicting every future requirement and freezing one architecture, the team defines properties worth protecting and uses feedback to detect harmful drift.

The key mechanism is the **fitness function**: an automated or reviewable check that gives evidence about an architectural characteristic such as dependency direction, latency, resilience, security, or data isolation.

## Why it matters for backend engineers

Architecture usually decays through ordinary pull requests, not one dramatic redesign. A new package import bypasses a module boundary, a query adds another synchronous dependency to a latency-critical path, or one team begins reading another team's database directly.

Diagrams and principles cannot prevent this by themselves. Teams need feedback close enough to the change that engineers understand which property they are affecting.

## How it works

First name the characteristics that matter to the product. Examples include: no cross-tenant data access, p95 report generation under two minutes, no circular module dependencies, or all public endpoints enforce authentication through the supported layer.

For each characteristic, decide whether a credible fitness function exists. Static checks can inspect imports or dependencies. Contract tests can enforce compatibility. Load tests can protect performance budgets. Policy checks can validate infrastructure. Operational SLOs can detect production behavior.

Not every property is fully automatable. Some require architecture review or ADRs. The important point is that the feedback mechanism matches the property rather than using an easy proxy.

Architectural evolution happens in small reversible steps. When a constraint is no longer valuable, update or remove the fitness function deliberately and record why.

## Key concepts

**Fitness function.** Evidence about an architectural property. It can be binary, threshold-based, or trend-based.

**Architectural characteristic.** A property the system should preserve, such as modifiability, availability, security, or performance.

**Seam.** Interface or boundary that allows one implementation to change without rewriting the entire system.

**Reversibility.** Changes that are easy to reverse require less prediction and allow faster learning.

**Proxy risk.** A metric can become detached from the property it approximates. Test coverage percentage, for example, does not prove architectural quality.

## Production example

A modular Go service has Billing, Reporting, and Identity packages. The architecture intends that Reporting may consume a Billing read interface but may not import Billing's persistence package or mutate invoice tables.

A CI dependency rule enforces the import boundary. When a new feature attempts to import `billing/internal/store` directly, the build fails immediately.

The service also has a report latency objective. A representative performance test runs on realistic tenant sizes and fails if p95 exceeds the agreed budget. These are two different fitness functions: one protects modularity, the other protects runtime performance.

A legitimate requirement later needs a new Billing capability. Engineers add an explicit module interface instead of disabling the dependency rule. If product needs eventually justify direct integration, an ADR changes the boundary and the fitness function is updated intentionally.

## Trade-offs

Incremental evolution reduces large migration risk and keeps architecture connected to current needs. Maintaining checks and representative tests costs engineering time.

Overly rigid fitness functions can freeze outdated assumptions. Weak proxies can create false confidence and encourage gaming.

Some architecture qualities emerge only at scale or in production and cannot be proven in CI.

## Failure modes / pitfalls

Creating dozens of checks for aesthetic preferences produces noise. Unowned checks that nobody understands become obstacles rather than safeguards.

A latency test using tiny synthetic data can pass while production performance degrades. Static dependency rules can preserve folders while data ownership is violated through direct SQL.

Fitness functions must target the real property, not the easiest measurable substitute.

## When to use it

Use evolutionary architecture for systems expected to change over years, especially where many teams contribute and selected qualities must survive continuous delivery.

Start with a small number of important characteristics and strong feedback.

## When not to use it

Do not attempt to automate every architectural judgment. Design review and domain understanding remain necessary.

Do not preserve an obsolete constraint merely because a test exists; architecture is supposed to evolve.

## What a Senior Engineer should know

A Senior Engineer should translate concrete architectural risks into useful checks, interpret failures, and update boundaries through small compatible steps.

They should distinguish a real fitness function from a vanity metric.

## What a Staff Engineer should understand

A Staff Engineer should choose which characteristics deserve organization-wide protection, connect fitness functions to ADRs and product risk, and retire controls when constraints change.

They should use evolutionary feedback to keep architecture adaptable rather than turn it into a static compliance system.

Further reading: [Fitness function-driven development](https://www.thoughtworks.com/insights/articles/fitness-function-driven-development).
