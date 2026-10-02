---
title: "Cloud IAM"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Cloud IAM defines who or what may operate cloud resources. It covers human access and workload identities, with policies scoped to resources and administrative boundaries.

## Why it matters for backend engineers

An application compromise becomes a cloud compromise if its identity can modify unrelated databases or secrets. Long-lived credentials make containment and rotation harder.

## How it works

An identity obtains credentials and presents them to a service. The service evaluates permissions under provider-specific policies, inheritance and conditions. Workload federation or metadata-based identity can issue short-lived credentials without baking keys into images. Human administration should use audited identities and bounded elevation.

## Key concepts

Authentication differs from permission evaluation. Role inheritance can widen effective access. Service-account impersonation is a privilege in its own right. Organization policies and deny mechanisms differ from ordinary grants and vary by cloud.

## Production example

A report worker only needs to read one bucket and write another. Its workload identity receives those grants, while deployment automation owns infrastructure changes. A leaked application token cannot create new IAM bindings. Audit records and a negative-access test confirm the intended separation.

## Trade-offs

Fine-grained permissions reduce blast radius but require ownership and maintenance. Broad predefined roles are convenient but can authorize unrelated operations.

## Failure modes / pitfalls

Static keys in repositories, wildcard resources, shared accounts and unnoticed inherited permissions weaken containment. Changing IAM can also break production if token and propagation behavior are misunderstood.

## When to use it

Use dedicated workload identities and least-privilege grants for every production component.

## When not to use it

Avoid creating custom roles without reviewing whether stable supported roles already meet the need.

## What a Senior Engineer should know

Inspect effective permissions, credential sources and audit evidence; test denied operations too.

## What a Staff Engineer should understand

Design identity boundaries, elevation and federation across environments and teams.

Further reading: [Google Cloud IAM overview](https://docs.cloud.google.com/iam/docs/overview), [AWS IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html).
