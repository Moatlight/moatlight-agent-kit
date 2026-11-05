# @moatlight/sdk

Official TypeScript/JavaScript client for the [Moatlight API](https://www.moatlight.com/docs): measure whether ChatGPT and Google AI Overview name a business, and read a ranked plan of changes. No dependencies; Node 18+.

```bash
npm install @moatlight/sdk
```

```ts
import { Moatlight, MoatlightSandbox } from "@moatlight/sdk"

// No login: the sandbox returns made-up data in the real shapes.
const sandbox = new MoatlightSandbox()
console.log((await sandbox.getReport()).stage) // "finished"

// With an OAuth access token (see https://www.moatlight.com/auth.md)
const api = new Moatlight({ token: process.env.MOATLIGHT_TOKEN })
const report = await api.createReport("yourcompany.com") // 202 Accepted, safe to retry
const ready = await api.waitForReport(report.id) // polls until needs_confirmation / finished
for await (const r of api.allReports()) console.log(r.id, r.stage) // follows next_cursor
```

- Every write sends an `Idempotency-Key` that stays the same across retries.
- Network errors, 429 and 5xx are retried with backoff; `Retry-After` is honoured.
- `api.lastRateLimit` holds the `RateLimit-*` headers of the last answer.
- Errors are `MoatlightError` with `status`, `code`, `detail` and `hint`.

Docs: https://www.moatlight.com/docs · OpenAPI: https://www.moatlight.com/openapi.json · Source: https://github.com/gentlemankz/moatlight-agent-kit · MIT
