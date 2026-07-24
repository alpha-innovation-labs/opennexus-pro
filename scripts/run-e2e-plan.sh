#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root (parent of scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLANS_DIR="$REPO_ROOT/docs/plans"

if [ ! -d "$PLANS_DIR" ]; then
  echo "Error: $PLANS_DIR does not exist." >&2
  exit 1
fi

# List plan files for fzf
PLAN_FILES=()
while IFS= read -r f; do
  PLAN_FILES+=("$f")
done < <(find "$PLANS_DIR" -maxdepth 1 -type f -name '*.md' | sort)

if [ ${#PLAN_FILES[@]} -eq 0 ]; then
  echo "Error: no .md files found in $PLANS_DIR" >&2
  exit 1
fi

# fzf selection
SELECTED="$(printf '%s\n' "${PLAN_FILES[@]}" | fzf --header="Pick a plan" --prompt="Plan> ")" || exit 1

if [ -z "$SELECTED" ]; then
  echo "No plan selected." >&2
  exit 1
fi

PLAN_CONTENT="$(cat "$SELECTED")"

nexus --no-skills \
  --skill ./agents/skills/agent-e2e/SKILL.md \
  --no-tools \
  --no-builtin-tools \
  --tools agent-e2e \
  -p "Your job is to review the following plan and use agent-e2e to test it to confirm that the snapshots generated from the agent-e2e tool match what the plan expects to see.
Use agent-e2e as a testing harness for a sample agent.
The plan is:
$PLAN_CONTENT"
