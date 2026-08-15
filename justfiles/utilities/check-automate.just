# Automated check for all @extensions and @nexus packages.
# Usage: just check-automate
#
# Lists every @extensions/* and @nexus/* package from turbo,
# then invokes `pi --no-skills p` to run `just check <pkg>`
# and fix any reported errors.
#
# Each package run is timed; a per-package summary table and the total
# wall-clock time are printed at the end.

check-automate:
    #!/usr/bin/env bash
    set -euo pipefail

    RESET=$'\033[0m'
    BOLD=$'\033[1m'
    CYAN=$'\033[0;36m'
    YELLOW=$'\033[0;33m'
    GREEN=$'\033[0;32m'
    RED=$'\033[0;31m'
    MAGENTA=$'\033[1;35m'

    # Format a duration in seconds as e.g. "42s", "3m 07s" or "1h 02m 05s".
    fmt_duration() {
      local s=$1
      if (( s >= 3600 )); then
        printf '%dh %02dm %02ds' $((s / 3600)) $(((s % 3600) / 60)) $((s % 60))
      elif (( s >= 60 )); then
        printf '%dm %02ds' $((s / 60)) $((s % 60))
      else
        printf '%ds' "$s"
      fi
    }

    echo "${BOLD}${CYAN}🔍 check-automate${RESET} — checking all @extensions/* and @nexus/* packages"
    echo ""

    PACKAGES=$(npx turbo ls 2>&1 | { grep -E '(@extensions|@nexus)/' || true; } | sed 's/^[[:space:]]*//' | cut -d' ' -f1)

    if [ -z "$PACKAGES" ]; then
      echo "${YELLOW}No @extensions or @nexus packages found.${RESET}"
      exit 0
    fi

    COUNT=$(printf '%s\n' "$PACKAGES" | wc -l | tr -d ' ')
    echo "${BOLD}${CYAN}Found ${COUNT} packages to check:${RESET}"
    printf '%s\n' "$PACKAGES" | while IFS= read -r p; do
      echo "  ${CYAN}•${RESET} ${p}"
    done
    echo ""

    TOTAL_START=$(date +%s)
    CURRENT=0
    FAILED=0
    NAMES=()
    TIMES=()
    OKS=()

    while IFS= read -r pkg; do
      CURRENT=$((CURRENT + 1))
      echo "${BOLD}${MAGENTA}[$CURRENT/$COUNT] ${pkg}${RESET}"
      echo "${CYAN}──────────────────────────────────────────────${RESET}"

      PROMPT="Please read ./docs/decision.md. Then, run 'just check ${pkg}' and fix all errors. Do not run any other command. You need to just make sure the index.ts is reflective of the current code. Do NOT add no longer existing files. If the command does not fail, simply skip. Don't worry about it."

      echo "  ${CYAN}Prompt:${RESET}"
      printf '%s\n' "$PROMPT" | fold -sw 78 | while IFS= read -r line; do
        echo "    ${MAGENTA}${line}${RESET}"
      done
      echo "  ${YELLOW}\$ pi --no-skills -p \"<prompt>\"${RESET}"
      echo ""

      START=$(date +%s)
      if pi --no-skills -p "$PROMPT" < /dev/null; then
        OK=1
      else
        OK=0
      fi
      DURATION=$(( $(date +%s) - START ))

      NAMES+=("$pkg")
      TIMES+=("$(fmt_duration "$DURATION")")
      OKS+=("$OK")

      if (( OK )); then
        echo "${GREEN}✓ ${pkg} completed in $(fmt_duration "$DURATION")${RESET}"
      else
        FAILED=$((FAILED + 1))
        echo "${RED}✗ ${pkg} failed after $(fmt_duration "$DURATION")${RESET}"
      fi
      echo ""
    done <<< "$PACKAGES"

    TOTAL=$(( $(date +%s) - TOTAL_START ))
    OK_COUNT=$((COUNT - FAILED))

    # Widest package name, for aligning the summary table.
    MAXLEN=0
    while IFS= read -r name; do
      if (( ${#name} > MAXLEN )); then
        MAXLEN=${#name}
      fi
    done <<< "$PACKAGES"

    echo "${BOLD}${CYAN}══════════════════════════════════════════${RESET}"
    echo "${BOLD}${CYAN}  Summary${RESET}"
    echo "${CYAN}──────────────────────────────────────────────${RESET}"
    for i in "${!NAMES[@]}"; do
      if (( ${OKS[$i]} )); then
        MARK="${GREEN}✓${RESET}"
      else
        MARK="${RED}✗${RESET}"
      fi
      printf '  %s%-*s%s  ⏱ %s\n' "$MARK" "$MAXLEN" "${NAMES[$i]}" "${TIMES[$i]}"
    done
    echo "${CYAN}──────────────────────────────────────────────${RESET}"
    printf '  %sPackages:%s %d (%s%d ok%s, %s%d failed%s)\n' \
      "$BOLD" "$RESET" "$COUNT" "$GREEN" "$OK_COUNT" "$RESET" "$RED" "$FAILED" "$RESET"
    if (( FAILED > 0 )); then
      printf '  %sTotal time:%s %s%s\n' "$BOLD" "$RESET" "$(fmt_duration "$TOTAL")" "${RED} (with failures)${RESET}"
    else
      printf '  %sTotal time:%s %s\n' "$BOLD" "$RESET" "$(fmt_duration "$TOTAL")"
    fi
    echo "${BOLD}${CYAN}══════════════════════════════════════════${RESET}"

    if (( FAILED > 0 )); then
      exit 1
    fi
