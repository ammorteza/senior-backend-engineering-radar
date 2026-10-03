---
title: "Model Context Protocol (MCP)"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

Model Context Protocol (MCP) is an open protocol for connecting AI hosts to external systems that expose capabilities such as tools, resources, and prompts.

MCP standardizes discovery and invocation. It is not a model, not an authorization policy, and not a statement that a server or its content is trustworthy.

As of this radar review, the current final MCP protocol revision is 2026-07-28. That revision made the protocol core stateless and differs materially from the 2025-era handshake/session model, so implementations should test the exact protocol era and SDK behavior they deploy.

## Why it matters for backend engineers

Without a common protocol, every AI host needs custom adapters for GitHub, databases, document stores, and internal APIs. MCP can reduce that integration work.

The same interoperability broadens security responsibility. Connecting a server can expose executable tools and private resources. Tool discovery must not become automatic authority to invoke every operation with the user's broadest credentials.

Protocol evolution also matters. MCP 2026-07-28 removed the required protocol-level session and initialize handshake used by 2025-era revisions, so production integrations need explicit version and SDK lifecycle management.

## How it works

An MCP host manages one or more clients that communicate with MCP servers. The server exposes supported primitives such as tools, resources, and prompts; the host decides which of those capabilities are available to the model or user.

For the 2026-07-28 protocol era, there is no required `initialize` / `initialized` handshake and no protocol-level `Mcp-Session-Id`. Each request is self-describing: it carries its protocol revision and relevant client identity or capability metadata. A client that wants to inspect server capabilities first can call `server/discover`, but discovery is optional.

Over Streamable HTTP, a modern request carries `MCP-Protocol-Version: 2026-07-28` plus routing metadata such as `Mcp-Method` and, where applicable, `Mcp-Name`. The JSON-RPC body contains the actual method and parameters. Because requests are stateless at the protocol layer, ordinary requests can be handled by different server instances behind a load balancer without sticky protocol sessions.

Older MCP revisions through the 2025 era use the older connection model: the client performs `initialize`, negotiates a protocol version and capabilities, and keeps that negotiated state for the session. Current SDKs can support both eras and may explicitly probe or fall back according to their version-negotiation configuration.

The 2026 revision also changed server-to-client interaction. Rather than relying on the older continuously open bidirectional request channel, modern MCP uses multi-round-trip request patterns for cases where the server needs additional client input.

Authorization remains a separate concern. HTTP tokens should be scoped to the intended MCP resource or server and validated for the correct issuer and audience. Passing through a token issued for an unrelated backend creates a confused-deputy and credential-exposure risk.

## Key concepts

**Host.** AI application that manages MCP clients and decides which server capabilities are available to the model or user.

**Server.** Process or service exposing MCP capabilities.

**Tool.** Callable operation with structured input and result. Tool-schema validity does not replace business authorization.

**Resource.** Data that can be discovered or read through the protocol. Resource contents remain untrusted data.

**Prompt.** Reusable prompt interaction exposed by a server. It is not higher authority than host, user, or system policy.

**Protocol era.** 2025-era revisions use initialize/session negotiation; 2026-07-28 is stateless and declares protocol information per request.

**Server discovery.** `server/discover` lets a modern client learn server capabilities before another operation, but it is not a mandatory handshake.

**Server trust.** Protocol compliance means a server speaks MCP; it does not make its code, instructions, or returned data safe.

## Production example

A company exposes internal engineering documentation and issue creation through an MCP server.

Resources provide read-only architecture docs. A `search_docs` tool performs bounded retrieval. A separate `create_issue_draft` tool creates a draft object but does not publish it directly.

A modern HTTP client sends the 2026-07-28 protocol version on each request. The service is stateless at the MCP protocol layer, so requests can reach different healthy server replicas. If the client wants capability information before first use, it performs `server/discover`; a supported legacy client can instead fall back to the older initialize-based era.

The host grants read capabilities automatically for the engineering workspace but requires explicit user confirmation before converting a draft to a real issue. Authentication tokens are scoped to this MCP service; a token issued for the underlying issue API is not blindly forwarded through the server.

Tests include malformed tool arguments, a resource outside the caller's authorization scope, returned content containing prompt-injection text, a 2025-only client/server compatibility case, a 2026 version-header mismatch, and a timeout after an issue draft is created.

For the timeout case, the tool uses a stable operation ID so the client can reconcile rather than duplicate the draft.

## Trade-offs

MCP reduces custom integration code and creates reusable capability surfaces across hosts. It introduces another protocol, server lifecycle, authorization model, and dependency ecosystem.

The stateless 2026 core makes ordinary horizontal HTTP scaling simpler, while dual-era support adds migration and compatibility work.

A generic MCP server can serve many clients but may tempt teams to expose overly broad tools. Narrow APIs often remain safer than a universal “run query” or “execute shell” capability.

Local stdio deployments avoid network exposure while inheriting the host process's local permissions; remote HTTP deployments add service availability and authentication responsibilities.

## Failure modes / pitfalls

Trusting arbitrary MCP servers or their prompt or resource text can introduce malicious instructions.

Broad credentials and token passthrough weaken authorization boundaries. Tool descriptions that understate side effects make host approval unreliable.

Mixing the 2025 handshake model with the 2026 stateless model can cause interoperability failures or incorrect infrastructure assumptions such as unnecessary sticky sessions.

Version mismatch between host, SDK, and server can produce subtle failures. Fast protocol evolution makes pinning and testing the actual revision important.

## When to use it

Use MCP when several AI hosts or tools need a maintained standard integration surface and the interoperability benefit exceeds the protocol and security cost.

Keep server capabilities narrow, independently authorized, and observable.

## When not to use it

A direct library, REST API, or CLI can be simpler for one local application with one integration.

Do not wrap every internal service in MCP merely to claim agent compatibility.

## What a Senior Engineer should know

A Senior Engineer should understand host and server roles, 2025 versus 2026 protocol behavior, Streamable HTTP, tool/resource/prompt semantics, structured schemas, authorization, and failure outcomes.

They should test the specific SDK and protocol revision deployed and treat returned content as untrusted input.

## What a Staff Engineer should understand

A Staff Engineer should govern trusted servers, identity and credential boundaries, SDK and protocol upgrades, compatibility windows, capability review, and audit across AI products.

They should distinguish interoperability from safety: MCP can standardize the connection while the organization still owns authorization, tool design, and lifecycle management.

Further reading: [MCP 2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28), [MCP 2026-07-28 release notes](https://blog.modelcontextprotocol.io/posts/2026-07-28/).
