# Automated check for all @extensions and @nexus packages.
# Usage: just check-automate
#
# Lists every @extensions/* and @nexus/* package from turbo,
# then invokes `nexus --minimal --no-skills -p` to run `just check <pkg>`
# and fix any reported errors.

check-automate:
    #!/usr/bin/env bash
    set -euo pipefail

    PACKAGES=$(npx turbo ls 2>&1 | grep -E '(@extensions|@nexus)/' | sed 's/^[[:space:]]*//' | cut -d' ' -f1)

    if [ -z "$PACKAGES" ]; then
      echo "No @extensions or @nexus packages found."
      exit 0
    fi

    COUNT=$(echo "$PACKAGES" | wc -l | tr -d ' ')
    echo "Found $COUNT packages to check."
    echo "Packages:"
    echo "$PACKAGES" | sed 's/^/  - /'
    echo ""

    CURRENT=0
    echo "$PACKAGES" | while IFS= read -r pkg; do
      CURRENT=$((CURRENT + 1))
      echo ""
      echo "[$CURRENT/$COUNT] Working on: $pkg"
      echo "----------------------------------------"
      PROMPT="Pleae read ./docs/decision.md. Then, Run 'just check $pkg' and fix all errors., Do not run any other command. You need to just make sure the index.ts is reflective of the current code. Do NOT add no longer existing files. if the command does not fail, simply skip. dont worry about it"
      echo "Running: pi --minimal --no-skills --no-session -p \"$PROMPT\""
      # just dev --minimal --no-skills --no-session -p "$PROMPT" < /dev/null
      pi --no-skills --no-session -p "$PROMPT" < /dev/null
    done

    echo ""
    echo "========================================"
    echo "Done. Checked $COUNT packages."
    echo "========================================"
