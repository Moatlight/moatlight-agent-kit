# @moatlight/cli

Command line for [Moatlight](https://moatlight.com): product facts, the no-login sandbox, reports and agent readiness. JSON on stdout, messages on stderr, exit code 0 / 1 (API error) / 2 (usage), so it works in scripts and for AI agents.

```bash
npm install -g @moatlight/cli     # or: npx @moatlight/cli product

moatlight product
moatlight sandbox report
moatlight login --email you@example.com      # approve in a browser with a short code
moatlight reports create yourcompany.com
moatlight reports wait <id>
moatlight reports start <id>
moatlight reports actions <id>
```

Run `moatlight --help` for every command. `MOATLIGHT_TOKEN` or `--token` skips `login`. Docs: https://moatlight.com/docs · Source: https://github.com/Moatlight/moatlight-agent-kit · MIT
