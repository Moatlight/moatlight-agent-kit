---
name: moatlight-read-report
description: "Read a finished Moatlight report and turn it into a short, honest summary and a ranked to-do list: how often AI named the business, which brands it named instead, and the next three changes. Use when a report has finished, or when the user asks what their AI visibility results mean, who beats them in ChatGPT answers, or what to change first."
license: MIT
compatibility: "Needs network access to www.moatlight.com. Works in any agent that can make HTTPS calls or use an MCP server."
metadata:
  author: Moatlight
  version: "1.2.0"
  homepage: https://www.moatlight.com/docs
---

# Read a Moatlight report

## Get the data

- `GET https://www.moatlight.com/api/v1/reports/{id}` (scope `reports:read`) → `stage` and, when `finished`, `summary`: `answers`, `named`, `share_of_voice`, `rank`, `per_engine`, `top_brands`, `lost_questions`.
- `GET https://www.moatlight.com/api/v1/reports/{id}/actions` → `moves` (up to three) and `lost_questions`.
- Do not know the id? `GET https://www.moatlight.com/api/v1/reports?limit=10`.

If `stage` is not `finished`, say so and stop. Do not summarize a partial report.

## Answer in this shape

```
<Business> was named in <named> of <answers> answers (ChatGPT <n>/<m>, Google AI Overview <n>/<m>).
Most named instead: <top brand> in <k> answers.
Questions it lost: <2 or 3 from lost_questions, in the user's words>

Next three changes
1. <title> (effort: <effort>)
   Why: <why>
   Do: <todo>, in <where>
2. ...
```

## Gotchas

- Moves may include a `draft` with [blanks]. Never fill a blank with a fact you do not have. Ask the user.
- `share_of_voice` and `rank` are relative to the brands seen in this report only.
- Engines differ. Report each one. Do not average them into one number.
- `moves` can be empty when the business was named in nearly every answer. Say that, and do not invent changes.
- A re-run after 30 days shows what moved. `recheck` repeats the report.

## Do not

- Do not say a change "will" raise visibility. The report states a hypothesis.
- Do not present counts as traffic or revenue.
