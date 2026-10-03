---
title: "AWS"
ring: assess
segment: platforms
tags: [backend]
---

## What it is

Amazon Web Services (AWS) is a cloud platform whose services are organized around accounts, regions, availability zones, identity policies, networking, quotas, and managed-service contracts. Backend engineers do not need to memorize the catalog; they need to understand the boundaries of the services they actually operate.

An AWS design should not be inferred from a product name alone. An RDS database, DynamoDB table, Lambda function, ECS task, and EKS workload have different scaling, consistency, networking, and failure behavior.

## Why it matters for backend engineers

Cloud abstractions remove server-management work but do not remove distributed-systems constraints. A workload can autoscale faster than its database connections, hit an account quota, fail because a route or security group blocks traffic, or lose availability because every replica is in one availability zone.

Cloud IAM and network controls also solve different problems. A security group can permit TCP traffic but does not authorize an AWS API call; an IAM role can authorize S3 access but does not create a network path.

## How it works

AWS resources live inside accounts and regions. Many regional services place resources in one or more availability zones; zones are separate failure domains within a region.

IAM policies define which principals may perform which AWS API actions on which resources, subject to the service's policy model. Workloads commonly obtain temporary credentials through roles rather than long-lived access keys.

VPCs provide network address space, subnets, routing, security groups, and connectivity mechanisms. A “public subnet” means its route table supports internet-gateway routing; the workload still needs addressing and security rules. A “private subnet” does not automatically imply secure application access—it simply lacks that direct route pattern.

Managed data services define their own replication and failover semantics. Engineers must read the selected product's guarantees instead of assuming “managed” means zero RPO or automatic multi-region recovery.

## Key concepts

**Account boundary.** Accounts are strong administrative, billing, and policy boundaries. Cross-account access usually uses roles and explicit trust.

**Region and Availability Zone.** A region contains multiple AZs. Multi-AZ architecture protects against selected zone failures; it is not the same as multi-region recovery.

**IAM role and STS.** Temporary credentials reduce persistent key exposure, but clients must refresh them using supported SDK behavior.

**Security groups versus IAM.** Security groups control network reachability; IAM authorizes AWS API actions.

**Service quotas.** API, compute, networking, and data services can have quotas distinct from physical workload capacity. Both need monitoring.

**NAT and egress.** Private workloads reaching the public internet may use NAT gateways or alternatives, introducing capacity and cost.

## Production example

A report worker runs as an ECS task and writes PDF objects to S3. The first design stores an access key in a secret and grants broad S3 permissions.

The team switches to a task role. The role can write only to the report bucket and only the required key prefix. The task receives temporary credentials automatically through the platform integration.

The workers run in private subnets. Rather than sending S3 traffic through a NAT gateway unnecessarily, the networking design uses an appropriate VPC endpoint where it fits the requirement. The team verifies route tables, bucket policy, and task-role behavior from a representative task.

The report metadata lives in RDS. Capacity testing shows ECS can scale to hundreds of tasks much faster than the database can accept new connections. The service therefore caps task count and uses bounded connection pools; “serverless or managed compute scales automatically” is not allowed to overload the database.

A disaster-recovery exercise separately validates the RDS topology and restore or failover process against the stated RPO and RTO. S3 durability does not prove the relational state can recover to the same point.

## Trade-offs

AWS's broad managed ecosystem can reduce custom infrastructure work and provide strong integrations. The same breadth creates many service-specific limits, policy models, and cost dimensions.

Using native managed services improves operational leverage but increases provider coupling. Designing for theoretical portability often sacrifices real platform benefits while failing to create true cross-cloud parity.

## Failure modes / pitfalls

Long-lived access keys, wildcard IAM policies, and over-trusted cross-account roles create security risk. Single-AZ databases or workers can be mistaken for highly available simply because the service itself is managed.

Autoscaling compute without downstream limits creates database or provider overload. NAT and cross-AZ or cross-region traffic can create surprising cost.

A common operational mistake is assuming console reachability proves application reachability; routes, DNS, security groups, and IAM must be checked from the workload's actual context.

## When to use it

Use AWS services when AWS is the production platform or a justified target and the selected products meet workload, resilience, compliance, and cost requirements.

Learn the specific failure and permission model of the services you operate rather than studying a product catalog superficially.

## When not to use it

Do not build multi-cloud abstractions merely to claim portability if they prevent teams from understanding the real production platform.

Do not select a managed service solely because another cloud has a similarly named product; compare semantics, operational model, and constraints.

## What a Senior Engineer should know

A Senior Engineer should reason about IAM roles, VPC routing, subnets, security groups, AZ placement, quotas, temporary credentials, and the managed services on their request path.

They should be able to trace one failed operation across DNS, network, IAM, quota, and service-level behavior.

## What a Staff Engineer should understand

A Staff Engineer should design account boundaries, cross-account trust, regional topology, recovery, cost attribution, and platform guardrails.

They should decide where AWS-native capabilities provide justified leverage and ensure organization-wide defaults prevent broad credentials, hidden egress cost, and compute scaling beyond downstream capacity.

Further reading: [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [AWS IAM documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html).
