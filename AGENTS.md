# AGENTS.md

This repository holds the agent kit for [Moatlight](https://www.moatlight.com): skills and MCP settings that let an AI agent measure whether ChatGPT and Google AI Overview name a business. It contains no application code.

## What to do

- To use Moatlight from an agent, read `skills/` first. Each `SKILL.md` is one job.
- To call the API, read https://www.moatlight.com/openapi.json (OpenAPI) and https://www.moatlight.com/docs. Public endpoints and a sandbox (https://www.moatlight.com/api/v1/sandbox) need no login.
- To log in, follow https://www.moatlight.com/auth.md: OAuth 2.0 authorization code with PKCE; an app uses an HTTPS client_id metadata URL (CIMD) or registers itself (RFC 7591). Ask only for the scopes you need: account:read, reports:read, reports:write, agent-readiness:read, agent-readiness:scan.
- MCP servers: https://www.moatlight.com/mcp (product), https://www.moatlight.com/mcp/docs (docs). Streamable HTTP.

## Rules

- Start a report only when the user asks. The free plan allows one website and one report every 30 days.
- Never invent facts about a business. Show the user what the report proposes and ask.
- Do not promise traffic, leads or dates. Reports show counts of answers.
- You cannot pay. The Early Access pass (agent readiness) is bought by a person at https://www.moatlight.com/pricing.
- Writes are safe to retry: send an `Idempotency-Key` header (the SDKs do). Lists are cursor-paged (`limit`, `cursor`, `next_cursor`). Read `RateLimit` headers and wait for `Retry-After` on a 429.
- Do not edit the files in `skills/` by hand; they are generated from the site (`npm run agent-kit` in the application repository).

## Files

- `plugin.json` and `mcp.json`: Agent Plugins manifest (agent-plugins.org 1.0.0) and its MCP servers.
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`: Claude Code plugin and marketplace.
- `.mcp.json`: the two MCP servers, Claude Code format.
- `packages/`: `sdk-js` (@moatlight/sdk), `cli` (@moatlight/cli) `sdk-py` (moatlight on PyPI), `sdk-rb` (RubyGem) and `sdk-go` (Go module). Edit them in the application repository, not here.
- `server.json`: MCP Registry entry.
- `skills/*/SKILL.md`: agent skills (agentskills.io format).
