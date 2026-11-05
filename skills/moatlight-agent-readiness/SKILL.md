---
name: moatlight-agent-readiness
description: Check how well AI agents can find and use a website (discovery files, API, MCP, auth) and list the ranked fixes. Use when a user wants their site to work for AI agents. Needs the Early Access pass.
license: Proprietary. Describes the public Moatlight API.
metadata:
  homepage: https://www.moatlight.com/docs
---

# Agent readiness scan

Needs the **Early Access pass** (US$10 one-time). Without it the API answers `402 needs_early_access_pass` with `upgrade_url`. A person must buy it in a browser at https://www.moatlight.com/pricing; you cannot pay.

## Steps

1. Scopes: `agent-readiness:read agent-readiness:scan`.
2. `GET https://www.moatlight.com/api/v1/reports/{id}/agent-readiness` → newest stored scan (`404 no_scan` if none).
3. `POST https://www.moatlight.com/api/v1/reports/{id}/agent-readiness/scan` → runs or reuses a result under 24 hours old. Send `{"force":true}` only after a fix was deployed. It is rate limited (`429`, see `Retry-After`).
4. Read `score`, `grade`, `layers` and `top_fixes`. Work on the first fix first.

## Do not

- Do not scan in a loop. Results are cached and the scanner has shared limits.
- Do not claim a score will rise before the user deploys the fix and you re-scan.
