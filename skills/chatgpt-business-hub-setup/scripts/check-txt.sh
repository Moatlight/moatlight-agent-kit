#!/usr/bin/env bash
# Usage: check-txt.sh <domain> [expected-value]
# Looks for the TXT record openai-business-profile.<domain> on public resolvers and on each authoritative name server.
# Prints MATCH, FOUND (other value) or MISSING for each. Exit 0 if any authoritative server has the expected value.
# Each TXT record is compared on its own, so the right value next to an older attempt still counts as MATCH.
set -u
d="${1:-}"; want="${2:-}"
if [ -z "$d" ]; then echo "usage: check-txt.sh <domain> [expected-value]" >&2; exit 2; fi
d="${d#http://}"; d="${d#https://}"; d="${d%%/*}"; d="${d#www.}"
if ! command -v dig >/dev/null 2>&1; then echo "dig not found. Use an online DNS lookup for TXT openai-business-profile.$d" >&2; exit 3; fi
host="openai-business-profile.$d"
want="${want%\"}"; want="${want#\"}"; want="$(printf '%s' "$want" | tr -d ' ')"
check() { # $1 label, $2 server (or empty)
  local out records
  if [ -n "$2" ]; then out="$(dig +short +time=3 +tries=1 TXT "$host" @"$2" 2>/dev/null)"; else out="$(dig +short +time=3 +tries=1 TXT "$host" 2>/dev/null)"; fi
  # dig prints one record per line; a long record is split into quoted strings ("a" "b"), joined here.
  records="$(printf '%s\n' "$out" | sed -e 's/" "//g' -e 's/"//g' -e 's/ //g' | grep -v '^$')"
  if [ -z "$records" ]; then echo "MISSING  $1"; return 1; fi
  if [ -n "$want" ]; then
    if printf '%s\n' "$records" | grep -qxF -- "$want"; then
      n="$(printf '%s\n' "$records" | wc -l | tr -d ' ')"
      if [ "$n" -gt 1 ]; then echo "MATCH    $1 (plus $((n - 1)) other record(s): delete older attempts)"; else echo "MATCH    $1"; fi
      return 0
    fi
    echo "FOUND    $1 (different value, check for typos or an older attempt)"; return 1
  fi
  echo "FOUND    $1"; printf '%s\n' "$records" | sed 's/^/           /'; return 0
}
# The authoritative servers belong to the zone, which for a subdomain (shop.example.com) is a parent name.
zone="$d"; ns=""
while :; do
  ns="$(dig +short NS "$zone" 2>/dev/null | sed 's/\.$//')"
  [ -n "$ns" ] && break
  case "$zone" in *.*.*) zone="${zone#*.}";; *) break;; esac
done
echo "Host: $host"
check "1.1.1.1" 1.1.1.1
check "8.8.8.8" 8.8.8.8
if [ -z "$ns" ]; then echo "Result: no name servers found for $d or its parent domains. Check the spelling, or use an online DNS lookup."; exit 1; fi
[ "$zone" != "$d" ] && echo "Zone: $zone (name servers of the parent domain)"
auth_ok=1
for n in $ns; do
  check "authoritative $n" "$n" && auth_ok=0
done
# A panel that appends the domain turns the full host into <host>.<domain>. Look there when the right host is empty.
dbl="$(dig +short +time=3 +tries=1 TXT "$host.$d" 2>/dev/null | tr -d '"' | grep -c 'openai-business-profile=')"
if [ "$auth_ok" -ne 0 ] && [ "${dbl:-0}" -gt 0 ]; then echo "Hint: a record exists at $host.$d (domain typed twice). Edit its Name to only: openai-business-profile"; fi
if [ "$auth_ok" -eq 0 ]; then echo "Result: record is live on the authoritative servers. If public resolvers say MISSING, wait 2 to 5 minutes."; exit 0; fi
echo "Result: expected value not on the authoritative servers. MISSING = record absent (wrong DNS host, wrong host name, or not saved). FOUND = a record exists with a different value (typo, or an older attempt: replace it with the latest value)."; exit 1
