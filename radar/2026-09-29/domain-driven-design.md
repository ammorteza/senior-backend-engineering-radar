---
title: "Domain-driven design"
ring: trial
segment: techniques
tags: [backend]
---

## What it is

Domain-Driven Design (DDD) is an approach for modeling software around a complex business domain and the language used by domain experts. Its strongest contribution is strategic: deciding where one model is valid, how models relate, and which business concepts belong together.

DDD is not a requirement to create repositories, factories, aggregates, and services for every CRUD application. The patterns are useful when the business domain is complicated enough that poor modeling repeatedly creates ambiguity or coupling.

## Why it matters for backend engineers

Backend systems encode business rules. When two teams use the same word differently—“customer,” “balance,” “order,” “account”—a shared database model can force incompatible meanings together.

Clear domain boundaries reduce this semantic coupling. They also clarify where transactions and invariants belong. A rule such as “a facility cannot exceed its approved limit” should have one authoritative model and owner, not be reimplemented differently in three services.

## How it works

Teams collaborate with domain experts to build a **ubiquitous language**: terms with precise meaning inside a business context.

A **bounded context** defines where one model and language apply. The “customer” in onboarding can represent identity verification and application status; the “customer” in collections can represent obligations and delinquency. They may refer to the same person while legitimately having different fields and lifecycle.

A **context map** describes how bounded contexts integrate: upstream/downstream relationships, translation layers, shared kernels, or published language.

Tactical patterns help inside a context. Entities have durable identity. Value objects represent concepts defined by their values. Aggregates define a consistency boundary around invariants. Domain events report facts accepted by the domain.

The aggregate is not automatically a microservice or database. It is primarily a transactional and modeling boundary.

## Key concepts

**Ubiquitous language.** Terms shared by engineers and domain experts inside a context. Code names should reinforce this language rather than invent unrelated technical vocabulary.

**Bounded context.** Boundary within which a model and its terms have one coherent meaning.

**Aggregate.** Cluster of domain objects changed under one consistency boundary. Keep it as small as the invariant allows.

**Value object.** Immutable concept without independent identity, such as Money(currency, amount) or an address value under domain rules.

**Anti-corruption layer.** Translation that prevents an external or legacy model from leaking directly into the internal domain model.

**Domain event.** Past-tense fact such as FacilityApproved, emitted after the domain accepts the transition.

## Production example

A credit product has two teams: Credit Facilities and Collections.

Facilities owns eligibility, approved limit, available amount, and facility lifecycle. Collections owns overdue obligations, repayment schedules, and delinquency treatment. Both use a human customer identifier, but their models differ.

Instead of one shared Customer table with dozens of fields used by both teams, Facilities publishes a contract such as FacilityActivated and exposes APIs for facility state. Collections translates the event into its own ObligationAccount model through an anti-corruption layer.

A business discussion reveals that “available credit” means approved amount minus currently committed draws, while “outstanding debt” includes fees and repayment timing. Keeping these terms in separate contexts prevents one misleading balance field from spreading across the system.

The two contexts may initially live in one modular monolith. If organizational or scaling requirements later justify separate deployment, the semantic boundary already exists.

## Trade-offs

DDD improves communication and ownership in complex domains, but domain modeling workshops and explicit boundaries require time.

A rich aggregate model can make invariants clear while becoming expensive if every object is loaded and changed together unnecessarily. Sometimes straightforward SQL plus a clear domain service is simpler.

Bounded contexts reduce semantic coupling while requiring translation between contexts.

## Failure modes / pitfalls

Treating every noun as a service confuses domain modeling with microservice decomposition. Giant aggregates make unrelated changes contend under one transaction.

Anemic models are not automatically bad, and “rich domain model” should not become object-oriented ceremony around a simple data pipeline.

A shared “common domain” library can accidentally erase bounded-context differences by forcing every team to use one universal Customer or Money type.

## When to use it

Use DDD when business terminology, rules, and ownership are complex enough that modeling mistakes repeatedly cause bugs or coordination problems.

Use the strategic ideas—language and bounded contexts—even if tactical object patterns are unnecessary.

## When not to use it

Do not apply a full DDD pattern catalog to simple administration CRUD, ETL, or small scripts where the domain is already obvious.

Do not force aggregate boundaries to match service boundaries unless independent deployment actually adds value.

## What a Senior Engineer should know

A Senior Engineer should discover invariants with domain experts, identify context boundaries, model entities and value objects deliberately, and keep aggregate transaction scope justified.

They should prevent storage schemas and external terminology from leaking blindly into the core model.

## What a Staff Engineer should understand

A Staff Engineer should align bounded contexts with team and product ownership, define integration relationships between contexts, and keep deployment topology independent from domain modeling when appropriate.

They should use context boundaries to reduce organization-wide semantic coupling rather than create more services for their own sake.

Further reading: [Martin Fowler on bounded contexts](https://martinfowler.com/bliki/BoundedContext.html), [DDD Reference](https://www.domainlanguage.com/ddd/reference/).
