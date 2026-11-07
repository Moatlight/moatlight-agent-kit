# Moatlight agent kit

Skills and MCP settings for using [Moatlight](https://moatlight.com) from an AI agent.

- Docs: https://moatlight.com/docs
- OpenAPI: https://moatlight.com/openapi.json
- MCP: https://moatlight.com/mcp
- Skills index: https://moatlight.com/.well-known/agent-skills/index.json
- MCP server page: https://moatlight.com/docs/mcp
- CLI and SDKs: `packages/` (TypeScript, Python, command line)

## Connect the MCP server

One URL, no API key. The client opens the OAuth login in a browser the first time a tool needs your account. Add `?readonly=true` to the URL to list only the read tools on that connection (it does not change what the login allows; approve only the read scopes if you want that).

```
Claude Code:
claude mcp add --transport http moatlight https://moatlight.com/mcp

Claude Code plugin (MCP, skills and the docs server together):
claude plugin marketplace add Moatlight/moatlight-agent-kit
claude plugin install moatlight@moatlight

Codex:
codex mcp add moatlight --url https://moatlight.com/mcp

Cursor:
cursor://anysphere.cursor-deeplink/mcp/install?name=moatlight&config=eyJ1cmwiOiJodHRwczovL21vYXRsaWdodC5jb20vbWNwIn0%3D

Any other client (VS Code, Windsurf, Claude Desktop):
{
  "mcpServers": {
    "moatlight": {
      "type": "http",
      "url": "https://moatlight.com/mcp"
    }
  }
}
```

## Install the skills only

```bash
npx skills add Moatlight/moatlight-agent-kit
```

License: MIT for the files in this repository. Moatlight itself is a hosted service.
