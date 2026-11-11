# DNS TXT verification

Contents: Facts, Find the DNS host, Read the live docs, Field rules, Check before Verify, Troubleshooting.

## Facts

- Type `TXT`. Host `openai-business-profile.<domain>`. Value `openai-business-profile=<token>`. Seen on moatlight.com and luframe.com, 11 to 12 Nov 2026 **[P]**.
- The token is unique per attempt. Never copy one from a doc, a chat or an earlier attempt.
- The record expires 30 minutes after the screen loads **[P]** (screen showed 20:03 load and "expires 8:33 PM"). Community posts also report a 30-minute window **[S]**.
- One secondary guide names `openai-business-claim` and 24 hours. It conflicts with the live UI. Trust the screen **[verify]**.
- OpenAI's help article on domain verification (article 8871611) is about workspace and enterprise identity. Do not use it for Business Hub.
- The domain verified is the one the user typed. A parent domain does not cover subdomains **[S]**.

## Find the DNS host

The DNS host is where the domain's name servers point. It decides where the TXT record goes. The website host and the registrar can be different companies.

Run `scripts/find-dns-host.sh <domain>` or `dig NS <domain> +short`. Match the name servers:

| Name server contains | DNS host |
|---|---|
| `ns.cloudflare.com` | Cloudflare |
| `domaincontrol.com` | GoDaddy |
| `registrar-servers.com` | Namecheap (BasicDNS) |
| `awsdns-` | Amazon Route 53 |
| `vercel-dns.com` | Vercel |
| `googledomains.com`, `ns-cloud-` | Google Cloud DNS or Google Domains legacy (now Squarespace) |
| `squarespacedns.com` | Squarespace Domains |
| `wixdns.net` | Wix |
| `dns-parking.com` | Hostinger |
| `porkbun.com` | Porkbun |
| `azure-dns` | Azure DNS |
| `digitalocean.com` | DigitalOcean |
| `nsone.net` | NS1, and also Netlify DNS. Ask which **[verify]** |
| `ui-dns`, `ionos` | IONOS **[verify]** |

Not in the table: run `whois <domain>` and read the registrar and name servers, or ask the user where they manage DNS. If the name servers are the website builder's (Shopify, Wix, Squarespace), the record is added in that builder's domain settings.

## Read the live docs

UI paths change. Do not write them from memory.

1. Web search: `<provider> add TXT record DNS` plus the current year.
2. Open the provider's own help page (their domain, not a blog). Read it.
3. Extract: where to click from the dashboard, the exact button labels, which fields appear, and any note about the host field.
4. Give the user the steps with the URL and the date read. Example of the shape:

> Cloudflare (read `<date>` at `<url>`): Dashboard > select `example.com` > DNS > Records > Add record. Type: TXT. Name: `openai-business-profile`. Content: the value from OpenAI. TTL: Auto. Save.

(The example shows shape only. Fetch the real page every time.)

If the page cannot be read, say so, then give these generic steps marked **[verify]**: sign in to the DNS host, open the domain's DNS records, add a record, choose TXT, fill host and value, save.

## Field rules

- **Host.** Many panels append the domain. Then enter only `openai-business-profile`. If the panel shows the full name or asks for a fully qualified name, enter `openai-business-profile.<domain>`. Pasting the full name where the domain is appended gives `openai-business-profile.example.com.example.com`. After saving, look at the record list: it should show one `.example.com`.
- **Value.** Paste exactly, starting with `openai-business-profile=`. No added quotes, spaces or line breaks. Some panels add quotes themselves. Do not double them. Long values are split into chunks by some providers. That is fine.
- **TTL.** Lowest available (Auto, 1 minute, 300 seconds). The window is 30 minutes.
- **Type.** `TXT`. Not CNAME.
- **Other TXT records** on the same name are not affected. Add a new record. Do not edit the SPF record.
- Have the DNS page open first. Then generate or reload the OpenAI screen, copy, paste, save. This keeps the 30 minutes for propagation.

## Check before Verify

`scripts/check-txt.sh <domain> "<value>"` queries 1.1.1.1, 8.8.8.8 and each authoritative name server. Reading:

- `MATCH` on the authoritative servers and at least one public resolver: ask the user to click **Verify domain**.
- `MATCH` on authoritative only: public caches lag. Wait 2 to 5 minutes, run again.
- `MISSING` everywhere after 5 minutes: record is on the wrong DNS host, host is mistyped, or it was not saved.

Without the script: `dig +short TXT openai-business-profile.<domain> @1.1.1.1`.

## Troubleshooting

| Problem | Fix |
|---|---|
| Panel rejects the host | The prefix has a trailing dot or the domain twice. Use the prefix only. |
| Record visible in the panel, not in dig | Wrong DNS host (the name servers point elsewhere), or the domain uses the builder's DNS. Re-run the NS check. |
| Verify says not found | Wait, re-run the check, confirm the value is the latest one on screen. |
| Expired | Go Back, restart, replace the value. |
| After success | The old TXT record can stay or be removed. Keep it until the user sees the domain as verified. |
