---
title: "AWS"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

AWS provides cloud infrastructure and managed services organized around accounts, regions and availability zones. Cloud-portable literacy requires understanding these boundaries, not assuming familiar GCP products map one-to-one.

## Why it matters for backend engineers

Permissions, regional availability and service-specific networking affect backend behavior. A public subnet does not automatically make a workload reachable, and a private subnet does not guarantee safe access policy.

## How it works

Workloads use services such as EC2, ECS, EKS or Lambda. IAM identities authorize API operations; VPC routes, security groups and endpoints govern connectivity. Data services have their own replication and consistency options. Account-level boundaries and cross-account roles separate administrative ownership.

## Key concepts

Regions and availability zones have different failure scope. Security groups are not IAM policies. STS credentials expire and need supported refresh. Service quotas and NAT/egress charges deserve capacity and cost review.

## Production example

A document worker accesses S3 through an instance or task role instead of stored access keys. Its permissions restrict it to required prefixes and actions. A private connectivity design is tested for both access and cost, while recovery verifies that the chosen RDS topology matches the stated RPO/RTO.

## Trade-offs

A broad managed ecosystem reduces custom infrastructure work. The number of options and provider-specific policies adds cognitive load and migration coupling.

## Failure modes / pitfalls

Long-lived keys, wildcard roles, single-zone placement mistaken for HA and unnoticed network costs cause surprises.

## When to use it

Learn or use AWS where it is the platform supporting the product or a justified target environment.

## When not to use it

Do not pursue nominal multi-cloud parity at the expense of understanding one production platform well.

## What a Senior Engineer should know

Reason about roles, VPC routing, zones and selected service guarantees.

## What a Staff Engineer should understand

Design account boundaries, recovery and financial accountability rather than service-name equivalence.

Further reading: [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html).
