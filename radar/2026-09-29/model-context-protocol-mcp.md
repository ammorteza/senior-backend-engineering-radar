---
title: "Model Context Protocol (MCP)"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Model Context Protocol (MCP) is an open protocol for connecting AI hosts to external systems that expose capabilities such as tools, resources, and prompts.

MCP standardizes discovery and invocation. It is not a model, not an authorization policy, and not a statement that a server or its content is trustworthy.

As of this radar review, the current final MCP protocol revision is 2026-07-28. SDK and host support still varies, so implementations should negotiate and test the protocol revision they actually support rather than copy examples from an older specification blindly.

## Why it matters for backend engineers

Without a common protocol, every AI host needs custom adapters for GitHub, databases, document stores, and internal APIs. MCP can reduce that integration work.

The same interoperability broadens security responsibility. Connecting a server can expose executable tools and private resources. Tool discovery must not become automatic authority to invoke every operation with the user's broadest credentials.

Protocol evolution also matters. MCP changed materially between 2025-era and 2026 revisions, so production integrations need explicit version and SDK lifecycle management.

## How it works

An MCP host manages one or more clients that communicate with MCP servers. Initialization negotiates protocol capabilities and version behavior.

Servers advertise supported primitives such as tools, resources, and prompts. The host decides how those capabilities are presented to the model or user.

MCP messages use JSON-RPC semantics carried over supported transports. Stdio is common for local child-process servers. Streamable HTTP is used for networked servers and has protocol-specific request, version, and authorization behavior.

The current 2026-07-28 protocol and stable v2 TypeScript SDK also introduce newer interaction patterns compared with older revisions, including revised state and multi-round-trip behavior. Applications should follow the exact revision and SDK documentation rather than assume older examples remain wire-compatible.

Authorization for HTTP deployments is a separate protocol concern. Tokens should be scoped to the intended server or resource and validated for audience. Passing through a token issued for some other backend creates confused-deputy and credential-exposure risk.

## Key concepts

**Host.** AI application that manages MCP clients and decides which server capabilities are available to the model or user.

**Server.** Process or service exposing MCP capabilities.

**Tool.** Callable operation with structured input and result. Tool schema validity does not replace business authorization.

**Resource.** Data that can be discovered or read through the protocol. Resource contents remain untrusted data.

**Prompt.** Reusable prompt interaction exposed by a server. It is not higher authority than host or user policy.

**Protocol version.** Negotiated contract. SDKs may support several revisions with different behavior.

**Server trust.** Protocol compliance means a server speaks MCP; it does not make its code, instructions, or returned data safe.

## Production example

A company exposes internal engineering documentation and issue creation through an MCP server.

Resources provide read-only architecture docs. A `search_docs` tool performs bounded retrieval. A separate `create_issue_draft` tool creates a draft object but does not publish it directly.

The host grants read capabilities automatically for the engineering workspace but requires explicit user confirmation before converting a draft to a real issue. Authentication tokens are scoped to this MCP service; a token issued for the underlying issue API is not blindly forwarded through the server.

Tests include:
- malformed tool arguments;
- a resource URI outside the caller's authorization scope;
- a returned document containing prompt-injection text;
- protocol-version mismatch;
- server timeout after an issue draft is created.

For the timeout case, the tool uses a stable operation ID so the client can reconcile rather than duplicate the draft.

The team upgrades from an older MCP SDK only after testing its 2026-07-28 behavior in compatibility environments.

## Trade-offs

MCP reduces custom integration code and creates reusable capability surfaces across hosts. It introduces another protocol, server lifecycle, authorization model, and dependency ecosystem.

A generic MCP server can serve many clients but may tempt teams to expose overly broad tools. Narrow APIs often remain safer than a universal “run query” or “execute shell” capability.

Networked MCP adds service availability and authentication; local stdio servers avoid network exposure while inheriting the host process's local permissions.

## Failure modes / pitfalls

Trusting arbitrary MCP servers or their prompt/resource text can introduce malicious instructions.

Broad credentials and token passthrough weaken authorization boundaries. Tool descriptions that understate side effects make host approval unreliable.

Version mismatch between host, SDK, and server can produce subtle failures. Treating an old 2025 spec link as permanently current is especially risky for a fast-evolving protocol.

## When to use it

Use MCP when several AI hosts or tools need a maintained standard integration surface and the interoperability benefit exceeds the protocol and security cost.

Keep server capabilities narrow and independently authorized.

## When not to use it

A direct library, REST API, or CLI can be simpler for one local application with one integration.

Do not wrap every internal service in MCP merely to claim agent compatibility.

## What a Senior Engineer should know

A Senior Engineer should understand host/server roles, initialization, protocol versioning, transports, tool/resource/prompt semantics, structured schemas, authorization, and failure outcomes.

They should test the specific SDK and revision deployed and treat returned content as untrusted input.

## What a Staff Engineer should understand

A Staff Engineer should govern trusted servers, identity and credential boundaries, SDK and protocol upgrades, capability review, and audit across AI products.

They should distinguish interoperability from safety: MCP can standardize the connection while the organization still owns authorization and tool design.

Further reading: [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28), [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/).
