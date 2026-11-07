---
name: moatlight-ai-visibility
description: "Measure whether ChatGPT and Google AI Overview name a business when its buyers ask for what it sells, and which rivals they name instead. Use when the user asks if AI recommends their company, about GEO, AEO, AI search visibility or share of voice, or why a competitor shows up in ChatGPT answers, even if they do not name Moatlight. Not for classic Google rankings or keyword SEO."
license: MIT
compatibility: "Needs network access to moatlight.com. Works in any agent that can make HTTPS calls or use an MCP server."
metadata:
  author: Moatlight
  version: "1.2.1"
  homepage: https://moatlight.com/docs
---

# Measure AI visibility with Moatlight

Moatlight reads a **public website**, then asks ChatGPT and Google AI Overview about ~50 buyer questions and counts who is named. A run takes about two minutes.

## Before you start

- Free plan: **one website**, **one report every 30 days**, no card. A report uses that allowance, so start one only when the user asks for it.
- Not logged in yet, or unsure how? Use `moatlight-connect`. To rehearse the calls, use the sandbox `https://moatlight.com/api/v1/sandbox`.
- Check the allowance first: `GET https://moatlight.com/api/v1/me` → `plan`, `limits`.

## Steps

1. `POST https://moatlight.com/api/v1/reports` with `{"website":"yourcompany.com"}` and an `Idempotency-Key` → stage `analyzing`. Scope `reports:write`.
2. Poll `GET https://moatlight.com/api/v1/reports/{id}` every 5 seconds until `stage` is `needs_confirmation`.
3. Show the user `profile` and `questions`. Ask whether they are right. Never invent facts about the business.
4. `POST https://moatlight.com/api/v1/reports/{id}/start` (optional `{"question_ids":[...]}`, 3 to 6 ids) → stage `running`.
5. Poll until `stage` is `finished`, then read the report with `moatlight-read-report`.

Checklist before step 4: the user confirmed the profile, the questions match what their buyers ask, the website is the one they want to spend the allowance on.

## Errors you will meet

- `domain_locked` (409): that site was reported in the last 30 days. `unlock_at` says when it can run again. Offer to read the existing report instead.
- `domain_cap` (403): the free plan covers one website.
- `site_unreachable` (422): the site could not be read. Ask for another address.
- Stage stuck in `analyzing` or `running` after 10 minutes: tell the user, give the report id, do not start another.

## Gotchas

- A report is about a **website**, not a brand name. Ask for the domain.
- `needs_confirmation` is a real pause. Do not call `start` before the user answers.
- The numbers are counts of answers on a fixed question set from the engines the account includes (two or four; `get_account` lists them in `limits.engines`). They say nothing about traffic.

## Do not

- Do not promise traffic, leads or dates.
- Do not start several reports to "try" things. Each one counts.
