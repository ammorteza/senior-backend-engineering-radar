---
title: "OAuth 2.0 and OpenID Connect"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

OAuth 2.0 delegates access to resources without sharing a user's password with every application. OpenID Connect (OIDC) adds an authentication layer, including identity claims in an ID token.

## Why it matters for backend engineers

Confusing access tokens and ID tokens can let a service accept a token intended for a different purpose. Login correctness depends on validation and flow design, not decoding a JWT.

## How it works

In a modern authorization-code flow, the client redirects to an authorization server, obtains a code and exchanges it with PKCE protection under the applicable client rules. The resource server validates access tokens for its audience and permissions. OIDC clients validate ID-token issuer, audience, signature, expiry and applicable nonce expectations.

## Key concepts

Scopes limit delegated capability, not necessarily object ownership. Refresh tokens extend sessions and require protection and rotation policy. State binds requests to browser interactions. RFC 9700 updates security guidance and deprecates insecure modes; implementation should follow maintained libraries and provider documentation.

## Production example

A partner application accesses invoices with a resource-specific access token. The API rejects an ID token and tokens meant for another audience. It then separately checks which invoices the delegated principal may read. Logout and revocation behavior are tested rather than assumed from token expiry alone.

## Trade-offs

Federation reduces password handling but adds issuer, key distribution and token-lifecycle dependencies. JWT validation can be local, while timely revocation may need additional mechanisms.

## Failure modes / pitfalls

Skipping audience checks, permissive redirect URLs, tokens in logs and trusting unsigned claims compromise the boundary.

## When to use it

Use OAuth for delegated API access and OIDC for supported federated login.

## When not to use it

Do not invent a token protocol or treat scopes as complete business authorization.

## What a Senior Engineer should know

Distinguish token types and validate the chosen flow end to end.

## What a Staff Engineer should understand

Own issuer trust, client registration, session lifecycle and migration away from obsolete flows.

Further reading: [OAuth security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700), [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html).
