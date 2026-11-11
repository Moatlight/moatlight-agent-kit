# Identity verification and Business details

Contents: What triggers it, Steps, Business details form, Prepare, Failures, Not known.

## What triggers it

The overview banner says a government-issued ID check is required before editing business info or publishing a business agent **[P]**. A third-party report says it is also needed to connect a product feed, view insights or create an agent **[S]**. The check is run by Persona **[S]**.

## Steps seen

1. **ID type.** Options seen on the Moatlight account: Driver License, National ID, PAN Card, Passport, Voter ID **[P]**. The list depends on the user's country. PAN Card and Voter ID appear for India. Do not promise a type; tell the user to choose one they hold and that is not expired.
2. **ID capture.** Photo of the document.
3. **Face check.** Look at the camera: center, then left, then right **[P]**. A video selfie is also reported **[S]**.
4. **Business details** form (below).
5. **Submitted.** "Application in review. Status updates will appear in your organization settings over the next few days. Thank you for your patience."

## Business details form

Fields seen **[S]** (third-party screenshots; the Moatlight account saw the later part):

| Field | Notes |
|---|---|
| Business name | As registered. |
| DBA (Doing Business As) name | Optional trade name. |
| Where is your business located? | Country. |
| Business type | **Sole Proprietor** or **Entity**. |

Then a second form, **Business Details**:

| Field | US screen **[P]** | Non-US screen **[S]** (India example) |
|---|---|---|
| Tax ID | "SSN or EIN (9 digits, no dashes)" with a show or hide eye | "Business tax identification number (optional)" |
| Business Website | Pre-filled with `https://<domain>` | Pre-filled |
| Physical address (no PO boxes) | "Start typing to autocomplete address...", or "or edit address manually" | Same idea |
| Legal registered address | Checkbox "Same as physical address" | Not shown in the screenshot |

Which tax field shows for Sole Proprietor and which for Entity is **[verify]**. Read the label on screen. Sole proprietors in the US usually have an SSN or an EIN. Entities have an EIN. Do not tell the user which to use; point them to their IRS or registration documents.

## Prepare the user (checklist to read out)

- [ ] The ID they will use is valid and not expired, in their hands, and the name matches the registration.
- [ ] Camera works, good light, a plain background.
- [ ] Legal business name, DBA, registration or tax number, and legal address, copied from official documents.
- [ ] A physical street address, not a PO box. If the legal address differs, they untick "Same as physical address" and enter it.
- [ ] The website in the form is the domain they verified.
- [ ] They are the owner or authorised to represent the business. The Terms ask them to confirm this.
- [ ] A private place. The agent never sees the data.

## Failures reported **[S]**

- Name, address, or tax number not matching official records is the main reason for rejection.
- UK sole traders: the form asked for a VAT number even for "Sole Proprietor". "N/A" passed the form but final verification failed for some, with no resubmit option (OpenAI community thread, Nov 2026).
- If rejected: tell the user to contact OpenAI support through the in-product help. Do not suggest workarounds that misstate the business type.

## Not known **[verify]**

- Full list of ID types per country.
- Whether Entities must supply a registration document.
- Review time. OpenAI says "the next few days".
