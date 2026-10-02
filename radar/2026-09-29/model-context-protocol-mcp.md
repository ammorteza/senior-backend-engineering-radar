---
title: "Model Context Protocol (MCP)"
ring: assess
segment: techniques
tags: [backend]
---

## What it is

MCP standardizes communication between AI hosts and servers exposing tools, resources and prompts. It is an integration protocol, not a model, authorization policy or guarantee that a server is trustworthy.

## Why it matters for backend engineers

A shared protocol reduces custom adapters, but connecting a server adds executable capabilities and data flows. Tool discovery must not become implicit authority to perform every advertised action.

## How it works

A host manages clients that negotiate protocol capabilities with servers. JSON-RPC messages invoke supported features over transports such as stdio or Streamable HTTP. Servers describe tools and provide results; the host decides how they are presented and used. HTTP authorization follows the applicable specification, while stdio has a different credential model.

## Key concepts

Tools perform operations; resources expose data; prompts provide reusable interactions. Protocol versions must be negotiated. Token audience validation and avoiding token passthrough protect authorization boundaries. Tool descriptions and results can contain untrusted instructions.

## Production example

A documentation server exposes searchable resources and a separate draft-issue tool. The host permits reads but constrains mutations under its action policy. Credentials are scoped to the intended server; a token for another API is not blindly forwarded. Tests exercise malformed arguments and unauthorized resource access.

## Trade-offs

Interoperability reduces integration work. Server dependencies, permissions and protocol evolution add operational and security responsibility.

## Failure modes / pitfalls

Trusting arbitrary servers, broad credentials, token passthrough and version mismatches can undermine access control.

## When to use it

Use MCP when multiple AI clients need a maintained standard integration surface.

## When not to use it

A direct API or CLI can be simpler for one well-defined local workflow.

## What a Senior Engineer should know

Understand transport, capability negotiation, tool schemas and authorization boundaries.

## What a Staff Engineer should understand

Govern server trust, identities and lifecycle without confusing protocol compliance with safety.

Further reading: [MCP specification](https://modelcontextprotocol.io/specification/2025-11-25), [Authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization).
