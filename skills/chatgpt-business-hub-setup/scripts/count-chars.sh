#!/usr/bin/env bash
# Usage: printf '%s' "your description" | count-chars.sh [min] [max]
# Counts characters (spaces included, trailing newline ignored). Default range 293 to 300.
min="${1:-293}"; max="${2:-300}"
text="$(cat)"
if command -v python3 >/dev/null 2>&1; then
  n="$(printf '%s' "$text" | python3 -I -c 'import sys; print(len(sys.stdin.read()))')"
else
  n="$(printf '%s' "$text" | wc -m | tr -d ' ')"
fi
if [ "$n" -ge "$min" ] && [ "$n" -le "$max" ]; then echo "PASS: $n characters (target $min to $max)"; exit 0; fi
if [ "$n" -lt "$min" ]; then echo "FAIL: $n characters, add $((min-n)) or more (target $min to $max)"; else echo "FAIL: $n characters, remove $((n-max)) or more (target $min to $max)"; fi
exit 1
