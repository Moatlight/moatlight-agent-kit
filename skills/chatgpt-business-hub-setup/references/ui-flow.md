# Business Hub screens, in order

Source: screenshots of the live flow taken by the Moatlight team on 11 and 12 Nov 2026 (moatlight.com, luframe.com) **[P]**. Items from other people's screenshots are marked **[S]**. Flow order from screenshots, dark theme, signed in to a free ChatGPT account. Hub entry: `chatgpt.com/business-hub` or the sidebar **[S]**.

Contents: 0 Start, 1 Interaction type, 2 Domain, 3 Category and description, 4 Contact, 5 Delivery, 6 Returns, 7 Created, 8 Overview, 9 Insights, 10 Identity, 11 Review. The numbered list the user follows (17 steps) is in `step-by-step.md`.

## 0. Start

Updated 12 Nov 2026, as reported by the owner **[verify]** labels on the next run: open `chatgpt.com/business-hub`. Type the business name in the field. A row **Create `<Name>`** has a plus button: click it. Then screen 1. Then the website field takes the domain (screen 2 uses it).

## 1. How do customers usually interact with `<Name>`?

Two rows, each with an arrow:

- **At a physical location**: Customers visit a store, restaurant, office, or other location.
- **Through a website**: Customers buy from your website or marketplace.

Footer link: **Businesses in ChatGPT Terms**. Website businesses pick the second row. One source reports physical locations go to a waitlist **[S]**.

## 2. Verify that you control `<domain>`

Text: "Add this TXT record to the DNS settings for `<domain>` through your domain provider. Changes may take time to appear." A box with three rows, each with a copy icon:

| Row | Value |
|---|---|
| Type | `TXT` |
| Name or host | `openai-business-profile.<domain>` |
| Value or content | `openai-business-profile=<unique token>` |

Below: "Record expires `<date>` at `<time>`" (30 minutes after the screen loaded). Buttons: **Back**, **Verify domain**. Shopify sign-in is a second method **[S]**. Details: `dns-verification.md`.

## 3. Help people get to know `<Name>`

- **Business category**: dropdown, placeholder "Select a category". **Continue** is greyed out until one is chosen. Full list: `categories.md`.
- **More about your business (optional)**: placeholder "Tell us what else you'd like customers to know, so ChatGPT can share it in conversations when helpful or relevant."
- Buttons: **Back**, **Continue**.

The side card on the right updates live: name, category, domain, then "Delivery policy" and "Return policy".

## 4. Help customers get in touch by including your contact information

- **Phone number (optional)**: country code picker (default US +1) and a number field.
- **Email (optional)**: text field.
- Buttons: **Back**, **Continue**.

Verification by code (email) and SMS or call (phone) is reported by the Moatlight team and by **[S]** sources. The code goes to the user. A work email on the business domain is accepted. The side card then shows the email.

## 5. How do you offer delivery?

Radio list:

- **We don't offer delivery**: Delivery isn't available for your business.
- **Paid delivery**: Delivery costs are shown at checkout.
- **Free delivery**: Available on all orders or above a minimum spend.

The side card then reads "Delivery unavailable" for the first option. **Continue** is greyed out until one is chosen.

## 6. What is your return policy?

Radio list:

- **Returns not accepted**: You don't accept standard returns.
- **Returns accepted, with fees**: Customers pay return shipping or other return fees.
- **Free returns**: No return shipping or other return fees.

Choosing a returns-accepted option shows a **Select return window** dropdown: **14 days, 30 days, 45 days, 90 days, No time limit, Custom**. Confirmed for Free returns; whether "with fees" shows it too is **[verify]**. The side card then reads "Free returns within 14 days". Button: **Submit** (greyed out until complete).

## 7. You've created `<Name>`

Check mark. "It's saved as a draft for now. Go to your business overview to continue verification or check its status." Three optional rows:

- **Manage your business**: View insights, add products, and keep your info up to date.
- **Get $500 in advertising credit**: Start advertising with ChatGPT Ads. (Paid product. The offer may change.)
- **Upgrade to a ChatGPT Business plan**: Work with your team and manage billing in a secure workspace.

Primary button: **Go to business overview**.

## 8. Business overview

Left panel **Business**: **Overview**, **Agent builder**, **Products**. Breadcrumb `Business > <Name>`. Title with a grey check and a **DRAFT** badge, the domain below, and **Edit business info**.

Banner: "Verify your identity with a government-issued ID. To keep your business secure, this is required before editing business info or publishing your business agent." Button **Verify**.

**Get started** cards (dismissable):

1. Get ready to chat with customers: review your business agent's guidelines and business context before publishing it.
2. Upload your product catalog: add products from a file so customers can browse what you sell.
3. Upgrade to a ChatGPT Business plan.

## 9. Insights (below Get started)

Tabs **Brand insights** and **Agent insights**; windows **7D** and **28D**. Tiles: **Mentions**, **Website clicks** (each with an info icon), and a card **Top 5 discovery topics**. New businesses see "No data is available for this timeframe. Try a different timeframe or check back later." More in `insights-and-agents.md`.

## 10. Identity verification

Starts from **Verify**. Content in `identity-and-business-details.md`: ID type, face check (center, left, right), **Business details** form.

## 11. Submitted

"Application in review. Status updates will appear in your organization settings over the next few days. Thank you for your patience."
