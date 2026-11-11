# The 17 steps, in order

Updated 12 Nov 2026: written from the owner's own walk through the live flow (steps 1, 2 and 12 to 17 are as the owner reported them, labels **[verify]** on the next run) plus screenshots of steps 3 to 11 **[P]**. Screens: `ui-flow.md`. If a label on the user's screen differs, trust the screen.

Give the user this list as the main output. Number every step. Fill each step with the user's real values (name, domain, email) so each line can be copied or clicked without thinking. Mark finished steps `Done`, the next one `NOW`, the rest `Later`.

| # | Where | What the user does | Fill in |
|---|---|---|---|
| 1 | Browser | Open `https://chatgpt.com/business-hub` and sign in | |
| 2 | Search box | Type the business name, then click the plus button on **Create `<Name>`** | `<Name>` |
| 3 | How do customers interact | Choose **Through a website** | |
| 4 | Website field | Enter the domain, no `https://`, no `www` | `<domain>` |
| 5 | Verify that you control `<domain>` | Add the DNS TXT record. Use the DNS card below | host, value |
| 6 | Same screen | Click **Verify domain**, only after `check-txt.sh` prints MATCH | |
| 7 | Business category | Pick one category. Use the category table below | `<Category>` |
| 8 | More about your business | Paste the approved description (293 to 300 characters) | description |
| 9 | Contact | Phone (optional) and Email. Codes come to the user | `<email>` |
| 10 | Delivery | Pick one option | `<delivery>` |
| 11 | Returns | Pick one option, then the return window if shown. Click **Submit** | `<returns>` |
| 12 | You've created `<Name>` | Click **Go to business overview** (skip ads and upgrade) | |
| 13 | Overview banner | **Verify your identity with a government-issued ID**: click **Verify** | |
| 14 | ID type | Choose an ID the user holds that is not expired | |
| 15 | Face check | Look at the camera: center, left, right | |
| 16 | Business details | Business name: `<Name>`. Add DBA only if the site uses a different trade name | `<Name>` |
| 17 | Tax ID | Choose **Sole Proprietor** or **Entity**, then the tax number the screen asks for. The user types it | type |

Steps 1 to 4 are one screen sequence. Do not skip step 3: **At a physical location** goes to a different, less documented flow **[verify]**.

## DNS card (step 5)

Always two columns: what OpenAI shows, and what to type at the DNS host. They differ on many hosts, which is where users go wrong. Put the values in a code block so each one copies cleanly.

| Field | OpenAI screen shows (copy icon) | Type at `<DNS host>` |
|---|---|---|
| Type | `TXT` | `TXT` |
| Name or host | `openai-business-profile.<domain>` | `<what that host's Name field takes: see below>` |
| Value or content | `openai-business-profile=<token>` | same, whole value, no quotes |
| TTL | not shown | lowest option, or the default |

Rules for the card:

- Host row: the OpenAI column is always `openai-business-profile.<domain>`. The DNS-host column depends on the host. Hostinger, GoDaddy, Namecheap and most panels add the domain themselves, so they take only `openai-business-profile`. Some panels (Cloudflare shows a preview) accept either. State which one this host wants, from its own help page. Never say the full name if the panel appends the domain: the record becomes `openai-business-profile.<domain>.<domain>` and `check-txt.sh` reports MISSING.
- Value row: the token is unique per attempt and only on the user's screen. Ask the user to click the copy icon next to **Value or content**, or to paste it (or a screenshot) here. It is a public DNS record, not a secret. When they paste it, rewrite the card with the real value in a code block.
- Existing record: run `scripts/check-txt.sh <domain>` first. It prints the TXT records already on the host. If one equals the value on the OpenAI screen, it is current: say "already added", skip to step 6. Call a record **stale** only when its value differs from the screen. Never tell the user to delete a record you have not compared.
- Expiry: the screen shows "Record expires `<time>`". Give the user that time. The record must be saved and visible before then.

Worked example, Hostinger (read 12 Nov 2026 at `hostinger.com/support/1583249-how-to-manage-dns-records-at-hostinger/` and `1583664-how-to-manage-txt-records-at-hostinger/` **[P]**):

1. Hostinger dashboard > **Domains** > the domain > **DNS / Nameservers** > **DNS records** tab.
2. In **Manage DNS records**: Type `TXT`.
3. Name: `openai-business-profile` (Hostinger: for a subdomain enter only its name).
4. TXT value: the whole value from OpenAI.
5. TTL: the default 14400 is allowed; lower if the list offers it.
6. Click **Add Record**.

## Category table (step 7)

Do not write paragraphs about the choice. One table, best fit first, then ask for a one-word answer.

| Option | Category (exact text) | Why, in 8 words or fewer |
|---|---|---|
| Recommended | `SaaS company` | `<reason>` |
| Alternative | `Software company` | `<reason>` |
| Alternative | `Analytics company` | `<reason>` |

Ask: "Which one? Reply 1, 2 or 3." Wait. After the answer, one line is enough.

## Description (step 8)

Give the text in a code block with its count on the line below, so it copies with no extra words. No prices, plans, free tier, limits or "no card needed": they go stale. Ask "Approve, or tell me what to change."

```text
<293 to 300 characters>
```

`<n> characters, PASS`

## Contact, delivery, returns (steps 9 to 11)

Short and compact, one line per step, as a table:

| Step | Pick | Because |
|---|---|---|
| 9 Contact | `<email>`, no phone | site lists no phone |
| 10 Delivery | `We don't offer delivery` | digital product |
| 11 Returns | `<option>` | `<one line, from the site's refund or return page>` |

If the site has no return policy for what it sells, show the three return options in a table and ask which the user wants. Do not pick one to get through.

## Identity steps (13 to 17)

These are entered by the user alone. Tell them what to have ready as a checklist (see `identity-and-business-details.md`). For step 17, the screen labels the field by business type, so ask which type they are before naming the field:

| Business type | Field the user will see (US) | Where the number comes from |
|---|---|---|
| Sole Proprietor | SSN or EIN, 9 digits, no dashes | their own tax records |
| Entity | EIN, 9 digits, no dashes | the company's IRS letter |
| Outside the US | Business tax identification number, may be optional **[S]** | their registration documents |

The exact label per type is **[verify]**: read it from the screen. Never ask for the number.
