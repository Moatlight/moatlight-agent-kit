---
name: moatlight-read-report
description: Read a finished Moatlight report and turn it into a short, honest summary and a ranked to-do list: how often AI named the business, which brands it named instead, and the next three changes. Use after a report is finished.
license: Proprietary. Describes the public Moatlight API.
metadata:
  homepage: https://moatlight.com/docs
---

# Read a Moatlight report

## Get the data

- `GET https://moatlight.com/api/v1/reports/{id}` (scope `reports:read`) → `summary`: `answers`, `named`, `share_of_voice`, `rank`, `per_engine`, `top_brands`, `lost_questions`.
- `GET https://moatlight.com/api/v1/reports/{id}/actions` → `moves` (up to three) and `lost_questions`.

## How to report it

- Say "named in `named` of `answers` answers", per engine. These are counts, not a measure of traffic.
- Name the top rival from `top_brands` and the number of answers it appeared in.
- For each move give: the title, `why` (the data behind it), `todo` (the exact edit), `where` and `effort`.
- Moves may include a `draft` with [blanks]. Never fill a blank with a fact you do not have: ask the user.
- Tell the user a re-run after 30 days shows what moved. `recheck` repeats that.

## Do not

- Do not say a change "will" raise visibility. The report states a hypothesis.
- Do not compare numbers between engines as if they were one score.
