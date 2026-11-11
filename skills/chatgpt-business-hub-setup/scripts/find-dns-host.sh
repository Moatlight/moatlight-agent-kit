#!/usr/bin/env bash
# Usage: find-dns-host.sh <domain>
# Prints the name servers of a domain and a best-guess DNS host.
# The DNS host is where a TXT record must be added. It is not always the website host.
set -u
d="${1:-}"
if [ -z "$d" ]; then echo "usage: find-dns-host.sh <domain>" >&2; exit 2; fi
d="${d#http://}"; d="${d#https://}"; d="${d%%/*}"; d="${d#www.}"
if ! command -v dig >/dev/null 2>&1; then echo "dig not found. Install dig or ask the user where DNS is managed." >&2; exit 3; fi
ns="$(dig +short NS "$d" | sed 's/\.$//' | sort)"
if [ -z "$ns" ]; then echo "No NS records for $d. Check the spelling; for a subdomain try the parent domain." >&2; exit 1; fi
echo "Domain: $d"
echo "Name servers:"; echo "$ns" | sed 's/^/  /'
low="$(echo "$ns" | tr 'A-Z' 'a-z')"
guess="unknown (run whois $d, or ask the user where they manage DNS)"
case "$low" in
  *ns.cloudflare.com*) guess="Cloudflare";;
  *domaincontrol.com*) guess="GoDaddy";;
  *registrar-servers.com*) guess="Namecheap";;
  *awsdns-*) guess="Amazon Route 53";;
  *vercel-dns.com*) guess="Vercel";;
  *squarespacedns.com*) guess="Squarespace Domains";;
  *googledomains.com*|*ns-cloud-*) guess="Google Cloud DNS or legacy Google Domains";;
  *wixdns.net*) guess="Wix";;
  *dns-parking.com*) guess="Hostinger";;
  *porkbun.com*) guess="Porkbun";;
  *azure-dns*) guess="Azure DNS";;
  *digitalocean.com*) guess="DigitalOcean";;
  *nsone.net*) guess="NS1 or Netlify DNS (ask the user)";;
esac
echo "DNS host (guess): $guess"
echo "Next: read that provider's current help page for adding a TXT record. Do not write UI steps from memory."
