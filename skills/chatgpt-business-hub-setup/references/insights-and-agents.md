# Eligibility, Insights and Business Agents

Evidence marks: **[P]** seen on the live UI or an official OpenAI page; **[S]** secondary report; **[verify]** unconfirmed. OpenAI's help pages and policies returned 403 to our fetcher on 12 Nov 2026, so most of this is **[S]**. Sources are at the end.

Contents: Eligibility, Brand insights, Agent insights, Business Agent, Product feed, Gotchas.

## Eligibility

- Beta launched 10 Nov 2026 **[S]**; confirmed by an OpenAI community post **[P]**.
- Verification: "any eligible business located where ChatGPT is available". Eligibility depends on industry, location, and verification and integrity checks. No country list **[S]**.
- Business Agent: eligible US ecommerce and online service businesses with a website **[P]** (OpenAI community post).
- Reports differ **[S]**:
  - One tester saw "Service" greyed out as "Coming soon" and physical locations sent to a waitlist. Others describe a broader scope.
  - At least one non-US verification request was waitlisted. One outlet says Europe is included.
  - One developer says local businesses can verify only existing US listings (unverified).
- No Ads account or Enterprise deal is needed to verify. Enterprise customers and advertisers can use their OpenAI rep. Shopify merchants can connect through Shopify **[S]**.
- Free at launch. A paid model is not ruled out **[S]**.

## Brand insights

Tabs: **Brand insights**, **Agent insights**. Windows: **7D**, **28D** **[P]**. Tiles **[P]**: **Mentions**, **Website clicks**, **Top 5 discovery topics**. A **Profile views** tile appears on some accounts **[S]**.

| Metric | Meaning | Limit |
|---|---|---|
| Mentions | Online business: ChatGPT referenced your website. Local business: ChatGPT showed a result for your location. **[S]** | A brand name without a website reference does not count. |
| Website clicks | "Number of recorded clicks on links to your website in ChatGPT." **[S]** | "Clicks don't confirm website visits or conversions." They will not match analytics referrals. |
| Top 5 discovery topics | Common themes where your website is cited **[S]** | Themes, not exact prompts. |

Limits **[S]**:

- ChatGPT only. No Gemini, Perplexity, Claude or Google AI Overviews.
- No prompts, no conversations, no competitor data, no share of voice, no record of what ChatGPT said about the business.
- Low volumes are withheld. A blank or "No data is available for this timeframe" is not proof of zero.
- Data lags by about a day. Not clear how long history is kept. No export or API reported.
- Many ChatGPT visits arrive without a referrer and land in Direct traffic in analytics.

**Baseline.** On verification day, save: date, window (7D or 28D), Mentions, Website clicks, the five topics. Repeat weekly. Read changes as direction, not exact counts.

**Do not publish Insights.** The Terms treat Insight Data as OpenAI confidential. It may be used only to measure and improve the business's own use. Summaries for the owner and their service providers are fine. Public posts, case studies or sharing with third parties need OpenAI's written permission (Terms section 6).

Optional, outside the Hub: to see which brands ChatGPT or Google AI Overview name for your buyers' questions, a measurement tool is needed. Moatlight (`moatlight-ai-visibility` skill) does that. This skill does not need it.

## Agent insights

Shown only when an agent is published **[S]**. Metrics are not documented in sources we could read **[verify]**. Report only what the screen shows.

## Business Agent

- OpenAI runs the agent. It is built from the business's instructions, feed and policy info. A self-built agent cannot be plugged in **[S]**.
- Builder: sidebar **Agent builder**; a "Get ready to chat with customers" card says to review the agent's guidelines and business context before publishing **[P]**.
- Guidelines field **[S]**: tone, when to ask questions, what to do if the agent cannot answer.
- Creating, configuring, previewing or linking does not publish it. Publishing is the user's choice, and publishing does not authorise paid ads (Terms 5.1).
- The business owns the agent's Outputs, including offers and commitments, even if it did not review them (Terms 5.2, 5.4).
- User experience **[S]**: labeled chat opened from the profile; shows products, delivery and returns; sends buyers to the brand's site. No checkout or payment inside the chat has been reported.
- Business Agents Policy points **[S]**: say it is an AI; do not pose as a human or an OpenAI endorsement; do not invent offers, prices, stock, credentials, reviews or guarantees; no false urgency; do not ask for health details, government IDs or financial credentials; no booking, buying or forms without an approved feature; no advice that needs a licence. OpenAI can modify, suspend or remove an agent at any time (Terms 5.6).
- Drafting guidelines: write from the facts sheet. Cover tone; the five most common questions (shipping, returns, pricing, availability, contact) with the site's own answers; when to hand off to a human; what to say when unsure ("I don't have that. Please contact `<email>`"). Do not include claims the site cannot back.
- Test list before publishing: returns, shipping, price, out-of-stock, a question it cannot answer, an attempt to make it promise something. Show the user the results.
- Sponsored agents (a ChatGPT Ad whose destination is the agent) are separate, paid and in limited testing **[S]**. Do not set up unless asked.

## Product feed

- Optional. Upload a file in **Products**, or connect Shopify **[S]**.
- Developer specs exist at `developers.openai.com/commerce/product-feeds/spec` and `.../file-upload/overview` **[P]**. Required fields in that spec: `item_id`, `title`, `description`, `url`, `brand`, `seller_name`, `image_url`, `availability`, `price` (for example `79.99 USD`). Optional return fields include `accepts_returns` and `return_deadline_in_days`. Whether Business Hub's upload uses this exact schema is **[verify]**. Read the spec before building a file. Do not invent fields.
- Feeds carry extra terms: allow OpenAI crawlers and waive text-and-data-mining opt-outs for OpenAI (Terms section 3).

## Gotchas

- Verifying does not guarantee placement, traffic or sales. OpenAI says so.
- OpenAI may create a listing for a business whether or not it is verified, and may edit or replace what the business submits (Terms 4.1).
- Keep name, address, phone, description and prices identical on the site, Google Business Profile, social profiles and directories **[S]**.
- No source confirms that schema markup, robots.txt rules or any crawler setting are required for Business Hub. Do not tell the user they are **[verify]**.

## Sources (read 12 Nov 2026)

- OpenAI community: community.openai.com/t/introducing-businesses-in-chatgpt-in-beta/1414865 **[P]**
- OpenAI developers: developers.openai.com/commerce/product-feeds/spec, /commerce/specs/file-upload/overview **[P]**
- ppc.land, llmpulse.ai, citeme.io, relevantaudience.com, trendingtopics.eu, intellectualclouds.com **[S]**
- Businesses in ChatGPT Terms, pasted by the Moatlight team from OpenAI's page **[P]**
