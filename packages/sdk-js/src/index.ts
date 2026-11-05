// Moatlight API client. No dependencies; uses the global fetch (Node 18+, browsers, Deno, Bun).
// Safe retries: network errors, 429 and 5xx are retried with backoff (Retry-After honoured), and every write
// carries an Idempotency-Key, so a retry can never start a second report.

export const DEFAULT_BASE_URL = "https://www.moatlight.com"

export type Stage = "analyzing" | "analysis_failed" | "needs_confirmation" | "running" | "finished" | "failed"

export interface Job { id: string; status: Stage; status_url: string; poll_after_seconds: number; done_when: string }
export interface Report {
  id: string
  website: string
  stage: Stage
  created_at?: string
  next_step?: string
  job_id?: string
  status_url?: string
  poll_after_seconds?: number
  job?: Job
  progress?: { answers_done: number; answers_total: number }
  error?: string
  human_view?: string
  profile?: Record<string, unknown>
  questions?: { id: string; question: string; audience: string; included: boolean }[]
  summary?: Record<string, unknown> | null
  [key: string]: unknown
}
export interface Page { next_cursor: string | null; has_more: boolean }
export interface ReportItem { id: string; website: string; stage: Stage; created_at: string; url: string }
export interface RateLimit { limit?: number; remaining?: number; resetSeconds?: number }

export class MoatlightError extends Error {
  /** The API's message without the code prefix. */
  readonly detail: string
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly hint?: string,
    readonly retryAfterSeconds?: number,
    readonly body?: unknown,
  ) {
    super(`${code}: ${message}`)
    this.name = "MoatlightError"
    this.detail = message
  }
}

export interface ClientOptions {
  /** OAuth access token. Public endpoints and the sandbox need none. */
  token?: string
  baseUrl?: string
  /** Retries for network errors, 429 and 5xx. Default 3. */
  maxRetries?: number
  fetch?: typeof fetch
  userAgent?: string
}

type Query = Record<string, string | number | undefined>
interface Call { method?: "GET" | "POST"; query?: Query; body?: unknown; idempotencyKey?: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class Moatlight {
  readonly baseUrl: string
  /** RateLimit headers of the last answer, so a caller can slow down before being refused. */
  lastRateLimit: RateLimit = {}
  private token?: string
  private maxRetries: number
  private doFetch: typeof fetch
  private userAgent: string

  constructor(options: ClientOptions = {}) {
    this.token = options.token
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "")
    this.maxRetries = options.maxRetries ?? 3
    this.doFetch = options.fetch ?? fetch
    this.userAgent = options.userAgent ?? "moatlight-sdk-js/1.1.0"
  }

  setToken(token: string) { this.token = token }

  async request<T>(path: string, call: Call = {}): Promise<T> {
    const url = new URL(this.baseUrl + path)
    for (const [k, v] of Object.entries(call.query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v))
    const method = call.method ?? "GET"
    const headers: Record<string, string> = { Accept: "application/json", "User-Agent": this.userAgent }
    if (this.token) headers.Authorization = `Bearer ${this.token}`
    if (call.body !== undefined) headers["Content-Type"] = "application/json"
    // Same key on every retry of this call: that is what makes the retry safe.
    if (method === "POST") headers["Idempotency-Key"] = call.idempotencyKey ?? crypto.randomUUID()

    for (let attempt = 0; ; attempt++) {
      let res: Response | null = null
      try {
        res = await this.doFetch(url, { method, headers, body: call.body === undefined ? undefined : JSON.stringify(call.body) })
      } catch (e) {
        if (attempt >= this.maxRetries) throw e
        await sleep(backoff(attempt))
        continue
      }
      this.lastRateLimit = readRateLimit(res.headers)
      const text = await res.text()
      const data = text ? safeJson(text) : null
      if (res.ok) return data as T
      const retryAfter = Number(res.headers.get("retry-after")) || undefined
      if ((res.status === 429 || res.status >= 500) && attempt < this.maxRetries) {
        await sleep(retryAfter ? Math.min(retryAfter, 60) * 1000 : backoff(attempt))
        continue
      }
      const err = (data as { error?: { code?: string; message?: string; hint?: string } } | null)?.error
      throw new MoatlightError(res.status, err?.code ?? `http_${res.status}`, err?.message ?? res.statusText, err?.hint, retryAfter, data)
    }
  }

  // ---- public ----
  getProduct(fields?: string) { return this.request<Record<string, unknown>>("/api/v1/product", { query: { fields } }) }
  getPricing(fields?: string) { return this.request<Record<string, unknown>>("/api/v1/pricing", { query: { fields } }) }
  getSampleReport() { return this.request<Report>("/api/v1/sample-report") }
  listFaq(page: { limit?: number; cursor?: string } = {}) { return this.request<{ faq: { question: string; answer: string }[] } & Page>("/api/v1/faq", { query: page }) }

  // ---- account (OAuth token) ----
  getAccount(fields?: string) { return this.request<Record<string, unknown>>("/api/v1/me", { query: { fields } }) }
  listReports(page: { limit?: number; cursor?: string } = {}) { return this.request<{ reports: ReportItem[] } & Page>("/api/v1/reports", { query: page }) }
  /** Every report, newest first, following next_cursor for you. */
  async *allReports(limit = 50): AsyncGenerator<ReportItem> {
    let cursor: string | undefined
    do {
      const page = await this.listReports({ limit, cursor })
      yield* page.reports
      cursor = page.next_cursor ?? undefined
    } while (cursor)
  }
  createReport(website: string, options: { country?: string; language?: string; idempotencyKey?: string } = {}) {
    const { idempotencyKey, ...rest } = options
    return this.request<Report>("/api/v1/reports", { method: "POST", body: { website, ...rest }, idempotencyKey })
  }
  getReport(id: string, fields?: string) { return this.request<Report>(`/api/v1/reports/${encodeURIComponent(id)}`, { query: { fields } }) }
  batchGetReports(ids: string[]) {
    return this.request<{ results: { report_id: string; status: number; report?: Report; error?: { code: string; message: string } }[]; succeeded: number; failed: number }>("/api/v1/reports/batch", { method: "POST", body: { report_ids: ids } })
  }
  startReport(id: string, options: { questionIds?: string[]; idempotencyKey?: string } = {}) {
    return this.request<Report>(`/api/v1/reports/${encodeURIComponent(id)}/start`, { method: "POST", body: options.questionIds ? { question_ids: options.questionIds } : {}, idempotencyKey: options.idempotencyKey })
  }
  getReportActions(id: string) { return this.request<Record<string, unknown>>(`/api/v1/reports/${encodeURIComponent(id)}/actions`) }
  getAgentReadiness(id: string) { return this.request<Record<string, unknown>>(`/api/v1/reports/${encodeURIComponent(id)}/agent-readiness`) }
  scanAgentReadiness(id: string, options: { force?: boolean; idempotencyKey?: string } = {}) {
    return this.request<Record<string, unknown>>(`/api/v1/reports/${encodeURIComponent(id)}/agent-readiness/scan`, { method: "POST", body: { force: options.force === true }, idempotencyKey: options.idempotencyKey })
  }

  /** Poll a report until its stage is one of `until` (default: needs_confirmation, finished or a failure). */
  async waitForReport(id: string, options: { until?: Stage[]; timeoutSeconds?: number; onPoll?: (r: Report) => void } = {}): Promise<Report> {
    const until = options.until ?? ["needs_confirmation", "finished", "analysis_failed", "failed"]
    const deadline = Date.now() + (options.timeoutSeconds ?? 300) * 1000
    for (;;) {
      const r = await this.getReport(id)
      options.onPoll?.(r)
      if (until.includes(r.stage)) return r
      if (Date.now() > deadline) throw new Error(`Timed out waiting for report ${id} (stage ${r.stage}).`)
      await sleep((r.poll_after_seconds ?? 5) * 1000)
    }
  }
}

/** The no-login sandbox: made-up data, same shapes and errors as production. */
export class MoatlightSandbox {
  private api: Moatlight
  constructor(options: Omit<ClientOptions, "token"> = {}) { this.api = new Moatlight(options) }
  getAccount() { return this.api.request<Record<string, unknown>>("/api/v1/sandbox/me") }
  listReports() { return this.api.request<{ reports: ReportItem[] } & Page>("/api/v1/sandbox/reports") }
  createReport(website: string) { return this.api.request<Report>("/api/v1/sandbox/reports", { method: "POST", body: { website } }) }
  getReport(id = "sandbox-report") { return this.api.request<Report>(`/api/v1/sandbox/reports/${encodeURIComponent(id)}`) }
}

function readRateLimit(h: Headers): RateLimit {
  const n = (k: string) => (h.get(k) === null ? undefined : Number(h.get(k)))
  return { limit: n("ratelimit-limit"), remaining: n("ratelimit-remaining"), resetSeconds: n("ratelimit-reset") }
}
const backoff = (attempt: number) => Math.min(8000, 500 * 2 ** attempt) + Math.floor(Math.random() * 250)
function safeJson(text: string): unknown { try { return JSON.parse(text) } catch { return text } }
