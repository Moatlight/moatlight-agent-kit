---
name: moatlight-ai-visibility
description: Measure whether ChatGPT and Google AI Overview name a business when its buyers ask for what it sells, and which rivals they name instead. Use when a user asks about AI search visibility, GEO or AEO for a website.
license: Proprietary. Describes the public Moatlight API.
metadata:
  homepage: https://www.moatlight.com/docs
---

# Measure AI visibility with Moatlight

Use this when the user wants to know if AI answer engines recommend their business, or a rival's.

## Before you start

- Moatlight reads **public websites** and asks ChatGPT and Google AI Overview about ~50 buyer questions. It takes about two minutes.
- Free plan: **one website**, **one report every 30 days**, no card. Do not start a report unless the user wants it; it uses their allowance.
- Test your calls first on the no-login sandbox: `https://www.moatlight.com/api/v1/sandbox`.

## Steps

1. Connect with OAuth 2.0 (see https://www.moatlight.com/auth.md). Scopes: `reports:read reports:write account:read`.
2. `GET https://www.moatlight.com/api/v1/me` → check `plan` and `limits`.
3. `POST https://www.moatlight.com/api/v1/reports` with `{"website":"yourcompany.com"}` → returns a report in stage `analyzing`.
4. Poll `GET https://www.moatlight.com/api/v1/reports/{id}` every 5 seconds until `stage` is `needs_confirmation`.
5. Show the user `profile` and `questions`. Ask if they look right. Do not invent facts about the business.
6. `POST https://www.moatlight.com/api/v1/reports/{id}/start` (optionally `{"question_ids":[...]}`, 3 to 6 ids) → stage `running`.
7. Poll until `stage` is `finished`, then read `summary`.

## Errors you will meet

- `domain_locked` (409): that site was reported in the last 30 days; `unlock_at` says when it can run again.
- `domain_cap` (403): the free plan covers one website.
- `site_unreachable` (422): the site could not be read; ask for another address.

## Do not

- Do not promise traffic, leads or dates. Moatlight shows counts of answers, nothing more.
- Do not start several reports to "try" things; each one counts.
