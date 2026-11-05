---
name: moatlight-connect
description: "Connect an agent to Moatlight: pick the access path (no-login sandbox, MCP server, CLI, SDK or REST), log in with OAuth, and fix 401, 402, 403 and 429 answers. Use when the user wants to use Moatlight from an agent or script, asks how to authenticate or which scopes to request, or a Moatlight call fails with an auth, plan or rate limit error."
license: MIT
compatibility: "Needs network access to www.moatlight.com. Works in any agent that can make HTTPS calls or use an MCP server."
metadata:
  author: Moatlight
  version: "1.2.0"
  homepage: https://www.moatlight.com/docs
---

# Connect to Moatlight

## Pick the path

| Need | Use |
|---|---|
| Try it with made-up data, no login | `https://www.moatlight.com/api/v1/sandbox` (same shapes as production) |
| Agent client with tools | MCP server `https://www.moatlight.com/mcp` (Streamable HTTP, OAuth). Docs search without login: `https://www.moatlight.com/mcp/docs` |
| Shell or CI | `npx @moatlight/cli product` (JSON on stdout, exit 0 ok, 1 API error, 2 usage) |
| Code | `@moatlight/sdk` (npm) or `moatlight` (PyPI) |
| Anything else | REST, spec at https://www.moatlight.com/openapi.json |

Start on the sandbox. Move to production only when the user wants real data.

## Log in

1. OAuth 2.0 authorization code with PKCE. Full steps: https://www.moatlight.com/auth.md.
2. Ask only for the scopes the job needs: `account:read`, `reports:read`, `reports:write`, `agent-readiness:read`, `agent-readiness:scan`.
3. Claude Code: `claude mcp add --transport http moatlight https://www.moatlight.com/mcp`, then `/mcp` and choose moatlight. Codex: `codex mcp add moatlight --url https://www.moatlight.com/mcp`.
4. Check with `GET https://www.moatlight.com/api/v1/me`. It returns `plan` and `limits`.

## Errors

Every error is JSON with `code`, `message` and `hint`. Read `hint` before retrying.

- `401 invalid_token`: the token expired or the server changed. Use the refresh token, or reconnect. Do not retry the same token.
- `402 needs_early_access_pass`: a person must buy the pass at https://www.moatlight.com/pricing. Give them `upgrade_url`. You cannot pay.
- `403 insufficient_scope`: the token lacks `required_scope`. Ask the user to approve it, then log in again. `403 domain_cap` is the free plan limit instead.
- `429`: wait `Retry-After` seconds. `RateLimit` headers show what is left. Do not loop.

## Gotchas

- Send an `Idempotency-Key` header on every POST so a retry cannot start a second report. The SDKs do this.
- Lists are cursor-paged: pass `next_cursor` back as `cursor` until `has_more` is false.
- A `202` answer means a job is still running. Follow `status_url` and honor `Retry-After`.
- There is no API key. Never ask the user to paste a secret into the chat.

## Do not

- Do not start a report to test the connection. It uses the user's allowance. Call `/me` or the sandbox.
