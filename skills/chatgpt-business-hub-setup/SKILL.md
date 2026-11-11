---
name: chatgpt-business-hub-setup
description: "Prepare a business to verify its profile in OpenAI's Business Hub (Businesses in ChatGPT): find the domain, detect the DNS host, give exact DNS TXT verification steps, pick the business category, write the 293 to 300 character description, and ready the contact, delivery, return and government ID steps. Use when the user wants to verify or set up their business in ChatGPT or Business Hub, add the openai-business-profile TXT record, choose a Business Hub category, prepare a Business Agent, or read Brand insights. Free, no Moatlight account needed."
license: MIT
compatibility: "Needs web search and page fetch to read the DNS host's current docs. Shell with dig and python3 is optional (scripts/). The user does the clicking and all sign-in, code and ID steps."
metadata:
  author: Moatlight
  version: "1.1.0"
  verified: "2026-11-12"
  homepage: https://chatgpt.com/business-hub
---

# Verify a business in ChatGPT (Business Hub)

You are the preparer. The user clicks in `chatgpt.com`. You gather facts, write the exact values to paste, and check each step. OpenAI launched Businesses in ChatGPT as a beta on 10 Nov 2026, so screens can change. If a label on the user's screen differs from this skill, trust the screen and say so.

## Rules

- Never ask for, type or store an SSN, EIN, ID number, ID photo, face scan, one-time code or password. The user enters those in OpenAI's own forms.
- Never read the user's inbox or phone for a code unless they explicitly ask and a mail tool is already connected. Default: they type it.
- Do not click Verify, Submit, ad credit or upgrade buttons for the user. Those are theirs.
- Do not invent business facts. Every value comes from the user's files or website. Mark guesses as guesses.
- Verifying does not raise rankings or sales, and OpenAI does not guarantee approval. Say this once, early.
- Facts here are mostly from screenshots of the live UI and secondary reports. OpenAI's help pages could not be fetched. Anything marked **[verify]** is unconfirmed.

## Output rules (how every answer looks)

The user copies from your answer, so format for copying. Long prose is the failure to avoid.

- Lead with the numbered 17-step list in `references/step-by-step.md`, filled with the user's values. Mark each step `Done`, `NOW` or `Later`. Do not renumber, merge or skip steps.
- Anything the user types or pastes goes in a code block or a table cell, alone, with no words around it.
- Choices (category, delivery, returns) are tables: `Option | Exact text | Why in 8 words or fewer`. Then one question and a one-word reply. Prose may follow the table, 2 sentences at most. Do not write "My pick is..." paragraphs.
- DNS is always a two-column card: what OpenAI's screen shows, and what to type at the DNS host. Never give only one.
- Sentences under 20 words. No intro, no recap of what the user already said.
- A "Heads up" list holds at most 3 lines and only things that can block verification (no physical address, no legal entity name, expiry time). Do not audit email, DMARC, SPF or anything outside Business Hub.
- Do not repeat the status table inside the same answer as the step list. Give it at the end of the session (Step 9) or when asked.
- If something was already done (the TXT record already exists and matches), say "already done" and move on. Do not ask the user to redo it.

## Step 0: Find the domain, or stop and ask

Look in the current folder first, in this order: `package.json` (`homepage`), `README.md`, `CNAME`, `vercel.json`, `next.config.*`, `astro.config.*`, `wrangler.toml`, `.env.example` (key names like `SITE_URL` only; never print `.env` values), `sitemap.xml`, `robots.txt`, `llms.txt`, `git remote -v`, brand or legal pages.

Take the first real production domain. Ignore `localhost`, `*.vercel.app`, `*.netlify.app` and similar preview hosts.

If the user gave a domain in the prompt, use it and skip the search.

**If no domain is found, stop. Ask the user and wait:**

> I could not find your website domain. What is it (for example `example.com`)? And how do customers mainly deal with you: **at a physical location**, or **through a website** (they buy from your site or marketplace)?

Do not guess a domain from the folder name. Do not continue until answered.

Use the apex domain the user owns (`example.com`), not `www`. If the site lives on a subdomain, ask which one they want on the profile.

## Step 1: Check eligibility and set expectations

Read `references/insights-and-agents.md` section "Eligibility". Tell the user, in three lines:

1. Verification is open to eligible businesses where ChatGPT is available. Industry, location and integrity checks decide. No country list is published.
2. Business Agents are US only, for ecommerce and online service businesses, at launch.
3. Reports differ on service businesses and non-US businesses. A waitlist or "Coming soon" is possible. That is OpenAI's gate, not a mistake on their side.

If the user says "physical location", the screens differ and are less documented. Offer the website path only if it fits; otherwise note **[verify]** and continue with what is known in `references/ui-flow.md`.

## Step 2: Read the website and build the facts sheet

Fetch the home page, about, pricing, contact, shipping and returns pages. Record:

| Field | Source |
|---|---|
| Business name (as on the site and legal pages) | home, footer |
| What it sells, to whom, in one sentence | home, about |
| 3 differentiators that the site proves | about, pricing |
| Contact email on the domain, phone, address | contact, footer |
| Delivery terms | shipping page |
| Return terms, window in days, who pays | returns page |
| Country and legal entity type, if stated | footer, terms |

Competitive context: run 2 or 3 searches for the business's category plus "alternatives". Note how direct competitors describe themselves. Use this only to sharpen the differentiators. Never name a competitor in the profile text.

If a field is missing on the site, list it under "Needs the user" and ask once at the end of this step. Do not fill it by guessing.

## Step 3: Domain verification (DNS TXT)

The user will see "Verify that you control `<domain>`" with three rows: Type, Name or host, Value or content. Full detail and pitfalls: `references/dns-verification.md`. Card format: `references/step-by-step.md`. Do this:

1. Fill what is stable. Type `TXT`. The OpenAI screen shows the host as `openai-business-profile.<domain>` (seen on moatlight.com and luframe.com, 11 to 12 Nov 2026). The value (`openai-business-profile=<token>`) is unique per attempt. Ask the user to click the copy icon next to **Value or content** and paste it, or to paste a screenshot. It is a public DNS record, not a secret. Never reuse a value from this skill or an old attempt.
2. Detect the DNS host. Run `scripts/find-dns-host.sh <domain>`, or `dig NS <domain> +short` and map the name servers with `references/dns-verification.md`. The DNS host is where the name servers point. It is often not where the website is hosted.
3. Look for an existing record. Run `scripts/check-txt.sh <domain>` with no value. If a record equals the value on the OpenAI screen, it is current: say so and go to step 6 of the list. Call a record stale and ask for deletion only when its value differs from the screen.
4. Fetch that provider's current help page for adding a TXT record. Search the web, read the page, and quote the click path from it. Do not write UI steps from memory. Cite the URL and the read date. If the page cannot be read, say so and give the generic steps marked **[verify]**.
5. Give the two-column DNS card: OpenAI screen value in column one, the exact text to type at this DNS host in column two (prefix or full host, from the help page). Add the click path as a numbered list and the TTL.
6. Timing. The record expires 30 minutes after the screen is shown ("Record expires ..." under the box). Give the user the expiry time. Have the DNS page open first, then copy, paste, save. If it expires, go Back in the flow and start again. The value changes, so replace the old record.
7. Check before the user clicks. Run `scripts/check-txt.sh <domain> "<value>"`. When it prints MATCH, tell the user to click **Verify domain**. If it prints MISSING after 5 minutes, see the troubleshooting table. The script also flags a doubled host.

## Step 4: Category and description

Screen: **Help people get to know `<Name>`**. Two fields: **Business category** (dropdown, required) and **More about your business** (optional text).

**Category.** Pick exactly one value from `references/categories.md`. It is the full list from the live dropdown. Rules:

- Match what the business is, not what it sells to. A marketing software tool is `Software company` or `SaaS company`, not `Marketing agency`.
- Show a three-row table (best fit, two near alternatives), each with a reason of 8 words or fewer, as in `references/step-by-step.md`. Ask for a one-word reply, then wait.
- Spell it exactly as in the list.

**Description: 293 to 300 characters, spaces included.** This is the target for this skill. OpenAI's own limit is **[verify]**. Write it, then count with `scripts/count-chars.sh`. Repeat until it prints PASS. Do not estimate the count.

Write it like this:

- Plain text, one paragraph, no emoji, no list, no URL.
- Say what the business is, who it serves, what it does, and one or two facts the website proves (location served, delivery area, years, specialty).
- No superlatives ("best", "leading", "#1") unless the site proves it. No prices, plans, free tiers, usage limits, "no card needed", discounts or dates: they go stale. No competitor names.
- No health, child, religion, race, finance-distress, immigration or other sensitive data. The Terms bar "Prohibited Data". See `references/terms-flags.md`.
- Written to be quoted by ChatGPT in answers: neutral and factual.

Show the final text alone in a code block, its count on the next line, then "Approve, or tell me what to change." Do not describe the draft in prose.

## Step 5: Contact, delivery, return

All in `references/ui-flow.md` with exact labels.

- Show steps 9 to 11 as one small table: `Step | Pick | Because` (see `references/step-by-step.md`).
- **Contact** (phone and email are optional). Use an email on the business domain (work email works). Code by email or SMS comes to the user. Tell them: by using Business Hub they agree OpenAI's AI assistant may phone the business on behalf of users. There is an opt-out link in the Terms. Ask before putting a personal mobile number.
- **Delivery**: `We don't offer delivery`, `Paid delivery`, or `Free delivery` (all orders or above a minimum spend). Choose from the shipping page. Digital-only or services: `We don't offer delivery`.
- **Returns**: `Returns not accepted`, `Returns accepted, with fees`, or `Free returns`. For free returns a **Select return window** list appears: 14 days, 30 days, 45 days, 90 days, No time limit, Custom. Use the number in the site's return policy. If the site has no return policy for what it sells (a refund rule on a digital pass is not a product return policy), stop, show the three options as a table and ask. Do not pick one to get through. Mark any guess **[verify]**.
- Make the choice match the website. The profile and the site must agree.

After **Submit**, the screen says "You've created `<Name>`", saved as a draft. It offers ad credit and a ChatGPT Business plan. Tell the user these are optional and paid products, and do not need to be touched to finish verifying. Then **Go to business overview**.

## Step 6: Identity verification (prepare, do not enter)

The overview shows a **DRAFT** badge and a banner: "Verify your identity with a government-issued ID", required before editing business info or publishing a business agent. These are steps 13 to 17 of the list. Prepare the user with `references/identity-and-business-details.md`:

- ID documents offered in the user's region (seen: Driver License, National ID, PAN Card, Passport, Voter ID). The list depends on country.
- A face check: look at the center, then left, then right.
- A **Business details** form: business name (the name from step 2), DBA name (optional), country, and **Sole Proprietor** or **Entity**. Then the tax field for that type (US: SSN or EIN, 9 digits, no dashes; table in `references/step-by-step.md`), website, physical address (no PO boxes), legal registered address. Ask which type the user is before naming the tax field.
- Name, address and tax or registration number must match official records. Tell the user to check them against their registration documents before starting.
- Have a camera, good light and the physical ID ready. Use a device the user trusts.

You do not see this data. Do not ask the user to paste it.

After submit the user sees: "Application in review. Status updates will appear in your organization settings over the next few days." Timing is not guaranteed. A failed review with no resubmit option has been reported by some sole traders **[S]**.

## Step 7: Before they accept the Terms

Show the six items in `references/terms-flags.md` in plain words, then let the user decide. This is not legal advice. Say that.

## Step 8: After verifying: insights and agent

Read `references/insights-and-agents.md`. Cover briefly:

- **Brand insights**: Mentions, Website clicks, Top 5 discovery topics, 7D and 28D. A blank can mean "below the reporting threshold", not zero. ChatGPT only. No prompts, no competitors.
- **Agent insights**: only after an agent is published.
- Ask the user to save a baseline (date, window, the three numbers) so changes can be read later.
- **Business Agent** (US only at launch): the Agent builder tab. Draft guidelines (tone, when to ask a question, what to do when it cannot answer) from the facts sheet, within the Business Agents policy. Creating or previewing does not publish. Publishing is the user's choice, and they own what it says. Test before publishing.

## Step 9: Hand back a status report

Print this table, filled in, once, at the end (or when asked). Mark each row `Done`, `Waiting on user`, `Waiting on OpenAI`, or `Blocked (why)`. Offer to save it as `chatgpt-business-hub/launch-pack.md` in the project. Save only if the user agrees, and never put IDs, tax numbers, codes or the full TXT value in it.

| Step | Status | Note |
|---|---|---|
| Business Hub opened, name created, "Through a website" chosen | | |
| Domain found | | |
| Eligibility understood | | |
| DNS host detected | | |
| TXT added and checked | | |
| Domain verified (user clicked) | | |
| Category chosen | | |
| Description 293 to 300 chars | | count |
| Email and phone verified (codes by the user) | | |
| Delivery and return set | | |
| Draft created | | |
| Government ID and face check | | |
| Business details form | | |
| Application in review | | |
| Baseline of insights saved | | |
| Agent drafted, tested, published | | |

End with the next single action for the user.

## Troubleshooting

| Symptom | Check |
|---|---|
| `check-txt.sh` says MISSING | Host typed wrong, or doubled (`openai-business-profile.example.com.example.com`). Enter only the prefix if the DNS panel appends the domain. Value has stray quotes or spaces. Record saved on the wrong DNS host. |
| MATCH but Verify fails | Wait a few minutes and retry once. Then check the record has not expired (30 min). Start again for a new value. |
| Record expired | Back, regenerate, replace the TXT value. |
| Domain says it is already verified or taken | Another account verified it. The profile menu has a dispute option **[S]**. Tell the user, do not retry. |
| Category not in the list | Use the closest match. Do not invent one. |
| Waitlist or "Coming soon" | OpenAI's gate. Save the facts sheet and description for later. |
