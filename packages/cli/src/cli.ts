#!/usr/bin/env node
// moatlight: a small CLI over the Moatlight API. Output is JSON on stdout (one document per command), messages
// and prompts go to stderr, and the exit code is 0 on success, 1 on an API error, 2 on bad usage. That makes it
// safe to script and to call from an AI agent.
import { mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

import { DEFAULT_BASE_URL, Moatlight, MoatlightError, MoatlightSandbox } from "@moatlight/sdk"

const HELP = `moatlight <command> [options]

Public (no login):
  product | pricing | faq [--limit N] [--cursor C] | sample-report
  sandbox account | sandbox reports | sandbox create <website> | sandbox report [id]

Account (needs login):
  login --email you@example.com   Approve in a browser with a short code (agent identity). Saves a token.
  logout
  account
  reports list [--limit N] [--cursor C] | reports all
  reports create <website> [--country XX --language yy]
  reports get <id> [--fields a,b] | reports batch <id> <id> ... | reports wait <id>
  reports start <id> [--questions id,id] | reports actions <id>
  readiness get <id> | readiness scan <id> [--force]

Options:
  --base-url URL   API origin (default ${DEFAULT_BASE_URL}, or MOATLIGHT_BASE_URL)
  --token T        Access token (or MOATLIGHT_TOKEN; otherwise the one saved by login)
  --help, --version
`

const CONFIG = join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "moatlight", "credentials.json")
type Saved = { access_token: string; identity_assertion?: string; expires_at?: number; base_url: string }
const readSaved = (): Saved | null => { try { return JSON.parse(readFileSync(CONFIG, "utf8")) } catch { return null } }

function parse(argv: string[]) {
  const flags: Record<string, string | true> = {}
  const rest: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=", 2)
      if (v !== undefined) flags[k] = v
      else if (argv[i + 1] && !argv[i + 1].startsWith("--") && !["force", "help", "version"].includes(k)) flags[k] = argv[++i]
      else flags[k] = true
    } else rest.push(a)
  }
  return { flags, rest }
}

const out = (value: unknown) => console.log(JSON.stringify(value, null, 2))
const say = (message: string) => console.error(message)
const usage = (message: string): never => { say(message); say("Run moatlight --help."); process.exit(2) }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function login(baseUrl: string, email: string | undefined) {
  if (!email) usage("login needs --email, the address of your Moatlight account.")
  const form = (o: Record<string, string>) => new URLSearchParams(o).toString()
  const res = await fetch(`${baseUrl}/agent/identity`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "service_auth", login_hint: email, agent_name: "moatlight CLI" }) })
  const reg = (await res.json()) as { claim_token?: string; claim?: { user_code: string; verification_uri: string; interval: number; expires_in: number }; error?: string; error_description?: string }
  if (!res.ok || !reg.claim_token || !reg.claim) throw new Error(`${reg.error ?? res.status}: ${reg.error_description ?? "could not start login"}`)
  say(`Open ${reg.claim.verification_uri}\nSign in as ${email}, check the scopes and type this code: ${reg.claim.user_code}\nWaiting for approval (${Math.round(reg.claim.expires_in / 60)} minutes)...`)
  let interval = reg.claim.interval
  for (;;) {
    await sleep(interval * 1000)
    const tr = await fetch(`${baseUrl}/api/auth/oauth2/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form({ grant_type: "urn:workos:agent-auth:grant-type:claim", claim_token: reg.claim_token }) })
    const t = (await tr.json()) as { access_token?: string; identity_assertion?: string; expires_in?: number; error?: string; error_description?: string }
    if (tr.ok && t.access_token) {
      mkdirSync(dirname(CONFIG), { recursive: true })
      writeFileSync(CONFIG, JSON.stringify({ access_token: t.access_token, identity_assertion: t.identity_assertion, expires_at: Date.now() + (t.expires_in ?? 3600) * 1000, base_url: baseUrl } satisfies Saved))
      chmodSync(CONFIG, 0o600)
      say("Logged in. The token lasts one hour; run login again after that.")
      return out({ logged_in: true, email })
    }
    if (t.error === "slow_down") interval += 5
    else if (t.error !== "authorization_pending") throw new Error(`${t.error}: ${t.error_description ?? "login failed"}`)
  }
}

async function main() {
  const { flags, rest } = parse(process.argv.slice(2))
  if (flags.version) return console.log("1.1.0")
  if (flags.help || rest.length === 0) return console.log(HELP)
  const saved = readSaved()
  const baseUrl = String(flags["base-url"] ?? process.env.MOATLIGHT_BASE_URL ?? saved?.base_url ?? DEFAULT_BASE_URL)
  const token = String(flags.token ?? process.env.MOATLIGHT_TOKEN ?? (saved && saved.base_url === baseUrl ? saved.access_token : "")) || undefined
  const api = new Moatlight({ baseUrl, token })
  const sandbox = new MoatlightSandbox({ baseUrl })
  const [cmd, sub, ...args] = rest
  const page = { limit: flags.limit ? Number(flags.limit) : undefined, cursor: typeof flags.cursor === "string" ? flags.cursor : undefined }
  const need = (v: string | undefined, what: string) => v ?? usage(`Missing ${what}.`)
  const fields = typeof flags.fields === "string" ? flags.fields : undefined

  switch (cmd) {
    case "product": return out(await api.getProduct(fields))
    case "pricing": return out(await api.getPricing(fields))
    case "faq": return out(await api.listFaq(page))
    case "sample-report": return out(await api.getSampleReport())
    case "login": return login(baseUrl, typeof flags.email === "string" ? flags.email : undefined)
    case "logout": { try { writeFileSync(CONFIG, "{}") } catch {} return out({ logged_out: true }) }
    case "account": return out(await api.getAccount(fields))
    case "sandbox":
      if (sub === "account") return out(await sandbox.getAccount())
      if (sub === "reports") return out(await sandbox.listReports())
      if (sub === "create") return out(await sandbox.createReport(need(args[0], "website")))
      if (sub === "report") return out(await sandbox.getReport(args[0]))
      return usage("sandbox needs account, reports, create or report.")
    case "reports":
      if (sub === "list") return out(await api.listReports(page))
      if (sub === "all") { const all = []; for await (const r of api.allReports()) all.push(r); return out({ reports: all }) }
      if (sub === "create") return out(await api.createReport(need(args[0], "website"), { country: flags.country as string | undefined, language: flags.language as string | undefined }))
      if (sub === "get") return out(await api.getReport(need(args[0], "report id"), fields))
      if (sub === "batch") return out(await api.batchGetReports(args))
      if (sub === "wait") return out(await api.waitForReport(need(args[0], "report id"), { onPoll: (r) => say(`stage: ${r.stage}`) }))
      if (sub === "start") return out(await api.startReport(need(args[0], "report id"), { questionIds: typeof flags.questions === "string" ? flags.questions.split(",") : undefined }))
      if (sub === "actions") return out(await api.getReportActions(need(args[0], "report id")))
      return usage("reports needs list, all, create, get, batch, wait, start or actions.")
    case "readiness":
      if (sub === "get") return out(await api.getAgentReadiness(need(args[0], "report id")))
      if (sub === "scan") return out(await api.scanAgentReadiness(need(args[0], "report id"), { force: flags.force === true }))
      return usage("readiness needs get or scan.")
    default: return usage(`Unknown command: ${cmd}`)
  }
}

main().catch((e) => {
  if (e instanceof MoatlightError) {
    console.error(JSON.stringify({ error: { status: e.status, code: e.code, message: e.detail, hint: e.hint, retry_after_seconds: e.retryAfterSeconds } }, null, 2))
    process.exit(1)
  }
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
