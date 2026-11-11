#!/usr/bin/env bash
# Usage: check-txt.sh <domain> [expected-value]
# Looks for the TXT record openai-business-profile.<domain> on public resolvers and on each authoritative name server.
# Prints MATCH, FOUND (other value) or MISSING for each. Exit 0 if any authoritative server has the expected value.
set -u
d="${1:-}"; want="${2:-}"
if [ -z "$d" ]; then echo "usage: check-txt.sh <domain> [expected-value]" >&2; exit 2; fi
d="${d#http://}"; d="${d#https://}"; d="${d%%/*}"; d="${d#www.}"
if ! command -v dig >/dev/null 2>&1; then echo "dig not found. Use an online DNS lookup for TXT openai-business-profile.$d" >&2; exit 3; fi
host="openai-business-profile.$d"
want="${want%\"}"; want="${want#\"}"
check() { # $1 label, $2 server (or empty)
  local out
  if [ -n "$2" ]; then out="$(dig +short +time=3 +tries=1 TXT "$host" @"$2" 2>/dev/null)"; else out="$(dig +short +time=3 +tries=1 TXT "$host" 2>/dev/null)"; fi
  out="$(echo "$out" | tr -d '"' | tr -d '\n' | sed 's/ //g')"
  if [ -z "$out" ]; then echo "MISSING  $1"; return 1; fi
  if [ -n "$want" ] && [ "$out" = "$(echo "$want" | tr -d ' ')" ]; then echo "MATCH    $1"; return 0; fi
  if [ -n "$want" ]; then echo "FOUND    $1 (different value, check for typos or an older attempt)"; return 1; fi
  echo "FOUND    $1"; return 0
}
echo "Host: $host"
check "1.1.1.1" 1.1.1.1
check "8.8.8.8" 8.8.8.8
auth_ok=1
for ns in $(dig +short NS "$d" | sed 's/\.$//'); do
  line="$(check "authoritative $ns" "$ns")"; echo "$line"
  case "$line" in MATCH*|FOUND*) [ -z "$want" ] && auth_ok=0; case "$line" in MATCH*) auth_ok=0;; esac;; esac
done
if [ "$auth_ok" -eq 0 ]; then echo "Result: record is live on the authoritative servers. If public resolvers say MISSING, wait 2 to 5 minutes."; exit 0; fi
echo "Result: expected value not on the authoritative servers. MISSING = record absent (wrong DNS host, wrong host name, or not saved). FOUND = a record exists with a different value (typo, or an older attempt: replace it with the latest value)."; exit 1
