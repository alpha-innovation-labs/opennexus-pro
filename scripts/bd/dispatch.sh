#!/usr/bin/env bash
# Fire one beads task through `nexus -p` with a standard priming prompt.
# Usage: ./dispatch.sh <bead-id>
# Sets BEAD_EXIT to the nexus exit code; prints a status footer.
set -uo pipefail

BEAD_ID="${1:?Usage: dispatch.sh <bead-id>}"
cd "$(cd "$(dirname "$0")/../.." && pwd)"
LOG="/tmp/nexus-${BEAD_ID}.log"

TITLE=$(bd show "$BEAD_ID" 2>/dev/null | sed -n 's/^○ //;s/^✓ //;s/^◐ //;s/^● //p' | head -1)
echo "=================================================="
echo "  FIRING $BEAD_ID"
echo "  $TITLE"
echo "=================================================="

PROMPT='You are executing a single beads task in the nexus-tui-awesome monorepo (a TypeScript pnpm/turbo monorepo). Bead id: '"$BEAD_ID"'.

Rules:
1. FIRST run `bd show '"$BEAD_ID"'` and read the full description. It names one or more context/extension/subagents/*.md files plus a heading that defines exactly what "done" means.
2. Read those context files IN FULL before writing any code. The context is the spec; implement exactly to it, present-tense target state.
3. The OS-process subagents extension lives in `packages/extension-core/subagents/`. Build/extend it there. Create new source files as needed. The current registration entry point is `src/registerSubagentsExtension.ts` and `src/index.ts` (currently a clean-slate no-op left by the prior retire bead).
4. Keep the subagents package green: run `pnpm --filter @extensions/subagents typecheck` and `pnpm --filter @extensions/subagents lint`, and fix ALL errors in the subagents package before finishing. (The monorepo-wide typecheck has pre-existing errors in unrelated packages; ignore those — only your package must be clean.)
5. Do NOT run any `git commit`, `git rebase`, or `git push` commands (an interactive rebase is in progress from before this session). Do not touch git state.
6. When the work is complete and verified, close the bead with a one-line reason:
   `bd close '"$BEAD_ID"' --reason "<one line: what you built + how it matches the spec heading>"`
7. Work ONLY on this bead. Do not open, edit, or close any other bead. Do not start sibling beads even if they look ready.
8. If blocked, do NOT close it. Run `bd note '"$BEAD_ID"' "<blocker + what you tried>"` and stop.'

nexus -a --name "$BEAD_ID" -p "$PROMPT" > "$LOG" 2>&1
CODE=$?

echo "--------------------------------------------------"
echo "nexus exit code: $CODE"
echo "log: $LOG"
echo "=== status footer ==="
bd show "$BEAD_ID" 2>&1 | head -4
echo
echo "=== last 20 lines of log ==="
tail -20 "$LOG"
echo
# Exit non-zero if the bead is not closed, so the orchestrator notices.
# Use the stable machine-readable status field (not pretty/ANSI output).
# Retry: bd can transiently lock right after nexus writes the close.
CLOSED=no
for _ in 1 2 3 4 5 6; do
  if bd show "$BEAD_ID" --json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d and d[0].get('status')=='closed' else 1)" 2>/dev/null; then
    CLOSED=yes; break
  fi
  sleep 1
done
if [ "$CLOSED" = yes ]; then
  echo "RESULT: CLOSED"
  exit 0
else
  echo "RESULT: NOT-CLOSED (check log)"
  exit 1
fi
