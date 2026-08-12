# Automated release check with self-healing.
# Usage: just check-release
#
# Each iteration has 2 prompts:
#   1. Run `just clean` then `just release`. If it fails, write the error
#      to ./.automation/error-N.txt and write "false" to ./.automation/status.
#   2. Read ./.automation/error-N.txt and fix the error. Do NOT retry the build.
#      Write ./.automation/attempt-N.md with what you learned.
#
# The loop then goes back to Prompt 1 with the next iteration number.
# Repeats until the build succeeds (status=true) or MAX_ITERATIONS is reached.
# Error files are named error-1.txt, error-2.txt, etc.

check-release:
    #!/usr/bin/env bash
    set -euo pipefail

    STATUS_DIR="./.automation"
    STATUS_FILE="$STATUS_DIR/status"
    MAX_ITERATIONS=10

    mkdir -p "$STATUS_DIR"
    echo "false" > "$STATUS_FILE"

    ITERATION=0
    while [ "$ITERATION" -lt "$MAX_ITERATIONS" ]; do
        ITERATION=$((ITERATION + 1))
        ERROR_FILE="$STATUS_DIR/error-${ITERATION}.txt"

        echo ""
        echo "========================================"
        echo "Iteration $ITERATION/$MAX_ITERATIONS"
        echo "========================================"

        # ---- Prompt 1: try the build, capture error ----
        PROMPT1="Run 'just clean' then run 'just release'. Read the FULL output of both commands carefully. After the build completes, try running ./apps/tui/build/index-darwin-arm64 -p 'tell me a joke' from the project root directory. If both commands succeed AND the binary runs without crashing, write 'true' to ./.automation/status. If there is ANY error in the output (build failure, missing binary, or the binary crashes when run), write a summary of the error (only the error, no extra text) to ./.automation/error-${ITERATION}.txt and write 'false' to ./.automation/status. You must read the output and interpret it — do not assume success unless the binary actually runs without errors."
        echo "Prompt 1: $PROMPT1"
        pi --no-skills --no-session -p "$PROMPT1" < /dev/null

        # ---- Check status AFTER Prompt 1 ----
        STATUS=$(cat "$STATUS_FILE" | tr -d '[:space:]')
        if [ "$STATUS" = "true" ]; then
            echo ""
            echo "========================================"
            echo "Release check passed on iteration $ITERATION."
            echo "========================================"
            exit 0
        fi

        # ---- Prompt 2: fix the error (do NOT write status, do NOT retry the build) ----
        echo ""
        echo "Error:"
        echo "----------------------------------------"
        cat "$ERROR_FILE"
        echo "----------------------------------------"

        PROMPT2="Read ./.automation/error-${ITERATION}.txt and fix the error. Do NOT run 'just clean' or 'just release'. Do NOT write to ./.automation/status — only Prompt 1 is allowed to set the status. Just fix the code. Before fixing, read all ./.automation/attempt-*.md files to learn from previous attempts and avoid repeating the same mistakes. Also read the tsdown skill at .agents/skills/tsdown since the problem is related to tsdown. Write ./.automation/attempt-${ITERATION}.md with everything you learned — what you changed, why it failed, and what to try next. Be thorough so the next attempt doesn't rediscover the same issues."
        echo "Prompt 2: $PROMPT2"
        pi --no-skills --no-session -p "$PROMPT2" < /dev/null
    done

    echo ""
    echo "========================================"
    echo "Release check failed after $MAX_ITERATIONS iterations."
    echo "Latest error:"
    echo "----------------------------------------"
    cat "$ERROR_FILE"
    echo "----------------------------------------"
    echo "========================================"
    exit 1
