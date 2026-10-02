---
title: "Cloud IAM"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

Cloud identity and access management determines which human or workload can perform which operation on cloud resources. It governs operations such as reading an object, obtaining a secret, impersonating another identity or changing a project's access policy.

IAM is distinct from networking and from application authorization. A route and firewall rule may permit a connection while IAM denies the API operation. Conversely, a valid cloud identity can have dangerously broad permissions even when its workload sits in a private network. Your application's customer roles remain a separate layer.

## Why it matters for backend engineers

A compromised service inherits the permissions of its workload identity. If a report generator can also modify IAM policies or read every production secret, a narrow application defect can become a fleet-wide incident.

Access errors also cause ordinary outages. Engineers need to distinguish a missing permission from expired credentials, wrong identity, incorrect resource scope or network failure. Replacing a narrow role with an administrator role may make the request succeed while creating a much larger problem.

## How it works

A workload obtains credentials through the provider's supported identity mechanism. Common patterns use platform metadata or federation to obtain short-lived credentials rather than shipping permanent keys in images. The application or SDK presents those credentials when calling a cloud API.

The provider authenticates the principal and evaluates the requested action against applicable policies. Exact evaluation rules differ between providers: resource policies, inherited grants, explicit denies, organizational restrictions and conditions can all matter. Inspect effective access using the provider's tools rather than assuming a role attached directly to the service account is the whole story.

Federation establishes a trust relationship between an external identity system and cloud credentials. Configure which issuer, subject and context may exchange credentials. Trusting all tokens from a broad CI organization, for example, can accidentally authorize a workflow unrelated to production releases.

Separate the identity that runs the application from the identity that deploys it. Reading an object is not the same responsibility as creating buckets, changing bindings or replacing workloads. This separation limits what an attacker can do after compromising the application process.

## Key concepts

**Principal, role and resource.** A principal identifies the actor, a role groups permissions and a binding or policy relates authority to a resource scope. Provider terminology differs, so translate the concepts rather than treating role names as portable.

**Inherited access.** A restrictive resource-level policy does not necessarily cancel a broad grant inherited elsewhere. Review project, account or organization scope along with the target resource.

**Impersonation.** Permission to obtain another identity's credentials can be as powerful as that identity's own roles. Include impersonation edges in privilege reviews.

**Short-lived is not least-privilege.** A ten-minute administrator token is still an administrator token. Credential lifetime and allowed actions solve different parts of the risk.

**Control plane and data plane.** Permission to configure a resource can differ from permission to read its contents. Some configuration powers indirectly expose data, so assess the consequence of the action, not just its category.

## Production example

A report worker reads raw CSV files from an input bucket and writes summaries to an output bucket. The runtime does not need to delete the raw files, change bucket permissions or administer the project.

The team gives the worker a dedicated workload identity and grants only the supported read and write actions at the required scopes. Deployment automation has a separate identity. In a staging environment, they test successful input reads and output writes, then attempt deletion of input data and access to an unrelated secret. The denied operations are part of the acceptance criteria.

Later, the worker starts receiving permission errors after a deployment. The engineer checks the identity actually used by the process and the denied action in audit evidence before modifying roles. The new deployment had selected the wrong service account. Correcting that binding fixes the outage without expanding permissions.

This investigation is more precise than adding a broad owner role until the error disappears. It also leaves the intended access model intact for the next deployment.

## Trade-offs

Fine-grained access reduces blast radius and makes ownership clearer. It adds maintenance when services gain new responsibilities or provider APIs require additional permissions. Small custom roles can be appropriate, but they need owners and periodic review.

Predefined roles are easier to operate and may evolve with the provider. Their breadth may exceed one workload's needs. Evaluate supported predefined roles first, inspect their actual permissions, and use custom roles where the gap matters. Avoid both unrestricted convenience roles and a maze of undocumented one-off exceptions.

## Failure modes / pitfalls

**Credential source is assumed.** Local developer credentials may differ from production identity. Log safe identity metadata or use audit records to confirm the actor.

**Every workload shares one account.** A permission added for one service silently expands every service's authority and makes audit attribution harder.

**Network isolation is treated as authorization.** Private placement does not stop a compromised workload from using its existing credentials against reachable APIs.

**Federation constraints are too broad.** An issuer being trusted does not mean every subject issued by it should deploy production.

**Policy changes are treated as instantaneous revocation.** Propagation, issued tokens and service behavior affect the actual result. Test the provider-specific revocation path and avoid promising a universal timing guarantee.

## When to use it

Use a distinct, attributable workload identity for each meaningful production responsibility and separate environments where their trust differs. Prefer supported short-lived credential mechanisms and narrowly scoped access to the resources a workload actually uses.

Review IAM whenever adding a new cloud dependency, changing deployment identities or extending automation. Include denied-action tests for high-impact permissions so the intended boundary is demonstrated, not merely documented.

## When not to use it

Do not use cloud IAM as a replacement for customer-level authorization inside your service. The database may correctly authorize the application's identity while the application incorrectly reads another tenant's rows.

Avoid custom roles solely for the appearance of precision. If a stable supported role meets the requirement at the right scope, an equivalent custom role may create maintenance without reducing risk. Conversely, do not solve unexplained errors by granting administrative access.

## What a Senior Engineer should know

A Senior Engineer should identify the credential source used by a running workload, inspect effective permissions and interpret a denied cloud operation. They should know which identity deploys the service and which identity executes its requests.

They should be able to propose the minimum required actions for a new integration, test negative cases and explain how credentials refresh. They should recognize impersonation and policy-editing rights as security-sensitive capabilities.

## What a Staff Engineer should understand

A Staff Engineer should design account or project boundaries, federation trust and privileged human access so that team ownership and failure scope align. Shared platform automation needs especially careful separation because it can influence many services.

Establish access review, audited temporary elevation and emergency containment procedures. Measure unowned identities, unused long-lived keys and broad grants with actual remediation ownership. The objective is a system whose effective authority remains understandable as the organization grows.

Further reading: [Google Cloud IAM overview](https://docs.cloud.google.com/iam/docs/overview), [AWS IAM introduction](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html).
