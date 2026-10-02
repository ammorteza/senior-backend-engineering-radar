---
title: "OAuth 2.0 and OpenID Connect"
ring: adopt
segment: techniques
tags: [backend]
---

## What it is

OAuth 2.0 is a framework for granting clients access to protected resources. For example, a business can authorize an accounting application to read invoices without giving that application the user's password. OpenID Connect, or OIDC, adds an identity layer so a client can authenticate a user through an identity provider.

These are related but distinct uses. An access token is presented to a resource server to access an API. An OIDC ID token communicates authentication information to the client it was issued for. A JWT is a token representation, not a guarantee that either purpose has been validated correctly; access tokens can also be opaque.

## Why it matters for backend engineers

Backend engineers implement the boundary where a token becomes authority. Parsing a token's JSON without validating it can turn attacker-controlled claims into a trusted user. Even a correctly signed token can be inappropriate if it was issued for another API or another client.

Successful login is only part of the lifecycle. Refresh, key rotation, logout, account removal and identity-provider outages all affect production behavior. A working demonstration with one user and one issuer does not establish that these transitions are safe.

## How it works

For a typical browser-based OIDC login using authorization code flow, the application creates a login transaction and redirects the browser to the identity provider. The request identifies the registered client and redirect URI, requests the required scopes, and uses protections such as PKCE and transaction-bound state or nonce as appropriate to the flow and library.

After authentication and any required consent, the provider redirects the browser back with a short-lived authorization code. The client exchanges that code at the token endpoint. With PKCE, the exchange includes the verifier corresponding to the earlier challenge, binding the exchange to the initiating client transaction. Confidential clients also authenticate as required by their registration.

The client validates the ID token using the configured issuer's rules and creates its own application session. An API separately validates access tokens intended for that resource. It then performs business authorization: a token permitting invoice reads does not establish that every invoice belongs to the caller's organization.

Use maintained protocol libraries and current provider guidance. RFC 9700 provides updated OAuth security guidance, including PKCE and protection of redirect-based flows. Recreating the flow from a few HTTP requests omits important checks that are easy to overlook.

## Key concepts

**Issuer and audience.** The issuer identifies the authority making the claims; the audience identifies their intended recipient. A trusted signature without the correct audience can allow token substitution between services.

**Scopes and object permissions.** A scope such as `invoices.read` can limit delegated capability. The API still needs tenant membership, ownership or other resource-specific checks.

**ID token, access token and refresh token.** They serve different consumers and purposes. A refresh token goes to the authorization server to obtain new tokens; it should not be used as an API bearer credential. Protect it according to the client type and provider's rotation or sender-constraining support.

**State, nonce and PKCE.** These mechanisms bind different parts of a login transaction and defend against different attacks. Their exact validation belongs to the chosen flow and library; do not treat them as arbitrary optional query parameters.

**Key rotation and revocation.** Signing-key refresh is different from revoking a user's session. A locally validated access token can remain accepted until expiry unless an additional revocation mechanism or policy intervenes. Define the intended window explicitly.

## Production example

An invoice API and a reporting application trust the same identity provider. A developer configures the API to accept any JWT whose signature verifies against that provider's keys. A token issued only for logging into the reporting application is now accepted by the invoice API, even though the API is not its intended audience.

The repair configures validation for the invoice API's access-token contract: expected issuer, audience, allowed algorithms, signature and relevant time claims. It rejects ID tokens used as API credentials. The handler then checks organization membership and invoice permissions separately.

Tests include a correctly signed token for the wrong audience, an expired token, an unexpected issuer, insufficient scope and an authenticated user requesting another organization's invoice. Testing only a malformed signature would miss the original defect because the substituted token was legitimately signed.

The team also rehearses signing-key rotation. Known valid keys can be cached according to supported library behavior; an unknown key identifier triggers controlled refresh rather than unrestricted outbound lookups from token-provided URLs. Finally, they verify logout and user-removal behavior against the documented session policy instead of assuming that deleting a browser cookie revokes every access token.

## Trade-offs

Federated login reduces password handling and can centralize account security. It introduces dependencies on issuer configuration, token endpoints, key distribution and client registration. Local JWT validation keeps ordinary API requests independent of a remote validation call, but immediate revocation becomes harder.

Opaque tokens with introspection can centralize token status, at the cost of network latency, caching decisions and another availability dependency. Neither representation is universally better. Choose based on trust boundaries, revocation requirements and supported identity infrastructure.

## Failure modes / pitfalls

- **Decoding is mistaken for validation.** Unverified claims must not become an authenticated principal.
- **Token types are interchangeable.** Keep ID-token validation and API access-token validation scoped to their intended consumers.
- **Redirect registration is permissive.** Broad redirects can send authorization responses to unintended destinations. Use exact supported registration rules.
- **Bearer credentials enter logs or URLs.** Treat access and refresh tokens as credentials, including in traces and error reports.
- **Scopes replace resource authorization.** A permitted action still needs the correct tenant and object scope.
- **Logout promises more than it implements.** Distinguish the application session, provider session, refresh credentials and already issued access tokens.

## When to use it

Use OAuth for delegated API access and supported machine-access scenarios, and OIDC when an application needs federated user authentication. Select a flow that matches the actual client type and use maintained integrations.

Before production, document who issues tokens, which audience each API expects and how sessions end. A small negative-test suite for issuer, audience, expiry and cross-tenant access catches mistakes that successful login tests do not.

## When not to use it

Do not invent a custom token protocol when standard supported flows meet the need. Do not add an OAuth authorization server solely to avoid designing your application's resource permissions; those decisions remain necessary.

Do not choose obsolete flows because an old tutorial is simpler. Check current security guidance and provider support, particularly for browser and native clients where embedded secrets cannot establish a confidential client identity.

## What a Senior Engineer should know

A Senior Engineer should explain the roles of client, authorization server and resource server; distinguish token types; and trace a complete login and API-access sequence. They should configure validation using trusted issuer metadata and verify the API's audience and permissions.

They should also diagnose expired credentials, key-rotation failures and session invalidation without logging token values. A correct integration includes negative tests and operational lifecycle behavior, not just a successful redirect.

## What a Staff Engineer should understand

A Staff Engineer should own issuer trust, client registration standards and token/session policy across services. Adding another issuer or audience changes the security boundary and should have an explicit migration and rollback design.

Coordinate revocation expectations with product and security teams, including third-party integrations and machine identities. Standard libraries and shared validation configuration reduce repeated protocol mistakes, while services retain responsibility for their business authorization.

Further reading: [OAuth security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html).
