import assert from "node:assert/strict"
import { test } from "node:test"

import { Moatlight, MoatlightError } from "../dist/index.js"

const json = (body, init = {}) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init })

test("writes carry one Idempotency-Key across retries and 429 is retried after Retry-After", async () => {
  const seen = []
  const fetchMock = async (url, init) => {
    seen.push({ url: String(url), key: init.headers["Idempotency-Key"], auth: init.headers.Authorization })
    return seen.length === 1 ? json({ error: { code: "rate_limited", message: "slow" } }, { status: 429, headers: { "retry-after": "0" } }) : json({ id: "r1", stage: "analyzing" }, { status: 202 })
  }
  const api = new Moatlight({ token: "t", fetch: fetchMock })
  const r = await api.createReport("example.com")
  assert.equal(r.id, "r1")
  assert.equal(seen.length, 2)
  assert.equal(seen[0].key, seen[1].key)
  assert.ok(seen[0].key.length >= 8)
  assert.equal(seen[0].auth, "Bearer t")
})

test("errors become MoatlightError with code and hint", async () => {
  const api = new Moatlight({ maxRetries: 0, fetch: async () => json({ error: { code: "not_found", message: "No.", hint: "Check the id." } }, { status: 404 }) })
  await assert.rejects(api.getReport("x"), (e) => e instanceof MoatlightError && e.status === 404 && e.code === "not_found" && e.hint === "Check the id.")
})

test("allReports follows next_cursor", async () => {
  const pages = [
    { reports: [{ id: "a" }, { id: "b" }], next_cursor: "c1", has_more: true },
    { reports: [{ id: "c" }], next_cursor: null, has_more: false },
  ]
  const urls = []
  const api = new Moatlight({ fetch: async (url) => { urls.push(String(url)); return json(pages[urls.length - 1]) } })
  const ids = []
  for await (const r of api.allReports(2)) ids.push(r.id)
  assert.deepEqual(ids, ["a", "b", "c"])
  assert.match(urls[1], /cursor=c1/)
})

test("rate limit headers are exposed after each call", async () => {
  const api = new Moatlight({ fetch: async () => json({}, { headers: { "ratelimit-limit": "120", "ratelimit-remaining": "119", "ratelimit-reset": "60" } }) })
  await api.getProduct()
  assert.deepEqual(api.lastRateLimit, { limit: 120, remaining: 119, resetSeconds: 60 })
})
